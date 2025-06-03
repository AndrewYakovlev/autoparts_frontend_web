// app/profile/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuthStore } from '@/stores/auth.store'
import { userService } from '@/lib/services/user.service'
import { formatPhoneDisplay } from '@/lib/utils/phone'
import { UpdateProfileDto } from '@/types/api'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символов').optional(),
  lastName: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символов').optional(),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
})

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<UpdateProfileDto>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      })
    }
  }, [user, form])

  const onSubmit = async (data: UpdateProfileDto) => {
    setIsLoading(true)
    try {
      const updatedUser = await userService.updateProfile(data)
      updateUser(updatedUser)
      toast.success('Профиль успешно обновлен')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при обновлении профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ADMIN: 'destructive',
      MANAGER: 'secondary',
      CUSTOMER: 'default',
    }

    const labels: Record<string, string> = {
      ADMIN: 'Администратор',
      MANAGER: 'Менеджер',
      CUSTOMER: 'Покупатель',
    }

    return <Badge variant={variants[role] || 'default'}>{labels[role] || role}</Badge>
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Мой профиль</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Личная информация</CardTitle>
                <CardDescription>Управляйте своими персональными данными</CardDescription>
              </div>
              {!isEditing && <Button onClick={() => setIsEditing(true)}>Редактировать</Button>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Телефон</p>
                  <p className="text-lg">{user?.phone && formatPhoneDisplay(user.phone)}</p>
                </div>
                {user?.role && getRoleBadge(user.role)}
              </div>

              <Separator />

              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                              <Input placeholder="Иван" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Фамилия</FormLabel>
                            <FormControl>
                              <Input placeholder="Иванов" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="ivan@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Отмена
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Имя</p>
                      <p className="text-lg">{user?.firstName || 'Не указано'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Фамилия</p>
                      <p className="text-lg">{user?.lastName || 'Не указано'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{user?.email || 'Не указан'}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="grid gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Дата регистрации:</span>
                <span>{user?.createdAt && new Date(user.createdAt).toLocaleDateString('ru')}</span>
              </div>
              {user?.lastLoginAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Последний вход:</span>
                  <span>{new Date(user.lastLoginAt).toLocaleDateString('ru')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
