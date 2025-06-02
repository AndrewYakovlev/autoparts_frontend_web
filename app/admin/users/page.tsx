// src/app/admin/users/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersTable } from "@/components/admin/users-table";
import { UserDialog } from "@/components/admin/user-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { apiClient } from "@/lib/api-client";
import { clientAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { User, UsersListResponse, CreateUserDto, UpdateUserDto } from "@/types";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const currentUser = clientAuth.getUser();
  const isAdmin = currentUser?.role === "ADMIN";

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Fetch users
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.get<UsersListResponse>("/users"),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserDto) => apiClient.post<User>("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Пользователь создан",
        description: "Новый пользователь успешно добавлен",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось создать пользователя",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      apiClient.put<User>(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast({
        title: "Пользователь обновлен",
        description: "Данные пользователя успешно изменены",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось обновить пользователя",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
      toast({
        title: "Пользователь удален",
        description: "Пользователь успешно деактивирован",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось удалить пользователя",
      });
    },
  });

  const handleCreateUser = (data: CreateUserDto) => {
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (data: UpdateUserDto) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    }
  };

  const handleDeleteUser = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground">Управление пользователями системы</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Ошибка загрузки данных. Попробуйте обновить страницу.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
          <p className="text-muted-foreground">Управление пользователями системы</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить пользователя
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Все пользователи</CardTitle>
          <CardDescription>
            {data ? `Всего пользователей: ${data.total}` : "Загрузка..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <UsersTable
              data={data?.data || []}
              onEdit={setEditingUser}
              onDelete={setDeletingUser}
              isAdmin={isAdmin}
            />
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <UserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateUser}
        isLoading={createUserMutation.isPending}
        isAdmin={isAdmin}
      />

      {/* Edit User Dialog */}
      <UserDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        user={editingUser}
        onSubmit={handleUpdateUser}
        isLoading={updateUserMutation.isPending}
        isAdmin={isAdmin}
      />

      {/* Delete User Dialog */}
      <DeleteUserDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        user={deletingUser}
        onConfirm={handleDeleteUser}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
