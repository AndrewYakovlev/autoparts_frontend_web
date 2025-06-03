// app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
	title: 'AutoParts - Интернет-магазин автозапчастей',
	description: 'Широкий выбор автозапчастей с быстрой доставкой',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="ru">
			<body className={`${GeistSans.className} antialiased`}>
				<ErrorBoundary>
					<AuthProvider>
						{children}
						<Toaster richColors position="top-center" />
					</AuthProvider>
				</ErrorBoundary>
			</body>
		</html>
	)
}
