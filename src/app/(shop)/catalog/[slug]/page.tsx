import { notFound } from 'next/navigation'
import { ProductPage } from '@/widgets/product'
import { getProductBySlug } from '@/entities/product'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export const revalidate = 86400

export default async function ProductPageRoute({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return <ProductPage product={product} />
}
