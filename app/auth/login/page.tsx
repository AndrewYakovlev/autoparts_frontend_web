// src/app/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/ui/otp-input";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { clientAuth, canAccessAdminPanel } from "@/lib/auth";
import { formatPhoneNumber, parsePhoneNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { AuthResponse, RequestOtpResponse, User } from "@/types";

// Validation schemas
const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Введите номер телефона")
    .regex(
      /^(\+7|8|7)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
      "Неверный формат номера"
    ),
});

const otpSchema = z.object({
  code: z.string().length(4, "Код должен состоять из 4 цифр"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const { toast } = useToast();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Phone form
  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  // OTP form
  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  // Request OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (data: PhoneFormData) => {
      const parsedPhone = parsePhoneNumber(data.phone);
      return apiClient.requestOtp({ phone: parsedPhone });
    },
    onSuccess: (data: RequestOtpResponse) => {
      setPhone(parsePhoneNumber(phoneForm.getValues("phone")));
      setStep("otp");
      setResendTimer(data.resendAfter);

      // Start countdown timer
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: "Код отправлен",
        description: data.message,
      });

      // Show code in development mode
      if (data.code) {
        toast({
          title: "Тестовый режим",
          description: `Ваш код: ${data.code}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось отправить код",
      });
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: OtpFormData) => {
      return apiClient.verifyOtp({ phone, code: data.code });
    },
    onSuccess: (data: AuthResponse) => {
      // Save tokens and user data
      clientAuth.setTokens(data);
      const user: User = {
        id: data.user.id,
        phone: data.user.phone,
        role: data.user.role as any,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      clientAuth.setUser(user);

      toast({
        title: "Успешная авторизация",
        description: "Добро пожаловать!",
      });

      // Redirect based on role
      if (canAccessAdminPanel(user)) {
        router.push("/admin");
      } else {
        router.push(returnUrl);
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Неверный код",
      });
      otpForm.reset();
    },
  });

  const onPhoneSubmit = (data: PhoneFormData) => {
    requestOtpMutation.mutate(data);
  };

  const onOtpSubmit = (data: OtpFormData) => {
    verifyOtpMutation.mutate(data);
  };

  const handleResendOtp = () => {
    if (resendTimer === 0 && phone) {
      requestOtpMutation.mutate({ phone });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в систему</CardTitle>
          <CardDescription>
            {step === "phone" ? "Введите номер телефона для получения кода" : "Введите код из SMS"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" ? (
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  disabled={requestOtpMutation.isPending}
                  {...phoneForm.register("phone", {
                    onChange: (e) => {
                      e.target.value = formatPhoneNumber(e.target.value);
                    },
                  })}
                />
                {phoneForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {phoneForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={requestOtpMutation.isPending}>
                {requestOtpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Получить код
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Код подтверждения</Label>
                <div className="flex justify-center">
                  <OTPInput
                    value={otpForm.watch("code")}
                    onChange={(value) => otpForm.setValue("code", value)}
                    disabled={verifyOtpMutation.isPending}
                  />
                </div>
                {otpForm.formState.errors.code && (
                  <p className="text-center text-sm text-destructive">
                    {otpForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Код отправлен на номер {formatPhoneNumber(phone)}</p>
              </div>

              <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending}>
                {verifyOtpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Войти
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep("phone");
                    otpForm.reset();
                  }}
                >
                  Изменить номер
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={resendTimer > 0 || requestOtpMutation.isPending}
                  onClick={handleResendOtp}
                >
                  {resendTimer > 0
                    ? `Отправить повторно (${formatTime(resendTimer)})`
                    : "Отправить повторно"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
