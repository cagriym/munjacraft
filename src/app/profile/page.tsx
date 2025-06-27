"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Lock,
  MessageSquare,
  LogOut,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import RanksPage from "../ranks/page";
import turkiyeIlIlce from "@/lib/turkiye-il-ilce.json";
import ilDataRaw from "@/lib/il.json";
import ilceDataRaw from "@/lib/ilce.json";
import Navbar from "@/components/Navbar";
import AdminUsersPage from "../admin/users/page";

interface User {
  id: number;
  email: string;
  fullname: string;
  nickname: string;
  birthdate: string | Date;
  role: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  region?: string;
}

const countries = [
  { value: "tr", label: "Türkiye" },
  { value: "us", label: "Amerika Birleşik Devletleri" },
  { value: "de", label: "Almanya" },
  { value: "fr", label: "Fransa" },
  { value: "uk", label: "Birleşik Krallık" },
  { value: "ru", label: "Rusya" },
  { value: "az", label: "Azerbaycan" },
  { value: "sa", label: "Suudi Arabistan" },
  { value: "nl", label: "Hollanda" },
  { value: "it", label: "İtalya" },
  { value: "es", label: "İspanya" },
  { value: "other", label: "Diğer" },
];

const iller = (turkiyeIlIlce as any[])
  .filter(
    (row) =>
      row.type !== "header" &&
      row.type !== "database" &&
      row.type !== "table" &&
      row.name === "MERKEZ"
  )
  .map((row) => ({ il_id: row.il_id, il_adi: row.il_adi || row.name }));

const ilcelerByIl = (il_id: string) =>
  (turkiyeIlIlce as any[])
    .filter(
      (row) =>
        row.type !== "header" &&
        row.type !== "database" &&
        row.type !== "table" &&
        row.il_id === il_id
    )
    .map((row) => row.name);

// Yeni il ve ilçe datasını işle
const ilData = (ilDataRaw as any[]).find(
  (x) => x.type === "table" && x.name === "il"
).data;
const ilceData = (ilceDataRaw as any[]).find(
  (x) => x.type === "table" && x.name === "ilce"
).data;

interface ProfileInfoProps {
  onProfileUpdate: (user: any) => void;
}

const ProfileInfo = ({ onProfileUpdate }: ProfileInfoProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [selectedIlId, setSelectedIlId] = useState<string>("");
  const [selectedIlceId, setSelectedIlceId] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Veri çekilemedi");
        const data = await res.json();
        setUser(data.user);
        onProfileUpdate(data.user);
      } catch (error) {
        console.error(error);
        toast.error("Kullanıcı bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      // il adı -> id eşlemesi
      const il = ilData.find((i: any) => i.name === user.city);
      setSelectedIlId(il ? il.id : "");
      const ilce = ilceData.find(
        (i: any) => i.name === user.district && i.il_id === (il ? il.id : "")
      );
      setSelectedIlceId(ilce ? ilce.id : "");
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const il = ilData.find((i: any) => i.id === selectedIlId)?.name || "";
      const ilce =
        ilceData.find((i: any) => i.id === selectedIlceId)?.name || "";
      const addressStr = ["Türkiye", il, ilce].filter(Boolean).join(", ");
      setUser((prev) =>
        prev
          ? {
              ...prev,
              address: addressStr,
              country: "tr",
              city: il,
              district: ilce,
            }
          : null
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIlId, selectedIlceId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Güncelleme başarısız oldu.");
      }
      toast.success("Profil başarıyla güncellendi!");
      if (data.user) {
        onProfileUpdate(data.user);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const handleOpen = (e: any) => {
      document.body.style.overflow = "unset";
    };
    window.addEventListener("mousedown", handleOpen, true);
    return () => window.removeEventListener("mousedown", handleOpen, true);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = "unset";
      }
      if (
        document.body.style.paddingRight &&
        document.body.style.paddingRight !== "0px"
      ) {
        document.body.style.paddingRight = "0px";
      }
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null; // or a not found message

  return (
    <Card>
      <CardHeader>
        <CardTitle>Genel Bilgiler</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nickname">Kullanıcı Adı</Label>
              <Input id="nickname" defaultValue={user.nickname} disabled />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">E-Posta</Label>
                {!editingEmail && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingEmail(true);
                      setNewEmail(user.email);
                    }}
                  >
                    Değiştir
                  </Button>
                )}
                {editingEmail && (
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setEditingEmail(false)}
                  >
                    Vazgeç
                  </Button>
                )}
              </div>
              <Input
                id="email"
                name="email"
                type="email"
                value={editingEmail ? newEmail : user.email}
                onChange={
                  editingEmail ? (e) => setNewEmail(e.target.value) : undefined
                }
                disabled={!editingEmail}
              />
              {editingEmail && (
                <Button
                  type="button"
                  size="sm"
                  className="mt-2"
                  onClick={async () => {
                    setIsUpdating(true);
                    try {
                      const res = await fetch("/api/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...user, email: newEmail }),
                      });
                      if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(
                          errorData.error || "E-posta güncellenemedi."
                        );
                      }
                      setUser((prev) =>
                        prev ? { ...prev, email: newEmail } : prev
                      );
                      setEditingEmail(false);
                      toast.success("E-posta başarıyla güncellendi!");
                    } catch (error: any) {
                      toast.error(error.message);
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating || !newEmail || newEmail === user.email}
                >
                  Kaydet
                </Button>
              )}
            </div>
          </div>

          <h3 className="text-lg font-medium border-t pt-4">İsim ve Soyisim</h3>
          <div className="space-y-2">
            <Label htmlFor="fullname">İsim ve Soyisim</Label>
            <Input
              id="fullname"
              name="fullname"
              value={user.fullname || ""}
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-medium border-t pt-4">Doğum Tarihi</h3>
          <div className="space-y-2">
            <Label htmlFor="birthdate">Doğum tarihi</Label>
            <Input
              id="birthdate"
              name="birthdate"
              type="date"
              value={
                user.birthdate
                  ? new Date(user.birthdate).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleChange}
            />
          </div>

          <h3 className="text-lg font-medium border-t pt-4">Adres Bilgileri</h3>
          <p className="text-sm text-gray-500">
            Adres bilgileri, size kargo, çekiliş, turnuva gibi fiziki teslimat
            gerektiren durumlarda size en hızlı şekilde ulaşmamız için
            gereklidir. Bu bilgileri eksiksiz doldurarak size ulaşmamızı
            kolaylaştırabilirsiniz. Telefon Numaranız ve diğer bilgileriniz 3.
            şahıslar ile paylaşılmaz.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon Numarası</Label>
              <Input
                id="phone"
                name="phone"
                value={user.phone || ""}
                onChange={handleChange}
                className="bg-white text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="country">Ülke</Label>
              <select
                id="country"
                name="country"
                className="w-full border rounded px-2 py-1 bg-white text-black"
                value="tr"
                disabled
              >
                <option value="tr">Türkiye</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">İl</Label>
              <select
                id="city"
                name="city"
                className="w-full border rounded px-2 py-1 bg-white text-black"
                value={selectedIlId}
                onChange={(e) => {
                  setSelectedIlId(e.target.value);
                  setSelectedIlceId("");
                }}
                required
              >
                <option value="">Seçiniz</option>
                {ilData
                  .sort((a: any, b: any) => a.name.localeCompare(b.name))
                  .map((il: any) => (
                    <option key={il.id} value={il.id}>
                      {il.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">İlçe</Label>
              <select
                id="district"
                name="district"
                className="w-full border rounded px-2 py-1 bg-white text-black"
                value={selectedIlceId}
                onChange={(e) => setSelectedIlceId(e.target.value)}
                required
                disabled={!selectedIlId}
              >
                <option value="">Seçiniz</option>
                {selectedIlId &&
                  ilceData
                    .filter((ilce: any) => ilce.il_id === selectedIlId)
                    .map((ilce: any) => (
                      <option key={ilce.id} value={ilce.id}>
                        {ilce.name}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="address">Adres</Label>
            <Textarea
              id="address"
              name="address"
              value={user.address || ""}
              readOnly
              disabled
              className="bg-white text-black"
            />
          </div>

          <p className="text-xs text-gray-500 pt-4 border-t">
            * İşaretli alanların eksiksiz ve doğru bir şekilde doldurulduğundan
            emin olmalısınız.
            <br />* Verdiğiniz bilgilerin doğruluğu sizin sorumluluğunuzdadır.
            Yanlış beyan edilen bilgilerden MunjaCraft sorumlu değildir.
          </p>

          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Güncelle
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const ChangePassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor!");
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Şifre değiştirilemedi.");
      }
      toast.success("Şifre başarıyla değiştirildi!");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Şifre Değiştir</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mevcut Şifre</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Yeni Şifre</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Şifreyi Güncelle
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const Ranks = () => (
  <div className="mt-4">
    <RanksPage />
  </div>
);

const UserManagement = AdminUsersPage;

const Messages = () => {
  // Placeholder data
  const conversations = [
    { id: 1, name: "Admin", lastMessage: "Merhaba, nasılsın?", time: "10:30" },
    {
      id: 2,
      name: "Ahmet",
      lastMessage: "Oyun ne zaman başlıyor?",
      time: "Dün",
    },
  ];

  const selectedConversation = [
    { id: 1, sender: "Admin", text: "Merhaba, nasılsın?", time: "10:30" },
    { id: 2, sender: "Sen", text: "İyiyim, teşekkürler!", time: "10:31" },
  ];

  return (
    <Card className="h-[70vh] flex">
      <div className="w-1/3 border-r">
        <CardHeader>
          <Input placeholder="Kullanıcı ara..." />
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {conversations.map((c) => (
              <li key={c.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {c.lastMessage}
                </p>
                <p className="text-xs text-gray-400 text-right">{c.time}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      <div className="w-2/3 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>Admin</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "Sen" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 ${
                  msg.sender === "Sen"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </CardContent>
        <div className="p-4 border-t">
          <div className="relative">
            <Textarea placeholder="Bir mesaj yazın..." className="pr-16" />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Gönder
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [profile, setProfile] = useState<any>(null);
  const [isAddressVerified, setIsAddressVerified] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const menuItems = [
    { id: "profile", label: "Genel Bilgiler", icon: UserIcon },
    { id: "password", label: "Şifre Değiştir", icon: Lock },
    { id: "messages", label: "Mesajlarım", icon: MessageSquare },
    { id: "ranks", label: "Rütbeler", icon: ShieldCheck },
  ];

  if (isAdmin) {
    menuItems.push({ id: "users", label: "Kullanıcı Yönetimi", icon: Users });
  }

  const handleProfileUpdate = (user: any) => {
    setProfile(user);
    setIsAddressVerified(user.isAddressVerified);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileInfo onProfileUpdate={handleProfileUpdate} />;
      case "password":
        return <ChangePassword />;
      case "messages":
        return <Messages />;
      case "ranks":
        return <Ranks />;
      case "users":
        return isAdmin ? <UserManagement /> : null;
      default:
        return null;
    }
  };

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = "unset";
      }
      if (
        document.body.style.paddingRight &&
        document.body.style.paddingRight !== "0px"
      ) {
        document.body.style.paddingRight = "0px";
      }
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <Navbar isAddressVerified={isAddressVerified} />
      <Toaster richColors />
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                {/* <img src="/path-to-avatar.png" alt="Avatar" className="w-16 h-16 rounded-full" /> */}
                <div>
                  {isAddressVerified ? (
                    <span className="px-2 py-1 rounded bg-green-600 text-white text-xs font-bold mb-1 block">
                      Onaylı Kullanıcı
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold mb-1 block">
                      Onaylanmadı
                    </span>
                  )}
                  <h2 className="text-lg font-semibold">
                    Hoşgeldin "
                    {profile?.nickname ||
                      profile?.name ||
                      session?.user?.name ||
                      "Kullanıcı"}
                    "
                  </h2>
                  <p className="text-sm text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <Separator />
              <nav className="mt-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === item.id
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
                <Separator />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Çıkış Yap</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3">{renderContent()}</main>
      </div>
    </div>
  );
}
