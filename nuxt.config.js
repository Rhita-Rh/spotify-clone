export default {
  ssr: true, // Ensure SSR is enabled
  target: 'server',
  modules: ['@nuxtjs/axios', '@nuxtjs/auth-next', '@nuxt/postcss8'],

  axios: {
    baseURL: 'https://api.spotify.com/v1', // API Spotify
  },
  css: [
    // Inclure Tailwind CSS
    '@/assets/css/tailwind.css',
  ],
  build: {
    postcss: {
      plugins: {
        'postcss-import': {},
        tailwindcss: {},
        autoprefixer: {},
      },
    },
  },

  head: {
    // ... autres options ...
    link: [
      // ... autres liens ...
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
      },
    ],
  },
  devServer: {
    host: '127.0.0.1',
    port: 3000
  },

  auth: {
    strategies: {
      spotify: {
        scheme: 'oauth2',
        endpoints: {
          authorization: 'https://accounts.spotify.com/authorize',
          token: 'https://accounts.spotify.com/api/token',
          userInfo: 'https://api.spotify.com/v1/me',
        },
        clientId: '5a2ce8d7cc9d448d8d923a47f247f7af',
        clientSecret: 'e5809d0cf97b4227b9703dc9bc62a7c7',
        scope: [
          'streaming',
          'user-read-email',
          'user-read-private',
          'user-modify-playback-state',
          'user-read-playback-state',
          'user-read-currently-playing',
          'playlist-read-private',
          'playlist-modify-public',
          'playlist-modify-private',
          'user-read-recently-played',
          'user-library-read',
          'user-top-read',
          'user-follow-read'
        ],
        grantType: 'authorization_code',
        responseType: 'code',
        redirectUri: 'https://69bb-197-230-122-193.ngrok-free.app/callback',
      },
    },
  },
};
