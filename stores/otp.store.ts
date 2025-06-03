// stores/otp.store.ts
import { create } from "zustand"

interface OtpState {
  phone: string
  resendTimer: number
  step: "phone" | "otp"

  setPhone: (phone: string) => void
  setResendTimer: (seconds: number) => void
  decrementTimer: () => void
  setStep: (step: "phone" | "otp") => void
  reset: () => void
}

export const useOtpStore = create<OtpState>(set => ({
  phone: "",
  resendTimer: 0,
  step: "phone",

  setPhone: phone => set({ phone }),

  setResendTimer: seconds => set({ resendTimer: seconds }),

  decrementTimer: () =>
    set(state => ({
      resendTimer: Math.max(0, state.resendTimer - 1),
    })),

  setStep: step => set({ step }),

  reset: () =>
    set({
      phone: "",
      resendTimer: 0,
      step: "phone",
    }),
}))
