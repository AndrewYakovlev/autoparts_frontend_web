// src/app/admin/layout.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Users, Package, ShoppingCart, BarChart, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clientAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useState } from "react";

const navigation = [
  { name: "Дашборд", href: "/admin", icon: BarChart },
  { name: "Пользователи", href: "/admin/users", icon: Users },
  { name: "Товары", href: "/admin/products", icon: Package },
  { name: "Заказы", href: "/admin/orders", icon: ShoppingCart },
  { name: "Настройки", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = clientAuth.getUser();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = clientAuth.getRefreshToken();
      if (refreshToken) {
        await apiClient.delete("/auth/logout", {
          body: JSON.stringify({ refreshToken }),
        });
      }
    },
    onSuccess: () => {
      clientAuth.clearTokens();
      toast({
        title: "Выход выполнен",
        description: "Вы вышли из системы",
      });
      router.push("/auth/login");
    },
    onError: () => {
      // Even if API fails, clear tokens and redirect
      clientAuth.clearTokens();
      router.push("/auth/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="font-bold text-xl">AutoParts Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <div className="mb-2 px-3 py-2">
            <p className="text-sm font-medium">{user?.firstName || user?.phone}</p>
            <p className="text-xs text-muted-foreground">
              {user?.role === "ADMIN" ? "Администратор" : "Менеджер"}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-5 w-5" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex-1" />

          <Button variant="ghost" size="sm" asChild>
            <Link href="/" target="_blank">
              Перейти в магазин
            </Link>
          </Button>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
