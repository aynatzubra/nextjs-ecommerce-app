import { notFound } from 'next/navigation'
import { ProductDetailsView } from '@/widgets/product'
import { getProductBySlug } from '@/entities/product'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 86400

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <section className="space-y-6">
      <ProductDetailsView product={product} />
    </section>
  )
}
