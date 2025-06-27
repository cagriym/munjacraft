"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      fullname: formData.get("fullname"),
      birthdate: formData.get("birthdate"),
      email: formData.get("email"),
      nickname: formData.get("nickname"),
      password: formData.get("password"),
    };
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Kayıt başarısız");
      setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
      setShowSuccessDialog(true);
      form.reset();
    } catch (err: any) {
      setError(err.message || "Kayıt başarısız");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
            <CardDescription>
              Hesap oluşturmak için lütfen bilgilerinizi giriniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullname">İsim Soyisim</Label>
                  <Input
                    id="fullname"
                    name="fullname"
                    type="text"
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthdate">Doğum Tarihi</Label>
                  <Input id="birthdate" name="birthdate" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="munja@craft.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nickname">Oyun İçi Nick</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    type="text"
                    placeholder="Minecraft nick'iniz"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Kayıt Ol"}
                </Button>
              </div>
              {error && (
                <div className="mt-4 text-center text-sm text-red-500">
                  {error}
                </div>
              )}
              <div className="mt-4 text-center text-sm">
                Zaten hesabınız var mı?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Giriş Yap
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="text-green-500" />
              Kayıt Başarılı!
            </DialogTitle>
            <DialogDescription>
              Hesabınız başarıyla oluşturuldu. Giriş sayfasına
              yönlendirilebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push("/login")}>Giriş Yap</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
