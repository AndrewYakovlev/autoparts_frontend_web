// app/(shop)/page.tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Package, Truck, Shield, Clock } from 'lucide-react'

export default function ShopPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<section className="text-center py-12 md:py-20">
				<h1 className="text-4xl md:text-6xl font-bold mb-6">
					Добро пожаловать в <span className="text-primary">AutoParts</span>
				</h1>
				<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
					Широкий выбор качественных автозапчастей с быстрой доставкой по всей России
				</p>
				<div className="flex gap-4 justify-center">
					<Link href="/catalog">
						<Button size="lg">Перейти к каталогу</Button>
					</Link>
					<Link href="/login">
						<Button size="lg" variant="outline">
							Войти в аккаунт
						</Button>
					</Link>
				</div>
			</section>

			<section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 py-12">
				<Card>
					<CardHeader>
						<Package className="h-12 w-12 mb-4 text-primary" />
						<CardTitle>Широкий ассортимент</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Более 100 000 наименований запчастей для всех марок автомобилей
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<Truck className="h-12 w-12 mb-4 text-primary" />
						<CardTitle>Быстрая доставка</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Доставка по всей России от 1 дня. Самовывоз из пунктов выдачи
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<Shield className="h-12 w-12 mb-4 text-primary" />
						<CardTitle>Гарантия качества</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Только оригинальные запчасти и качественные аналоги с гарантией
						</CardDescription>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<Clock className="h-12 w-12 mb-4 text-primary" />
						<CardTitle>Поддержка 24/7</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Консультация специалистов и помощь в подборе запчастей круглосуточно
						</CardDescription>
					</CardContent>
				</Card>
			</section>

			<section className="text-center py-12 bg-muted/50 rounded-lg">
				<h2 className="text-3xl font-bold mb-4">Как начать покупки?</h2>
				<div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto mt-8">
					<div>
						<div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
							1
						</div>
						<h3 className="font-semibold mb-2">Зарегистрируйтесь</h3>
						<p className="text-muted-foreground">Войдите по номеру телефона за 30 секунд</p>
					</div>
					<div>
						<div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
							2
						</div>
						<h3 className="font-semibold mb-2">Найдите запчасть</h3>
						<p className="text-muted-foreground">Используйте поиск или каталог для выбора</p>
					</div>
					<div>
						<div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
							3
						</div>
						<h3 className="font-semibold mb-2">Оформите заказ</h3>
						<p className="text-muted-foreground">Добавьте в корзину и выберите способ доставки</p>
					</div>
				</div>
			</section>
		</div>
	)
}
