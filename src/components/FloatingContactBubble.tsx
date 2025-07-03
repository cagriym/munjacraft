"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const FloatingContactBubble = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (response.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setMessage("");
        setTimeout(() => setSent(false), 4000);
        setOpen(false);
      } else {
        setError("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      }
    } catch {
      setError("Sunucuya ulaşılamıyor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg px-6 py-3 font-bold text-lg flex items-center gap-2 transition-all duration-200"
          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)" }}
        >
          <span>💬</span> Bize Ulaşın
        </button>
      </DialogTrigger>
      <DialogContent
        className="fixed right-0 top-0 bottom-0 my-auto h-auto max-h-[90vh] w-full max-w-md rounded-l-xl bg-background shadow-2xl border-none animate-slide-in-from-right"
        style={{ right: 0, left: "auto", transform: "none" }}
      >
        <DialogHeader>
          <DialogTitle>Bize Ulaşın</DialogTitle>
          <DialogDescription>
            Lütfen iletişim bilgilerinizi ve mesajınızı girin.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Adınız"
            className="bg-black text-white placeholder:text-gray-400 border-gray-700"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="E-posta"
            className="bg-black text-white placeholder:text-gray-400 border-gray-700"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Textarea
            placeholder="Mesajınız"
            className="bg-black text-white placeholder:text-gray-400 border-gray-700"
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </DialogFooter>
          {sent && (
            <div className="text-green-600 bg-green-100 border border-green-300 rounded-lg p-2 mt-2 text-center font-semibold">
              Mesajınız başarıyla gönderildi!
            </div>
          )}
          {error && (
            <div className="text-red-600 bg-red-100 border border-red-300 rounded-lg p-2 mt-2 text-center font-semibold">
              {error}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FloatingContactBubble;
