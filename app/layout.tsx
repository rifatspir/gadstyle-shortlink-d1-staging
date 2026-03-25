
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gadstyle App Shortlink Server',
  description: 'Shortlink server and app landing for the Gadstyle app.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <footer className="site-footer">
          <span>Developed by </span>
          <a href="https://marbwp.com/" target="_blank" rel="noreferrer">MARB</a>
        </footer>
      </body>
    </html>
  );
}
