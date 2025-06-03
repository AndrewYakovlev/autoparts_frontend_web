// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { UserRole, UserStatsResponseDto } from '@/types/api'
import { userService } from '@/lib/services/user.service'
import { Users, UserCheck, UserX, TrendingUp, ArrowRight } from 'lucide-react'

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<UserStatsResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    if (user?.role !== UserRole.ADMIN) {
      setIsLoading(false)
      return
    }

    try {
      const data = await userService.getUserStats()
      setStats(data)
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при загрузке статистики')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Панель управления</h1>
          <p className="text-muted-foreground mt-2">
            Добро пожаловать, {user?.firstName || user?.phone}!
          </p>
        </div>

        {user?.role === UserRole.ADMIN && stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.recentRegistrations} за последние 30 дней
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Активные</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.active}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.active / stats.total) * 100)}% от общего числа
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Заблокированные</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.inactive / stats.total) * 100)}% от общего числа
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Новые за месяц</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentRegistrations}</div>
                <p className="text-xs text-muted-foreground">Зарегистрировано за 30 дней</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>Просмотр, создание и редактирование пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Управляйте пользователями системы, изменяйте их роли и статусы.
              </p>
              <Link href="/admin/users">
                <Button className="w-full sm:w-auto">
                  Перейти к пользователям
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>Информация о вашем аккаунте</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-medium">Телефон:</dt>
                  <dd className="text-muted-foreground">{user?.phone}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium">Роль:</dt>
                  <dd className="text-muted-foreground">
                    {user?.role === UserRole.ADMIN ? 'Администратор' : 'Менеджер'}
                  </dd>
                </div>
                {user?.firstName && (
                  <div className="flex justify-between">
                    <dt className="font-medium">Имя:</dt>
                    <dd className="text-muted-foreground">
                      {user.firstName} {user.lastName}
                    </dd>
                  </div>
                )}
              </dl>
              <Link href="/profile">
                <Button variant="outline" className="w-full sm:w-auto mt-4">
                  Редактировать профиль
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
