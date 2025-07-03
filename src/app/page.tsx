"use client";

import Image from "next/image";
import styles from "./page.module.css";
import {
  FaUsers,
  FaShieldAlt,
  FaComments,
  FaUserEdit,
  FaLock,
} from "react-icons/fa";
import HeroVideo from "@/components/HeroVideo";
import { useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import FeatureSlider from "@/components/FeatureSlider";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  return (
    <main className="w-full bg-gray-900 -mt-20">
      <HeroVideo />
      <div className="bg-gray-900">
        {/* Info Card Section */}
        <section className="w-full flex justify-center pt-2 pb-8 px-4">
          <div className="bg-white/10 rounded-2xl shadow-xl p-8 max-w-xl w-full text-center border border-white/10 backdrop-blur-md animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-white">
              Neden Munjacraft?
            </h2>
            <ul className="text-gray-200 text-left list-none grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <li className="flex items-center gap-3">
                <FaShieldAlt className="text-primary text-xl" /> Güvenli ve adil
                bir topluluk ortamı
              </li>
              <li className="flex items-center gap-3">
                <FaLock className="text-primary text-xl" /> Rol tabanlı erişim
                ve yönetim
              </li>
              <li className="flex items-center gap-3">
                <FaComments className="text-primary text-xl" /> Kullanıcılar
                arası mesajlaşma
              </li>
              <li className="flex items-center gap-3">
                <FaUserEdit className="text-primary text-xl" /> Profil yönetimi
                ve kişiselleştirme
              </li>
              <li className="flex items-center gap-3">
                <FaUsers className="text-primary text-xl" /> Yalnızca kayıtlı
                üyeler sunucuya katılabilir
              </li>
            </ul>
          </div>
        </section>
        {/* Features Section */}
        <section className="w-full flex justify-center py-12 px-4">
          <FeatureSlider />
        </section>
        <section
          id="news"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-800 text-white"
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-8">
              Haberler & Duyurular
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">Yeni Sezon Başladı!</h3>
                <p className="text-gray-300">
                  MunjaCraft'ın efsanevi 5. sezonu, yeni haritalar, özel
                  etkinlikler ve sürpriz ödüllerle başladı! Maceraya katılın.
                </p>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">
                  Haftalık Bakım Çalışması
                </h3>
                <p className="text-gray-300">
                  Sunucu performansını artırmak için yapılacak olan haftalık
                  bakım çalışması, Pazar günü 04:00-06:00 arasında
                  gerçekleştirilecektir.
                </p>
              </div>
              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">
                  Turnuva Kayıtları Açıldı!
                </h3>
                <p className="text-gray-300">
                  Büyük ödüllü 1v1 turnuvamız için kayıtlar başladı. Yeteneğini
                  göster, MunjaCoin'leri kap!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4 text-gray-500">
              İletişim
            </h2>
            <p className="text-gray-500 md:text-xl mb-8">
              Sorularınız, önerileriniz veya destek talepleriniz için bize
              ulaşın.
            </p>
            <div className="mx-auto max-w-sm space-y-4">
              <Button asChild size="lg" className="w-full">
                <a href="https://discord.gg/munjacraft" target="_blank">
                  Discord Sunucumuza Katıl
                </a>
              </Button>
              <p className="text-xs text-gray-500">
                En hızlı destek için Discord sunucumuzu tercih edebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        <footer className="w-full text-center py-6 text-gray-400 text-sm mt-8">
          &copy; {new Date().getFullYear()} Munjacraft Sunucu Platformu. Tüm
          hakları saklıdır.
        </footer>
      </div>
      {/* About Section */}
      <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-white">
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
                olmanın ötesine geçerek, üyelerinin keyifli vakit
                geçirebileceği, yeni arkadaşlıklar kurabileceği ve rekabetin
                tadını çıkarabileceği güçlü bir topluluk oluşturmaktır.
              </p>
              <p>
                Teknik ekibimiz, en stabil ve akıcı oyun deneyimini sunmak için
                en son teknolojileri kullanmakta ve sunucu altyapımızı sürekli
                olarak güncellemektedir. Adil bir oyun ortamı sağlamak en büyük
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
      </section>
    </main>
  );
}
