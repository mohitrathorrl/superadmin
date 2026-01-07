import { Inter } from "next/font/google"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

/* =========================
   METADATA (NO VIEWPORT HERE)
========================= */
export const metadata = {
  title: "Superadmin Fincloud",
  description: "Production-ready admin dashboard",
}

/* =========================
   VIEWPORT (SEPARATE EXPORT)
========================= */
export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
