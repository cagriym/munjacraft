"use client";
import {
  useEffect,
  useState,
  FormEvent,
  ChangeEvent,
  Suspense,
  useRef,
} from "react";
import { getSocket } from "@/lib/socket";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  nickname?: string;
  fullname?: string;
  role: string;
};

type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt: string;
  delivered?: boolean;
  seen?: boolean;
  status?: string;
};

type Conversation = User & {
  lastMessage?: Message;
  unreadCount?: number;
};

type Friend = {
  id: number;
  requesterId: number;
  addressee: User;
  requester: User;
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}

function MessagesPageContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [pendingRequests, setPendingRequests] = useState<{
    incoming: Friend[];
    outgoing: Friend[];
  }>({ incoming: [], outgoing: [] });
  const [friends, setFriends] = useState<Friend[]>([]);
  const messagesPanelRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const focusMessageInput = useFocusMessageInput(
    messageInputRef as React.RefObject<HTMLTextAreaElement>
  );
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users);
    }
    async function fetchMe() {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) setMe(data.user);
    }
    fetchUsers();
    fetchMe();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    setLoading(true);
    fetch(`/api/messages?with=${selectedUser}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      });
  }, [selectedUser]);

  useEffect(() => {
    if (!me) return;
    const socket = getSocket();
    socket.emit("join", me.id);
    const handleMessage = (data: Message) => {
      if (
        (String(data.senderId) === String(selectedUser) &&
          data.receiverId === me.id) ||
        (data.senderId === me.id &&
          String(data.receiverId) === String(selectedUser))
      ) {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === data.id)) return prev;
          return [...prev, data];
        });
      }
    };
    socket.on("message", handleMessage);
    return () => {
      socket.off("message", handleMessage);
    };
  }, [me, selectedUser]);

  // Sohbet edilen kullanıcıları getir (en son konuşulan en üstte)
  useEffect(() => {
    if (!me) return;
    fetch("/api/messages/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) setConversations(data.conversations);
        console.log("CONVERSATIONS:", data.conversations);
      });
  }, [me, showUserSearch]);

  // Yeni kişi eklenince otomatik seçili yap
  useEffect(() => {
    if (conversations.length > 0 && !selectedUser) {
      setSelectedUser(String(conversations[0].id));
    }
  }, [conversations]);

  // URL'den user parametresiyle otomatik sohbet başlat
  useEffect(() => {
    const userParam = searchParams ? searchParams.get("user") : null;
    if (userParam && users.some((u) => String(u.id) === String(userParam))) {
      setSelectedUser(userParam);
    }
  }, [searchParams, users]);

  // Bekleyen arkadaş isteklerini çek
  useEffect(() => {
    if (!showUserSearch || !me?.id) return;
    fetch("/api/friends/requests")
      .then((res) => res.json())
      .then((data) => {
        if (data.incoming && data.outgoing) setPendingRequests(data);
        console.log("PENDING FRIEND REQUESTS (modal açıldı):", data);
      });
    console.log("DEBUG MODAL me:", me);
  }, [showUserSearch, me]);

  useEffect(() => {
    if (!me) return;
    fetch("/api/friends")
      .then((res) => res.json())
      .then((data) => {
        if (data.friends) setFriends(data.friends);
        console.log("FRIENDS:", data.friends);
      });
  }, [me]);

  // Sohbet açıldığında karşı tarafın okunmamış mesajlarını otomatik seen yap
  useEffect(() => {
    if (!selectedUser || !messages.length || !me) return;
    const unread = messages.filter(
      (msg) =>
        msg.senderId === Number(selectedUser) &&
        msg.receiverId === me.id &&
        (!msg.seen || !msg.delivered)
    );
    if (unread.length > 0) {
      unread.forEach(async (msg) => {
        await fetch("/api/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId: msg.id,
            seen: true,
            delivered: true,
            userId: me.id,
          }),
        });
        // Gerçek zamanlı okundu event'i gönder
        const socket = getSocket();
        socket.emit("seen", {
          messageId: msg.id,
          userId: me.id,
          to: msg.senderId,
        });
      });
    }
  }, [selectedUser, messages, me]);

  // Gelen okundu event'ini işle
  useEffect(() => {
    const socket = getSocket();
    function handleSeen({ messageId }: { messageId: number }) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, seen: true, delivered: true } : msg
        )
      );
    }
    socket.on("seen", handleSeen);
    return () => {
      socket.off("seen", handleSeen);
    };
  }, []);

  // 1. Gönder tuşu sonrası focus için useEffect
  useEffect(() => {
    if (!loading && message === "") {
      setTimeout(() => {
        focusMessageInput();
      }, 10);
    }
  }, [message, loading, focusMessageInput]);

  // 2. Scroll event handler fonksiyonunu dışarı al
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
    }
  };

  // Mesajlar değiştiğinde veya kullanıcı değiştiğinde otomatik en alta kaydır
  useEffect(() => {
    const panel = messagesPanelRef.current;
    if (panel) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          panel.scrollTo({ top: panel.scrollHeight, behavior: "smooth" });
        });
      }, 0);
    }
  }, [messages, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(
    e: FormEvent<HTMLFormElement> | KeyboardEvent,
    focusBack?: boolean
  ) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selectedUser, content: message }),
    });
    if (res.ok) {
      setMessage("");
      const data = await res.json();
      const sentMsg = data.message;
      setMessages((prev) => [...prev, sentMsg]);
      const socket = getSocket();
      socket.emit("message", {
        ...sentMsg,
        to: sentMsg.receiverId,
        from: sentMsg.senderId,
      });
    }
    setLoading(false);
  }

  async function handleUserSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?q=${encodeURIComponent(searchUser)}`
      );
      const data = await res.json();
      if (res.ok) {
        setSearchResults(
          data.users.filter(
            (u: any) => !u.isBanned && String(u.id) !== String(me?.id)
          )
        );
      } else {
        setAddError(data.error || "Kullanıcılar getirilemedi");
      }
    } catch (err) {
      setAddError("Sunucu hatası");
    }
    setAddLoading(false);
  }

  function handleSelectUserFromSearch(user: User) {
    setShowUserSearch(false);
    // Eğer zaten conversations'da yoksa ekle
    if (!conversations.some((u) => String(u.id) === String(user.id))) {
      setConversations((prev) => [user, ...prev]);
    }
    setSelectedUser(String(user.id));
  }

  if (!me) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span>Yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow h-[70vh] flex relative">
      <button
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 absolute top-4 right-4 z-10"
        onClick={() => setShowUserSearch(true)}
      >
        Arkadaş Ekle
      </button>
      <div className="w-1/3 border-r">
        {/* Arkadaşlarım ve kullanıcı arama inputu */}
        <div className="flex flex-col space-y-1.5 p-6">
          <Input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            placeholder="Kullanıcı ara..."
          />
        </div>
        <div className="p-0" style={{ maxHeight: 220, overflowY: "auto" }}>
          <ul className="divide-y">
            {conversations.map((c) => {
              console.log("CONV ITEM:", c);
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-2 mb-1 cursor-pointer"
                  onClick={() => setSelectedUser(String(c.id))}
                  style={{ background: "white" }}
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border text-black mr-2 self-end">
                    {c.nickname?.[0]?.toUpperCase() ||
                      c.fullname?.[0]?.toUpperCase() ||
                      "?"}
                  </div>
                  <span className="font-semibold">
                    {c.nickname || c.fullname || c.email}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Arkadaşlarım</h2>
        </div>
        <div
          className="p-4 space-y-2"
          style={{ maxHeight: 180, overflowY: "auto" }}
        >
          {friends?.map((friend) => {
            const friendUser =
              friend.requesterId === me.id
                ? friend.addressee
                : friend.requester;
            const displayName =
              friendUser.nickname || friendUser.fullname || friendUser.email;
            const avatarUrl =
              friendUser.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                displayName
              )}`;
            return (
              <div
                key={friend.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
                onClick={() => setSelectedUser(String(friendUser.id))}
              >
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-semibold">{displayName}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-2/3 flex flex-col">
        <div className="flex flex-col space-y-1.5 p-6 border-b">
          <div className="font-semibold leading-none tracking-tight">
            Mesajlarım
          </div>
        </div>
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 relative hide-scrollbar"
          ref={messagesPanelRef}
          onScroll={() => {
            const panel = messagesPanelRef.current;
            if (!panel) return;
            const atBottom =
              panel.scrollHeight - panel.scrollTop - panel.clientHeight < 10;
            setShowScrollToBottom(!atBottom);
          }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400">Henüz mesaj yok.</div>
          ) : (
            messages.map((msg, i) => {
              const myId = me ? Number(me.id) : -1;
              const isMe = Number(msg.senderId) === myId;
              console.log(
                "DEBUG msg:",
                msg,
                "myId:",
                myId,
                "isMe:",
                isMe,
                "selectedUser:",
                selectedUser,
                "me:",
                me
              );
              const otherUser = !isMe
                ? conversations.find(
                    (c) => Number(c.id) === Number(msg.senderId)
                  )
                : me;
              return (
                <div
                  key={msg.id}
                  ref={(el: HTMLDivElement | null) => {
                    messageRefs.current[i] = el;
                  }}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && otherUser && (
                    <Image
                      src={otherUser.avatar || "/default-avatar.png"}
                      alt={
                        otherUser.nickname ||
                        otherUser.fullname ||
                        otherUser.email
                      }
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border mr-2 self-end"
                    />
                  )}
                  <div
                    className={`px-3 py-2 rounded-lg max-w-xs relative ${
                      isMe ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
                    }`}
                    style={{ minWidth: 60 }}
                  >
                    {!isMe && (
                      <div className="text-xs font-semibold text-gray-700 mb-1">
                        {otherUser?.nickname ||
                          otherUser?.fullname ||
                          otherUser?.email}
                      </div>
                    )}
                    {msg.content}
                    <div className="text-xs text-gray-400 mt-1 text-right flex items-center gap-1">
                      {new Date(msg.sentAt).toLocaleString()}
                      {isMe && (
                        <span
                          title={
                            msg.seen
                              ? "Okundu"
                              : msg.delivered
                              ? "Teslim edildi"
                              : "Gönderildi"
                          }
                        >
                          {msg.seen ? (
                            <span className="ml-1">✔✔</span>
                          ) : msg.delivered ? (
                            <span className="ml-1">✔</span>
                          ) : (
                            <span className="ml-1">•</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {isMe && me && (
                    <Image
                      src={me.avatar || "/default-avatar.png"}
                      alt={me.nickname || me.fullname || me.email}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border ml-2 self-end"
                    />
                  )}
                </div>
              );
            })
          )}
          {showScrollToBottom && (
            <button
              onClick={scrollToBottom}
              className="fixed left-1/2 -translate-x-1/2 z-30 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-3 transition-all flex items-center justify-center"
              style={{ bottom: "calc(48px + 1rem)" }}
              aria-label="En alta in"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          )}
        </div>
        <form onSubmit={(e) => handleSend(e, true)} className="p-4 border-t">
          <div className="relative">
            <textarea
              ref={messageInputRef}
              autoFocus
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pr-16"
              value={message}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setMessage(e.target.value)
              }
              placeholder="Bir mesaj yazın..."
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                }
              }}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs absolute right-2 top-1/2 -translate-y-1/2"
              disabled={loading || !message.trim()}
            >
              Gönder
            </button>
          </div>
        </form>
      </div>
      {/* Arkadaş Ekle Modalı */}
      {me && me.role !== "ADMIN" && (
        <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Arkadaş Ekle</DialogTitle>
              <DialogDescription>
                Buradan yeni arkadaş ekleyebilir, son arananları ve bekleyen
                istekleri görebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUserSearch} className="flex gap-2 mb-4">
              <Input
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Kullanıcı adı veya email ara..."
              />
              <Button type="submit" disabled={addLoading}>
                {addLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Ara"
                )}
              </Button>
            </form>
            {addError && (
              <div className="text-red-500 text-sm mb-2">{addError}</div>
            )}
            {/* Son Arananlar */}
            <div className="mb-2">
              <div className="font-semibold mb-1">Son Arananlar</div>
              {/* Son arama geçmişi yoksa */}
              <div className="text-gray-400 text-sm">Kayıt yok.</div>
            </div>
            {/* Bekleyen İstekler */}
            <div className="mb-2">
              <div className="font-semibold mb-1">Bekleyen İstekler</div>
              {pendingRequests.incoming.length === 0 &&
              pendingRequests.outgoing.length === 0 ? (
                <div className="text-gray-400 text-sm">Bekleyen istek yok.</div>
              ) : (
                <>
                  {pendingRequests.incoming.length > 0 && (
                    <div className="mb-1">
                      <div className="text-sm font-medium">Gelen İstekler</div>
                      <ul className="pl-2">
                        {pendingRequests.incoming.map((req: any) => (
                          <li
                            key={req.id}
                            className="text-sm flex items-center gap-2"
                          >
                            {req.requester?.avatar ? (
                              <Image
                                src={req.requester.avatar}
                                alt="Avatar"
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold border text-black">
                                {req.requester?.nickname?.[0]?.toUpperCase() ||
                                  req.requester?.fullname?.[0]?.toUpperCase() ||
                                  "?"}
                              </div>
                            )}
                            <span>
                              {req.requester?.nickname ||
                                req.requester?.fullname ||
                                req.requester?.email}
                            </span>
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
                              <Image
                                src={req.addressee.avatar}
                                alt="Avatar"
                                width={24}
                                height={24}
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
            </div>
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
    </div>
  );
}

function useFocusMessageInput(ref: React.RefObject<HTMLTextAreaElement>) {
  return () => {
    if (ref.current) {
      ref.current.focus();
    }
  };
}
