import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#10b981',
};

export const metadata: Metadata = {
  title: 'Casino Platform - Play & Win Big!',
  description: 'A modern casino gaming platform with dice, coinflip, roulette, and more exciting games.',
  keywords: 'casino, games, dice, coinflip, roulette, blackjack, slots, gambling',
  authors: [{ name: 'Casino Platform Team' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Casino Platform - Play & Win Big!',
    description: 'A modern casino gaming platform with exciting games and real-time action.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Casino Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Casino Platform - Play & Win Big!',
    description: 'A modern casino gaming platform with exciting games and real-time action.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-casino-gradient`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 container-responsive py-8">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}