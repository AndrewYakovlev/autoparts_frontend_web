// app/(shop)/layout.tsx
import { Navigation } from "@/components/Navigation"

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {children}
    </div>
  )
}
