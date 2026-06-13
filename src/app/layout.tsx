import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scriptr — YouTube AI Script Writer",
  description: "Find outlier videos, write AI scripts, track competitors, generate thumbnails.",

  openGraph: {
    title: "Scriptr — Find Viral Ideas & Write YouTube Scripts with AI",
    description: "Find outlier videos performing 2–10x above average, generate full AI scripts, track competitors, and build your channel faster. Try free for 7 days.",
    url: "https://www.getscriptr.io",
    siteName: "Scriptr",
    type: "website",
    images: [{ url: "https://www.getscriptr.io/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scriptr — Find Viral Ideas & Write YouTube Scripts with AI",
    description: "Find outlier videos performing 2–10x above average, generate full AI scripts, track competitors, and build your channel faster. Try free for 7 days.",
    images: ["https://www.getscriptr.io/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','2107484023507689');fbq('track','PageView');
        `}</Script>
      </body>
    </html>
  );
}
