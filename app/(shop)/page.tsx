// src/app/(shop)/page.tsx
export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold tracking-tight">Добро пожаловать в AutoParts</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Широкий ассортимент автозапчастей с доставкой по всей России
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-center">
          <h3 className="text-lg font-semibold">Быстрая доставка</h3>
          <p className="mt-2 text-sm text-muted-foreground">Доставка по всей России от 1 дня</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <h3 className="text-lg font-semibold">Гарантия качества</h3>
          <p className="mt-2 text-sm text-muted-foreground">Только оригинальные запчасти</p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-center">
          <h3 className="text-lg font-semibold">Поддержка 24/7</h3>
          <p className="mt-2 text-sm text-muted-foreground">Всегда готовы помочь с выбором</p>
        </div>
      </section>
    </div>
  );
}
