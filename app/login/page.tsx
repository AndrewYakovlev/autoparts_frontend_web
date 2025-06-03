// app/login/page.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useAuth } from '@/hooks/useAuth'
import { useOtpStore } from '@/stores/otp.store'
import { formatPhoneNumber, formatPhoneDisplay } from '@/lib/utils/phone'
import { RequestOtpDto, VerifyOtpDto } from '@/types/api'

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Номер телефона обязателен')
    .regex(/^\+7\d{10}$/, 'Номер телефона должен быть в формате +7XXXXXXXXXX'),
})

const otpSchema = z.object({
  phone: z.string(),
  code: z
    .string()
    .min(4, 'Код должен содержать 4 цифры')
    .max(4, 'Код должен содержать 4 цифры')
    .regex(/^\d{4}$/, 'Код должен содержать только цифры'),
})

export default function LoginPage() {
  const { requestOtp, verifyOtp, isLoading, error } = useAuth()
  const { phone, resendTimer, step, setPhone, setResendTimer, decrementTimer, setStep, reset } =
    useOtpStore()

  const phoneForm = useForm<RequestOtpDto>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: phone || '',
    },
  })

  const otpForm = useForm<VerifyOtpDto>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      phone: phone || '',
      code: '',
    },
  })

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => decrementTimer(), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer, decrementTimer])

  const onPhoneSubmit = async (data: RequestOtpDto) => {
    try {
      const response = await requestOtp(data)
      setPhone(data.phone)
      otpForm.setValue('phone', data.phone)
      setStep('otp')
      setResendTimer(response.resendAfter)
    } catch (err) {
      // Ошибка уже обработана в хуке
    }
  }

  const onOtpSubmit = async (data: VerifyOtpDto) => {
    try {
      await verifyOtp(data)
      reset() // Очищаем OTP состояние после успешного входа
    } catch (err) {
      // Ошибка уже обработана в хуке
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return

    try {
      const response = await requestOtp({ phone })
      setResendTimer(response.resendAfter)
    } catch (err) {
      // Ошибка уже обработана в хуке
    }
  }

  const handleChangePhone = () => {
    setStep('phone')
    otpForm.reset({ phone: '', code: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в систему</CardTitle>
          <CardDescription>
            {step === 'phone'
              ? 'Введите номер телефона для получения кода подтверждения'
              : 'Введите код подтверждения, отправленный на ваш телефон'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер телефона</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+7 (XXX) XXX-XX-XX"
                          type="tel"
                          disabled={isLoading}
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value)
                            field.onChange(formatted)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Отправка...' : 'Получить код'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4 text-center">
                  Код отправлен на номер {formatPhoneDisplay(phone)}
                </div>
                <FormField
                  control={otpForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Код подтверждения</FormLabel>
                      <FormControl>
                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={4}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              // Автоматически отправляем форму при вводе 4 цифр
                              if (value.length === 4) {
                                otpForm.handleSubmit(onOtpSubmit)()
                              }
                            }}
                            disabled={isLoading}
                            autoFocus
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {resendTimer > 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Повторная отправка через {resendTimer} сек.
                  </p>
                )}
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Проверка...' : 'Войти'}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleChangePhone}
                      disabled={isLoading}
                    >
                      Изменить номер
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleResendOtp}
                      disabled={isLoading || resendTimer > 0}
                    >
                      Отправить снова
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
