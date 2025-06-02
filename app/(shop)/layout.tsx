// src/app/(shop)/layout.tsx
import Link from "next/link";
import { ShoppingCart, Heart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">AutoParts</span>
          </Link>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Поиск запчастей..."
                  className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm"
                />
              </div>
            </div>

            <nav className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Избранное</span>
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Корзина</span>
                </Link>
              </Button>

              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Профиль</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 AutoParts. Все права защищены.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/about" className="hover:underline">
              О компании
            </Link>
            <Link href="/delivery" className="hover:underline">
              Доставка
            </Link>
            <Link href="/contacts" className="hover:underline">
              Контакты
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
