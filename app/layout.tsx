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
<body className="bg-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-gray-100 py-12 md:py-16 mt-16 md:mt-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-medium mb-3 text-white flex items-center justify-center md:justify-start gap-2">
                  Langgoku
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">Toko digital premium terpercaya dengan berbagai pilihan akun subscription berkualitas tinggi</p>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-medium mb-4 text-white">Layanan</h4>
                <ul className="text-gray-400 space-y-2 text-sm">
                  <li><a href="/" className="hover:text-white transition-colors">Belanja Produk</a></li>
                  <li><a href="/about" className="hover:text-white transition-colors">Tentang Kami</a></li>
                  <li><a href="/admin" className="hover:text-white transition-colors">Admin Panel</a></li>
                </ul>
              </div>
              <div className="text-center md:text-right">
                <h4 className="text-lg font-medium mb-4 text-white">Hubungi Kami</h4>
                <div className="text-gray-400 space-y-3 text-sm">
                  <p>support@langgoku.com</p>
                  <p>WhatsApp: +62 812-3456-7890</p>
                  <p>08:00 - 22:00 WIB (Setiap Hari)</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-center text-gray-500 text-xs md:text-sm">&copy; 2026 Langgoku. Semua hak dilindungi.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
