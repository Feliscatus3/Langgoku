'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container-custom">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-8 font-medium transition-colors duration-300">
            ← Kembali ke Toko
          </Link>
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4">Tentang Langgoku</h1>
            <p className="text-xl text-blue-100">Platform digital premium terpercaya untuk semua kebutuhan Anda</p>
          </div>
        </div>
      </div>

      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Apa itu Langgoku?</h2>
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed text-center max-w-3xl mx-auto">
              Langgoku adalah platform e-commerce modern yang menjual akun premium digital
              seperti <span className="font-bold text-blue-600">Netflix, Canva, CapCut, Adobe Creative Cloud</span>,
              dan berbagai layanan premium lainnya dengan harga yang terjangkau dan terpercaya.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: '💰',
                title: 'Harga Terjangkau',
                description: 'Harga kompetitif dan hemat di pasaran',
                color: 'from-green-500 to-emerald-600'
              },
              {
                icon: '💳',
                title: 'Pembayaran Mudah',
                description: 'QRIS, Transfer Bank, E-wallet tersedia',
                color: 'from-blue-500 to-cyan-600'
              },
              {
                icon: '⚡',
                title: 'Pengiriman Cepat',
                description: 'Akun dikirim dalam 5-15 menit',
                color: 'from-purple-500 to-pink-600'
              },
              {
                icon: '📱',
                title: 'Support 24/7',
                description: 'Customer service via WhatsApp',
                color: 'from-orange-500 to-red-600'
              },
              {
                icon: '🛡️',
                title: 'Garansi Aktif',
                description: 'Garansi sesuai durasi pembelian',
                color: 'from-indigo-500 to-purple-600'
              },
              {
                icon: '⭐',
                title: 'Terpercaya',
                description: 'Ribuan pelanggan puas menggunakan',
                color: 'from-yellow-500 to-orange-600'
              }
            ].map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl mb-4 text-white text-xl`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Langgoku dalam Angka</h2>
              <p className="text-gray-200">Pencapaian dan kepercayaan yang telah diraih</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { number: '50+', label: 'Layanan Premium' },
                { number: '1000+', label: 'Pelanggan Puas' },
                { number: '24/7', label: 'Support Online' },
                { number: '99%', label: 'Tingkat Kepuasan' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                    {stat.number}
                  </div>
                  <p className="text-gray-200 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Siap Membeli?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Temukan produk premium yang Anda butuhkan dengan harga terbaik
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold py-3 px-8 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Mulai Belanja Sekarang →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
