// lib/utils/phone.ts
export function formatPhoneNumber(value: string): string {
  // Удаляем все символы кроме цифр и +
  const cleaned = value.replace(/[^\d+]/g, "")

  // Если нет +7 в начале, добавляем
  if (!cleaned.startsWith("+7") && cleaned.length > 0) {
    if (cleaned.startsWith("7")) {
      return "+" + cleaned
    } else if (cleaned.startsWith("8")) {
      return "+7" + cleaned.slice(1)
    } else {
      return "+7" + cleaned
    }
  }

  return cleaned
}

export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/[^\d]/g, "")

  if (cleaned.length >= 11) {
    const countryCode = cleaned.slice(0, 1)
    const areaCode = cleaned.slice(1, 4)
    const prefix = cleaned.slice(4, 7)
    const lineNumber1 = cleaned.slice(7, 9)
    const lineNumber2 = cleaned.slice(9, 11)

    return `+${countryCode} (${areaCode}) ${prefix}-${lineNumber1}-${lineNumber2}`
  }

  return phone
}
