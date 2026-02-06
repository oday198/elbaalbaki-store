import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from './context/CartContext'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata = {
  title: 'Premium Electronics & Appliances',
  description: 'Shop the latest electronics, appliances, TVs, and home essentials. Free delivery on orders over $100. 2-year warranty on all products.',
  keywords: 'electronics, appliances, TV, air fryers, vacuum cleaners, kitchenware, home appliances, delivery',
  authors: [{ name: 'ELBAALBAKI ELECTRIC' }],
  openGraph: {
    title: 'ELBAALBAKI ELECTRIC - Premium Electronics & Appliances',
    description: 'Shop the latest electronics and appliances with free delivery',
    type: 'website',
    locale: 'en_US',
    url: 'https://romeoelectric.com',
    siteName: 'ELBAALBAKI ELECTRIC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELBAALBAKI ELECTRIC - Premium Electronics & Appliances',
    description: 'Shop the latest electronics and appliances with free delivery',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Theme Color - Updated to black/white scheme */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        
        {/* Additional Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Preload critical fonts */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" as="style" />
      </head>
      <body className={`${inter.className} antialiased bg-background text-text-primary`}>
        <CartProvider>
          {children}
        </CartProvider>
        
        {/* WhatsApp Floating Button - Updated color */}
        <a 
            href="https://wa.me/78922256" 
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 z-50 flex items-center justify-center border-4 border-white ring-4 ring-[#25D366]/20"
            aria-label="Chat on WhatsApp"
            style={{
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="text-white"
            >
              <path d="M12.032 2c5.324 0 9.645 4.323 9.645 9.648 0 5.324-4.321 9.646-9.645 9.646-1.85 0-3.583-.52-5.062-1.417l-5.146 1.61 1.647-4.998c-1.036-1.61-1.647-3.51-1.647-5.514 0-5.325 4.322-9.648 9.646-9.648zm0 1.558a8.09 8.09 0 0 0-8.087 8.09 8.066 8.066 0 0 0 1.38 4.55l-1.023 3.113 3.209-1.005a8.092 8.092 0 0 0 4.52 1.376 8.09 8.09 0 0 0 0-16.18zm4.467 10.955c-.242-.122-1.423-.704-1.644-.784-.22-.08-.38-.122-.54.122-.16.243-.626.784-.767.947-.14.163-.28.183-.52.061-.242-.122-1.018-.376-1.937-1.198-.716-.64-1.199-1.43-1.338-1.672-.14-.242-.015-.373.105-.494.108-.108.242-.283.363-.424.12-.14.16-.242.242-.404.08-.162.04-.304-.02-.425-.06-.12-.54-1.304-.74-1.785-.193-.47-.387-.407-.54-.414-.14-.006-.303-.006-.466-.006-.163 0-.427.06-.652.304-.226.243-.863.845-.863 2.06 0 1.215.888 2.39 1.012 2.555.124.165 1.747 2.672 4.238 3.746.594.259 1.058.414 1.42.53.594.19 1.134.163 1.56.099.48-.073 1.476-.603 1.684-1.186.208-.584.208-1.084.144-1.186-.062-.102-.226-.163-.467-.285z"/>
            </svg>

        </a>
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ElectronicsStore",
              "name": "ELBAALBAKI ELECTRIC",
              "description": "Premium electronics and appliances store",
              "url": "https://romeoelectric.com",
              "logo": "https://romeoelectric.com/logo.png",
              "telephone": "+1-234-567-8900",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Electronics Street",
                "addressLocality": "City",
                "addressRegion": "State",
                "postalCode": "12345",
                "addressCountry": "US"
              },
              "openingHours": "Mo-Sa 09:00-21:00",
              "priceRange": "$$",
              "sameAs": [
                "https://facebook.com/romeoelectric",
                "https://instagram.com/romeoelectric",
                "https://twitter.com/romeoelectric"
              ]
            })
          }}
        />
      </body>
    </html>
  )
}
