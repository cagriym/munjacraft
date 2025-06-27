"use client";
import { useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { useEffect } from "react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const reason = searchParams.get("reason");
  const type = searchParams.get("type");
  const until = searchParams.get("until");

  useEffect(() => {
    if (error === "ban") {
      toast.error(
        <div style={{ fontSize: 20, padding: 16 }}>
          <div>
            <b>Hesabınız banlanmıştır!</b>
          </div>
          <div>
            <b>Ban Sebebi:</b> {reason}
          </div>
          <div>
            <b>Ban Tipi:</b> {type}
          </div>
          {type === "SURELI" && until && until !== "-" && (
            <div>
              <b>Ban Bitiş Tarihi:</b> {new Date(until).toLocaleString("tr-TR")}
            </div>
          )}
        </div>,
        { duration: 10000 }
      );
    }
  }, [error, reason, type, until]);

  if (error === "ban") {
    // Ban tipi Türkçeleştirme
    let typeLabel = "Belirtilmedi";
    if (type === "SURELI") typeLabel = "Süreli";
    else if (type === "SURESUZ") typeLabel = "Süresiz";
    else if (type === "IP_BAN") typeLabel = "IP Ban";
    else if (type && type !== "-") typeLabel = type;

    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: 24,
            marginBottom: 32,
            fontSize: 20,
            fontWeight: "bold",
            maxWidth: 480,
            margin: "32px auto",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 12 }}>Giriş Engellendi</div>
          <div style={{ fontSize: 22, marginBottom: 8 }}>
            Hesabınız banlanmıştır!
          </div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            <b>Ban Sebebi:</b>{" "}
            {reason && reason !== "-" ? reason : "Belirtilmedi"}
          </div>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            <b>Ban Tipi:</b> {typeLabel}
          </div>
          {type === "SURELI" && until && until !== "-" ? (
            <div style={{ fontSize: 18, marginBottom: 8 }}>
              <b>Ban Bitiş Tarihi:</b> {new Date(until).toLocaleString("tr-TR")}
            </div>
          ) : null}
          {type === "SURESUZ" && (
            <div style={{ fontSize: 18, marginBottom: 8 }}>
              <b>Ban Bitiş Tarihi:</b> Süresiz
            </div>
          )}
        </div>
        <a
          href="/login"
          style={{
            fontSize: 18,
            color: "#2563eb",
            textDecoration: "underline",
          }}
        >
          Giriş sayfasına dön
        </a>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h1>Bir hata oluştu</h1>
      <p>Giriş sırasında bir hata meydana geldi.</p>
      {error && <p style={{ color: "red" }}>Hata kodu: {error}</p>}
      <a href="/announcements">Ana sayfaya dön</a>
    </div>
  );
}
