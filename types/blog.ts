export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image?: string
  author: string
  category: string
  createdAt: string
  published: boolean
  publishedAt?: string
  views: number
}
