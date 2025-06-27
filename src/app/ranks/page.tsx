"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { useState, useEffect } from "react";

// Kullanıcı bilgilerini ve rütbeleri tanımlayan arayüzler
interface UserProfile {
  id: string;
  role: string;
  balance: number;
}

interface Rank {
  name: string;
  price: number;
  features: string[];
  color: string;
  emoji: string;
}

// Rütbe verileri
const ranks: Rank[] = [
  {
    name: "VIP",
    price: 19.99,
    features: [
      "Haftalık 5.000 coin",
      "/vip prefix",
      "Sunucu doluyken giriş önceliği",
      "Renkli yazı (sınırlı)",
      "Küçük VIP eşyalar",
      "/hat, /me komutları",
    ],
    color: "bg-green-500",
    emoji: "🟢",
  },
  {
    name: "MVIP",
    price: 29.99,
    features: [
      "Haftalık 10.000 coin",
      "Market alışverişlerinde %5 indirim",
      "1 özel pet kullanımı",
      "Renkli zırh parlatma",
      "Kozmetik komutlara erişim",
      "/craft, /feed komutları",
    ],
    color: "bg-blue-500",
    emoji: "🔵",
  },
  {
    name: "MVIP_PLUS",
    price: 39.99,
    features: [
      "Haftalık 15.000 coin",
      "Market alışverişlerinde %7 indirim",
      "2 özel pet slotu",
      "Gelişmiş kozmetikler (pelerin, efekt)",
      "İsmin sunucuda duyurulması",
      "/enderchest, /workbench",
    ],
    color: "bg-blue-300",
    emoji: "🔷",
  },
  {
    name: "ULTRAVIP",
    price: 59.9,
    features: [
      "Haftalık 25.000 coin",
      "Market alışverişlerinde %10 indirim",
      "3 özel pet slotu",
      "Partikül & alev efektleri",
      "Sunucu sırası atlama",
      "Belirli alanlarda /fly kullanımı",
    ],
    color: "bg-purple-500",
    emoji: "🟣",
  },
  {
    name: "MUNJAVIP",
    price: 99.99,
    features: [
      "Haftalık 50.000 coin",
      "Market alışverişlerinde %15 indirim",
      "Sınırsız pet slotu",
      "Tüm kozmetiklere sınırsız erişim",
      "Özel ikon + aylık tanıtım hakkı",
      "/nick, /rename, sınırlı /vanish",
    ],
    color: "bg-orange-500",
    emoji: "🔶",
  },
];

const rankNameToDisplay: { [key: string]: string } = {
  VIP: "VIP",
  MVIP: "MVIP",
  MVIP_PLUS: "MVIP+",
  ULTRAVIP: "UltraVIP",
  MUNJAVIP: "MunjaVIP",
  ADMIN: "Admin",
  USER: "Kullanıcı",
};

export default function RanksPage() {
  const { data: session, status, update } = useSession();
  const [giftNick, setGiftNick] = useState<{ [key: string]: string }>({});
  const [giftLoading, setGiftLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data.user);
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  const handlePurchase = async (rank: Rank) => {
    if (!session?.user) {
      toast.error("Satın alım için giriş yapmalısınız.");
      return;
    }

    if (session.user.balance < rank.price) {
      toast.error("Yetersiz bakiye!");
      return;
    }

    if (session.user.role === "ADMIN") {
      toast.info("Adminler rütbe satın alamaz.");
      return;
    }

    try {
      const response = await fetch("/api/ranks/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rankName: rank.name, price: rank.price }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Rütbe satın alınamadı.");
      }

      await update();
      toast.success(
        `${rankNameToDisplay[rank.name]} rütbesi başarıyla satın alındı!`
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleGift = async (rank: Rank) => {
    const nick = giftNick[rank.name]?.trim();
    if (!nick) {
      toast.error(
        "Lütfen hediye göndermek istediğiniz kişinin oyun nickini girin."
      );
      return;
    }
    setGiftLoading((prev) => ({ ...prev, [rank.name]: true }));
    try {
      const response = await fetch("/api/ranks/gift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rankName: rank.name,
          price: rank.price,
          targetNickname: nick,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Hediye gönderilemedi.");
      toast.success(data.message || "Hediye başarıyla gönderildi!");
      setGiftNick((prev) => ({ ...prev, [rank.name]: "" }));
      await update();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGiftLoading((prev) => ({ ...prev, [rank.name]: false }));
    }
  };

  // Rütbe efekt ve renk haritası
  const rankEffects: { [key: string]: string } = {
    VIP: "text-green-500 drop-shadow-lg animate-pulse",
    MVIP: "text-blue-500 drop-shadow-lg animate-bounce",
    MVIP_PLUS: "text-blue-300 drop-shadow-lg animate-pulse",
    ULTRAVIP: "text-purple-500 drop-shadow-lg animate-bounce",
    MUNJAVIP: "text-orange-500 drop-shadow-lg animate-pulse",
    ADMIN: "text-red-500 drop-shadow-lg animate-bounce",
    USER: "text-gray-500",
  };

  // Sayaç hesaplama
  let kalanGun = null,
    kalanSaat = null,
    bitisTarihi = null,
    alisTarihi = null;
  if (profile?.roleAssignedAt) {
    alisTarihi = new Date(profile.roleAssignedAt);
    bitisTarihi = new Date(alisTarihi.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = bitisTarihi.getTime() - now.getTime();
    if (diff > 0) {
      kalanGun = Math.floor(diff / (1000 * 60 * 60 * 24));
      kalanSaat = Math.floor((diff / (1000 * 60 * 60)) % 24);
    } else {
      kalanGun = 0;
      kalanSaat = 0;
    }
  }

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Yükleniyor...
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Bu sayfayı görmek için giriş yapmalısınız.
      </div>
    );
  }

  // Artık session.user'ın varlığından eminiz.
  const { user } = session;

  return (
    <div className="container mx-auto p-4 md:p-8 text-white relative">
      <Toaster position="top-center" richColors />
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-black">Rütbe Mağazası</h1>
        <p className="text-lg text-black font-bold">
          Kendinize en uygun rütbeyi seçerek ayrıcalıklardan yararlanın!
        </p>
        <div className="mt-4 p-4 bg-white/10 rounded-lg inline-block">
          <h2 className="text-xl font-bold text-black">Mevcut Durumunuz</h2>
          <div className="flex flex-col items-center justify-center gap-4 mt-2">
            <span
              className={`text-4xl font-extrabold ${
                rankEffects[profile?.role || "USER"] || ""
              }`}
              style={{ letterSpacing: 2 }}
            >
              {profile
                ? rankNameToDisplay[profile.role] || "Bilinmiyor"
                : "..."}
            </span>
            <Badge variant="secondary">
              Bakiyeniz: {Number(profile?.balance ?? 0).toFixed(2)} TL
            </Badge>
          </div>
        </div>
      </header>
      {/* Sayaç sağ alt köşe */}
      {profile?.roleAssignedAt && (
        <div className="fixed bottom-6 right-6 bg-black/80 text-white rounded-lg shadow-lg p-4 z-50 flex flex-col items-end">
          <div className="text-lg font-bold mb-1">
            Rütbe Başlangıcı: {alisTarihi?.toLocaleString("tr-TR")}
          </div>
          <div className="text-md font-semibold mb-1">
            Bitiş: {bitisTarihi?.toLocaleString("tr-TR")}
          </div>
          <div className="text-2xl font-extrabold text-green-400">
            {kalanGun} gün {kalanSaat} saat kaldı
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {ranks.map((rank) => (
          <Card
            key={rank.name}
            className="bg-gray-800 border-gray-700 text-white flex flex-col"
          >
            <CardHeader className={`text-white rounded-t-lg ${rank.color}`}>
              <CardTitle className="text-2xl font-bold text-center">
                {rank.emoji} {rankNameToDisplay[rank.name]}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-grow flex flex-col">
              <p className="text-3xl font-bold text-center mb-4">
                {rank.price}₺{" "}
                <span className="text-sm font-normal text-gray-400">
                  /aylık
                </span>
              </p>
              <ul className="space-y-2 text-gray-300 flex-grow">
                {rank.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">✔</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-6 w-full ${rank.color} hover:brightness-110`}
                onClick={() => handlePurchase(rank)}
              >
                Satın Al
              </Button>
              <div className="mt-4 flex flex-col gap-2">
                <input
                  type="text"
                  className="rounded px-3 py-2 text-black"
                  placeholder="Oyun nickini girin"
                  value={giftNick[rank.name] || ""}
                  onChange={(e) =>
                    setGiftNick((prev) => ({
                      ...prev,
                      [rank.name]: e.target.value,
                    }))
                  }
                  disabled={giftLoading[rank.name]}
                />
                <Button
                  className={`w-full ${rank.color} hover:brightness-110`}
                  onClick={() => handleGift(rank)}
                  disabled={giftLoading[rank.name]}
                >
                  {giftLoading[rank.name] ? "Gönderiliyor..." : "Hediye Gönder"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
