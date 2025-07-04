# 🎮 Minecraft Sunucu Platformu

## 🚀 Proje Tanımı

Minecraft sunucu yönetimi ve topluluk etkileşimi için geliştirilmiş, kullanıcı yönetimi, rol tabanlı erişim ve mesajlaşma sistemi içeren bir web uygulamasıdır.

## 🛠️ Kullanılan Teknolojiler

- ⚡ **Next.js**
- 🗄️ **Prisma ORM**
- 🗃️ **SQLite**
- 🎨 **TailwindCSS**
- 🧩 **Shadcn UI**

## ✨ Temel Özellikler

- 📝 Kayıt olma, giriş/çıkış ve profil yönetimi
- 🛡️ Rol tabanlı erişim (**Admin & Normal Kullanıcı**)
- 🧑‍💼 **Admin paneli:** kullanıcı yönetimi, rol değiştirme, kullanıcı silme, ek admin işlemleri
- 💬 Kullanıcılar arası mesajlaşma
- 👥 Arkadaşlık sistemi
- 📢 Duyuru ve profil arama geçmişi

## ⚙️ Kurulum ve Çalıştırma

1. 📥 Depoyu klonlayın:
   ```bash
   git clone <repo-url>
   cd minecraft-sunucu-platformu
   ```
2. 📦 Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. 🗄️ Veritabanı migrasyonlarını çalıştırın:
   ```bash
   npx prisma migrate deploy
   ```
4. 🖥️ Sunucuyu başlatın:
   ```bash
   bun run server.js
   ```

## 🔑 Giriş Bilgileri

### 👑 Admin

- **E-posta:** `xmemo051708@gmail.com`
- **Şifre:** `449296memolIi`

### 👤 Diğer Kullanıcılar

- **E-posta:** (veritabanında kayıtlı)
- **Şifre:** `user1234`

## 📌 Notlar

- Proje **SQLite** veritabanı ile çalışır.
- Tüm kullanıcıların e-posta adresleri veritabanında kayıtlıdır.
- Proje gereksinimleri ve detaylar için `proje gereksinimleri.txt` dosyasına bakınız.
