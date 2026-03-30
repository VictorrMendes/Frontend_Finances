import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Meu Dinheiro - Finanças',
    short_name: 'Meu Dinheiro',
    description: 'Seu controle financeiro pessoal na palma da mão.',
    start_url: '/',
    display: 'standalone', // Isso faz ele abrir em tela cheia, como app nativo
    background_color: '#0f172a', // Cor de fundo da tela de carregamento (Slate 900)
    theme_color: '#2563eb', // Cor da barra de status do celular (Blue 600)
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}