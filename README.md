# Minecraft Sunucu Platformu

Bu proje, oyuncuların bir araya gelebileceği, etkileşimde bulunabileceği ve çeşitli özelliklerden faydalanabileceği modern bir Minecraft sunucu platformu uygulamasıdır. Next.js, Prisma ve NextAuth.js kullanılarak oluşturulmuştur.

> **Not:** Bu proje bir Node.js/Next.js projesidir. Ödev gereği `requirements.txt` dosyası referans amaçlı eklenmiştir. Gerçek bağımlılık yönetimi için `package.json` ve `bun.lock`/`package-lock.json` dosyalarını kullanın.

## ✨ Özellikler

- **Kullanıcı Yönetimi:**
  - Güvenli kayıt ve giriş sistemi (NextAuth.js ile)
  - E-posta ve şifre ile kimlik doğrulama
  - Yönetici (Admin) ve Kullanıcı (User) rolleri
- **Gelişmiş Profil Sistemi:**
  - Kişisel bilgileri (isim, takma ad, doğum tarihi vb.) düzenleme
  - Profil fotoğrafı (avatar) yükleme
  - Adres bilgileri ve doğrulama sistemi
  - Kullanıcı biyografisi ve web sitesi ekleme
- **Sosyal Etkileşim:**
  - Arkadaşlık isteği gönderme, kabul etme ve reddetme
  - Kullanıcılar arası özel mesajlaşma
  - Kullanıcıların en son ne zaman aktif olduğunu görme (`lastSeen`)
- **Sunucu İçi Ekonomi ve Rütbeler:**
  - Kullanıcı bakiyesi sistemi
  - Farklı VIP seviyeleri (NORMAL, VIP, MVIP, vb.) içeren rütbe sistemi
- **Yönetim ve Moderasyon:**
  - Yönetici paneli
  - Kullanıcıları süreli, süresiz veya IP bazlı yasaklama sistemi
  - Duyuru yayınlama sistemi
- **Diğer Özellikler:**
  - Dosya yükleme
  - Kullanıcı arama geçmişi kaydı

## 🛠️ Teknoloji Yığını

- **Framework:** [Next.js](https://nextjs.org/)
- **Dil:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Kimlik Doğrulama:** [NextAuth.js](https://next-auth.js.org/)
- **Veritabanı:** [SQLite](https://www.sqlite.org/index.html) (Geliştirme için)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Bileşenleri:** [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/icons/)
- **Form Yönetimi:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Gerçek Zamanlı İletişim:** [Socket.IO](https://socket.io/)
- **Test:** [Jest](https://jestjs.io/)

## 🚀 Başlarken

Bu bölüm, projeyi yerel makinenizde geliştirme ve test amacıyla nasıl kuracağınızı açıklar.

### Gereksinimler

- [Node.js](https://nodejs.org/en/) (v20.x veya üstü önerilir)
- [Bun](https://bun.sh/) (veya npm/yarn)

### Kurulum

1.  **Projeyi klonlayın:**

    ```bash
    git clone https://github.com/cagriym/munjacraft.git
    cd minecraft-sunucu-platformu
    ```

2.  **Bağımlılıkları yükleyin:**

    ```bash
    bun install
    # veya
    npm install
    ```

3.  **Ortam Değişkenlerini Ayarlayın:**
    Proje kök dizininde `.env` adında bir dosya oluşturun ve aşağıdaki gibi doldurun:

    ```env
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="buraya_guvenli_bir_anahtar_girin" # `openssl rand -base64 32` ile oluşturabilirsiniz
    ```

4.  **Veritabanı şemasını uygulayın:**
    Prisma şemasını veritabanına uygulamak için aşağıdaki komutu çalıştırın:

    ```bash
    npx prisma migrate dev
    ```

5.  **Veritabanını örnek verilerle doldurun (isteğe bağlı):**
    ```bash
    npx prisma db seed
    ```

### Geliştirme Sunucusunu Başlatma

Tüm kurulum adımları tamamlandıktan sonra, geliştirme sunucusunu başlatmak için aşağıdaki komutu çalıştırın:

```bash
bun run dev
# veya
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

### Build ve Üretim

```bash
bun run build
bun run start
# veya
npm run build
npm run start





```

**Önemli Not**:
_Bu proje socket kullanmaktadır. Bağımlılıkları yükledikten sonra server ihtiyacından dolayı birlikte projeyi çalıştırmak için_
**"bun run server.js"**
_komutu yeterlidir_

### Örnek Admin Giriş Bilgileri

```
E-posta: xmemo051708@gmail.com
Şifre: 449296memolIi
```

### Diğer Kullanıcı Giriş Bilgileri

```
E-posta: //tüm e-postalar prismada mevcuttur.
Şifre: user1234  (admin hariç tüm hesaplar için)

## scripts

- `bun run dev`: Geliştirme modunda başlatır.
- `bun run build`: Üretim için derler.
- `bun run start`: Üretim sunucusunu başlatır.
- `bun run lint`: Kod stilini denetler.
- `bun run test`: Jest testlerini çalıştırır.

## klasör yapısı

`src` klasörü altındaki temel dizinler:

- `app/`: Next.js App Router yapısı. Sayfalar ve API endpoint'leri burada yer alır.
- `components/`: Proje genelinde kullanılan React bileşenleri.
- `lib/`: Yardımcı fonksiyonlar, kütüphane entegrasyonları (örn: `prisma.ts`).
- `prisma/`: Veritabanı şeması (`schema.prisma`), migrasyonlar ve seed betikleri.
- `types/`: Proje genelinde kullanılan TypeScript tipleri ve arayüzleri.
- `public/`: Statik dosyalar (resimler, videolar vb.).

---

Bu README dosyası, projenizin mevcut durumuna göre oluşturulmuştur. Proje geliştikçe güncellemeyi unutmayın.
```
