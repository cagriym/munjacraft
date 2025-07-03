"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");
  const [balanceBlur, setBalanceBlur] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data.user);
      setLoadingProfile(false);
    };
    fetchProfile();
    (window as any).fetchProfile = fetchProfile;
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
      if (typeof (window as any).fetchProfile === "function")
        (window as any).fetchProfile();
      toast.success(
        `${rankNameToDisplay[rank.name]} rütbesi başarıyla satın alındı!`
      );
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleLoadBalance = async () => {
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      setBalanceError("Lütfen geçerli bir tutar girin.");
      return;
    }
    if (amount < 50) {
      setBalanceError("Minimum 50 TL bakiye yükleyebilirsiniz.");
      return;
    }
    setBalanceError("");
    setBalanceLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: amount }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Bakiye güncellenemedi.");
      }
      await update(); // Session'ı güncelle
      if (typeof (window as any).fetchProfile === "function") {
        (window as any).fetchProfile(); // Profil bilgisini yeniden çek
      }
      toast.success("Bakiye başarıyla yüklendi!");
      setShowBalanceModal(false);
      setBalanceAmount("");
    } catch (error: any) {
      setBalanceError(error.message);
      toast.error(error.message);
    } finally {
      setBalanceLoading(false);
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
      if (typeof (window as any).fetchProfile === "function")
        (window as any).fetchProfile();
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
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="container mx-auto p-4 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Rütbe Mağazası</h1>
        <div className="text-right">
          <h3 className="text-lg font-semibold text-orange-400">
            Hemen Bakiye Yükle!
          </h3>
          <Button
            onClick={() => setShowBalanceModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
          >
            Yükle
          </Button>
        </div>
      </div>

      <Dialog open={showBalanceModal} onOpenChange={setShowBalanceModal}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Bakiye Yükle</DialogTitle>
            <DialogDescription>
              Yüklemek istediğiniz tutarı girin. Minimum 50 TL
              yükleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="Tutar (örn: 100)"
              className="bg-gray-700 border-gray-600 text-white"
              min="50"
            />
            {balanceError && (
              <p className="text-red-500 text-sm mt-2">{balanceError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBalanceModal(false)}
            >
              İptal
            </Button>
            <Button
              onClick={handleLoadBalance}
              disabled={balanceLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {balanceLoading ? "Yükleniyor..." : "Onayla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-gray-800/10 backdrop-blur-sm p-4 rounded-lg mb-6 flex justify-between items-center">
        <div>
          <span className="text-lg">Mevcut Rütben: </span>
          <span
            className={`text-2xl font-bold ${
              rankEffects[
                profile?.role === "ADMIN" ? "ADMIN" : profile?.rank || "USER"
              ] || ""
            }`}
          >
            {profile
              ? profile.role === "ADMIN"
                ? rankNameToDisplay["ADMIN"]
                : rankNameToDisplay[profile.rank] || "Kullanıcı"
              : "..."}
          </span>
        </div>
        <div>
          <span className="text-lg">Bakiye: </span>
          <span
            className={`font-bold transition-all duration-300 ${
              balanceBlur ? "blur-sm" : "blur-none"
            }`}
            onClick={() => setBalanceBlur((prev) => !prev)}
            style={{ cursor: "pointer" }}
            title="Bakiyeyi göster/gizle"
          >
            {Number(profile?.balance ?? 0).toFixed(2)} TL
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ranks.map((rank) => (
          <Card
            key={rank.name}
            className="bg-gray-800 border-gray-700 text-white flex flex-col min-w-[260px] max-w-[320px] w-full sm:w-[300px]"
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
              {!isAdmin && (
                <Button
                  className={`mt-6 w-full ${rank.color} hover:brightness-110`}
                  onClick={() => handlePurchase(rank)}
                >
                  Satın Al
                </Button>
              )}
              <div className="mt-4 flex flex-col gap-2">
                <input
                  type="text"
                  className="rounded px-3 py-2 text-white bg-gray-800 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
