import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Controle Financeiro',
    short_name: 'Financeiro',
    description: 'Aplicativo de controle financeiro',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192x192.jpg',
        sizes: '192x192',
        type: 'image/jpg',
      },
      {
        src: '/icon-512.jpg',
        sizes: '512x512',
        type: 'image/jpg',
      },
    ],
  }
}