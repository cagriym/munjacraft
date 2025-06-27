import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#181c23] py-24 text-center min-h-screen w-full flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold text-white mb-4">Hakkımızda</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          <strong>MunjaCraft</strong>, 2024 yılında Minecraft tutkunlarını bir
          araya getirme hayaliyle kurulmuş, yenilikçi ve oyuncu odaklı bir
          sunucu platformudur. Amacımız, sadece bir oyun sunucusu olmanın
          ötesine geçerek, üyelerinin keyifli vakit geçirebileceği, yeni
          arkadaşlıklar kurabileceği ve rekabetin tadını çıkarabileceği güçlü
          bir topluluk oluşturmaktır.
        </p>
      </section>
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Hakkımızda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg text-gray-700">
            <p>
              <strong>MunjaCraft</strong>, 2024 yılında Minecraft tutkunlarını
              bir araya getirme hayaliyle kurulmuş, yenilikçi ve oyuncu odaklı
              bir sunucu platformudur. Amacımız, sadece bir oyun sunucusu
              olmanın ötesine geçerek, üyelerinin keyifli vakit geçirebileceği,
              yeni arkadaşlıklar kurabileceği ve rekabetin tadını çıkarabileceği
              güçlü bir topluluk oluşturmaktır.
            </p>
            <p>
              Teknik ekibimiz, en stabil ve akıcı oyun deneyimini sunmak için en
              son teknolojileri kullanmakta ve sunucu altyapımızı sürekli olarak
              güncellemektedir. Adil bir oyun ortamı sağlamak en büyük
              önceliğimizdir; bu nedenle hileye ve toksik davranışlara karşı
              sıfır tolerans politikası izlemekteyiz.
            </p>
            <p>
              Siz de bu büyük ailenin bir parçası olmak, unutulmaz maceralara
              atılmak ve yeteneklerinizi sergilemek istiyorsanız, doğru
              yerdesiniz. MunjaCraft'a hoş geldiniz!
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
