import "./tailwind.css"
import type { PropsWithChildren } from "react"
import { Playpen_Sans } from "next/font/google"
import { LoadingSpinner, LoadingStore } from "./LoadingStore"
import lazy from "next/dynamic"

const StoreProvider = lazy(() => import("./store").then(mod => mod.StoreProvider), {
  ssr: false,
  loading: () => <LoadingSpinner />,
})

export const metadata = {
  title: 'Rankem',
}

const font = Playpen_Sans({
  subsets: ['latin'],
  variable: '--font-playpen-sans',
  weight: ['400']
})

export const dynamic = "force-static"

export default function RootLayout({
  children,
}: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={`${font.variable} font-playpen antialiased`}>
        <StoreProvider>
          <LoadingStore>
            {children}
          </LoadingStore>
        </StoreProvider>
      </body>
    </html>
  )
}
