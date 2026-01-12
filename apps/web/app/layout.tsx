import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Lead Gen Malaysia',
    description: 'Automated lead generation dashboard',
}

import { ToastProvider } from '../components/ui/Toast'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ToastProvider>
                    <main className="min-h-screen p-4">
                        {children}
                    </main>
                </ToastProvider>
            </body>
        </html>
    )
}
