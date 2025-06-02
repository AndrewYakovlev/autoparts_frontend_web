// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")

  // Format as +7 (XXX) XXX-XX-XX
  if (digits.length === 11 && digits.startsWith("7")) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
      7,
      9
    )}-${digits.slice(9, 11)}`
  }

  return phone
}

export function parsePhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "")

  // Ensure it starts with 7 and has 11 digits
  if (digits.length === 10) {
    return `+7${digits}`
  } else if (digits.length === 11 && digits.startsWith("7")) {
    return `+${digits}`
  } else if (digits.length === 11 && digits.startsWith("8")) {
    return `+7${digits.slice(1)}`
  }

  return phone
}
