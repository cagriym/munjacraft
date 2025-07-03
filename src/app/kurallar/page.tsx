import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KurallarPage() {
  return (
    <>
      <section className="bg-[#181c23] -mt-20 text-center w-full flex flex-col justify-center items-center shadow-md">
        <h1 className="text-4xl font-bold text-white mb-2">
          MUNJA HİZMET ŞARTLARI
        </h1>
        <p className="text-gray-400 mb-2">Son Güncelleme: 04/07/2021 15:42</p>
      </section>
      <div className="container mx-auto p-4 md:p-8 pt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Hizmet Şartları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-base text-gray-700">
            <p>
              İşbu MUNJA Hizmet Şartları (“Hizmet Şartları”) ile, MUNJA
              tarafından size oyunlarımızı, uygulamalarımızı, internet
              sitelerimizi ve başka hizmetlerimizi kullanma ve onlardan
              yararlanma izni verilmesinin şartları belirlenmektedir.
            </p>
            <p>
              İşbu Hizmet Şartları siz ile söz konusu kuruluş arasında bir
              sözleşme niteliğindedir, MUNJA oyununa kayıt olurken bu sözleşmeyi
              kabul etmiş olursunuz. Şartlar ve koşulların herhangi birine
              uyulmadığı takdirde, MUNJA hesap feshetme hakkını saklı tutar.
            </p>
            <h2 className="text-xl font-semibold mt-8 mb-2">İÇİNDEKİLER</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                <a
                  href="#hesap-kaydi"
                  className="text-blue-600 hover:underline"
                >
                  HESAP KAYDI
                </a>
              </li>
              <li>
                <a
                  href="#hesap-feshi"
                  className="text-blue-600 hover:underline"
                >
                  HESAP FESHİ
                </a>
              </li>
              <li>
                <a
                  href="#kullanim-kurallari"
                  className="text-blue-600 hover:underline"
                >
                  KULLANIM KURALLARI
                </a>
              </li>
              <li>
                <a
                  href="#oyun-kurallari"
                  className="text-blue-600 hover:underline"
                >
                  OYUN KURALLARI
                </a>
              </li>
              <li>
                <a
                  href="#gizlilik-politikasi"
                  className="text-blue-600 hover:underline"
                >
                  GİZLİLİK POLİTİKASI
                </a>
              </li>
              <li>
                <a
                  href="#ucretlendirme-vergiler"
                  className="text-blue-600 hover:underline"
                >
                  ÜCRETLENDİRME & VERGİLER
                </a>
              </li>
              <li>
                <a
                  href="#iade-politikasi"
                  className="text-blue-600 hover:underline"
                >
                  İADE POLİTİKASI
                </a>
              </li>
              <li>
                <a
                  href="#hukum-kosullar"
                  className="text-blue-600 hover:underline"
                >
                  HÜKÜM & KOŞULLARIN DEĞİŞTİRİLMESİ
                </a>
              </li>
            </ol>
            <h2
              id="hesap-kaydi"
              className="text-xl font-semibold mt-8 mb-2 scroll-mt-24"
            >
              1. HESAP KAYDI
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                13 yaşından büyük olmanız veya ebeveynlerinizin iznini almış
                olmanız gerekir.
              </li>
              <li>
                MUNJA, herhangi bir kullanıcı adını reddetme veya engelleme
                hakkını saklı tutar.
              </li>
              <li>
                Kayıt olduğunuzda gerçek bilgilerinizi istediğinizde vermeniz
                gerekir. (İsim Soyisim, E-posta vs.)
              </li>
              <li>
                Kayıt olduğunuzda Oyun Kuralları'nı kabul etmiş sayılırsınız.
                (Bkz: Madde 4. Oyun Kuralları)
              </li>
              <li>
                Kayıt olduğunuzda verdiğiniz bilgilerin doğruluğunu kabul etmiş
                sayılırsınız.
              </li>
              <li>
                Oturum Açma Bilgilerinizi paylaşmış iseniz veya hesabınızı veya
                Oturum Açma Bilgilerinizi güvenli hale getirmemiş iseniz,
                hesabınızda meydana gelecek tüm kayıplardan (Sanal İçerikler'in
                kaybolması veya kullanılması da dâhil olmak üzere) siz
                sorumlusunuz.
              </li>
              <li>
                Kayıt olduğunuzda hesabınızı satmamayı veya başkasına
                devretmemeyi kabul edersiniz.
              </li>
              <li>
                Hesap bilgilerini kimseyle paylaşmayacağınızı kabul edersiniz.
              </li>
            </ul>
            <h2
              id="hesap-feshi"
              className="text-xl font-semibold mt-8 mb-2 scroll-mt-24"
            >
              2. HESAP FESHİ
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                İşbu Hizmet Koşulları'nın herhangi bir maddesini ihlal
                ettiyseniz (Oyun Kuralları dahil),
              </li>
              <li>
                MUNJA Topluluğunun veya Hizmetimizin çıkarları veya üçüncü bir
                şahsın haklarının korunması için gerekliyse,
              </li>
              <li>Yaptığınız herhangi bir ödemeyi iade ederseniz,</li>
              <li>
                Başka birine ait herhangi bir ödeme bilgilerini izinsiz/yetkisiz
                bir şekilde kullanmış iseniz,
              </li>
            </ul>
            <h2
              id="kullanim-kurallari"
              className="text-xl font-semibold mt-8 mb-2 scroll-mt-24"
            >
              3. KULLANIM KURALLARI
            </h2>
            <p>
              Herhangi biri MUNJA hizmetine kayıt olarak aşağıdaki koşulları ve
              kuralları kabul etmiş sayılır;
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-1">ŞARTLAR</h3>
            <p>
              Bu web sitesine erişerek, bu web sitesinin Şartlar ve
              Koşullar'ına, yürürlükteki tüm kurallarına ve düzenlemelerine tabi
              olmayı kabul edersiniz ve yürürlükteki yerel kurallara ve şartlara
              uymaktan sorumlu olduğunuzu kabul edersiniz. Bu şartların
              hiçbirine katılmıyorsanız, bu siteyi kullanmanız veya bu siteye
              erişmeniz yasaktır. Bu web sitesinde bulunan materyaller geçerli
              telif hakkı ve ticari marka kanunları ile korunmaktadır.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-1">FERAGAT</h3>
            <p>
              MUNJA'ın web sitesindeki materyaller 'olduğu gibi' sağlanmıştır.
              MUNJA, hiçbir garanti vermez, ifade etmez veya ima etmez ve işbu
              sözleşmeyle sınırlı olmamak kaydıyla, örtülü garantiler veya
              satılabilirlik koşulları, belirli bir amaca uygunluk veya fikri
              mülkiyet haklarının ihlali veya diğer hakların ihlal edilmemesi de
              dahil olmak üzere diğer tüm garantileri reddeder. Ayrıca, MUNJA,
              malzemelerin internet web sitesinde kullanımının doğruluğu, olası
              sonuçları veya güvenilirliği ile ilgili veya başka bir şekilde bu
              tür malzemelerle veya bu siteyle bağlantılı herhangi bir site ile
              ilgili hiçbir garanti vermez veya sunmaz.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-1">SINIRLAMALAR</h3>
            <p>
              Hiçbir durumda MUNJA veya tedarikçileri, MUNJA'ın internet
              sitesinde bulunan materyallerin kullanılmasından veya
              kullanılmamasından doğacak zararlardan (bunlarla sınırlı olmamak
              üzere veri veya kar zararı veya iş kesintisi nedeniyle) sorumlu
              tutulamaz. MUNJA veya MUNJA yetkili temsilcisine sözlü olarak veya
              bu tür bir hasar olasılığını yazılı olarak bildirilmiş olsa bile.
              Bazı yargı bölgelerinde zımni garantilerde sınırlamalar veya
              dolaylı veya olası zararlar için sorumluluk sınırlamaları
              bulunmadığından, bu sınırlamalar sizin için geçerli olmayabilir.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-1">
              DÜZELTMELER & HATALAR
            </h3>
            <p>
              MUNJA'ın web sitesinde görünen materyaller teknik, tipografik veya
              fotografik hatalar içerebilir. MUNJA, web sitesindeki
              materyallerin hiçbirinin doğru, eksiksiz veya güncel olduğunu
              garanti etmemektedir. MUNJA, web sitesinde yer alan materyallerde
              herhangi bir zamanda önceden bildirimde bulunmaksızın değişiklik
              yapabilir. Ancak MUNJA, malzemeleri güncellemek için herhangi bir
              taahhütte bulunmaz.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-1">BAĞLANTILAR</h3>
            <p>
              MUNJA, İnternet web sitesine bağlı sitelerin tümünü incelememiştir
              ve bu bağlantılı sitelerin içeriğinden sorumlu değildir. Herhangi
              bir bağlantının dahil edilmesi, sitenin MUNJA tarafından
              onaylandığı anlamına gelmez. Bu tür bağlantılı web sitelerinin
              kullanımı kullanıcının sorumluluğundadır.
            </p>
            <h3 className="text-lg font-semibold mt-4 mb-1">
              YASAKLANMIŞ EYLEMLER & İÇERİK
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Size bildirilmediği sürece diğer kullanıcılardan bilgi toplamaya
                çalışmak.
              </li>
              <li>
                Herhangi bir uygunsuz içerik yayınlamak, bu bağlantıları ve
                siteleri içerir.
              </li>
              <li>Kötü amaçlı herhangi bir içerik veya virüs yüklemek.</li>
              <li>
                Herhangi bir kullanıcıya kabalanmak, taciz etmek veya tehdit
                etmek..
              </li>
              <li>
                Yasadışı faaliyetlerde bulunmak; kullanıcıların Türkiye
                Cumhuriyeti yasalarına uyması gerekir.
              </li>
              <li>Irkçı ve ayrımcı konuşmalar yapmak.</li>
              <li>
                MUNJA'ın izni olmadan herhangi bir engellemeden veya
                uzaklaştırmadan kurtulmaya çalışmak.
              </li>
            </ul>
            <h2
              id="oyun-kurallari"
              className="text-xl font-semibold mt-8 mb-2 scroll-mt-24"
            >
              4. OYUN KURALLARI
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                MUNJA'a kayıt olan herhangi biri aşağıdaki oyun kurallarını
                kabul eder, MUNJA yetkilileri kurallara uymayan hesapları geçici
                süreliğine veya süresiz olarak uzaklaştırma hakkını ya da hesap
                kısıtlama hakkını saklı tutar.
              </li>
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-1">
              HİLE VE MOD KULLANIMI
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                MUNJA, hile kullananları hiç sevmez ve ciddi cezalar verir.
                Tespit edildiği durumlarda aynı IP adresine kayıtlı diğer
                hesapları da engelleme hakkını saklı tutar.
              </li>
              <li>
                MUNJA'a kayıt olan her hesap oyuna ek müdahale edebilecek
                mod/hile kullanmamayı kabul eder.
              </li>
              <li>
                Oyuna ek müdahale edebilecek 3. parti hile uygulaması veya mod
                kullanmamayı kabul eder.
              </li>
              <li>
                Regedit, timespeed vb. gibi yollarla oyunda haksız rekabet
                sağlamamayı kabul eder.
              </li>
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-1">
              İLLEGAL OYUN & HAKSIZ REKABET
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Oyunlarda illegal yollar kullanarak haksız rekabet sağlamamayı
                kabul eder.
              </li>
              <li>İllegal yollara şunlar dahildir;</li>
              <li>
                Birden fazla hesap açarak paylaşımlı istatistik kazanılması.
                (haksız rekabet)
              </li>
              <li>
                Birden fazla hesap ile aynı oyun arenasına giriş yapıp tek bir
                hesaba istatistik sağlanması. (örgütlenmek)
              </li>
              <li>
                Haksız rekabet unsurları kullanarak normal standartların
                üzerinde istatistik kazanılması (haksız rekabet)
              </li>
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-1">
              SOLO & TAKIM OYUNLAR
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Solo oyun moduna sahip arenalarda takım olmamayı kabul eder.
              </li>
              <li>
                Takım oyun moduna sahip arenalarda kendi takım arkadaşı
                dışındaki birisiyle takım olmamayı kabul eder.
              </li>
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-1">HESAP GÜVENLİĞİ</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Oyuncu kayıt olurken hesap güvenliğinin ve sorumluluğunun
                kendine ait olduğunu kabul eder. Herhangi bir şekilde hesaba
                giriş bilgilerini paylaşmamayı da kabul eder. Bununla ilgili
                oluşabilecek hesap çalınmalarında sorumluluk oyuncuya aittir.
              </li>
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-1">
              UYGUNSUZ KULLANICI ADI
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Oyuncu kayıt olurken uygunsuz, küfürlü veya nefret içerikli
                kullanıcı isimleri kullanarak kayıt olmamayı kabul eder.
              </li>
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-1">SAYGI</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Oyun içerisinde veya MUNJA'a ait topluluk ortamlarında diğer
                herkese karşı saygılı olacağını, dil, din, ırkçılık,
                cinsiyetçiliki yaşlılık ve özürlülük gibi küstahça bir dil
                kullanımı sergilemeyeceğini kabul eder.
              </li>
            </ul>
            <h3 className="text-lg font-semibold mt-4 mb-1">TİCARET & SATIŞ</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Oyun içerisinde hesabını veya buna benzer MUNJA'ın etkileneceği
                herhangi bir satışı yapmamayı ve buna teşvik etmemeyi kabul
                eder.
              </li>
            </ul>
            <h2
              id="gizlilik-politikasi"
              className="text-xl font-semibold mt-8 mb-2 scroll-mt-24"
            >
              5. GİZLİLİK POLİTİKASI
            </h2>
            <p>
              Gizliliğiniz bizim için çok önemlidir. Bu doğrultuda, kişisel
              bilgileri nasıl topladığımızı, kullandığımızı, açıkladığımızı ve
              kullandığınızı anlamanız için bu politika'yı geliştirdik.
              Aşağıdaki maddeler gizlilik politikamızı özetlemektedir.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Kişisel bilgi toplamanın öncesinde veya sırasında, bilgilerin
                toplanma amaçları belirlenir..
              </li>
              <li>
                Kişisel bilgileri yalnızca tarafımızca belirtilen amaçları
                yerine getirmek veya yasaların gerektirdiği şekilde yerine
                getirmek, tarafımızca belirtilen amaçları yerine getirmek ve
                diğer uyumlu amaçlar doğrultusunda kullanılır.
              </li>
              <li>
                Kişisel bilgileri yalnızca bu amaçların yerine getirilmesi için
                gerekli olduğu sürece saklanır.
              </li>
              <li>
                Kişisel bilgileri yasal, adil yollarla ve uygun olduğu
                durumlarda ilgili kişinin bilgisi veya rızası ile toplanır.
              </li>
              <li>
                Kişisel veriler, kullanılma amaçları ile ilgili olmalı ve bu
                amaçlar için gerekli olan ölçüde doğru, eksiksiz ve güncel
                olmalıdır.
              </li>
              <li>
                Kişisel bilgileri, makul olmayan güvenlik önlemleriyle kayıp
                veya hırsızlığa karşı korunacaktır, ayrıca yetkisiz erişim,
                açıklama, kopyalama, kullanım veya değiştirmeye karşı
                korunacaktır.
              </li>
              <li>
                Kişisel bilgilerin yönetimi ile ilgili politikalarımız ve
                uygulamalarımız hakkında müşterilerimize bilgi sunacağız.
              </li>
              <li>
                Kişisel bilgilerin gizliliğinin korunmasını ve korunmasını
                sağlamak için işimizi bu ilkelere uygun olarak yürütmeyi taahhüt
                ediyoruz.
              </li>
            </ul>
            <p className="mt-2">
              Gizlilik Politikası'nın detaylarına{" "}
              <a href="#" className="text-blue-600 underline">
                Buradan
              </a>{" "}
              ulaşabilirsiniz.
            </p>
            <h2
              id="ucretlendirme-vergiler"
              className="text-xl font-semibold mt-8 mb-2 scroll-mt-24"
            >
              6. ÜCRETLENDİRME & VERGİLER
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                MUNJA'a kayıt olan herhangi birisi aşağıdaki ödeme ve vergi
                koşullarını kabul eder.
              </li>
              <li>
                MUNJA Hizmetleri'nin bazı işlevleri ücretli olabilir. Bundan
                dolayı bize veya yararlandığımız ödeme şirketlerine doğru ve
                eksiksiz ödeme bilgileri vermeyi kabul ediyorsunuz.
              </li>
              <li>
                Ayrıca, hesabınız kapsamında yüklenilen bütün ilgili ücret ve
                vergileri ödemeyi de kabul ediyorsunuz.
              </li>
            </ul>
            <h2
              id="iade-politikasi"
              className="text-xl font-semibold mt-8 mb-2 scroll-mt-24"
            >
              7. İADE POLİTİKASI
            </h2>
            <p>
              Tüm satışlar kesindir, iade yapılamaz, durdurulamaz, sunucuyu
              ödemenizi geri ödemesi için geri almak için gerekli herhangi bir
              yolla kredilendiremezsiniz. Bunu yaparken sunucu/forumlarda devam
              etmekte olan hesabınıza izin vermeme ve başka kredi yükleme
              işlemlerinin eklenmesine veya alınmasına izin vermeme hakkımızı
              saklı tutarız. Zorla geri ödeme durumunda tazminat almak için
              gerekli yasal veya tahsil işlemlerini yapma hakkımızı saklı
              tutarız.
            </p>
            <h2
              id="hukum-kosullar"
              className="text-xl font-semibold mt-8 mb-2 scroll-mt-24"
            >
              8. HÜKÜM & KOŞULLARIN DEĞİŞTİRİLMESİ
            </h2>
            <p>
              MUNJA, hüküm ve koşulları zaman zaman önceden bildirilmeksizin
              değiştirme hakkını saklı tutar. Değişikliklerden haberdar olmak
              için kullanıcı, sözleşmeyi periyodik olarak gözden geçirme
              sorumluluğunda olduğunu kabul eder. Bu tür değişiklikler
              sonrasında bu siteyi kullanmaya devam etmeniz, değiştirilen hüküm
              ve koşulların onaylandığı ve kabul edildiği anlamına gelir.
            </p>
          </CardContent>
        </Card>
      </div>
      <footer className="w-full text-center mt-8 mb-4">
        <p className="text-xs text-gray-400">
          © 2024 MunjaCraft. Tüm hakları saklıdır. Bu sitedeki içeriklerin
          izinsiz kopyalanması ve kullanılması yasaktır.
          <br />
          MunjaCraft bir ticari markadır. Yasal uyarılar ve iletişim için
          info@munjacraft.com adresine başvurabilirsiniz.
        </p>
      </footer>
    </>
  );
}
