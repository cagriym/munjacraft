"use client";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { getSocket } from "@/lib/socket";

type User = {
  id: number;
  name: string;
  email: string;
};

type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  sentAt: string;
};

export default function MessagesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<User | null>(null);

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
    // Socket bağlantısı ve odaya katılma
    const socket = getSocket();
    socket.emit("join", me.id);
    // Yeni mesaj geldiğinde arayüzü güncelle
    socket.on("message", (data) => {
      // data: { to, from, content, sentAt }
      if (
        (String(data.senderId) === String(selectedUser) &&
          data.receiverId === me.id) ||
        (data.senderId === me.id &&
          String(data.receiverId) === String(selectedUser))
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });
    return () => {
      socket.off("message");
    };
  }, [me, selectedUser]);

  async function handleSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim() || !selectedUser || !me) return;
    setLoading(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selectedUser, content: message }),
    });
    if (res.ok) {
      setMessage("");
      // API'den dönen mesajı socket ile karşı tarafa ilet
      const data = await res.json();
      const sentMsg = data.message;
      const socket = getSocket();
      socket.emit("message", {
        ...sentMsg,
        to: sentMsg.receiverId,
        from: sentMsg.senderId,
      });
      setMessages((prev) => [...prev, sentMsg]);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Mesajlaşma</h1>
      <div className="mb-4">
        <label className="block mb-2">Kime mesaj göndermek istiyorsun?</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={selectedUser}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            setSelectedUser(e.target.value)
          }
        >
          <option value="">Kullanıcı seç</option>
          {users
            .filter((u) => me && String(u.id) !== String(me.id))
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
        </select>
      </div>
      {selectedUser && (
        <>
          <div className="border rounded p-4 h-64 overflow-y-auto bg-black/10 mb-4">
            {loading ? (
              <div>Yükleniyor...</div>
            ) : messages.length === 0 ? (
              <div className="text-gray-400">Henüz mesaj yok.</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-2 flex ${
                    me && msg.senderId === me.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg max-w-xs ${
                      me && msg.senderId === me.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.content}
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {new Date(msg.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              className="flex-1 border rounded px-2 py-1"
              value={message}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMessage(e.target.value)
              }
              placeholder="Mesajınızı yazın..."
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded"
              disabled={loading || !message.trim()}
            >
              Gönder
            </button>
          </form>
        </>
      )}
    </div>
  );
}
