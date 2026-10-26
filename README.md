# Storm Atlas — Reverse: 1999 Team Builder

Prototype React + TypeScript dengan koleksi lokal dan rekomendasi berbasis aturan.

## Status

Source MVP tahap awal. Instalasi dependensi, tes, dan build **belum berhasil dijalankan** di lingkungan pembuat karena akses jaringan sandbox terblokir. Jalankan langkah verifikasi di bawah sebelum distribusi. Belum ada APK maupun website yang diterbitkan.

Dataset awal berisi 16 karakter provisional, bukan seluruh katalog atau meta terverifikasi. Ilustrasi SVG berupa simbol orisinal, bukan portrait resmi karakter. Koefisien offense/sustain/actionDemand adalah asumsi model kualitatif, bukan hasil simulasi damage. Tier dan rarity tidak menambah skor.

## Menjalankan web

Prasyarat: Node.js 22 LTS dan npm.

```sh
npm install
npm test
npm run build
npm run dev
```

Hasil build berada di `dist/`. Untuk hosting gunakan static hosting dengan MIME JavaScript dan JSON yang benar. Tidak membutuhkan API key, akun, atau backend.

## Membuat APK dengan Capacitor

Prasyarat tambahan: Android Studio, Android SDK, dan JDK sesuai persyaratan versi Capacitor yang dipasang.

```sh
npm install @capacitor/core @capacitor/android
npm install --save-dev @capacitor/cli
npx cap init "Storm Atlas" "com.example.stormatlas" --web-dir dist
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Ganti `com.example.stormatlas` dengan application ID milik Anda sebelum distribusi. Di Android Studio, tunggu Gradle sync selesai, lalu gunakan menu Build untuk membuat APK. APK release memerlukan signing key Anda sendiri. Setelah perubahan source, jalankan `npm run build` dan `npx cap sync android` kembali.

Uji pemuatan worker, persistensi IndexedDB, impor/ekspor JSON, dan tautan eksternal pada Android WebView. Download melalui Blob dapat memerlukan integrasi Capacitor Filesystem/Share pada WebView tertentu; versi ini belum memiliki integrasi native tersebut. PWA dan service worker belum disediakan. Font Google opsional; ketika offline, aplikasi memakai font fallback.

## Fitur yang sudah ditulis

- Grid katalog, pencarian, filter rarity/afflatus/role, penanda kepemilikan.
- Koleksi IndexedDB, impor/ekspor koleksi.
- Catatan Insight, Portray, Euphoria; hanya Insight minimum memengaruhi aktivasi sinergi saat ini.
- Pemilihan ukuran tim 3/4 dan penguncian satu anggota.
- Pencarian kombinasi melalui Web Worker, indikator proses, pembatalan.
- Best Overall, Alternative, Mode-Specific; tidak membuat alternatif palsu jika koleksi terlalu kecil.
- Penjelasan skor, perbandingan hasil, Dark/Light, layout responsif.
- Impor dataset tervalidasi, ekspor template, rollback satu versi sebelumnya.

## Batas implementasi

- Mode otomatis belum memiliki preset stage terverifikasi; ukuran manual dipertahankan dan UI menjelaskan ini.
- Mode General/Boss/Multi-target adalah preset model, bukan aturan stage resmi.
- Sinergi saat ini berbasis pasangan tag; belum memodelkan durasi, stack, konflik Array, rotasi, atau efek bersyarat secara lengkap.
- Tidak ada simulasi damage, Psychube, Resonance, efek Portray atau Euphoria, maupun filter region/patch.
- Missing Character Recommendation dan Multiple Team Builder belum diimplementasikan.
- Skor 0–100 bukan peluang menang. Jangan gunakan prototype ini sebagai satu-satunya dasar investasi karakter.
- Pencarian dibatasi 250.000 kombinasi per preset; jika batas tercapai, UI menandai hasil sebagai terbaik yang ditemukan.
- Perbandingan menyajikan skor dari preset asal tiap hasil; jangan menganggap skor antar-preset setara.
- Browser QA, aksesibilitas menyeluruh, dan pengujian APK belum dilakukan.

## Struktur

```text
src/model.ts       Schema Zod dan tipe data
src/engine.ts      Aturan penilaian dan pencarian tim
src/worker.ts      Worker untuk analisis
src/main.tsx       UI, koleksi lokal, impor/ekspor
src/style.css      Tema dan layout responsif
public/data/      Dataset JSON awal
public/art/       Ilustrasi simbol SVG orisinal
tests/            Tes mesin dan validasi
```

Rumus dan rincian normalisasi tersedia di halaman Data & metode dan `src/engine.ts`. Tes mencakup kepemilikan, ukuran tim, penguncian anggota, immunity, Insight, independensi rarity, konsistensi skor, dan validasi dataset.

## Pembaruan data

Ekspor template melalui Data & metode, edit JSON, lalu impor kembali. Impor dataset hanya menerima schemaVersion 1, ID unik, nilai koefisien 0–1, dan sumber HTTPS. Untuk menandai karakter verified, isi verifiedAt. Status verified merupakan pernyataan penyedia data, bukan audit otomatis aplikasi.

Gunakan dataset/aset yang Anda berhak gunakan. Prydwen melarang ekstraksi massal dalam ketentuan penggunaannya; proyek ini tidak menyertakan scraper. Tautan profil merupakan referensi untuk review manusia, bukan bukti bahwa semua entri sudah diverifikasi.

Referensi:
- https://www.prydwen.gg/re1999/team-tier-list
- https://www.prydwen.gg/terms

Proyek penggemar independen, tidak berafiliasi dengan Bluepoch atau Prydwen.
