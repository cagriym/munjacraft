"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { useSession, signOut } from "next-auth/react";
import { Link as ScrollLink, animateScroll as scroll } from "react-scroll";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavbarProps = {
  isAddressVerified?: boolean;
};

const Navbar = ({ isAddressVerified }: NavbarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const navLinks = [
    { to: "news", label: "Haberler" },
    { to: "contact", label: "İletişim" },
    { to: "about", label: "Hakkımızda" },
  ];

  const toggleHome = () => {
    if (pathname === "/") {
      scroll.scrollToTop({
        duration: 500,
        smooth: "easeInOutQuad",
      });
    } else {
      // If we are on another page, regular link behavior
      window.location.href = "/";
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-50 backdrop-blur-md text-white p-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div onClick={toggleHome} className="text-2xl font-bold cursor-pointer">
          MunjaCraft
        </div>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            pathname === "/" ? (
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
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                {typeof isAddressVerified === "boolean" ? (
                  isAddressVerified ? (
                    <span className="px-2 py-1 rounded bg-green-600 text-white text-xs font-bold mb-1">
                      Onaylı Kullanıcı
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-bold mb-1">
                      Onaylanmadı
                    </span>
                  )
                ) : session.user.isAddressVerified ? (
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
              <Link href="/profile">
                <Button variant="default" size="lg">
                  Hesabım
                </Button>
              </Link>
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
