"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useSession, signOut } from "next-auth/react";
import { Link as ScrollLink, animateScroll as scroll } from "react-scroll";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Toaster, toast } from "sonner";

type NavbarProps = {
  isAddressVerified?: boolean;
};

const Navbar = ({ isAddressVerified }: NavbarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);
  const [showViewAvatarModal, setShowViewAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navLinks = [
    { to: "news", label: "Haberler" },
    { to: "contact", label: "İletişim" },
    { to: "about", label: "Hakkımızda" },
    { to: "/kurallar", label: "Kurallar", isPage: true },
  ];

  const toggleHome = () => {
    if (pathname === "/") {
      scroll.scrollToTop({
        duration: 500,
        smooth: "easeInOutQuad",
      });
    } else {
      window.location.href = "/";
    }
  };

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleOpenFileDialog() {
    fileInputRef.current?.click();
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-50 backdrop-blur-md text-white p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div onClick={toggleHome} className="text-2xl font-bold cursor-pointer">
          MunjaCraft
        </div>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.isPage ? (
              <Link
                key={link.to}
                href={link.to}
                className="cursor-pointer hover:text-gray-300 transition-colors"
              >
                {link.label}
              </Link>
            ) : pathname === "/" ? (
              <ScrollLink
                key={link.to}
                to={link.to}
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                className="cursor-pointer hover:text-gray-300 transition-colors"
              >
                {link.label}
              </ScrollLink>
            ) : (
              <Link
                key={link.to}
                href={`/#${link.to}`}
                className="cursor-pointer hover:text-gray-300 transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
        <div>
          {session?.user ? (
            <div className="flex items-center gap-4 relative">
              <div className="flex flex-col items-end mr-2">
                {session.user.isAddressVerified ? (
                  <span className="px-2 py-1 rounded bg-green-600 text-white text-xs font-bold mb-1">
                    Onaylı Kullanıcı
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold mb-1">
                    Onaylanmadı
                  </span>
                )}
              </div>
              <div
                className="cursor-pointer"
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              >
                <span className="text-sm text-gray-300">Bakiyeniz: </span>
                <span
                  className={`font-bold transition-all duration-300 ${
                    !isBalanceVisible ? "blur-sm" : "blur-none"
                  }`}
                >
                  {Number(session.user.balance).toFixed(2)} TL
                </span>
              </div>

              <Link
                href="/profile"
                onClick={() => {
                  if (typeof window !== "undefined")
                    localStorage.setItem("profileActiveTab", "profile");
                }}
              >
                <Button variant="secondary" size="sm">
                  Profilim
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer group">
                    {session.user.avatar ? (
                      <Image
                        src={session.user.avatar}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold border text-black">
                        {session.user.nickname?.[0]?.toUpperCase() ||
                          session.user.fullname?.[0]?.toUpperCase() ||
                          "?"}
                      </div>
                    )}
                    <span className="font-semibold text-white">
                      {session.user.nickname || session.user.fullname}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem
                    onClick={() => setShowViewAvatarModal(true)}
                    disabled={!session.user.avatar}
                  >
                    Profil Resmini Görüntüle
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowChangeAvatarModal(true)}
                  >
                    Profil Resmini Değiştir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog
                open={showChangeAvatarModal}
                onOpenChange={setShowChangeAvatarModal}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Profil Resmini Değiştir</DialogTitle>
                    <DialogDescription>
                      Profil fotoğrafı yükleme işlemi
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Önizleme"
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover border"
                      />
                    ) : session.user.avatar ? (
                      <Image
                        src={session.user.avatar}
                        alt="Avatar"
                        width={96}
                        height={96}
                        className="w-24 h-24 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold border text-black">
                        {session.user.nickname?.[0]?.toUpperCase() ||
                          session.user.fullname?.[0]?.toUpperCase() ||
                          "?"}
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                    />
                    <Button variant="outline" onClick={handleOpenFileDialog}>
                      Yeni Profil Resmi Seç
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="default"
                      onClick={async () => {
                        if (!fileInputRef.current?.files?.[0]) return;
                        const formData = new FormData();
                        formData.append("file", fileInputRef.current.files[0]);
                        const res = await fetch("/api/profile/avatar", {
                          method: "POST",
                          body: formData,
                        });
                        if (res.ok) {
                          toast.success(
                            "Profil fotoğrafı başarıyla güncellendi!"
                          );
                          setShowChangeAvatarModal(false);
                          setTimeout(() => window.location.reload(), 1200);
                        } else {
                          toast.error("Profil fotoğrafı güncellenemedi!");
                        }
                      }}
                    >
                      Kaydet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowChangeAvatarModal(false)}
                    >
                      İptal
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={showViewAvatarModal}
                onOpenChange={setShowViewAvatarModal}
              >
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {session.user.nickname || session.user.fullname}'in profil
                      resmi
                    </DialogTitle>
                    <DialogDescription>
                      Profil fotoğrafı görüntüleme
                    </DialogDescription>
                  </DialogHeader>
                  {session.user.avatar && (
                    <Image
                      src={session.user.avatar}
                      alt="Avatar"
                      width={512}
                      height={512}
                      className="rounded-lg object-cover"
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="default">Giriş Yap</Button>
              </Link>
              <Link href="/register">
                <Button variant="default">Kayıt Ol</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
