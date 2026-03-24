import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for blog posts
let blogPosts: any[] = []

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'Blog posts berhasil diambil',
      data: blogPosts,
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil blog posts',
        data: [],
      },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newPost = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    }
    
    blogPosts.push(newPost)
    
    return NextResponse.json({
      success: true,
      message: 'Blog post berhasil ditambahkan',
      data: newPost,
    })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal membuat blog post',
      },
      { status: 400 }
    )
  }
}
