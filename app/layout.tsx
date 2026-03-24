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
        <footer className="bg-blue-600 text-white py-16 mt-20">
          <div className="container-custom mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  🚀 Langgoku
                </h3>
                <p className="text-blue-100 text-lg leading-relaxed">Toko digital premium terpercaya dengan berbagai pilihan akun subscription</p>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-6 text-blue-50">📌 Layanan</h4>
                <ul className="text-blue-100 space-y-3">
                  <li><a href="/" className="hover:text-white transition-colors duration-300 font-medium">→ Produk</a></li>
                  <li><a href="/about" className="hover:text-white transition-colors duration-300 font-medium">→ Tentang</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors duration-300 font-medium">→ Kontak</a></li>
                  <li><a href="/admin" className="hover:text-white transition-colors duration-300 font-medium">→ Admin</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-bold mb-6 text-blue-50">📞 Kontak</h4>
                <div className="text-blue-100 space-y-3">
                  <p className="font-medium">📧 Email: support@langgoku.com</p>
                  <p className="font-medium">💬 WhatsApp: +62 xxx-xxxx-xxxx</p>
                  <p className="font-medium">⏰ Jam Operasional: 08:00 - 22:00</p>
                </div>
              </div>
            </div>
            <div className="border-t border-blue-400 my-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="font-bold text-blue-50">Aman & Terpercaya</p>
                <p className="text-blue-100 text-sm">Pembayaran terenkripsi</p>
              </div>
              <div>
                <p className="font-bold text-blue-50">Dukungan 24/7</p>
                <p className="text-blue-100 text-sm">Siap membantu Anda</p>
              </div>
              <div>
                <p className="font-bold text-blue-50">Pengiriman Cepat</p>
                <p className="text-blue-100 text-sm">5-15 menit</p>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-400 pt-8">
            <p className="text-center text-blue-100 font-medium">&copy; 2026 Langgoku. All rights reserved.</p>
            <p className="text-center text-blue-200 text-sm mt-2">Dibuat dengan ❤️ menggunakan Next.js & Google Sheets</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
