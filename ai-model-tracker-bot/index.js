require("dotenv").config();
const http = require("http");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const Parser = require("rss-parser");
const feeds = require("./feeds");
const storage = require("./storage");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // opsional, untuk register command instan di 1 server
const DEFAULT_CHANNEL_ID = process.env.CHANNEL_ID;
const CHECK_INTERVAL_MINUTES = Number(process.env.CHECK_INTERVAL_MINUTES || 10);

if (!TOKEN || !CLIENT_ID) {
  console.error(
    "DISCORD_TOKEN dan CLIENT_ID wajib diisi di environment variables (.env)."
  );
  process.exit(1);
}

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; AIModelTrackerBot/1.0)" },
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ---------- Slash commands ----------
const commands = [
  new SlashCommandBuilder()
    .setName("latest")
    .setDescription("Tampilkan rilis AI terbaru yang sudah terdeteksi")
    .addIntegerOption((opt) =>
      opt
        .setName("jumlah")
        .setDescription("Berapa banyak item (default 5, maks 15)")
        .setMinValue(1)
        .setMaxValue(15)
    ),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Cek status bot (kapan terakhir cek feed, dll)"),
  new SlashCommandBuilder()
    .setName("cek")
    .setDescription("Paksa bot cek semua feed sekarang juga"),
  new SlashCommandBuilder()
    .setName("setchannel")
    .setDescription("Set channel ini sebagai tujuan notifikasi rilis AI baru"),
].map((c) => c.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commands,
      });
      console.log("Slash command terdaftar di guild (instan).");
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      });
      console.log("Slash command terdaftar global (bisa 1 jam baru muncul).");
    }
  } catch (err) {
    console.error("Gagal daftar slash command:", err);
  }
}

// ---------- Cek RSS ----------
async function checkFeeds() {
  const channelId = storage.getChannelId() || DEFAULT_CHANNEL_ID;
  let channel = null;

  if (channelId) {
    try {
      channel = await client.channels.fetch(channelId);
    } catch (err) {
      console.error("Tidak bisa mengambil channel:", err.message);
    }
  }

  for (const feed of feeds) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || []).slice(0, 10);

      // proses dari yang terlama ke terbaru biar urutan post di Discord rapi
      for (const item of items.reverse()) {
        const guid = item.guid || item.link || item.title;
        if (!guid || storage.isSeen(feed.name, guid)) continue;

        storage.markSeen(feed.name, guid);
        storage.addRecent({
          feed: feed.name,
          title: item.title,
          link: item.link,
          pubDate: item.pubDate || item.isoDate || null,
        });

        if (channel) {
          const embed = new EmbedBuilder()
            .setTitle(item.title || "(tanpa judul)")
            .setURL(item.link || null)
            .setDescription(
              (item.contentSnippet || item.summary || "").slice(0, 300) ||
                null
            )
            .setColor(feed.color || 0x5865f2)
            .setAuthor({ name: `${feed.emoji || ""} ${feed.name}`.trim() })
            .setTimestamp(item.pubDate ? new Date(item.pubDate) : new Date());

          await channel.send({ embeds: [embed] }).catch((err) =>
            console.error("Gagal kirim pesan:", err.message)
          );
        }
      }
    } catch (err) {
      console.error(`Gagal ambil feed ${feed.name}:`, err.message);
    }
  }

  storage.setLastCheck(new Date().toISOString());
  storage.persist();
}

// ---------- Event handlers ----------
client.once("ready", async () => {
  console.log(`Bot login sebagai ${client.user.tag}`);
  await registerCommands();
  await checkFeeds(); // cek sekali saat start
  setInterval(checkFeeds, CHECK_INTERVAL_MINUTES * 60 * 1000);
  console.log(`Bot akan cek feed setiap ${CHECK_INTERVAL_MINUTES} menit.`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "latest") {
    const jumlah = interaction.options.getInteger("jumlah") || 5;
    const recent = storage.getRecent(jumlah);
    if (recent.length === 0) {
      await interaction.reply(
        "Belum ada data rilis AI yang terdeteksi. Coba `/cek` dulu."
      );
      return;
    }
    const desc = recent
      .map(
        (r, i) =>
          `**${i + 1}. [${r.title}](${r.link})**\n_${r.feed}_${
            r.pubDate ? " · " + new Date(r.pubDate).toLocaleDateString("id-ID") : ""
          }`
      )
      .join("\n\n");
    const embed = new EmbedBuilder()
      .setTitle("🆕 Rilis AI Terbaru")
      .setDescription(desc)
      .setColor(0x5865f2);
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "status") {
    const lastCheck = storage.getLastCheck();
    const channelId = storage.getChannelId() || DEFAULT_CHANNEL_ID;
    const embed = new EmbedBuilder()
      .setTitle("📊 Status Bot")
      .addFields(
        { name: "Feed dipantau", value: feeds.map((f) => f.name).join(", ") },
        {
          name: "Cek terakhir",
          value: lastCheck ? new Date(lastCheck).toLocaleString("id-ID") : "Belum pernah",
        },
        {
          name: "Interval cek",
          value: `${CHECK_INTERVAL_MINUTES} menit`,
        },
        {
          name: "Channel notifikasi",
          value: channelId ? `<#${channelId}>` : "Belum diset (pakai /setchannel)",
        }
      )
      .setColor(0x57f287);
    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === "cek") {
    await interaction.reply("🔄 Mengecek semua feed sekarang...");
    await checkFeeds();
    await interaction.followUp("✅ Selesai cek feed.");
  }

  if (interaction.commandName === "setchannel") {
    storage.setChannelId(interaction.channelId);
    storage.persist();
    await interaction.reply(
      `✅ Channel ini (<#${interaction.channelId}>) diset sebagai tujuan notifikasi rilis AI baru.`
    );
  }
});

client.login(TOKEN);

// ---------- Health-check server (untuk Render / uptime monitor) ----------
const PORT = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("AI Model Tracker Bot is running.");
  })
  .listen(PORT, () => console.log(`Health-check server jalan di port ${PORT}`));
