"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";

const formSchema = z.object({
  email: z.string().email({
    message: "Lütfen geçerli bir email adresi girin.",
  }),
  password: z.string().min(1, {
    message: "Şifre alanı boş olamaz.",
  }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      console.log("signIn result:", result); // DEBUG

      if (result?.error) {
        if (result.error === "BANNED_USER") {
          // Banlı kullanıcı, ban detaylarını çek ve yönlendir
          const banRes = await fetch("/api/check-ban", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: values.email }),
          });
          let banData;
          let rawText;
          try {
            rawText = await banRes.text();
            try {
              banData = JSON.parse(rawText);
              console.log("banData:", banData);
            } catch (e) {
              console.log("JSON parse hatası! Dönen veri:", rawText);
              banData = {};
            }
          } catch (e) {
            console.log("Response body okunamadı!", e);
            banData = {};
          }
          console.log("banRes.ok:", banRes.ok, "banData:", banData); // DEBUG
          if (banRes.ok && banData.banned) {
            const params = new URLSearchParams({
              error: "ban",
              reason: banData.reason || "-",
              type: banData.type || "-",
              until: banData.until || "-",
            });
            console.log("Yönlendirme parametreleri:", params.toString()); // DEBUG
            router.push(`/auth/error?${params.toString()}`);
            return;
          }
          // Banlı ama detay çekilemedi, yine de ban sayfasına yönlendir
          console.log(
            "Ban detayları çekilemedi, sadece error parametresiyle yönlendiriliyor."
          );
          router.push(`/auth/error?error=ban`);
          return;
        }
        console.log("Diğer hata:", result.error); // DEBUG
        throw new Error("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      } else if (result?.ok) {
        router.push("/profile");
      }
    } catch (err: any) {
      setError(err.message);
      console.log("onSubmit catch error:", err); // DEBUG
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Giriş Yap</CardTitle>
          <CardDescription>
            Hesabınıza giriş yapmak için lütfen bilgilerinizi giriniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="munja@craft.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>Password</FormLabel>
                      <a
                        href="#"
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                      >
                        Şifrenizi mi unuttunuz?
                      </a>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>
          {error && (
            <div className="mt-4 text-center text-sm text-red-500">{error}</div>
          )}
          <div className="mt-4 text-center text-sm">
            Hesabınız yok mu?{" "}
            <a href="/register" className="underline underline-offset-4">
              Kayıt ol
            </a>
          </div>
        </CardContent>
      </Card>
      <Toaster position="top-center" richColors />
    </div>
  );
}
