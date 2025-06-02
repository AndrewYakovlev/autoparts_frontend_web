// src/components/admin/user-dialog.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatPhoneNumber, parsePhoneNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Role, type User, type CreateUserDto, type UpdateUserDto } from "@/types";

const createUserSchema = z.object({
  phone: z
    .string()
    .min(1, "Введите номер телефона")
    .regex(
      /^(\+7|8|7)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
      "Неверный формат номера"
    ),
  role: z.nativeEnum(Role),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
});

const updateUserSchema = z.object({
  role: z.nativeEnum(Role).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading = false,
  isAdmin = false,
}: UserDialogProps) {
  const isEditing = !!user;

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: isEditing
      ? {
          role: user.role,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          isActive: user.isActive,
        }
      : {
          phone: "",
          role: Role.CUSTOMER,
          firstName: "",
          lastName: "",
          email: "",
        },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && user) {
        form.reset({
          role: user.role,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          isActive: user.isActive,
        });
      } else {
        form.reset({
          phone: "",
          role: Role.CUSTOMER,
          firstName: "",
          lastName: "",
          email: "",
        });
      }
    }
  }, [open, isEditing, user, form]);

  const handleSubmit = (data: CreateUserFormData | UpdateUserFormData) => {
    if (isEditing) {
      onSubmit(data as UpdateUserDto);
    } else {
      const createData = data as CreateUserFormData;
      onSubmit({
        ...createData,
        phone: parsePhoneNumber(createData.phone),
        email: createData.email || undefined,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать пользователя" : "Добавить пользователя"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Измените данные пользователя" : "Создайте нового пользователя системы"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!isEditing && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Номер телефона</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+7 (999) 123-45-67"
                        {...field}
                        onChange={(e) => {
                          e.target.value = formatPhoneNumber(e.target.value);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isAdmin && (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Роль</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Role.CUSTOMER}>Покупатель</SelectItem>
                        <SelectItem value={Role.MANAGER}>Менеджер</SelectItem>
                        <SelectItem value={Role.ADMIN}>Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            {isEditing && isAdmin && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Активен</FormLabel>
                      <FormDescription>
                        Активные пользователи могут входить в систему
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Сохранить" : "Создать"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
