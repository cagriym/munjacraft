"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

const rankEffects: { [key: string]: string } = {
  VIP: "text-green-500 drop-shadow-lg animate-pulse",
  MVIP: "text-blue-500 drop-shadow-lg animate-bounce",
  MVIP_PLUS: "text-blue-300 drop-shadow-lg animate-pulse",
  ULTRAVIP: "text-purple-500 drop-shadow-lg animate-bounce",
  MUNJAVIP: "text-orange-500 drop-shadow-lg animate-pulse",
  ADMIN: "text-red-500 drop-shadow-lg animate-bounce",
  USER: "text-gray-500",
};
const rankNameToDisplay: { [key: string]: string } = {
  VIP: "VIP",
  MVIP: "MVIP",
  MVIP_PLUS: "MVIP+",
  ULTRAVIP: "UltraVIP",
  MUNJAVIP: "MunjaVIP",
  ADMIN: "Admin",
  USER: "Kullanıcı",
};

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params?.id;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");
      try {
        if (!userId || isNaN(Number(userId))) {
          setError("Geçersiz kullanıcı ID");
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/profile/${userId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Kullanıcı bulunamadı");
        } else {
          setUser(data.user);
        }
      } catch (e) {
        setError("Sunucu hatası");
        console.error("Profil görüntüle hata:", e, userId);
      }
      setLoading(false);
    }
    if (userId) fetchUser();
  }, [userId]);

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-2 md:p-4">
      <Card className="w-full max-w-xl shadow-2xl bg-gray-50/80 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center gap-2 p-4 md:p-8">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="Profil"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold border-4 border-gray-200">
              {user.nickname?.[0] || user.fullname?.[0] || "?"}
            </div>
          )}
          <CardTitle className="text-3xl mt-4">
            {user.nickname || user.fullname}
          </CardTitle>
          <div className="flex gap-2 mt-2">
            <span
              className={`text-xl font-bold ${
                rankEffects[
                  user.role === "ADMIN" ? "ADMIN" : user.rank || "USER"
                ] || ""
              }`}
            >
              {user
                ? user.role === "ADMIN"
                  ? rankNameToDisplay["ADMIN"]
                  : rankNameToDisplay[user.rank] || "Kullanıcı"
                : "..."}
            </span>
            {user.isBanned && <Badge variant="destructive">Banlı</Badge>}
          </div>
          {session?.user?.id &&
            String(session.user.id) !== String(user.id) &&
            null}
        </CardHeader>
        <CardContent className="space-y-4 text-lg md:text-xl">
          {user.fullname && (
            <div>
              <b>Ad Soyad:</b> {user.fullname}
            </div>
          )}
          <div>
            <b>Kullanıcı Adı:</b> {user.nickname}
          </div>
          <div>
            <b>Profil Oluşturma:</b> {new Date(user.createdAt).toLocaleString()}
          </div>
          {user.lastSeen && (
            <div>
              <b>Son Giriş:</b> {new Date(user.lastSeen).toLocaleString()}
            </div>
          )}
          {user.bio && (
            <div>
              <b>Hakkında:</b> {user.bio}
            </div>
          )}
          {user.isBanned && (
            <div className="mt-2">
              <b>Ban Nedeni:</b> {user.banReason || "Belirtilmemiş"}
              <br />
              {user.banUntil && (
                <span>
                  <b>Ban Bitiş:</b> {new Date(user.banUntil).toLocaleString()}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
