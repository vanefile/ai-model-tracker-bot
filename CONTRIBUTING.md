# Contributing

Makasih sudah tertarik berkontribusi ke **AI Model Tracker Bot**! 🎉

## Cara berkontribusi

1. Fork repo ini
2. Buat branch baru: `git checkout -b fitur/nama-fitur-kamu`
3. Lakukan perubahan, commit dengan pesan yang jelas:
   ```
   git commit -m "feat: tambah dukungan feed Mistral AI"
   ```
4. Push ke fork kamu: `git push origin fitur/nama-fitur-kamu`
5. Buka Pull Request ke branch `main` repo ini, jelaskan perubahan yang dibuat

## Format commit message

Pakai gaya [Conventional Commits](https://www.conventionalcommits.org/) biar histori repo rapi:

| Prefix      | Kapan dipakai                                  |
|-------------|-------------------------------------------------|
| `feat:`     | Menambah fitur baru                              |
| `fix:`      | Memperbaiki bug                                  |
| `docs:`     | Perubahan dokumentasi saja (README, dll)         |
| `refactor:` | Ubah struktur kode tanpa mengubah perilaku       |
| `chore:`    | Tugas kecil (update dependency, config, dll)     |

## Menambah sumber feed baru

Cukup edit `feeds.js`, tambahkan objek baru dengan `name`, `url`, dan opsional
`emoji`/`color`. Tidak perlu menyentuh `index.js`.

## Melaporkan bug / request fitur

Gunakan tab **Issues** di repo ini. Sertakan langkah reproduksi (untuk bug) atau
alasan/kegunaan (untuk request fitur) supaya lebih mudah ditindaklanjuti.
