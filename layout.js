import './globals.css'

export const metadata = {
  title: 'Premium Portfolio | Photographer & Videographer',
  description: 'Professional photography, videography, and editing services',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}
