// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Что-то пошло не так!</h1>
        <p className="mt-4 text-muted-foreground">Произошла непредвиденная ошибка</p>
        <Button onClick={reset} className="mt-8">
          Попробовать снова
        </Button>
      </div>
    </div>
  );
}
