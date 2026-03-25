'use client'

import { useState, useEffect } from 'react'

interface Testimony {
  id: number
  name: string
  role: string
  text: string
  rating: number
  avatar: string
}

const testimonies: Testimony[] = [
  {
    id: 1,
    name: 'Budi Santoso',
    role: 'Freelancer',
    text: 'Sejak menggunakan Langgoku, saya bisa mendapatkan akun premium dengan harga jauh lebih murah. Kualitas serta prosesnya sangat profesional dan cepat. Sangat merekomendasikan!',
    rating: 5,
    avatar: '👨‍💼',
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    role: 'Content Creator',
    text: 'Pembayaran sangat mudah dan akun langsung bisa digunakan. Saya sudah membeli Netflix dan Canva di sini. Customer service-nya juga responsif dan membantu.',
    rating: 5,
    avatar: '👩‍💻',
  },
  {
    id: 3,
    name: 'Ahmad Wijaya',
    role: 'Pelajar',
    text: 'Sebagai pelajar, harga di Langgoku sangat terjangkau. Bisa langganan CapCut premium tanpa harus menguras kantong. Worth it banget!',
    rating: 5,
    avatar: '🧑‍🎓',
  },
  {
    id: 4,
    name: 'Rina Kusuma',
    role: 'Pengusaha',
    text: 'Trusted seller! Sudah beli berkali-kali dan tidak pernah kecewa. Prosesnya transparan dan garansi uang kembali memberikan kepercayaan lebih.',
    rating: 5,
    avatar: '👩‍🏫',
  },
  {
    id: 5,
    name: 'Doni Hermawan',
    role: 'Designer',
    text: 'Harga Canva premium di Langgoku jauh lebih murah dari belinya langsung. Hemat hingga 70% dan proses aktivasi instant. Top banget!',
    rating: 5,
    avatar: '🎨',
  },
]

export default function TestimoniesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonies.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isAutoPlay])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlay(false)
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonies.length)
    setIsAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonies.length) % testimonies.length)
    setIsAutoPlay(false)
  }

  const currentTestimony = testimonies[currentIndex]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-950 mb-4">Apa Kata Pelanggan Kami?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ribuan pelanggan puas telah membuktikan kualitas dan kepercayaan Langgoku
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Slide */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 transition-all duration-500">
              {/* Stars */}
              <div className="flex gap-1.5 mb-6">
                {[...Array(currentTestimony.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed italic">
                "{currentTestimony.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
                  {currentTestimony.avatar}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{currentTestimony.name}</h4>
                  <p className="text-sm text-gray-600">{currentTestimony.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center px-4 md:px-0">
            <button
              onClick={prevSlide}
              onMouseEnter={() => setIsAutoPlay(false)}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6 text-gray-700 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  onMouseEnter={() => setIsAutoPlay(false)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-8 h-3 bg-blue-600'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              onMouseEnter={() => setIsAutoPlay(false)}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6 text-gray-700 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Counter */}
          <div className="text-center mt-8 text-sm text-gray-600">
            Testimoni <span className="font-bold text-blue-600">{currentIndex + 1}</span> dari{' '}
            <span className="font-bold text-blue-600">{testimonies.length}</span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-950 mb-4">Siap Belanja Premium?</h3>
          <p className="text-lg text-gray-600 mb-8">Bergabunglah dengan ribuan pelanggan puas kami sekarang juga</p>
          <a href="/#products" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
            Mulai Belanja Sekarang
          </a>
        </div>
      </div>
    </section>
  )
}
