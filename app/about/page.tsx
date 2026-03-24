'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-12">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Kembali ke Toko
        </Link>

        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Tentang Langgoku</h1>

          <div className="card p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Apa itu Langgoku?</h2>
              <p className="text-gray-600 leading-relaxed">
                Langgoku adalah platform e-commerce modern yang menjual akun premium digital 
                seperti Netflix, Canva, CapCut, Adobe Creative Cloud, dan berbagai layanan 
                premium lainnya dengan harga yang terjangkau dan terpercaya.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Mengapa Memilih Kami?</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Harga terjangkau dan kompetitif</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Pembayaran mudah (QRIS, Transfer Bank)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Pengiriman akun cepat (5-15 menit)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Customer support responsif via WhatsApp</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Garansi akun aktif sesuai durasi</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Cara Kerja</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pilih Produk</h3>
                    <p className="text-gray-600">Browsing dan pilih akun premium yang Anda inginkan</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Input Data</h3>
                    <p className="text-gray-600">Masukkan nama lengkap dan nomor WhatsApp Anda</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pembayaran</h3>
                    <p className="text-gray-600">Scan QRIS atau transfer ke nomor rekening yang tersedia</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Terima Akun</h3>
                    <p className="text-gray-600">Akun dikirim via WhatsApp dalam beberapa menit</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Hubungi Kami</h2>
              <p className="text-gray-600 mb-4">
                Punya pertanyaan? Jangan ragu untuk menghubungi kami melalui WhatsApp atau email.
              </p>
              <div className="space-y-2">
                <a
                  href="https://wa.me/62xxx"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.89 10.525 1.891 3.368 5.853 4.795 9.797 3.488 3.368-1.079 5.82-4.15 5.428-7.418-.167-1.334-1.01-2.502-2.149-3.162-1.147-.medalist-2.295-1.023-3.958-.645z"/>
                  </svg>
                  WhatsApp: +62 xxx-xxxx-xxxx
                </a>
                <a
                  href="mailto:support@langgoku.com"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Email: support@langgoku.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
