// app/admin/users/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { userService } from '@/lib/services/user.service'
import { formatPhoneDisplay } from '@/lib/utils/phone'
import { UserResponseDto, UserRole, GetUsersFilterDto } from '@/types/api'
import { MoreVertical, Search, UserPlus } from 'lucide-react'
import { CreateUserDialog } from '@/components/CreateUserDialog'
import { EditUserDialog } from '@/components/EditUserDialog'

export default function UsersPage() {
  const [users, setUsers] = useState<UserResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState<GetUsersFilterDto>({
    page: 1,
    limit: 20,
    search: '',
    role: undefined,
    isActive: undefined,
  })

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const response = await userService.getUsers(filter)
      setUsers(response.data)
      setTotalUsers(response.total)
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при загрузке пользователей')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [filter])

  const handleSearch = (value: string) => {
    setFilter({ ...filter, search: value, page: 1 })
    setCurrentPage(1)
  }

  const handleRoleFilter = (value: string) => {
    setFilter({
      ...filter,
      role: value === 'all' ? undefined : (value as UserRole),
      page: 1,
    })
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setFilter({
      ...filter,
      isActive: value === 'all' ? undefined : value === 'active',
      page: 1,
    })
    setCurrentPage(1)
  }

  const handleDeleteUser = async (user: UserResponseDto) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя ${user.phone}?`)) {
      return
    }

    try {
      await userService.deleteUser(user.id)
      toast.success('Пользователь успешно удален')
      loadUsers()
    } catch (error: any) {
      toast.error(error.message || 'Ошибка при удалении пользователя')
    }
  }

  const getRoleBadge = (role: UserRole) => {
    const variants: Record<UserRole, 'default' | 'secondary' | 'destructive'> = {
      [UserRole.ADMIN]: 'destructive',
      [UserRole.MANAGER]: 'secondary',
      [UserRole.CUSTOMER]: 'default',
    }

    const labels: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'Администратор',
      [UserRole.MANAGER]: 'Менеджер',
      [UserRole.CUSTOMER]: 'Покупатель',
    }

    return <Badge variant={variants[role]}>{labels[role]}</Badge>
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'outline'}>
        {isActive ? 'Активен' : 'Заблокирован'}
      </Badge>
    )
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Управление пользователями</h1>
            <p className="text-muted-foreground mt-1">Всего пользователей: {totalUsers}</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Добавить пользователя
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
            <CardDescription>Поиск и фильтрация пользователей</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск по имени, телефону или email..."
                  className="pl-9"
                  value={filter.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <Select value={filter.role || 'all'} onValueChange={handleRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Все роли" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value={UserRole.CUSTOMER}>Покупатели</SelectItem>
                  <SelectItem value={UserRole.MANAGER}>Менеджеры</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Администраторы</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={
                  filter.isActive === undefined ? 'all' : filter.isActive ? 'active' : 'inactive'
                }
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Заблокированные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Загрузка...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Пользователи не найдены
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {formatPhoneDisplay(user.phone)}
                        </TableCell>
                        <TableCell>
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.firstName || user.lastName || '—'}
                        </TableCell>
                        <TableCell>{user.email || '—'}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString('ru')}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user)}
                              >
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalUsers > filter.limit && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Показано {users.length} из {totalUsers}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilter({ ...filter, page: filter.page - 1 })
                      setCurrentPage(currentPage - 1)
                    }}
                    disabled={filter.page === 1}
                  >
                    Назад
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilter({ ...filter, page: filter.page + 1 })
                      setCurrentPage(currentPage + 1)
                    }}
                    disabled={users.length < filter.limit}
                  >
                    Вперед
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <CreateUserDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={loadUsers}
        />

        {editingUser && (
          <EditUserDialog
            user={editingUser}
            open={!!editingUser}
            onOpenChange={(open) => !open && setEditingUser(null)}
            onSuccess={loadUsers}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
