<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Barre latérale -->
    <Sidebar />

    <!-- Contenu principal -->
    <main class="flex-1 overflow-y-auto">
      <!-- Header -->
      <header class="p-4 bg-gray-900">
        <!-- Barre de recherche -->
        <div class="flex items-center">
          <input
            v-model="query"
            @keyup.enter="search"
            placeholder="Rechercher des artistes, titres ou podcasts"
            class="w-full p-2 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </header>

      <!-- Résultats de recherche -->
      <section class="p-4">
        <h2 v-if="results" class="text-2xl font-bold mb-4">Résultats de recherche</h2>
        <div v-if="results" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="item in results"
            :key="item.id"
            class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700"
          >
            <img
              :src="item.album?.images?.[0]?.url || require('~/assets/default-album.png')"
              :alt="`Pochette de l'album ${item.album?.name || 'Unknown'}`"
              class="w-full h-48 object-cover mb-4 rounded"
            />
            <h3 class="text-lg font-semibold mb-1">{{ item.name }}</h3>
            <p class="text-gray-400 mb-2">{{ item.artists?.[0]?.name || 'Unknown Artist' }}</p>
            <div class="flex space-x-2">
              <button
                @click="playTrack(item.uri)"
                class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Lire
              </button>
              <button
                @click="toggleLike(item.id)"
                class="p-2 text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                <i class="material-icons">{{ isLiked(item.id) ? 'favorite' : 'favorite_border' }}</i>
              </button>
              <div class="relative">
                <button
                  @click="showAddToPlaylistMenu = item.id"
                  class="p-2 rounded-full hover:bg-gray-600 transition-colors duration-200 text-gray-400"
                >
                  <i class="material-icons">playlist_add</i>
                </button>
                <!-- Add to Playlist Menu -->
                <div
                  v-if="showAddToPlaylistMenu === item.id"
                  class="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700"
                >
                  <div class="p-2 border-b border-gray-700">
                    <h3 class="text-sm font-semibold text-white">Ajouter à une playlist</h3>
                  </div>
                  <div class="max-h-64 overflow-y-auto">
                    <div
                      @click="toggleLike(item.id); showAddToPlaylistMenu = null"
                      class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center space-x-3 group"
                    >
                      <div class="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                        <i class="material-icons text-red-500">favorite</i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate">Titres likés</p>
                        <p class="text-xs text-gray-400">{{ likedTracks.length }} titres</p>
                      </div>
                      <i class="material-icons text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {{ isLiked(item.id) ? 'remove' : 'add' }}
                      </i>
                    </div>
                    <div v-if="userPlaylists.length === 0" class="p-4 text-center text-gray-400 text-sm">
                      Aucune playlist disponible
                    </div>
                    <div
                      v-for="playlist in userPlaylists"
                      :key="playlist.id"
                      @click="addTrackToPlaylist(item.uri, playlist.id)"
                      class="px-4 py-3 hover:bg-gray-700 cursor-pointer flex items-center space-x-3 group"
                    >
                      <img
                        :src="playlist.images?.[0]?.url || require('~/assets/default-album.png')"
                        :alt="playlist.name || 'Unknown Playlist'"
                        class="w-10 h-10 object-cover rounded"
                      />
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate">{{ playlist.name }}</p>
                        <p class="text-xs text-gray-400">{{ playlist.tracks?.total || 0 }} titres</p>
                      </div>
                      <i class="material-icons text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">add</i>
                    </div>
                  </div>
                  <div class="p-2 border-t border-gray-700">
                    <button
                      @click="showCreatePlaylistModal = true; showAddToPlaylistMenu = null"
                      class="w-full px-4 py-2 text-sm text-white bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center space-x-2"
                    >
                      <i class="material-icons text-sm">add</i>
                      <span>Créer une nouvelle playlist</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Static Albums Section -->
        <div v-else-if="!loading && !query" class="space-y-6">
          <h2 class="text-2xl font-bold mb-4">Albums populaires</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              v-for="album in staticAlbums"
              :key="album.id"
              class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
            >
              <div :class="[album.album.color, 'w-full h-48 rounded mb-4 flex items-center justify-center']">
                <span class="text-white text-2xl font-bold">{{ album.name }}</span>
              </div>
              <h3 class="text-lg font-semibold mb-1">{{ album.name }}</h3>
              <p class="text-gray-400 mb-2">{{ album.artists[0].name }}</p>
              <div class="flex space-x-2">
                <button
                  @click="playTrack(album.uri)"
                  class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                >
                  Lire
                </button>
                <button
                  @click="toggleLike(album.id)"
                  class="p-2 text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  <i class="material-icons">{{ isLiked(album.id) ? 'favorite' : 'favorite_border' }}</i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="loading" class="text-center mt-8">
          <svg class="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <p class="mt-4">Recherche en cours...</p>
        </div>
      </section>
    </main>

    <!-- Static Footer Player -->
    <footer class="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 flex items-center">
      <div class="flex items-center w-1/4">
        <img
          src="https://i.scdn.co/image/ab67616d0000b273e2e352d5c4f0b0b0c0c0c0c0"
          alt="Album Cover"
          class="w-16 h-16 object-cover mr-4"
        />
        <div>
          <p class="text-white font-semibold">Thriller</p>
          <p class="text-gray-400">Michael Jackson</p>
        </div>
      </div>

      <div class="flex-1 flex flex-col items-center">
        <div class="flex items-center space-x-4 mb-2">
          <button class="text-gray-400 hover:text-white">
            <i class="material-icons">shuffle</i>
          </button>
          <button class="text-gray-400 hover:text-white">
            <i class="material-icons">skip_previous</i>
          </button>
          <button class="text-white hover:text-green-500">
            <i class="material-icons text-4xl">play_circle_filled</i>
          </button>
          <button class="text-gray-400 hover:text-white">
            <i class="material-icons">skip_next</i>
          </button>
          <button class="text-gray-400 hover:text-white">
            <i class="material-icons">repeat</i>
          </button>
        </div>
        <div class="w-full flex items-center space-x-2">
          <span class="text-xs text-gray-400">0:00</span>
          <div class="flex-1 h-1 bg-gray-600 rounded-full">
            <div class="h-full bg-white rounded-full w-1/3"></div>
          </div>
          <span class="text-xs text-gray-400">3:42</span>
        </div>
      </div>

      <div class="w-1/4 flex justify-end items-center space-x-4">
        <button class="text-gray-400 hover:text-white">
          <i class="material-icons">volume_up</i>
        </button>
        <div class="w-24 h-1 bg-gray-600 rounded-full">
          <div class="h-full bg-white rounded-full w-1/2"></div>
        </div>
      </div>
    </footer>
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
      query: '',
      results: null,
      loading: false,
      likedTracks: [],
      likedPlaylistId: null,
      showAddToPlaylistMenu: null,
      showCreatePlaylistModal: false,
      userPlaylists: [],
      searchTimeout: null,
      staticAlbums: [
        {
          id: 'static1',
          name: 'Thriller',
          artists: [{ name: 'Michael Jackson' }],
          album: {
            name: 'Thriller',
            color: 'bg-red-600'
          },
          uri: 'spotify:album:2ANVost0y2y52ema1E9xAZ'
        },
        {
          id: 'static2',
          name: 'Abbey Road',
          artists: [{ name: 'The Beatles' }],
          album: {
            name: 'Abbey Road',
            color: 'bg-yellow-500'
          },
          uri: 'spotify:album:0ETFjACtuP2ADo6LFhL6HN'
        },
        {
          id: 'static3',
          name: 'The Dark Side of the Moon',
          artists: [{ name: 'Pink Floyd' }],
          album: {
            name: 'The Dark Side of the Moon',
            color: 'bg-purple-700'
          },
          uri: 'spotify:album:4LH4d3cOWNNsVw41Gqt2kv'
        },
        {
          id: 'static4',
          name: 'Back to Black',
          artists: [{ name: 'Amy Winehouse' }],
          album: {
            name: 'Back to Black',
            color: 'bg-gray-900'
          },
          uri: 'spotify:album:097eYvf9NKyFJoKhIBoXnz'
        },
        {
          id: 'static5',
          name: 'Rumours',
          artists: [{ name: 'Fleetwood Mac' }],
          album: {
            name: 'Rumours',
            color: 'bg-blue-500'
          },
          uri: 'spotify:album:1bt6q2SruMsBtcerNVtpZB'
        },
        {
          id: 'static6',
          name: 'Purple Rain',
          artists: [{ name: 'Prince' }],
          album: {
            name: 'Purple Rain',
            color: 'bg-purple-500'
          },
          uri: 'spotify:album:7n8LkQALQc5dR1hHtFX5c5'
        },
        {
          id: 'static7',
          name: 'Nevermind',
          artists: [{ name: 'Nirvana' }],
          album: {
            name: 'Nevermind',
            color: 'bg-blue-600'
          },
          uri: 'spotify:album:2guirTSEqLizK7j9i1MTTZ'
        },
        {
          id: 'static8',
          name: 'The Joshua Tree',
          artists: [{ name: 'U2' }],
          album: {
            name: 'The Joshua Tree',
            color: 'bg-orange-600'
          },
          uri: 'spotify:album:5vBZRYu2GLA65nfxBvG1a7'
        },
        {
          id: 'static9',
          name: 'Born to Run',
          artists: [{ name: 'Bruce Springsteen' }],
          album: {
            name: 'Born to Run',
            color: 'bg-yellow-600'
          },
          uri: 'spotify:album:3lYrywFU7t8Uo4zPtfQ33h'
        },
        {
          id: 'static10',
          name: 'Kind of Blue',
          artists: [{ name: 'Miles Davis' }],
          album: {
            name: 'Kind of Blue',
            color: 'bg-blue-800'
          },
          uri: 'spotify:album:1weenld61qoidwYuZ1GESA'
        },
        {
          id: 'static11',
          name: 'The Wall',
          artists: [{ name: 'Pink Floyd' }],
          album: {
            name: 'The Wall',
            color: 'bg-gray-700'
          },
          uri: 'spotify:album:5Dbax7G8SWrP9xyzkOvy2F'
        },
        {
          id: 'static12',
          name: 'Like a Prayer',
          artists: [{ name: 'Madonna' }],
          album: {
            name: 'Like a Prayer',
            color: 'bg-pink-600'
          },
          uri: 'spotify:album:48AGkmM7iO4jrELRnNZGPV'
        }
      ]
    };
  },
  watch: {
    query(newQuery) {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // If query is empty, show static albums
      if (!newQuery.trim()) {
        this.results = null;
        return;
      }

      // Set loading state
      this.loading = true;

      // Set new timeout for search
      this.searchTimeout = setTimeout(() => {
        this.search();
      }, 300); // 300ms debounce
    }
  },
  async mounted() {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) {
      console.error('Token non disponible. Veuillez vous reconnecter.');
      return;
    }

    if (window.Spotify) {
      this.initializePlayer(token);
    } else {
      window.onSpotifyWebPlaybackSDKReady = () => {
        this.initializePlayer(token);
      };
    }

    await this.findLikedPlaylist();
    await this.getLikedTracks();
    await this.loadUserPlaylists();
  },
  methods: {
    ...mapMutations(['setDeviceId']),
    initializePlayer(token) {
      console.log('Initialisation du lecteur Spotify.');

      this.player = new Spotify.Player({
        name: 'Spotify Clone Player',
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      this.player.addListener('ready', ({ device_id }) => {
        console.log('Lecteur prêt avec Device ID :', device_id);
        this.deviceId = device_id;
        this.setDeviceId(device_id);
      });

      this.player.addListener('player_state_changed', (state) => {
        if (state) {
          const track = state.track_window.current_track;
          this.currentTrack = {
            name: track.name,
            artist: track.artists[0]?.name,
            albumCover: track.album.images[0]?.url,
            albumName: track.album.name,
          };
          console.log('Morceau en cours :', this.currentTrack);
        }
      });

      this.player.connect().then((success) => {
        if (success) {
          console.log('Lecteur Spotify connecté.');
        } else {
          console.error('Échec de la connexion au lecteur Spotify.');
        }
      });
    },

    async search() {
      if (!this.query.trim()) {
        this.results = null;
        this.loading = false;
        return;
      }

      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('Token non disponible. Veuillez vous reconnecter.');
          return;
        }

        const response = await this.$axios.$get(
          'https://api.spotify.com/v1/search',
          {
            params: { 
              q: this.query, 
              type: 'track',
              limit: 20 // Increased limit for better results
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.results = response.tracks?.items || [];
      } catch (error) {
        console.error('Erreur lors de la recherche :', error.response?.data || error.message);
        if (this.$toast) {
          this.$toast.error('Erreur lors de la recherche');
        }
      } finally {
        this.loading = false;
      }
    },

    async playTrack(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!this.deviceId) {
          console.error("Device ID non disponible. Le lecteur n'est pas prêt.");
          return;
        }

        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`,
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

        console.log(`Lecture démarrée pour ${uri}`);
      } catch (error) {
        console.error('Erreur lors du démarrage de la lecture :', error.response?.data || error.message);
      }
    },

    async pausePlayback() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!this.deviceId) {
          console.error('Device ID non disponible. Le lecteur n’est pas prêt.');
          return;
        }

        await this.$axios.$put(
          `https://api.spotify.com/v1/me/player/pause?device_id=${this.deviceId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log('Lecture mise en pause.');
      } catch (error) {
        console.error('Erreur lors de la mise en pause :', error.response?.data || error.message);
      }
    },

    async findLikedPlaylist() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        const response = await this.$axios.$get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 50,
          },
        });

        const likedPlaylist = response.items.find(playlist => playlist.name === 'Titres likés');
        if (likedPlaylist) {
          this.likedPlaylistId = likedPlaylist.id;
        } else {
          // Create the playlist if it doesn't exist
          const createResponse = await this.$axios.$post(
            'https://api.spotify.com/v1/me/playlists',
            {
              name: 'Titres likés',
              public: false,
              description: 'Vos titres préférés',
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          this.likedPlaylistId = createResponse.id;
        }
      } catch (error) {
        console.error('Error finding/creating liked playlist:', error);
      }
    },

    async getLikedTracks() {
      if (!this.likedPlaylistId) return;

      try {
        const token = localStorage.getItem('spotify_access_token');
        const response = await this.$axios.$get(`https://api.spotify.com/v1/playlists/${this.likedPlaylistId}/tracks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        this.likedTracks = response.items.map(item => item.track.id);
      } catch (error) {
        console.error('Error getting liked tracks:', error);
      }
    },

    isLiked(trackId) {
      return this.likedTracks.includes(trackId);
    },

    async toggleLike(trackId) {
      if (!this.likedPlaylistId) {
        await this.findLikedPlaylist();
      }

      try {
        const token = localStorage.getItem('spotify_access_token');
        const isCurrentlyLiked = this.isLiked(trackId);

        if (isCurrentlyLiked) {
          // Remove from liked tracks
          await this.$axios.$delete(
            `https://api.spotify.com/v1/playlists/${this.likedPlaylistId}/tracks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              data: {
                tracks: [{ uri: `spotify:track:${trackId}` }],
              },
            }
          );
          this.likedTracks = this.likedTracks.filter(id => id !== trackId);
        } else {
          // Add to liked tracks
          await this.$axios.$post(
            `https://api.spotify.com/v1/playlists/${this.likedPlaylistId}/tracks`,
            {
              uris: [`spotify:track:${trackId}`],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          this.likedTracks.push(trackId);
        }
      } catch (error) {
        console.error('Error toggling like:', error);
      }
    },

    async loadUserPlaylists() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        const response = await this.$axios.$get('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 50,
          },
        });

        if (response && response.items) {
          this.userPlaylists = response.items;
        }
      } catch (error) {
        console.error('Error loading playlists:', error.response?.data || error.message);
      }
    },

    async addTrackToPlaylist(trackUri, playlistId) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        await this.$axios.$post(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            uris: [trackUri],
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        this.showAddToPlaylistMenu = null;
        if (this.$toast) {
          this.$toast.success('Morceau ajouté à la playlist');
        }
      } catch (error) {
        console.error('Error adding track to playlist:', error.response?.data || error.message);
        if (this.$toast) {
          this.$toast.error('Erreur lors de l\'ajout du morceau à la playlist');
        }
      }
    },
  },
};
</script>

