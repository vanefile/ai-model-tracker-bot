# 🤖 AI Model Tracker Bot

![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2)
![Status](https://img.shields.io/badge/status-active-success)

Bot Discord yang memantau blog resmi **OpenAI**, **Google DeepMind / Google AI**,
**Hugging Face**, dan berita **Anthropic**, lalu otomatis mengirim notifikasi ke
channel Discord setiap ada rilis model AI baru.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tampilan](#-tampilan)
- [Persyaratan](#-persyaratan)
- [Instalasi](#-instalasi)
  - [1. Buat aplikasi & bot di Discord](#1-buat-aplikasi--bot-di-discord)
  - [2. Setup environment variables](#2-setup-environment-variables)
  - [3. Jalankan lokal (opsional)](#3-jalankan-lokal-opsional)
- [Deploy 24 Jam](#-deploy-24-jam)
- [Struktur Proyek](#-struktur-proyek)
- [Konfigurasi Sumber Feed](#-konfigurasi-sumber-feed)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

## ✨ Fitur

- ✅ Auto-post ke channel saat ada postingan baru dari sumber yang dipantau
- ✅ `/latest [jumlah]` — lihat rilis terbaru yang sudah terdeteksi
- ✅ `/status` — cek kapan terakhir bot mengecek feed
- ✅ `/cek` — paksa cek feed sekarang juga
- ✅ `/setchannel` — jadikan channel saat ini sebagai tujuan notifikasi
- ✅ Server HTTP kecil bawaan untuk keperluan health-check (Render, UptimeRobot, dll)
- ✅ Sumber feed mudah ditambah/dikurangi lewat satu file config (`feeds.js`)

## 🖼️ Tampilan

> Tambahkan screenshot notifikasi bot di sini setelah bot online, contoh:
> `![Contoh notifikasi](docs/screenshot.png)`

## 📦 Persyaratan

- Node.js versi 18 ke atas
- Akun Discord + akses ke Discord Developer Portal
- Akun hosting (Railway / Render) untuk online 24 jam

## 🚀 Instalasi

### 1. Buat aplikasi & bot di Discord

1. Buka [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application**.
2. Tab **Bot** → **Reset Token** → simpan (ini `DISCORD_TOKEN`, jangan pernah dibagikan/di-commit).
3. Tidak perlu mengaktifkan intent tambahan apa pun — bot ini hanya pakai slash command.
4. Tab **General Information** → salin **Application ID** → ini `CLIENT_ID`.
5. Tab **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`
   - Buka URL yang dihasilkan, undang bot ke server kamu.
6. Di Discord, aktifkan **Developer Mode** (User Settings → Advanced), lalu:
   - Klik kanan channel notifikasi → **Copy Channel ID** → ini `CHANNEL_ID`
   - Klik kanan nama server → **Copy Server ID** → ini `GUILD_ID` (opsional, agar slash command muncul instan)

### 2. Setup environment variables

```bash
cp .env.example .env
```

Isi `.env`:

```env
DISCORD_TOKEN=isi_token_bot_kamu
CLIENT_ID=isi_application_id
GUILD_ID=isi_server_id
CHANNEL_ID=isi_channel_id
CHECK_INTERVAL_MINUTES=10
```

### 3. Jalankan lokal (opsional)

```bash
npm install
npm start
```

Log `Bot login sebagai ...` menandakan sukses. Tes dengan `/status` di Discord.

## ☁️ Deploy 24 Jam

<details>
<summary><strong>Railway</strong> (rekomendasi, paling simpel)</summary>

1. Push repo ini ke GitHub (lihat bagian Kontribusi/commit di bawah kalau belum).
2. Railway → **New Project → Deploy from GitHub repo** → pilih repo ini.
3. Tab **Variables** → isi semua environment variable dari `.env`.
4. Cek tab **Deployments → Logs** untuk pastikan bot online.
</details>

<details>
<summary><strong>Render</strong></summary>

1. Push repo ini ke GitHub.
2. Render → **New → Background Worker** (atau Web Service kalau plan kamu cuma punya itu).
3. Build command: `npm install`. Start command: `npm start`.
4. Isi environment variables yang sama seperti di atas.
5. Kalau pakai Web Service gratis: layanan tidur setelah 15 menit tanpa trafik HTTP.
   Tambahkan uptime monitor gratis (mis. [UptimeRobot](https://uptimerobot.com)) yang
   ping URL Render kamu tiap 5 menit supaya tetap online.
</details>

## 🗂️ Struktur Proyek

```
ai-model-tracker-bot/
├── index.js              # Logika utama bot (polling RSS, slash commands)
├── feeds.js               # Daftar sumber RSS yang dipantau
├── storage.js              # Penyimpanan sederhana (item yang sudah dikirim, cache)
├── package.json
├── .env.example
├── .gitignore
├── LICENSE
├── CONTRIBUTING.md
└── .github/ISSUE_TEMPLATE/ # Template laporan bug & request fitur
```

## 🔧 Konfigurasi Sumber Feed

Edit `feeds.js` untuk menambah/menghapus sumber:

```js
{
  name: "Mistral AI",
  url: "https://mistral.ai/news/rss.xml",
  emoji: "🌬️",
  color: 0xff7000,
}
```

## 🤝 Kontribusi

Kontribusi, laporan bug, dan usulan fitur sangat diterima!
Baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk alur kerja dan konvensi commit.

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE) — bebas dipakai, dimodifikasi, dan
didistribusikan ulang, dengan tetap menyertakan atribusi lisensi.

## ⚠️ Catatan

- `data.json` menyimpan item yang sudah pernah dikirim. Di hosting gratis, file ini
  bisa ter-reset saat redeploy — efeknya paling beberapa postingan lama terkirim
  ulang sekali, tidak fatal.
- Anthropic belum menyediakan RSS resmi, jadi bot ini pakai mirror tidak resmi
  (`tim-hilde.github.io/anthropic-rss`). Kalau mirror itu mati, ganti URL-nya di
  `feeds.js`.
