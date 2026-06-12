import React from 'react'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import JarvisWidget from '@/components/JarvisWidget'

export const metadata = {
  title: 'Zenith Terminal Workspace',
  description: 'A responsive full-screen widget-based personal dashboard.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
             __html: `
              (function() {
                try {
                  var _fetch = window.fetch;
                  Object.defineProperty(window, 'fetch', {
                    get: function() { return _fetch; },
                    set: function(val) { _fetch = val; },
                    configurable: true,
                    enumerable: true
                  });
                } catch (e) {
                  console.warn("Mitigated read-only fetch descriptor issue");
                }
                window.addEventListener('error', function(event) {
                  if (event.message && (event.message.indexOf('fetch') !== -1 || event.message.indexOf('getter') !== -1)) {
                    event.preventDefault();
                  }
                });
              })();
            `
          }}
        />
      </head>
      <body className="h-full bg-slate-950 text-slate-100 antialiased font-sans select-none" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <JarvisWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
