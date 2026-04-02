import type { Metadata } from 'next';
import { DM_Mono, DM_Serif_Display } from 'next/font/google';
import './globals.css';

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kevin Sundstrom',
  icons: [
    {
      rel: 'icon',
      url: '/favicon-light.svg',
      type: 'image/svg+xml',
      media: '(prefers-color-scheme: light)',
    },
    {
      rel: 'icon',
      url: '/favicon-dark.svg',
      type: 'image/svg+xml',
      media: '(prefers-color-scheme: dark)',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmMono.variable} ${dmSerifDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
