'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="container-custom py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-10 font-semibold transition-colors">
          ← Kembali ke Toko
        </Link>

        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gradient mb-3">📖 Tentang Langgoku</h1>
            <p className="text-lg text-primary-600">Kenali lebih dekat tentang toko digital premium kami</p>
          </div>

          <div className="card p-10 space-y-10 border border-primary-200">
            <section>
              <h2 className="text-3xl font-bold text-gradient mb-4">Apa itu Langgoku?</h2>
              <p className="text-lg text-primary-700 leading-relaxed">
                Langgoku adalah platform e-commerce modern yang menjual akun premium digital 
                seperti <span className="font-bold">Netflix, Canva, CapCut, Adobe Creative Cloud</span>, dan berbagai layanan 
                premium lainnya dengan harga yang terjangkau dan terpercaya.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gradient mb-6">✨ Mengapa Memilih Kami?</h2>
              <ul className="space-y-3 text-primary-700">
                <li className="flex items-start gap-4 p-3 rounded-xl bg-primary-50 border border-primary-200">
                  <span className="text-accent-600 font-bold text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Harga terjangkau dan kompetitif di pasaran</span>
                </li>
                <li className="flex items-start gap-4 p-3 rounded-xl bg-primary-50 border border-primary-200">
                  <span className="text-accent-600 font-bold text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Pembayaran mudah (QRIS, Transfer Bank, E-wallet)</span>
                </li>
                <li className="flex items-start gap-4 p-3 rounded-xl bg-primary-50 border border-primary-200">
                  <span className="text-accent-600 font-bold text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Pengiriman akun cepat (5-15 menit)</span>
                </li>
                <li className="flex items-start gap-4 p-3 rounded-xl bg-primary-50 border border-primary-200">
                  <span className="text-accent-600 font-bold text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Customer support responsif via WhatsApp 24/7</span>
                </li>
                <li className="flex items-start gap-4 p-3 rounded-xl bg-primary-50 border border-primary-200">
                  <span className="text-accent-600 font-bold text-xl flex-shrink-0">✓</span>
                  <span className="font-medium">Garansi akun aktif sesuai durasi pembelian</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gradient mb-8">🚀 Cara Kerja</h2>
              <div className="space-y-5">
                <div className="flex gap-5 p-5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900 text-lg">Pilih Produk</h3>
                    <p className="text-primary-700 mt-1">Browsing dan pilih akun premium yang Anda inginkan dari katalog kami</p>
                  </div>
                </div>
                <div className="flex gap-5 p-5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900 text-lg">Input Data</h3>
                    <p className="text-primary-700 mt-1">Masukkan nama lengkap dan nomor WhatsApp Anda dengan benar</p>
                  </div>
                </div>
                <div className="flex gap-5 p-5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900 text-lg">Pembayaran</h3>
                    <p className="text-primary-700 mt-1">Scan QRIS atau transfer ke nomor rekening yang tersedia</p>
                  </div>
                </div>
                <div className="flex gap-5 p-5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900 text-lg">Terima Akun</h3>
                    <p className="text-primary-700 mt-1">Akun dikirim via WhatsApp dalam beberapa menit</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-gradient-to-r from-primary-50 to-accent-50 p-8 rounded-2xl border-2 border-accent-300">
              <h2 className="text-3xl font-bold text-gradient mb-4">💬 Hubungi Kami</h2>
              <p className="text-primary-700 mb-6 font-medium">
                Punya pertanyaan atau butuh bantuan? Jangan ragu untuk menghubungi kami melalui WhatsApp atau email.
              </p>
              <div className="space-y-3">
                <a
                  href="https://wa.me/62xxx"
                  className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-primary-700 border border-primary-200"
                >
                  <svg className="w-6 h-6 text-accent-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.364-3.905 6.75-1.89 10.525 1.891 3.368 5.853 4.795 9.797 3.488 3.368-1.079 5.82-4.15 5.428-7.418-.167-1.334-1.01-2.502-2.149-3.162-1.147-.medalist-2.295-1.023-3.958-.645z"/>
                  </svg>
                  💬 WhatsApp: +62 xxx-xxxx-xxxx
                </a>
                <a
                  href="mailto:support@langgoku.com"
                  className="flex items-center gap-3 bg-white px-5 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-primary-700 border border-primary-200"
                >
                  <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  📧 Email: support@langgoku.com
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
