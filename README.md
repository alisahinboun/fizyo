# Skolyoz Fizyoterapi — Danışan Takip ve Randevu Uygulaması

Skolyoz alanında çalışan bir fizyoterapist için tek kullanıcılı web uygulaması.
İki yüzü var:

- **Herkese açık site** — tanıtım sayfası ve *boş randevu saatleri*. Danışan bir
  saat seçer, WhatsApp butonuna basar; tarih ve saat hazır mesaja otomatik
  yazılır. **Online rezervasyon yoktur**, randevu karşılıklı teyitle kesinleşir.
- **Yönetim paneli** (parola korumalı) — danışan kayıtları, ölçüm girişi,
  ilerleme grafikleri, haftalık randevu takvimi ve site ayarları.

## Hızlı başlangıç

```bash
npm install
npm run dev          # http://localhost:3000
```

İlk açılışta `/kurulum` sayfası panel parolasını sorar. Parola belirlendikten
sonra panel `/panel` adresinden kullanılır.

Üretim için:

```bash
npm run build
npm start
```

### Örnek veriyle denemek

```bash
node scripts/ornek-veri.mjs          # parola: skolyoz2026
node scripts/ornek-veri.mjs kendiparolam
```

> Bu betik **mevcut danışan, ölçüm ve randevu kayıtlarını siler.** Yalnızca
> deneme ortamında çalıştırın.

## Özellikler

### Danışan yönetimi
- Kimlik, iletişim, veli bilgileri; şehir ve meslek/okul
- Klinik tablo: skolyoz tipi, eğrilik paterni, konveksite, Risser evresi,
  menarş, korse modeli ve hedef kullanım süresi, uygulanan yöntem
  (Schroth, SEAS, BSPTS, side-shift, Dobomed, klinik pilates)
- Tedavi hedefleri, tıbbi notlar, KVKK açık rıza işareti
- Ad/telefon/e-posta ile arama, aktif–pasif filtresi
- Danışan dosyasını yazdırma (panel kromu çıktıya girmez)

### Ölçüm ve görselleştirme
Her kontrolde kaydedilebilen parametreler:

| Grup | Alanlar |
|---|---|
| Cobb açısı | torakal, torakolomber, lomber |
| Rotasyon & postür | ATR torakal/lomber, kifoz, lordoz, omuz ve pelvis asimetrisi |
| Antropometri | boy, oturma yüksekliği, kilo |
| Klinik durum | ağrı (VAS), SRS-22r, korse saati, Risser |

Girilen alanlar için grafikler **otomatik** oluşur — ölçülmemiş başlık için
boş grafik çizilmez. Her grafiğin tablo karşılığı da sayfada yer alır.
Danışan sayfasının üstünde Cobb, ATR ve VAS için ilk ölçüme göre değişim
özeti gösterilir (azalma iyi kabul edilir).

### Randevu ve WhatsApp akışı
- Haftalık takvim; slotlar **boş / dolu / kapalı** olarak yönetilir
- Tarih aralığı + haftanın günleri + mesai saatleri seçilerek **toplu slot
  üretimi** (var olan saatler atlanır)
- Tek slot ekleme, boş slotları toplu temizleme (dolu randevulara dokunmaz)
- Bir slota kayıtlı danışan veya kayıtsız kişi atama
- Dolu randevuda, danışanın telefonuna **WhatsApp hatırlatma** bağlantısı
- Sitede yalnızca `boş` ve `yayımda` işaretli slotlar görünür; kaç haftalık
  bölümün yayımlanacağı ayarlardan belirlenir

WhatsApp mesaj şablonunda kullanılabilen yer tutucular:
`{tarih}` `{saat}` `{gun}` `{klinik}` `{uzman}` — ayarlar sayfasında canlı
önizlemesi vardır.

### Ayarlar
Klinik adı, uzman adı ve ünvanı, ana sayfa metinleri, iletişim bilgileri,
WhatsApp numarası ve mesaj şablonları, seans süresi ve mesai saatleri, panel
parolası.

## Teknik

- **Next.js 15** (App Router, sunucu bileşenleri ve server action'lar)
- **Tailwind CSS 4**, **Recharts**
- **SQLite** (`better-sqlite3`) — kurulum gerektirmeyen tek dosyalık veritabanı
- Kimlik doğrulama: `scrypt` ile saklanan tek parola + HMAC imzalı oturum çerezi

Türkçe arayüz; tarihler saat dilimi kaymasını önlemek için yerel duvar saati
biçiminde (`YYYY-MM-DDTHH:mm`) saklanır.

### Klasörler

```
src/app/          sayfalar ve server action'lar
src/components/   arayüz bileşenleri
src/lib/          veritabanı, sorgular, ayarlar, kimlik, tarih ve WhatsApp yardımcıları
scripts/          örnek veri yükleyici
data/fizyo.db     veritabanı (git'e girmez)
```

### Ortam değişkenleri

Hiçbiri zorunlu değildir; `.env.example` dosyasına bakın.

| Değişken | Açıklama |
|---|---|
| `DATABASE_PATH` | Veritabanı dosyasının yolu (varsayılan `data/fizyo.db`) |
| `SESSION_SECRET` | Oturum imzalama anahtarı. Verilmezse üretilip veritabanında saklanır. |

## Yayına alırken

Uygulama sağlık verisi tutar; bu veriler KVKK kapsamında **özel nitelikli
kişisel veridir**.

- Mutlaka **HTTPS** arkasında yayınlayın (oturum çerezi üretimde `secure`).
- `data/` klasörünün **düzenli yedeğini** alın — tüm kayıtlar bu dosyadadır.
- Sunucuyu birden fazla süreçle (ör. `cluster`) çalıştırmayın; SQLite tek
  yazıcıya göre yapılandırılmıştır.
- Birden çok sunucuda çalıştıracaksanız `SESSION_SECRET` değişkenini elle
  tanımlayın.
