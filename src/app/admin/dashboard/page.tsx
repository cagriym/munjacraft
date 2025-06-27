"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Users,
  ShieldAlert,
  Award,
  ArrowUp,
  LogOut,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Placeholder data for player list
const placeholderPlayers = [
  {
    id: 1,
    nickname: "Notch",
    email: "notch@minecraft.net",
    role: "ADMIN",
    status: "Active",
  },
  {
    id: 2,
    nickname: "Jeb_",
    email: "jeb@minecraft.net",
    role: "USER",
    status: "Active",
  },
  {
    id: 3,
    nickname: "Herobrine",
    email: "null",
    role: "USER",
    status: "Banned",
  },
  {
    id: 4,
    nickname: "Steve",
    email: "steve@minecraft.net",
    role: "USER",
    status: "Active",
  },
];

const PlayerManagement = () => {
  // TODO: Add state for search, dialogs etc.
  return (
    <Card>
      <CardHeader>
        <CardTitle>Oyuncu Yönetimi</CardTitle>
        <div className="mt-2">
          <Input placeholder="Oyuncu ara..." />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nickname</TableHead>
              <TableHead>E-Posta</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Eylemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {placeholderPlayers.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.nickname}</TableCell>
                <TableCell>{player.email}</TableCell>
                <TableCell>{player.role}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      player.status === "Active"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-red-500/20 text-red-500"
                    }`}
                  >
                    {player.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menüyü aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        <span>Oyuncuyu Banla</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Award className="mr-2 h-4 w-4" />
                        <span>Ödüllendir</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowUp className="mr-2 h-4 w-4" />
                        <span>Rank Yükselt</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("players");
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // TODO: Add proper authorization check for ADMIN role
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
        <h2 className="text-2xl font-semibold mb-4">Erişim Reddedildi</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Bu sayfayı görmek için admin yetkisine sahip bir hesapla giriş
          yapmanız gerekmektedir.
        </p>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="outline">Ana Menüye Dön</Button>
          </Link>
          <Link href="/login">
            <Button>Giriş Yap</Button>
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      id: "players",
      label: "Oyuncu Yönetimi",
      icon: Users,
      href: "/admin/users",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "players":
        return <PlayerManagement />;
      default:
        return <PlayerManagement />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 pt-[88px]">
      <aside className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-6 text-gray-700 dark:text-gray-200">
            Admin Paneli
          </h2>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Çıkış yap</span>
        </button>
      </aside>
      <main className="flex-1 p-8">{renderContent()}</main>
    </div>
  );
}
