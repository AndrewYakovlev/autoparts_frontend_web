// app/admin/layout.tsx
import { Navigation } from "@/components/Navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/50">
      <Navigation />
      {children}
    </div>
  )
}
