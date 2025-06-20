import './globals.css'
import type { Metadata } from 'next'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'KakaoChan Commissions',
  description: 'Commission your favorite vamp-wolf VTuber',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
