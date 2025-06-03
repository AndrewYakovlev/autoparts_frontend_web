// lib/test-data.ts
// Тестовые данные для разработки

export const TEST_USERS = [
  {
    phone: "+79991234567",
    role: "ADMIN",
    description: "Администратор",
  },
  {
    phone: "+79991234568",
    role: "MANAGER",
    description: "Менеджер",
  },
  {
    phone: "+79991234569",
    role: "CUSTOMER",
    description: "Покупатель",
  },
]

export const isDevelopment = process.env.NODE_ENV === "development"
