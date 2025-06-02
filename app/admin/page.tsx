// src/app/admin/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import { clientAuth } from "@/lib/auth";
import { Users, ShoppingCart, Package, TrendingUp } from "lucide-react";
import type { UserStats } from "@/types";

export default function AdminDashboard() {
  const user = clientAuth.getUser();
  const isAdmin = user?.role === "ADMIN";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => apiClient.get<UserStats>("/users/stats"),
    enabled: isAdmin,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-muted-foreground">Добро пожаловать, {user?.firstName || user?.phone}!</p>
      </div>

      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? "..." : stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.active || 0} активных</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Новые регистрации</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats?.recentRegistrations || 0}
              </div>
              <p className="text-xs text-muted-foreground">За последние 30 дней</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заказы</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Функционал в разработке</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Товары</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Функционал в разработке</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Панель менеджера</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Используйте меню слева для навигации по разделам.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
