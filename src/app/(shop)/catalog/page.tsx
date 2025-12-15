import { getCatalogProducts } from '@/entities/product'
import { ProductGrid } from '@/widgets/catalog'

export const revalidate = 86400 // 24 our

export default async function CatalogPage() {
  const products = await getCatalogProducts()

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
        <p className="text-sm text-zinc-600">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci aperiam deleniti dolore dolorem enim, error
          eveniet explicabo, harum nulla odio officiis pariatur quas, quia quod repellendus sequi voluptate. Maiores,
          quae?
        </p>
      </header>

      <ProductGrid products={products} />
    </section>
  )
}
