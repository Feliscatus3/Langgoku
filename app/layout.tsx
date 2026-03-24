import type { Metadata } from 'next'
import '../styles/globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Langgoku - Premium Digital Accounts Store',
  description: 'Belanja akun premium digital (Netflix, Canva, CapCut, dan lainnya) dengan harga terjangkau',
  keywords: 'netflix, canva, capcut, premium account, digital account, ecommerce',
  openGraph: {
    title: 'Langgoku - Premium Digital Accounts Store',
    description: 'Belanja akun premium digital dengan mudah dan aman',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50">
        <Navbar />
        <main>{children}</main>
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Langgoku</h3>
                <p className="text-gray-400">Toko digital premium terpercaya</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Layanan</h4>
                <ul className="text-gray-400 space-y-2">
                  <li><a href="/" className="hover:text-white transition">Produk</a></li>
                  <li><a href="/about" className="hover:text-white transition">Tentang</a></li>
                  <li><a href="/contact" className="hover:text-white transition">Kontak</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Kontak</h4>
                <p className="text-gray-400">Email: support@langgoku.com</p>
                <p className="text-gray-400">WhatsApp: +62 xxx-xxxx-xxxx</p>
              </div>
            </div>
            <hr className="border-gray-700 mb-4" />
            <p className="text-center text-gray-400">&copy; 2026 Langgoku. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
