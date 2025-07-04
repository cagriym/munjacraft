"use client";
import { useState, useEffect, useRef } from "react";
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
  Check,
  CheckCheck,
  ChevronDown,
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
  SelectGroup,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import RanksPage from "../ranks/page";
import turkiyeIlIlce from "@/lib/turkiye-il-ilce.json";
import ilDataRaw from "@/lib/il.json";
import ilceDataRaw from "@/lib/ilce.json";
import Navbar from "@/components/Navbar";
import AdminUsersPage from "../admin/users/page";
import MessagesPage from "../messages/page";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getSocket } from "@/lib/socket";

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

const Messages = ({
  handleTabChange,
}: {
  handleTabChange?: (tab: string) => void;
}) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState({
    incoming: [],
    outgoing: [],
  });
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  let typingTimeout: any = null;
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const [windowFocused, setWindowFocused] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    msgId: number | null;
  }>({ x: 0, y: 0, msgId: null });
  const [editMessageId, setEditMessageId] = useState<number | null>(null);
  const [editMessageInput, setEditMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddressVerified, setIsAddressVerified] = useState<boolean>(
    session?.user?.isAddressVerified ?? false
  );
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesPanelRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsAddressVerified(session?.user?.isAddressVerified ?? false);
  }, [session]);

  // Son arananlar backend'den yükle
  useEffect(() => {
    if (showUserSearch) {
      fetch("/api/profile/search-history")
        .then((res) => res.json())
        .then((data) => {
          if (data.history)
            setRecentUsers(
              data.history.map((h: any) => h.queryUser).filter(Boolean)
            );
        });
    }
  }, [showUserSearch]);

  // Arkadaşlar listesini yükle
  useEffect(() => {
    setLoading(true);
    fetch("/api/friends")
      .then((res) => res.json())
      .then((data) => {
        if (data.friends) setFriends(data.friends);
      })
      .finally(() => setLoading(false));
  }, []);

  // selectedFriend'i localStorage'dan yükle
  useEffect(() => {
    const last = localStorage.getItem("selectedFriend");
    if (last) setSelectedFriend(Number(last));
  }, []);

  // selectedFriend değişince localStorage'a kaydet
  useEffect(() => {
    if (selectedFriend)
      localStorage.setItem("selectedFriend", String(selectedFriend));
  }, [selectedFriend]);

  // selectedFriend değişince mesajları fetch et
  useEffect(() => {
    if (!selectedFriend) return;
    setLoadingMessages(true);
    fetch(`/api/messages?with=${selectedFriend}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoadingMessages(false);
      });
  }, [selectedFriend]);

  // Mesajlar için 5 saniyede bir polling fallback (socket koparsa reload gerekmesin)
  useEffect(() => {
    if (!selectedFriend) return;
    const interval = setInterval(() => {
      fetch(`/api/messages?with=${selectedFriend}`)
        .then((res) => res.json())
        .then((data) => {
          setMessages((prev: any[]) => {
            // Sadece yeni mesaj varsa ekle
            if (!data.messages) return prev;
            if (prev.length === data.messages.length) return prev;
            return data.messages;
          });
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedFriend]);

  // Mesajlar state'i güncellendiğinde, karşıdan gelen ve daha önce seen=false olan mesajlar için PATCH ile seen=true yap
  useEffect(() => {
    console.log("PATCH useEffect tetiklendi", {
      messages,
      selectedFriend,
      userId: session?.user?.id,
    });
    if (!selectedFriend || !messages.length) return;
    const unseen = messages.filter(
      (msg: any) => msg.receiverId === session?.user?.id && !msg.seen
    );
    unseen.forEach((msg: any) => {
      fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: msg.id,
          seen: true,
          status: "seen",
          userId: session?.user?.id,
        }),
      });
      setMessages((prev: any[]) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, seen: true, status: "seen" } : m
        )
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedFriend]);

  // Mesajlar state'i güncellendiğinde, kendi gönderdiğin ve delivered=false olan mesajlar için PATCH ile delivered=true yap
  useEffect(() => {
    console.log("PATCH useEffect tetiklendi", {
      messages,
      selectedFriend,
      userId: session?.user?.id,
    });
    if (!selectedFriend || !messages.length) return;
    const undelivered = messages.filter(
      (msg: any) => msg.senderId === session?.user?.id && !msg.delivered
    );
    undelivered.forEach((msg: any) => {
      fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: msg.id,
          delivered: true,
          status: "delivered",
          userId: session?.user?.id,
        }),
      });
      setMessages((prev: any[]) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, delivered: true, status: "delivered" } : m
        )
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, selectedFriend]);

  // Kullanıcı arama (admin için tüm kullanıcılar, normal kullanıcı için arkadaş ekleme)
  async function handleUserSearch(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?q=${encodeURIComponent(searchUser)}`
      );
      const data = await res.json();
      if (res.ok) {
        setSearchResults(data.users.filter((u: any) => !u.isBanned));
      } else {
        setAddError(data.error || "Kullanıcılar getirilemedi");
      }
    } catch (err) {
      setAddError("Sunucu hatası");
    }
    setAddLoading(false);
  }

  // Normal kullanıcı için arkadaş ekleme
  async function handleAddFriend(userId: number, userObj: any) {
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId }),
      });
      const data = await res.json();
      if (!res.ok) setAddError(data.error || "İstek gönderilemedi");
      else {
        setAddError("İstek gönderildi!");
        addToRecent(userObj);
      }
    } catch (err) {
      setAddError("Sunucu hatası");
    }
    setAddLoading(false);
  }

  // Son arananlar/görüntülenenler güncelle (backend)
  async function addToRecent(user: any) {
    await fetch("/api/profile/search-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: user.nickname || user.email }),
    });
    // Tekrar yükle
    fetch("/api/profile/search-history")
      .then((res) => res.json())
      .then((data) => {
        if (data.history)
          setRecentUsers(
            data.history.map((h: any) => h.queryUser).filter(Boolean)
          );
      });
  }

  useEffect(() => {
    const socket = getSocket();
    if (!session?.user?.id) return;
    socket.emit("join", session.user.id);
    // delivered eventini dinle
    socket.on("delivered", async (data) => {
      console.log("SOCKET DELIVERED EVENT", data);
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: data.messageId,
          delivered: true,
          userId: session?.user?.id,
        }),
      });
      const result = await res.json();
      console.log("PATCH DELIVERED RESPONSE", result);
      setMessages((prev: any[]) =>
        prev.map((m) =>
          m.id === data.messageId
            ? { ...m, delivered: true, status: "delivered" }
            : m
        )
      );
    });
    // seen eventini dinle
    socket.on("seen", async (data) => {
      console.log("SOCKET SEEN EVENT", data);
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: data.messageId,
          seen: true,
          userId: session?.user?.id,
        }),
      });
      const result = await res.json();
      console.log("PATCH SEEN RESPONSE", result);
      setMessages((prev: any[]) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, seen: true, status: "seen" } : m
        )
      );
    });
    return () => {
      socket.off("delivered");
      socket.off("seen");
    };
  }, [session?.user?.id]);

  // Mesajlar güncellendiğinde delivered/seen eventlerini socket ile bildir
  useEffect(() => {
    console.log(
      "messages:",
      messages,
      "session.user.id:",
      session?.user?.id,
      "selectedFriend:",
      selectedFriend
    );
    messages.forEach((msg) => {
      console.log(
        "msg",
        msg,
        "receiverId",
        msg.receiverId,
        "delivered",
        msg.delivered,
        "seen",
        msg.seen
      );
    });
    const socket = getSocket();
    if (!selectedFriend || !session?.user?.id) return;
    for (const msg of messages) {
      if (
        Number(msg.receiverId) === Number(session.user.id) &&
        (!msg.delivered || !msg.seen)
      ) {
        console.log("PATCH gönderiliyor", msg);
        fetch("/api/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId: msg.id,
            delivered: !msg.delivered ? true : undefined,
            seen: !msg.seen ? true : undefined,
            userId: session.user.id,
          }),
        })
          .then((res) => res.json())
          .then(console.log);
        if (!msg.delivered)
          socket.emit("delivered", { to: msg.senderId, messageId: msg.id });
        if (!msg.seen)
          socket.emit("seen", { to: msg.senderId, messageId: msg.id });
      }
    }
  }, [messages, selectedFriend, session?.user?.id]);

  // Mesaj inputunda yazma olayı
  const handleInputChange = (e: any) => {
    setMessageInput(e.target.value);
    if (!selectedFriend || !session?.user?.id) return;
    const socket = getSocket();
    socket.emit("typing", { to: selectedFriend, from: session.user.id });
  };

  // Typing eventini dinle
  useEffect(() => {
    const socket = getSocket();
    socket.on("typing", (data) => {
      if (data.from === selectedFriend) {
        setFriendTyping(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setFriendTyping(false), 2000);
      }
    });
    return () => {
      socket.off("typing");
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [selectedFriend]);

  // Scroll-to-bottom butonu için scroll event handler fonksiyonunu dışarı al
  function handleScroll(
    panel: HTMLDivElement | null,
    setShowScrollToBottom: (v: boolean) => void
  ) {
    if (!panel) return;
    const distanceFromBottom =
      panel.scrollHeight - panel.scrollTop - panel.clientHeight;
    const atBottom = distanceFromBottom < 10;
    setShowScrollToBottom(!atBottom);
  }

  useEffect(() => {
    const panel = messagesPanelRef.current;
    if (!panel) return;
    const scrollHandler = () => handleScroll(panel, setShowScrollToBottom);
    panel.addEventListener("scroll", scrollHandler);
    scrollHandler();
    return () => panel.removeEventListener("scroll", scrollHandler);
  }, [messages]);

  const scrollToBottom = () => {
    const panel = messagesPanelRef.current;
    if (panel) {
      panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
      setTimeout(() => {
        handleScroll(panel, setShowScrollToBottom);
      }, 400);
    }
  };

  // Mesaj gönderme fonksiyonu
  const handleSendMessage = async (e: any, focusBack?: boolean) => {
    e.preventDefault();
    if (!messageInput.trim() || sendLoading) return;
    setSendLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedFriend,
          content: messageInput,
        }),
      });
      if (res.ok) {
        setMessageInput("");
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      } else {
        const data = await res.json();
        setSendError(data.error || "Mesaj gönderilemedi.");
      }
    } catch (err) {
      setSendError("Sunucu hatası. Lütfen tekrar deneyin.");
    }
    setSendLoading(false);
    setTimeout(() => {
      if (focusBack && messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }, 0);
  };

  // Mesajlar güncellendiğinde otomatik scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      // Sadece sohbet kutusunu aşağı kaydır, tüm sayfayı değil
      messagesEndRef.current.parentElement?.scrollTo({
        top: messagesEndRef.current.parentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Pencere odağı kontrolü
  useEffect(() => {
    const onFocus = () => setWindowFocused(true);
    const onBlur = () => setWindowFocused(false);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Yeni mesaj bildirimi
  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg.receiverId === session?.user?.id &&
      (!windowFocused ||
        (messagesEndRef.current &&
          messagesEndRef.current.getBoundingClientRect().bottom - 100 >
            window.innerHeight))
    ) {
      setNewMessageAlert(true);
      setTimeout(() => setNewMessageAlert(false), 3000);
    }
  }, [messages, windowFocused]);

  // Mesaj silme fonksiyonu
  const handleDeleteMessage = async (msgId: number) => {
    const userId = session?.user?.id;
    if (!userId) {
      alert("Kullanıcı ID bulunamadı!");
      return;
    }
    const res = await fetch("/api/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: msgId, userId }),
    });
    if (res.ok) {
      setMessages((prev: any[]) => prev.filter((m) => m.id !== msgId));
      // Socket ile karşı tarafa bildir
      const socket = getSocket();
      socket.emit("deleted", { to: selectedFriend, messageId: msgId });
    }
  };

  // Mesaj kutusunda sağ tık menüsü
  const handleContextMenu = (e: any, msgId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, msgId });
  };
  const closeContextMenu = () => setContextMenu({ x: 0, y: 0, msgId: null });

  // Mesaj düzenleme fonksiyonu
  const handleEditMessage = async () => {
    if (!editMessageId || !editMessageInput.trim()) return;
    const userId = session?.user?.id;
    if (!userId) {
      alert("Kullanıcı ID bulunamadı!");
      return;
    }
    const res = await fetch("/api/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: editMessageId,
        content: editMessageInput,
        status: "edited",
        userId,
      }),
    });
    if (res.ok) {
      setMessages((prev: any[]) =>
        prev.map((m) =>
          m.id === editMessageId
            ? { ...m, content: editMessageInput, status: "edited" }
            : m
        )
      );
      setEditMessageId(null);
      setEditMessageInput("");
      // Socket ile karşı tarafa bildir
      const socket = getSocket();
      socket.emit("edited", {
        to: selectedFriend,
        messageId: editMessageId,
        content: editMessageInput,
      });
    }
  };

  // Socket ile deleted eventini dinle
  useEffect(() => {
    const socket = getSocket();
    socket.on("deleted", (data) => {
      setMessages((prev: any[]) => prev.filter((m) => m.id !== data.messageId));
    });
    return () => {
      socket.off("deleted");
    };
  }, []);

  // Fetch pending friend requests when modal opens
  useEffect(() => {
    if (showUserSearch && !isAdmin) {
      fetch("/api/friends/requests")
        .then((res) => res.json())
        .then((data) => {
          setPendingRequests({
            incoming: data.incoming || [],
            outgoing: data.outgoing || [],
          });
        });
    }
  }, [showUserSearch, isAdmin]);

  // Add accept/reject handlers
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const res = await fetch(`/api/friends/requests/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        toast.success("Arkadaşlık isteği kabul edildi.");
        setPendingRequests((prev) => ({
          ...prev,
          incoming: prev.incoming.filter((r: any) => r.id !== requestId),
        }));
      } else {
        const data = await res.json();
        toast.error(data.error || "Kabul işlemi başarısız.");
      }
    } catch (err) {
      toast.error("Sunucu hatası.");
    }
  };
  const handleRejectRequest = async (requestId: number) => {
    try {
      const res = await fetch(`/api/friends/requests/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        toast.success("Arkadaşlık isteği reddedildi.");
        setPendingRequests((prev) => ({
          ...prev,
          incoming: prev.incoming.filter((r: any) => r.id !== requestId),
        }));
      } else {
        const data = await res.json();
        toast.error(data.error || "Reddetme işlemi başarısız.");
      }
    } catch (err) {
      toast.error("Sunucu hatası.");
    }
  };

  useEffect(() => {
    const panel = messagesPanelRef.current;
    if (!panel) return;
    setTimeout(() => {
      requestAnimationFrame(() => {
        panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
      });
    }, 0);
  }, [messages, selectedFriend]);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [selectedFriend]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("message", (data) => {
      // data: { to, from, content, sentAt }
      if (
        (String(data.senderId) === String(selectedFriend) &&
          data.receiverId === session?.user?.id) ||
        (data.senderId === session?.user?.id &&
          String(data.receiverId) === String(selectedFriend))
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });
    return () => {
      socket.off("message");
    };
  }, [selectedFriend, session?.user?.id]);

  return (
    <div>
      <Card className="h-[70vh] flex relative">
        {/* Admin için Kullanıcı Ara, normal kullanıcı için Arkadaş Ekle butonu */}
        {isAdmin ? (
          <Button
            className="absolute top-4 right-4 z-10"
            variant="outline"
            onClick={() => setShowUserSearch(true)}
          >
            Kullanıcı Ara
          </Button>
        ) : (
          <Button
            className="absolute top-4 right-4 z-10"
            variant="outline"
            onClick={() => setShowUserSearch(true)}
          >
            Arkadaş Ekle
          </Button>
        )}
        {/* Kullanıcı Ara veya Arkadaş Ekle Pop-up */}
        {showUserSearch && (
          <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isAdmin ? "Kullanıcı Ara" : "Arkadaş Ekle"}
                </DialogTitle>
                <DialogDescription>
                  {isAdmin
                    ? "Kullanıcıları arayabilir ve profillerini görüntüleyebilirsiniz."
                    : "Buradan yeni arkadaş ekleyebilir, son arananları ve bekleyen istekleri görebilirsiniz."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUserSearch} className="flex gap-2 mb-4">
                <Input
                  placeholder={
                    isAdmin
                      ? "Kullanıcı adı veya email ara..."
                      : "Kullanıcı adı veya email ara..."
                  }
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                />
                <Button type="submit" disabled={addLoading}>
                  Ara
                </Button>
              </form>
              {addError && <div className="text-red-500 mb-2">{addError}</div>}
              {/* Son arananlar ve arama sonuçları */}
              {searchUser.trim() === "" ? (
                <>
                  <div className="font-semibold mb-2">Son Arananlar</div>
                  <ul className="max-h-48 overflow-y-auto divide-y">
                    {recentUsers.length === 0 && (
                      <li className="p-2 text-gray-400">Kayıt yok.</li>
                    )}
                    {recentUsers.map((u: any) => (
                      <li
                        key={u.id}
                        className="flex items-center justify-between p-2 gap-2"
                      >
                        <span>{u.nickname || u.email}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => router.push(`/profile/${u.id}`)}
                          >
                            Profilini Görüntüle
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAddFriend(u.id, u)}
                          >
                            Ekle
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {/* Bekleyen İstekler */}
                  <div className="font-semibold mt-4 mb-2">
                    Bekleyen İstekler
                  </div>
                  {pendingRequests.incoming.length === 0 &&
                  pendingRequests.outgoing.length === 0 ? (
                    <div className="text-gray-400 text-sm">
                      Bekleyen istek yok.
                    </div>
                  ) : (
                    <>
                      {pendingRequests.incoming.length > 0 && (
                        <div className="mb-1">
                          <div className="text-sm font-medium">
                            Gelen İstekler
                          </div>
                          <ul className="pl-2">
                            {pendingRequests.incoming.map((req: any) => (
                              <li
                                key={req.id}
                                className="text-xs flex items-center gap-1 py-1"
                              >
                                {req.requester?.avatar ? (
                                  <img
                                    src={req.requester.avatar}
                                    alt="Avatar"
                                    className="w-5 h-5 rounded-full object-cover border"
                                  />
                                ) : (
                                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold border text-black">
                                    {req.requester?.nickname?.[0]?.toUpperCase() ||
                                      req.requester?.fullname?.[0]?.toUpperCase() ||
                                      "?"}
                                  </div>
                                )}
                                <span className="truncate max-w-[80px]">
                                  {req.requester?.nickname ||
                                    req.requester?.fullname ||
                                    req.requester?.email}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleAcceptRequest(req.id)}
                                  >
                                    Kabul
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectRequest(req.id)}
                                  >
                                    Red
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {pendingRequests.outgoing.length > 0 && (
                        <div>
                          <div className="text-sm font-medium">
                            Gönderilen İstekler
                          </div>
                          <ul className="pl-2">
                            {pendingRequests.outgoing.map((req: any) => (
                              <li
                                key={req.id}
                                className="text-sm flex items-center gap-2"
                              >
                                {req.addressee?.avatar ? (
                                  <img
                                    src={req.addressee.avatar}
                                    alt="Avatar"
                                    className="w-6 h-6 rounded-full object-cover border"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border text-black">
                                    {req.addressee?.nickname?.[0]?.toUpperCase() ||
                                      req.addressee?.fullname?.[0]?.toUpperCase() ||
                                      "?"}
                                  </div>
                                )}
                                <span>
                                  {req.addressee?.nickname ||
                                    req.addressee?.fullname ||
                                    req.addressee?.email}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="font-semibold mb-2">Arama Sonuçları</div>
                  <ul className="max-h-48 overflow-y-auto divide-y">
                    {searchResults.map((u: any) => {
                      const isFriend = friends.some((f: any) => f.id === u.id);
                      return (
                        <li
                          key={u.id}
                          className="flex items-center justify-between p-2 gap-2"
                        >
                          <span>{u.nickname || u.email}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => router.push(`/profile/${u.id}`)}
                            >
                              Profilini Görüntüle
                            </Button>
                            {isFriend ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setShowUserSearch(false);
                                  setSelectedFriend(u.id);
                                  if (typeof window !== "undefined") {
                                    localStorage.setItem(
                                      "profileActiveTab",
                                      "messages"
                                    );
                                    if (!handleTabChange)
                                      window.location.reload();
                                  }
                                  if (typeof handleTabChange === "function")
                                    handleTabChange("messages");
                                }}
                              >
                                Mesaj
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleAddFriend(u.id, u)}
                              >
                                Ekle
                              </Button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {/* Son arananlar da gösterilsin */}
                  {recentUsers.length > 0 && (
                    <>
                      <div className="font-semibold mt-4 mb-2">
                        Son Arananlar
                      </div>
                      <ul className="max-h-32 overflow-y-auto divide-y">
                        {recentUsers.map((u: any) => (
                          <li
                            key={u.id}
                            className="flex items-center justify-between p-2 gap-2"
                          >
                            <span>{u.nickname || u.email}</span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => router.push(`/profile/${u.id}`)}
                              >
                                Profilini Görüntüle
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAddFriend(u.id, u)}
                              >
                                Ekle
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowUserSearch(false)}
                >
                  Kapat
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {/* Eski mesajlar paneli aşağıda */}
        <div className="w-1/3 border-r">
          <CardHeader>
            <Input placeholder="Kullanıcı ara..." />
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {/* Arkadaşlar burada listelenecek */}
              {friends.map((f) => {
                const isOnline =
                  f.lastSeen &&
                  new Date(f.lastSeen) > new Date(Date.now() - 10 * 1000);
                return (
                  <li
                    key={f.id}
                    className={`flex items-center gap-2 mb-1 ${
                      isOnline ? "" : "text-gray-400"
                    }`}
                  >
                    {f.avatar ? (
                      <img
                        src={f.avatar}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border text-black">
                        {f.nickname?.[0]?.toUpperCase() ||
                          f.fullname?.[0]?.toUpperCase() ||
                          "?"}
                      </div>
                    )}
                    <a
                      href={`/profile/${f.id}`}
                      className="font-semibold hover:underline"
                    >
                      {f.nickname || f.fullname || f.email}
                    </a>
                    {isOnline && (
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block ml-1" />
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </div>
        <div className="w-2/3 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Mesajlar</CardTitle>
          </CardHeader>
          <CardContent
            className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar relative"
            ref={messagesPanelRef}
          >
            {/* Mesajlar burada listelenecek */}
            {!selectedFriend && (
              <div className="text-gray-400 text-center mt-8">
                Bir arkadaş seçin
              </div>
            )}
            {selectedFriend && loadingMessages && (
              <div className="text-gray-400 text-center mt-8">
                Yükleniyor...
              </div>
            )}
            {selectedFriend && !loadingMessages && messages.length === 0 && (
              <div className="text-gray-400 text-center mt-8">
                Henüz mesaj yok.
              </div>
            )}
            {selectedFriend &&
              !loadingMessages &&
              messages.length > 0 &&
              messages.map((msg: any) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  isMe={Number(msg.senderId) === Number(session?.user?.id)}
                  handleContextMenu={handleContextMenu}
                  myAvatar={session?.user?.avatar || null}
                  myNickname={session?.user?.nickname || null}
                  friendAvatar={
                    friends.find((f) => f.id === selectedFriend)?.avatar || null
                  }
                  friendNickname={
                    friends.find((f) => f.id === selectedFriend)?.nickname ||
                    null
                  }
                />
              ))}
            {showScrollToBottom && (
              <button
                type="button"
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 z-30 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-3 transition-all flex items-center justify-center"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                aria-label="En alta in"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            )}
          </CardContent>
          <form onSubmit={(e) => handleSendMessage(e, true)}>
            <div className="p-4 border-t">
              <div className="relative">
                <Textarea
                  ref={messageInputRef}
                  placeholder="Bir mesaj yazın..."
                  className="pr-16"
                  value={messageInput}
                  onChange={handleInputChange}
                  disabled={!selectedFriend || sendLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (messageInput.trim() && !sendLoading) {
                        handleSendMessage(e as any, true);
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  disabled={
                    !selectedFriend || !messageInput.trim() || sendLoading
                  }
                >
                  {sendLoading ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    "Gönder"
                  )}
                </Button>
              </div>
              {sendError && (
                <div className="text-xs text-red-500 mt-2">{sendError}</div>
              )}
            </div>
          </form>
          <div ref={messagesEndRef} />
          {friendTyping && (
            <div className="text-xs text-blue-500 px-4 pb-2">Yazıyor...</div>
          )}
          {/* Sağ tık menüsü */}
          {contextMenu.msgId && (
            <div
              style={{
                position: "fixed",
                top: contextMenu.y,
                left: contextMenu.x,
                zIndex: 50,
              }}
              className="bg-white border rounded shadow p-2"
              onClick={closeContextMenu}
            >
              <button
                className="text-blue-600 px-2 py-1 hover:bg-blue-50 rounded"
                onClick={() => {
                  const msg = messages.find((m) => m.id === contextMenu.msgId);
                  setEditMessageId(msg.id);
                  setEditMessageInput(msg.content);
                  closeContextMenu();
                }}
              >
                Düzenle
              </button>
              <button
                className="text-red-600 px-2 py-1 hover:bg-red-50 rounded"
                onClick={() => {
                  handleDeleteMessage(contextMenu.msgId!);
                  closeContextMenu();
                }}
              >
                Mesajı Sil
              </button>
            </div>
          )}
          {/* Mesaj düzenleme inputu */}
          {editMessageId && (
            <div className="flex gap-2 p-2 border-t bg-gray-50">
              <input
                className="flex-1 border rounded px-2 py-1"
                value={editMessageInput}
                onChange={(e) => setEditMessageInput(e.target.value)}
                autoFocus
              />
              <Button size="sm" onClick={handleEditMessage}>
                Kaydet
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditMessageId(null)}
              >
                İptal
              </Button>
            </div>
          )}
          {/* Yeni mesaj bildirimi */}
          {newMessageAlert && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded shadow z-50">
              Yeni mesaj geldi
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// MessageItem props tipi
interface MessageItemProps {
  msg: any;
  isMe: boolean;
  handleContextMenu: (e: React.MouseEvent, msgId: number) => void;
  myAvatar: string | null;
  myNickname: string | null;
  friendAvatar: string | null;
  friendNickname: string | null;
}

function MessageItem({
  msg,
  isMe,
  handleContextMenu,
  myAvatar,
  myNickname,
  friendAvatar,
  friendNickname,
}: MessageItemProps) {
  const [sentAtStr, setSentAtStr] = useState("");
  useEffect(() => {
    setSentAtStr(new Date(msg.sentAt).toLocaleString());
  }, [msg.sentAt]);
  const avatarUrl = isMe ? myAvatar : friendAvatar;
  const avatarName = isMe ? myNickname : friendNickname;
  // WhatsApp-style tikler
  let statusIcon = null;
  if (isMe) {
    if (msg.seen) {
      statusIcon = (
        <span title="Okundu" className="ml-1">
          <CheckCheck className="inline w-4 h-4 text-green-500" />
        </span>
      );
    } else if (msg.delivered) {
      statusIcon = (
        <span title="Teslim edildi" className="ml-1">
          <CheckCheck className="inline w-4 h-4 text-gray-400" />
        </span>
      );
    } else {
      statusIcon = (
        <span title="Gönderildi" className="ml-1">
          <Check className="inline w-4 h-4 text-gray-400" />
        </span>
      );
    }
  }
  return (
    <div
      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
      onContextMenu={isMe ? (e) => handleContextMenu(e, msg.id) : undefined}
    >
      {!isMe &&
        (avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border mr-2 self-end"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border text-black mr-2 self-end">
            {avatarName?.[0]?.toUpperCase() || "?"}
          </div>
        ))}
      <div
        className={`px-3 py-2 rounded-lg max-w-xs relative ${
          isMe ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
        }`}
        style={{ minWidth: 60 }}
      >
        <div
          className={`mb-1 ${
            isMe
              ? "text-lg font-bold text-white"
              : "text-xs font-semibold text-gray-700"
          }`}
        >
          {isMe ? "Siz" : null}
        </div>
        {msg.content}
        <div className="text-xs text-gray-400 mt-1 text-right flex items-center gap-1">
          {sentAtStr}
          {isMe && statusIcon}
        </div>
      </div>
      {isMe &&
        (avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border ml-2 self-end"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border text-black ml-2 self-end">
            {avatarName?.[0]?.toUpperCase() || "?"}
          </div>
        ))}
    </div>
  );
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [profile, setProfile] = useState<any>(null);
  const [isAddressVerified, setIsAddressVerified] = useState<boolean>(
    session?.user?.isAddressVerified ?? false
  );
  const [friends, setFriends] = useState<any[]>([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/friends")
      .then((res) => res.json())
      .then((data) => {
        if (data.friends) setFriends(data.friends);
      })
      .finally(() => setLoading(false));
  }, []);

  const menuItems = [
    { id: "profile", label: "Genel Bilgiler", icon: UserIcon },
    { id: "password", label: "Şifre Değiştir", icon: Lock },
    { id: "messages", label: "Mesajlarım", icon: MessageSquare },
    { id: "ranks", label: "Rütbeler", icon: ShieldCheck },
  ];

  if (isAdmin) {
    menuItems.push({ id: "users", label: "Kullanıcı Yönetimi", icon: Users });
    menuItems.push({ id: "istekler", label: "İstekler", icon: MessageSquare });
  }

  const handleProfileUpdate = (user: any) => {
    setProfile(user);
    setIsAddressVerified(!!user?.isAddressVerified);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      localStorage.setItem("profileActiveTab", tab);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileInfo onProfileUpdate={handleProfileUpdate} />;
      case "password":
        return <ChangePassword />;
      case "messages":
        return <Messages handleTabChange={handleTabChange} />;
      case "ranks":
        return <Ranks />;
      case "users":
        return isAdmin ? <UserManagement /> : null;
      case "istekler":
        return isAdmin ? <IsteklerTab /> : null;
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

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastSeen: new Date() }),
      });
    }, 5000); // 5 saniye
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/friends")
        .then((res) => res.json())
        .then((data) => {
          if (data.friends) setFriends(data.friends);
        });
    }, 5000); // 5 saniye
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tab = localStorage.getItem("profileActiveTab");
      if (tab) setActiveTab(tab);
    }
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <Navbar isAddressVerified={isAddressVerified} />
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              {isAddressVerified ? (
                <div className="mb-4">
                  <span className="px-2 py-1 rounded bg-green-600 text-white text-xs font-bold block text-center">
                    Onaylı Kullanıcı
                  </span>
                </div>
              ) : (
                <div className="mb-4">
                  <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold block text-center">
                    Onaylanmadı
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  Hoşgeldin "
                  {profile?.nickname ||
                    profile?.name ||
                    session?.user?.name ||
                    "Kullanıcı"}
                  "
                </h2>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
              <Separator />
              <nav className="mt-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === item.id
                        ? "bg-gray-200 text-gray-900"
                        : item.id === "istekler"
                        ? "text-blue-600 hover:bg-blue-50"
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
              {/* Arkadaşlarım kutusu */}
              <div className="mt-8 bg-white rounded shadow p-4 relative">
                <div className="font-bold mb-2 flex items-center justify-between">
                  <span>Arkadaşlarım</span>
                  <span className="text-xs text-gray-500">
                    {loading ? (
                      <Loader2 className="animate-spin inline w-4 h-4 text-gray-400" />
                    ) : (
                      `${
                        friends.filter(
                          (f) =>
                            f.lastSeen &&
                            new Date(f.lastSeen) >
                              new Date(Date.now() - 2 * 60 * 1000)
                        ).length
                      }/${friends.length} çevrim içi`
                    )}
                  </span>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
                  </div>
                ) : (
                  <ul>
                    {friends.map((f) => {
                      const isOnline =
                        f.lastSeen &&
                        new Date(f.lastSeen) > new Date(Date.now() - 10 * 1000);
                      return (
                        <li
                          key={f.id}
                          className={`flex items-center gap-2 mb-1 ${
                            isOnline ? "" : "text-gray-400"
                          }`}
                        >
                          {f.avatar ? (
                            <img
                              src={f.avatar}
                              alt="Avatar"
                              className="w-6 h-6 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border text-black">
                              {f.nickname?.[0]?.toUpperCase() ||
                                f.fullname?.[0]?.toUpperCase() ||
                                "?"}
                            </div>
                          )}
                          <a
                            href={`/profile/${f.id}`}
                            className="font-semibold hover:underline"
                          >
                            {f.nickname || f.fullname || f.email}
                          </a>
                          {isOnline && (
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block ml-1" />
                          )}
                        </li>
                      );
                    })}
                    {friends.length === 0 && (
                      <li className="text-gray-400">Hiç arkadaşın yok.</li>
                    )}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="md:col-span-3">{renderContent()}</main>
      </div>
    </div>
  );
}

function IsteklerTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">İletişim İstekleri</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Ad</th>
                <th className="px-4 py-2 border">E-posta</th>
                <th className="px-4 py-2 border">Mesaj</th>
                <th className="px-4 py-2 border">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id}>
                  <td className="px-4 py-2 border">{msg.id}</td>
                  <td className="px-4 py-2 border">{msg.name}</td>
                  <td className="px-4 py-2 border">{msg.email}</td>
                  <td className="px-4 py-2 border">{msg.message}</td>
                  <td className="px-4 py-2 border">
                    {new Date(msg.createdAt).toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
