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
        <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-12 md:py-16 mt-16 md:mt-20">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className="text-3xl">🚀</span> Langgoku
                </h3>
                <p className="text-blue-100 text-sm md:text-base leading-relaxed">Toko digital premium terpercaya dengan berbagai pilihan akun subscription berkualitas tinggi</p>
              </div>
              <div className="text-center">
                <h4 className="text-lg font-bold mb-4 text-blue-50">📌 Layanan</h4>
                <ul className="text-blue-100 space-y-3 text-sm md:text-base">
                  <li><a href="/" className="hover:text-white transition-colors duration-300 font-medium hover:translate-x-1 inline-block">→ Belanja Produk</a></li>
                  <li><a href="/about" className="hover:text-white transition-colors duration-300 font-medium hover:translate-x-1 inline-block">→ Tentang Kami</a></li>
                  <li><a href="/admin" className="hover:text-white transition-colors duration-300 font-medium hover:translate-x-1 inline-block">→ Admin Panel</a></li>
                </ul>
              </div>
              <div className="text-center md:text-right">
                <h4 className="text-lg font-bold mb-4 text-blue-50">📞 Hubungi Kami</h4>
                <div className="text-blue-100 space-y-3 text-sm md:text-base">
                  <p className="font-medium">📧 support@langgoku.com</p>
                  <p className="font-medium">💬 WhatsApp: +62 812-3456-7890</p>
                  <p className="font-medium">⏰ 08:00 - 22:00 WIB (Setiap Hari)</p>
                </div>
              </div>
            </div>
            <div className="border-t border-blue-800 pt-8">
              <p className="text-center text-blue-200 font-medium text-xs md:text-sm">&copy; 2026 Langgoku. All rights reserved. | Dibuat dengan ❤️ untuk kemudahan berbelanja Anda</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
