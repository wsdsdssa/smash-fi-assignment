import type { Metadata } from 'next';
import { Providers } from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coin Dashboard',
  description: 'Dark mode coin list powered by React Query and Zustand',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="antialiased bg-background text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
