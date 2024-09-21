import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rankem',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff',
    icons: [
      {
        src: '/icon.png',
        sizes: '300x300',
        type: 'image/png',
      },
    ],
  }
}