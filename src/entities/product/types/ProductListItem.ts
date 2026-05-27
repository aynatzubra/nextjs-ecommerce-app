export interface ProductListItem {
  id: number
  name: string
  slug: string
  description: string
  price: number
  imageUrl: string
  categoryName: string
  inStock: boolean
  stock: number
}

export interface ProductDetails {
  id: number
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  categoryName: string
  stock: number
  inStock: boolean
}
