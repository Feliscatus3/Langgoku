import { NextRequest, NextResponse } from 'next/server'
import { getProductsFromSheet } from '@/lib/googleAppsScript'
import { getGoogleSheetsData } from '@/lib/googleSheets'

export async function GET(request: NextRequest) {
  try {
    // Ambil produk dari Google Sheets via Apps Script
    const result = await getProductsFromSheet()
    
    if (result.success && result.data && result.data.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Produk berhasil diambil',
        data: result.data,
      })
    }

    // Fallback ke Google Sheets API langsung jika Apps Script gagal atau kosong
    const products = await getGoogleSheetsData()
    
    if (!products || products.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data produk belum terhubung atau kosong',
          data: [],
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Produk berhasil diambil (fallback)',
      data: products,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // Fallback ke Google Sheets API langsung
    try {
      const products = await getGoogleSheetsData()
      return NextResponse.json({
        success: true,
        message: 'Produk berhasil diambil (fallback)',
        data: products || [],
      })
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return NextResponse.json(
        {
          success: false,
          message: 'Gagal mengambil data produk',
          data: [],
        },
        { status: 200 }
      )
    }
  }
}
