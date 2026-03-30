# Minecraft Sunucu Platformu

Minecraft sunucu yonetimi ve topluluk etkilesimi icin gelistirilmis bir web uygulamasi. Kullanici yonetimi, rol tabanli erisim ve mesajlasma modulleri icerir.

## Teknolojiler
- Next.js
- Prisma ORM
- SQLite
- TailwindCSS
- Shadcn UI

## Ozellikler
- Kayit / giris / profil yonetimi
- Rol tabanli erisim (Admin ve Kullanici)
- Admin paneli (kullanici yonetimi, rol degistirme)
- Mesajlasma ve arkadaslik sistemi
- Duyurular

## Kurulum
```bash
git clone <repo-url>
cd minecraft-sunucu-platformu
npm install
npx prisma migrate deploy
```

## Calistirma
```bash
bun run server.js
```

## Ornek Giris
Admin:
- Email: admin@gmail.com
- Sifre: admin

Kullanici:
- Email: veritabaninda kayitli
- Sifre: user1234

## Notlar
- Veritabani SQLite kullanir.
