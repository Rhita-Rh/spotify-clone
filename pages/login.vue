<template>
  <div class="landing-container">
    <div class="landing-content">
      <h1 class="melodify-logo">Melodify</h1>
      <p class="landing-tagline">Votre compagnon musical personnel</p>
      
      <button @click="redirectToSpotify" class="spotify-login-btn">
        <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" alt="Spotify" class="spotify-icon" />
        Se connecter avec Spotify
      </button>

      <div class="features-section">
        <div class="feature-card">
          <h3 class="feature-title">Écoutez partout</h3>
          <p class="feature-description">Profitez de votre musique préférée où que vous soyez, sur tous vos appareils.</p>
        </div>
        
        <div class="feature-card">
          <h3 class="feature-title">Playlists personnalisées</h3>
          <p class="feature-description">Créez et partagez vos playlists avec vos amis et découvrez de nouvelles musiques.</p>
        </div>
        
        <div class="feature-card">
          <h3 class="feature-title">Contrôle total</h3>
          <p class="feature-description">Gérez votre bibliothèque musicale et contrôlez la lecture comme vous le souhaitez.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    redirectToSpotify() {
      const clientId = '5a2ce8d7cc9d448d8d923a47f247f7af';
      const redirectUri = 'https://neon-kelpie-58d58d.netlify.app/callback';
      const scopes = [
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
      ];
      const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=${encodeURIComponent(scopes.join(' '))}`;
      window.location.href = authUrl;
    },
  },
};
</script>

<style>
@import '@/assets/css/landing.css';
</style>
  
