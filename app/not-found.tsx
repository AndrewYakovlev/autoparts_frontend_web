// src/app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-4 text-xl text-muted-foreground">Страница не найдена</p>
        <p className="mt-2 text-muted-foreground">
          Запрашиваемая страница не существует или была удалена
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Вернуться на главную</Link>
        </Button>
      </div>
    </div>
  );
}
