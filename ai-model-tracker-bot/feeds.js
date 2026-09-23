// Daftar sumber (RSS feed) yang dipantau bot.
// Tambah/hapus/ubah baris di bawah ini sesuai kebutuhan.
// name  -> nama yang muncul di notifikasi Discord
// url   -> alamat RSS feed
// emoji -> emoji kecil biar embed lebih enak dilihat (opsional)

module.exports = [
  {
    name: "OpenAI",
    url: "https://openai.com/news/rss.xml",
    emoji: "🟢",
    color: 0x10a37f,
  },
  {
    name: "Anthropic (unofficial mirror)",
    url: "https://tim-hilde.github.io/anthropic-rss/rss.xml",
    emoji: "🟠",
    color: 0xd97757,
  },
  {
    name: "Google DeepMind",
    url: "https://deepmind.google/blog/rss.xml",
    emoji: "🔵",
    color: 0x4285f4,
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    emoji: "🔵",
    color: 0x4285f4,
  },
  {
    name: "Hugging Face",
    url: "https://huggingface.co/blog/feed.xml",
    emoji: "🤗",
    color: 0xffd21e,
  },
];
