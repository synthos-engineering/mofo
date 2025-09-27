import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agentic Hookups - AI-Powered Dating',
  description: 'Find your perfect match through AI agents trained on your brainwaves',
  keywords: ['AI', 'dating', 'World ID', 'blockchain', 'EEG', 'matching'],
  authors: [{ name: 'Mofo Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#667eea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Agentic Hookups" />
      </head>
      <body className={`${inter.className} h-full world-miniapp`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

