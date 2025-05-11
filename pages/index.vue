<template>
  <div class="flex h-screen bg-black text-white">
    <!-- Barre latérale -->
    <Sidebar />

    <!-- Contenu principal -->
    <main class="flex-1 overflow-y-auto">
      <!-- Header -->
      <header class="p-4 bg-gray-900">
        <div class="flex justify-between items-center">
          <!-- Search Bar -->
          <div class="relative flex-1 max-w-2xl">
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Rechercher des artistes, des chansons ou des playlists..."
              class="w-full px-4 py-2 bg-gray-800 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span class="absolute right-4 top-2 text-gray-400">
              <i class="material-icons">search</i>
            </span>
          </div>

          <!-- Profile Section -->
          <div class="flex items-center space-x-4 ml-4">
            <div class="relative group">
              <button
                @click="showProfileMenu = !showProfileMenu"
                class="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-full transition-colors duration-200"
              >
                <img
                  :src="userProfile?.images?.[0]?.url || require('~/assets/default-album.png')"
                  :alt="userProfile?.display_name || 'Profile'"
                  class="w-8 h-8 rounded-full object-cover"
                />
                <span class="text-white font-medium">{{ userProfile?.display_name || 'Utilisateur' }}</span>
                <i class="material-icons text-gray-400">arrow_drop_down</i>
              </button>

              <!-- Profile Dropdown Menu -->
              <div
                v-if="showProfileMenu"
                class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700"
              >
                <div class="p-2">
                  <div class="px-4 py-2 border-b border-gray-700">
                    <p class="text-sm font-medium text-white">{{ userProfile?.display_name }}</p>
                    <p class="text-xs text-gray-400">{{ userProfile?.email }}</p>
                  </div>
                  <div class="py-1">
                    <a
                      href="https://www.spotify.com/account"
                      target="_blank"
                      class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Compte
                    </a>
                    <a
                      href="https://www.spotify.com/premium"
                      target="_blank"
                      class="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Passer à Premium
                    </a>
                    <button
                      @click="logout"
                      class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="p-8">
        <h2 class="text-2xl font-bold mb-4">Résultats de recherche</h2>
        
        <!-- Artists -->
        <div v-if="searchResults.artists?.items.length" class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Artistes</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="artist in searchResults.artists.items"
              :key="artist.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <img
                :src="artist.images[0]?.url || require('~/assets/default-album.png')"
                :alt="artist.name"
                class="w-full h-40 object-cover mb-2 rounded-full"
              />
              <h3 class="text-lg font-semibold text-center">{{ artist.name }}</h3>
              <p class="text-gray-400 text-sm text-center">Artiste</p>
            </div>
          </div>
        </div>

        <!-- Tracks -->
        <div v-if="searchResults.tracks?.items.length" class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Chansons</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="track in searchResults.tracks.items"
              :key="track.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <img
                :src="track.album.images[0]?.url || require('~/assets/default-album.png')"
                :alt="track.name"
                class="w-full h-40 object-cover mb-2 rounded"
              />
              <h3 class="text-lg font-semibold">{{ track.name }}</h3>
              <p class="text-gray-400 text-sm">{{ track.artists[0]?.name }}</p>
              <button
                @click="playTrack(track.uri)"
                class="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
              >
                Écouter
              </button>
            </div>
          </div>
        </div>

        <!-- Playlists -->
        <div v-if="searchResults.playlists?.items.length" class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Playlists</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="playlist in searchResults.playlists.items"
              :key="playlist.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <img
                :src="playlist.images[0]?.url || require('~/assets/default-album.png')"
                :alt="playlist.name"
                class="w-full h-40 object-cover mb-2 rounded"
              />
              <h3 class="text-lg font-semibold">{{ playlist.name }}</h3>
              <p class="text-gray-400 text-sm">Par {{ playlist.owner.display_name }}</p>
              <button
                @click="playPlaylist(playlist.uri)"
                class="mt-2 w-full bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
              >
                Écouter
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Accueil -->
      <section v-else class="p-8 bg-gradient-to-b from-gray-800 to-black">
        <!-- Bannière -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold">
            {{ greetingMessage }}, {{ userName || 'utilisateur' }} !
          </h1>
        </div>

        <!-- Section Écoutés récemment -->
        <div v-if="recentlyPlayed && recentlyPlayed.length" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Écoutés récemment</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="track in recentlyPlayed"
              :key="track.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <div class="relative group">
                <img
                  :src="track?.album?.images?.[0]?.url || require('~/assets/default-album.png')"
                  :alt="track?.name || 'Unknown track'"
                  class="w-full h-40 object-cover mb-2 rounded"
                />
                <button
                  @click="playTrack(track.uri)"
                  class="absolute bottom-2 right-2 bg-green-500 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <i class="material-icons">play_arrow</i>
                </button>
              </div>
              <h3 class="text-lg font-semibold truncate">{{ track?.name || 'Unknown track' }}</h3>
              <p class="text-gray-400 text-sm truncate">{{ track?.artists?.[0]?.name || 'Unknown artist' }}</p>
            </div>
          </div>
        </div>

        <!-- Section Vos Playlists -->
        <div v-if="userPlaylists && userPlaylists.length" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Vos Playlists</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="playlist in userPlaylists"
              :key="playlist.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <div class="relative group">
                <img
                  :src="playlist?.images?.[0]?.url || require('~/assets/default-album.png')"
                  :alt="playlist?.name || 'Unknown playlist'"
                  class="w-full h-40 object-cover mb-2 rounded"
                />
                <button
                  @click="playPlaylist(playlist.uri)"
                  class="absolute bottom-2 right-2 bg-green-500 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <i class="material-icons">play_arrow</i>
                </button>
              </div>
              <h3 class="text-lg font-semibold truncate">{{ playlist?.name || 'Unknown playlist' }}</h3>
              <p class="text-gray-400 text-sm truncate">{{ playlist?.tracks?.total || 0 }} titres</p>
            </div>
          </div>
        </div>

        <!-- Section Recommandations -->
        <div v-if="recommendations && recommendations.length" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Recommandations pour vous</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
              v-for="track in recommendations"
              :key="track.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition duration-200 ease-in-out transform hover:scale-105"
            >
              <div class="relative group">
                <img
                  :src="track?.album?.images?.[0]?.url || require('~/assets/default-album.png')"
                  :alt="track?.name || 'Unknown track'"
                  class="w-full h-40 object-cover mb-2 rounded"
                />
                <button
                  @click="playTrack(track.uri)"
                  class="absolute bottom-2 right-2 bg-green-500 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <i class="material-icons">play_arrow</i>
                </button>
              </div>
              <h3 class="text-lg font-semibold truncate">{{ track?.name || 'Unknown track' }}</h3>
              <p class="text-gray-400 text-sm truncate">{{ track?.artists?.[0]?.name || 'Unknown artist' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Lecteur en bas de page -->
      <footer v-if="currentTrack" class="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex items-center">
        <img
          :src="currentTrack.albumCover || require('~/assets/default-album.png')"
          :alt="`Pochette de l'album ${currentTrack.albumName}`"
          class="w-16 h-16 object-cover mr-4"
        />
        <div class="flex-1">
          <p class="text-white font-semibold">{{ currentTrack.name }}</p>
          <p class="text-gray-400">{{ currentTrack.artist }}</p>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="pausePlayback" class="text-white hover:text-green-500">
            <i class="material-icons text-3xl">pause_circle_filled</i>
          </button>
        </div>
      </footer>
    </main>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import Sidebar from '~/components/Sidebar.vue';

export default {
  components: {
    Sidebar,
  },
  data() {
    return {
      player: null,
      deviceId: null,
      currentTrack: null,
      userName: null,
      recentlyPlayed: [],
      userPlaylists: [],
      recommendations: [],
      searchQuery: '',
      searchResults: {
        artists: { items: [] },
        tracks: { items: [] },
        playlists: { items: [] }
      },
      searchTimeout: null,
      showProfileMenu: false,
      userProfile: null,
    };
  },
  mounted() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      console.error('Token non disponible. Veuillez vous reconnecter.');
      this.$router.push('/login');
      return;
    }

    // Initialize Spotify Web Playback SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      this.initializePlayer(token);
    };

    // Fetch user data
    this.getUserInfo();
    this.getRecentlyPlayed();
    this.loadLibrary();
    this.getRecommendations();
    this.getUserProfile();
  },
  computed: {
    greetingMessage() {
      const hour = new Date().getHours();
      if (hour < 12) {
        return 'Bonjour';
      } else if (hour < 18) {
        return 'Bon après-midi';
      } else {
        return 'Bonsoir';
      }
    },
  },
  methods: {
    ...mapMutations(['setDeviceId']),
    initializePlayer(token) {
      this.player = new Spotify.Player({
        name: 'Spotify Clone Player',
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      // Error handling
      this.player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize:', message);
      });

      this.player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate:', message);
      });

      this.player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account:', message);
      });

      this.player.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback:', message);
      });

      // Playback status updates
      this.player.addListener('player_state_changed', (state) => {
        if (state) {
          const track = state.track_window.current_track;
          this.currentTrack = {
            name: track.name,
            artist: track.artists[0]?.name,
            albumCover: track.album.images[0]?.url,
            albumName: track.album.name,
          };
        }
      });

      // Ready
      this.player.addListener('ready', ({ device_id }) => {
        this.deviceId = device_id;
        this.setDeviceId(device_id);
        localStorage.setItem('spotify_device_id', device_id);
      });

      // Connect to the player
      this.player.connect().then((success) => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      });
    },
    async getUserInfo() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const userResponse = await this.$axios.$get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.userName = userResponse.display_name || userResponse.id;
      } catch (error) {
        console.error('Erreur lors de la récupération des informations de l\'utilisateur :', error.response?.data || error.message);
      }
    },
    async getRecentlyPlayed() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        const response = await this.$axios.$get('https://api.spotify.com/v1/me/player/recently-played', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 8,
          },
        });

        if (response && response.items) {
          const tracks = response.items.map(item => item.track).filter(track => track !== null);
          const uniqueTracks = tracks.filter((track, index, self) =>
            index === self.findIndex((t) => t.id === track.id)
          );

          this.recentlyPlayed = uniqueTracks;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des éléments récemment écoutés :', error.response?.data || error.message);
        this.recentlyPlayed = [];
      }
    },
    async loadLibrary() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        const playlistsResponse = await this.$axios.$get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 50,
          },
        });

        if (playlistsResponse && playlistsResponse.items) {
          this.userPlaylists = playlistsResponse.items.filter(playlist => playlist !== null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la bibliothèque :', error.response?.data || error.message);
        this.userPlaylists = [];
      }
    },
    async getRecommendations() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        // Get user's top artists if no followed artists
        const topArtistsResponse = await this.$axios.$get('https://api.spotify.com/v1/me/top/artists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 5,
            time_range: 'medium_term',
          },
        });

        if (!topArtistsResponse || !topArtistsResponse.items || topArtistsResponse.items.length === 0) {
          console.error('No top artists found');
          return;
        }

        const artistIds = topArtistsResponse.items.map(artist => artist.id).filter(id => id !== null);

        if (artistIds.length === 0) {
          console.error('No valid artist IDs found');
          return;
        }

        // Get recommendations based on top artists
        const recommendationsResponse = await this.$axios.$get('https://api.spotify.com/v1/recommendations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            seed_artists: artistIds.join(','),
            limit: 10,
          },
        });

        if (recommendationsResponse && recommendationsResponse.tracks) {
          this.recommendations = recommendationsResponse.tracks.filter(track => track !== null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des recommandations :', error.response?.data || error.message);
        this.recommendations = [];
      }
    },
    async playTrack(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const deviceId = this.deviceId || localStorage.getItem('spotify_device_id');

        if (!deviceId) {
          console.error('Device ID non disponible. Le lecteur n\'est pas prêt.');
          return;
        }

        // First, ensure the device is active
        await this.$axios.$put(
          'https://api.spotify.com/v1/me/player',
          {
            device_ids: [deviceId],
            play: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Then play the track
        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            uris: [uri],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (error) {
        console.error('Erreur lors du démarrage de la lecture :', error.response?.data || error.message);
      }
    },
    async pausePlayback() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const deviceId = this.deviceId || localStorage.getItem('spotify_device_id');

        if (!deviceId) {
          console.error('Device ID non disponible. Le lecteur n\'est pas prêt.');
          return;
        }

        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error('Erreur lors de la mise en pause :', error.response?.data || error.message);
      }
    },
    async handleSearch() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      if (!this.searchQuery.trim()) {
        this.searchResults = {
          artists: { items: [] },
          tracks: { items: [] },
          playlists: { items: [] }
        };
        return;
      }

      this.searchTimeout = setTimeout(async () => {
        try {
          const token = localStorage.getItem('spotify_access_token');
          const response = await this.$axios.$get('https://api.spotify.com/v1/search', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              q: this.searchQuery,
              type: 'artist,track,playlist',
              limit: 5,
            },
          });

          this.searchResults = response;
        } catch (error) {
          console.error('Erreur lors de la recherche :', error.response?.data || error.message);
        }
      }, 300);
    },
    async playPlaylist(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const deviceId = this.deviceId || localStorage.getItem('spotify_device_id');

        if (!deviceId) {
          console.error('Device ID non disponible. Le lecteur n\'est pas prêt.');
          return;
        }

        // First, ensure the device is active
        await this.$axios.$put(
          'https://api.spotify.com/v1/me/player',
          {
            device_ids: [deviceId],
            play: false,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Then play the playlist
        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            context_uri: uri,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } catch (error) {
        console.error('Erreur lors de la lecture de la playlist :', error.response?.data || error.message);
      }
    },
    async getUserProfile() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('Token non disponible. Veuillez vous reconnecter.');
          return;
        }

        const response = await this.$axios.$get('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.userProfile = response;
      } catch (error) {
        console.error('Error loading user profile:', error.response?.data || error.message);
      }
    },
    async logout() {
      try {
        // Clear local storage
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_token_expires_at');

        // Redirect to login page
        this.$router.push('/login');
      } catch (error) {
        console.error('Error during logout:', error);
      }
    },
  },
};
</script>

<style scoped>
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style>
