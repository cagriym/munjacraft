"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";

interface User {
  id: string;
  fullname?: string;
  nickname?: string;
  email: string;
  role: "USER" | "ADMIN";
  isBanned?: boolean;
  banReason?: string | null;
  banUntil?: string | null;
  banType?: string | null;
  bannedIp?: string | null;
  isAddressVerified?: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType] = useState("SURESUZ");
  const [banUntil, setBanUntil] = useState("");

  async function fetchUsers() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users);
      // Me'yi bul
      const sessionRes = await fetch("/api/profile");
      const sessionData = await sessionRes.json();
      setMe(sessionData.user);
    } else {
      setError(data.error || "Hata oluştu");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleDelete(id: string) {
    if (!window.confirm("Kullanıcıyı silmek istediğinize emin misiniz?"))
      return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) fetchUsers();
    else alert("Silme işlemi başarısız");
  }

  async function handleRoleChange(id: string, newRole: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: newRole }),
    });
    if (res.ok) fetchUsers();
    else alert("Rol değiştirme başarısız");
  }

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="flex flex-col items-center min-h-screen bg-white px-4 py-12">
        <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow border border-gray-200">
          <h2 className="text-3xl font-bold text-black mb-6 text-center">
            Kullanıcı Yönetimi
          </h2>
          <table className="w-full text-left text-black border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="py-2 px-2">ID</th>
                <th className="py-2 px-2">Ad Soyad</th>
                <th className="py-2 px-2">Nickname</th>
                <th className="py-2 px-2">E-posta</th>
                <th className="py-2 px-2">Rol</th>
                <th className="py-2 px-2">Banlı mı?</th>
                <th className="py-2 px-2">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(user);
                    setModalOpen(true);
                  }}
                >
                  <td className="py-2 px-2">{user.id}</td>
                  <td className="py-2 px-2">{user.fullname || "-"}</td>
                  <td className="py-2 px-2">{user.nickname || "-"}</td>
                  <td className="py-2 px-2">{user.email}</td>
                  <td className="py-2 px-2">
                    <span className="font-bold">{user.role}</span>
                  </td>
                  <td className="py-2 px-2">
                    {user.isBanned ? "Evet" : "Hayır"}
                  </td>
                  <td className="py-2 px-2 flex gap-2">
                    <button
                      className="px-3 py-1 rounded border border-gray-300 bg-white text-black hover:bg-gray-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(user);
                        setModalOpen(true);
                      }}
                    >
                      Detay / Düzenle
                    </button>
                    {me && String(me.id) === String(user.id) ? (
                      <span className="text-gray-400">Kendi hesabın</span>
                    ) : (
                      <button
                        className="px-3 py-1 rounded border border-red-400 bg-white text-red-600 hover:bg-red-50 transition"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await handleDelete(user.id);
                          toast.success("Kullanıcı silindi");
                        }}
                      >
                        Sil
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Kullanıcı Detay Modalı */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="bg-white text-black rounded-lg p-6 border border-gray-200 max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">
                Kullanıcı Detayları
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Kullanıcıyı güncelleyebilir veya banlayabilirsiniz.
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-2">
                <div>
                  <b>ID:</b> {selectedUser.id}
                </div>
                <div>
                  <b>Ad Soyad:</b> {selectedUser.fullname || "-"}
                </div>
                <div>
                  <b>Nickname:</b> {selectedUser.nickname || "-"}
                </div>
                <div>
                  <b>E-posta:</b> {selectedUser.email}
                </div>
                <div>
                  <b>Rol:</b> {selectedUser.role}
                </div>
                <div>
                  <b>Banlı mı?:</b> {selectedUser.isBanned ? "Evet" : "Hayır"}
                </div>
                <div>
                  <b>Ban Sebebi:</b> {selectedUser.banReason || "-"}
                </div>
                <div>
                  <b>Ban Tipi:</b> {selectedUser.banType || "-"}
                </div>
                <div>
                  <b>Ban Bitiş:</b> {selectedUser.banUntil || "-"}
                </div>
                <div>
                  <b>IP Ban:</b> {selectedUser.bannedIp || "-"}
                </div>
                <div>
                  <b>Adres Onayı:</b>{" "}
                  {selectedUser.isAddressVerified ? (
                    <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">
                      Onaylı
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">
                      Onaylanmadı
                    </span>
                  )}
                </div>
                {/* Güncelleme alanları */}
                <div className="flex flex-col gap-2 mt-4">
                  <input
                    className="border rounded px-2 py-1 bg-white text-black"
                    placeholder="Ad Soyad"
                    value={selectedUser.fullname || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        fullname: e.target.value,
                      })
                    }
                  />
                  <input
                    className="border rounded px-2 py-1 bg-white text-black"
                    placeholder="Nickname"
                    value={selectedUser.nickname || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        nickname: e.target.value,
                      })
                    }
                  />
                  <input
                    className="border rounded px-2 py-1 bg-white text-black"
                    placeholder="E-posta"
                    value={selectedUser.email || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {/* Admin kendini banlayamaz */}
                  {me &&
                  String(me.id) ===
                    String(selectedUser.id) ? null : !selectedUser.isBanned ? (
                    <button
                      className="px-3 py-1 rounded border border-red-400 bg-white text-red-600 hover:bg-red-50 transition"
                      onClick={() => setBanDialogOpen(true)}
                    >
                      Banla
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 rounded border border-green-400 bg-white text-green-700 hover:bg-green-50 transition"
                      onClick={async () => {
                        const res = await fetch("/api/admin/users", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: selectedUser.id,
                            action: "unban",
                          }),
                        });
                        const data = await res.json();
                        if (data.success && data.user) {
                          setUsers((users) =>
                            users.map((u) =>
                              u.id === data.user.id ? data.user : u
                            )
                          );
                          setSelectedUser(data.user);
                          setModalOpen(false);
                          toast.success("Kullanıcı banı kaldırıldı");
                        } else {
                          toast.error("Unban işlemi başarısız");
                        }
                      }}
                    >
                      Unban
                    </button>
                  )}
                  <button
                    className="px-3 py-1 rounded border border-blue-400 bg-white text-blue-700 hover:bg-blue-50 transition"
                    onClick={async () => {
                      const res = await fetch("/api/admin/users", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: selectedUser.id,
                          action: "update",
                          fullname: selectedUser.fullname,
                          nickname: selectedUser.nickname,
                          email: selectedUser.email,
                        }),
                      });
                      if (res.ok) {
                        fetchUsers();
                        setModalOpen(false);
                        toast.success("Kullanıcı güncellendi");
                      } else {
                        toast.error("Güncelleme başarısız");
                      }
                    }}
                  >
                    Güncelle
                  </button>
                  {me && String(me.id) !== String(selectedUser.id) && (
                    <button
                      className="px-3 py-1 rounded border border-gray-400 bg-white text-gray-700 hover:bg-gray-100 transition"
                      onClick={async () => {
                        await handleDelete(selectedUser.id);
                        setModalOpen(false);
                        toast.success("Kullanıcı silindi");
                      }}
                    >
                      Sil
                    </button>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <button className="px-3 py-1 rounded border border-gray-300 bg-white text-black hover:bg-gray-100 transition">
                  Kapat
                </button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Ban Dialog */}
        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent className="bg-white text-black rounded-lg p-6 border border-gray-200 max-w-md w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-black">
                Kullanıcıyı Banla
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Ban sebebi, tipi ve süresi giriniz.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedUser || !banReason.trim() || !banType) return;
                const res = await fetch("/api/admin/users", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: selectedUser.id,
                    action: "ban",
                    banReason,
                    banType,
                    banUntil:
                      banType === "SURELI" && banUntil
                        ? new Date(banUntil).toISOString()
                        : null,
                  }),
                });
                const data = await res.json();
                if (data.success && data.user) {
                  setUsers((users) =>
                    users.map((u) => (u.id === data.user.id ? data.user : u))
                  );
                  setSelectedUser(data.user);
                  setBanDialogOpen(false);
                  setModalOpen(false);
                  setBanReason("");
                  setBanType("SURESUZ");
                  setBanUntil("");
                  toast.success("Kullanıcı banlandı");
                } else {
                  toast.error("Banlama işlemi başarısız");
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Ban Sebebi</label>
                  <input
                    className="border rounded px-2 py-1 w-full bg-white text-black"
                    placeholder="Açıklama giriniz"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Ban Tipi</label>
                  <select
                    className="border rounded px-2 py-1 w-full bg-white text-black"
                    value={banType}
                    onChange={(e) => setBanType(e.target.value)}
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="SURESUZ">Süresiz</option>
                    <option value="SURELI">Süreli</option>
                    <option value="IP_BAN">IP Ban</option>
                  </select>
                </div>
                {banType === "SURELI" && (
                  <div>
                    <label className="block mb-1 font-medium">
                      Ban Bitiş Tarihi
                    </label>
                    <input
                      type="datetime-local"
                      className="border rounded px-2 py-1 w-full bg-white text-black"
                      value={banUntil}
                      onChange={(e) => setBanUntil(e.target.value)}
                      required={banType === "SURELI"}
                    />
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  variant="default"
                  disabled={!selectedUser || !banReason.trim() || !banType}
                >
                  Banla
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
