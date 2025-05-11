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
                class="p-2 rounded-full hover:bg-gray-600 transition-colors duration-200"
                :class="{ 'text-red-500': likedTracks.has(item.id), 'text-gray-400': !likedTracks.has(item.id) }"
              >
                <i class="material-icons">{{ likedTracks.has(item.id) ? 'favorite' : 'favorite_border' }}</i>
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
                        <p class="text-xs text-gray-400">{{ likedTracks.size }} titres</p>
                      </div>
                      <i class="material-icons text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {{ likedTracks.has(item.id) ? 'remove' : 'add' }}
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
            <span class="material-icons text-3xl">pause_circle_filled</span>
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
      query: '',
      results: null,
      loading: false,
      likedTracks: new Set(),
      showAddToPlaylistMenu: null,
      showCreatePlaylistModal: false,
      userPlaylists: [],
    };
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

    await this.loadLikedTracks();
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
      this.loading = true;

      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('Token non disponible. Veuillez vous reconnecter.');
          return;
        }

        const response = await this.$axios.$get(
          'https://api.spotify.com/v1/search',
          {
            params: { q: this.query, type: 'track' },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.results = response.tracks?.items || [];
      } catch (error) {
        console.error('Erreur lors de la recherche :', error.response?.data || error.message);
      } finally {
        this.loading = false;
      }
    },

    async playTrack(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!this.deviceId) {
          console.error('Device ID non disponible. Le lecteur n’est pas prêt.');
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

    async toggleLike(trackId) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        const isLiked = this.likedTracks.has(trackId);
        console.log(`Toggling like for track ${trackId}, currently liked:`, isLiked);

        if (isLiked) {
          // Remove from liked tracks
          await this.$axios.$delete(
            'https://api.spotify.com/v1/me/tracks',
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              data: {
                ids: [trackId],
              },
            }
          );
          this.likedTracks.delete(trackId);
        } else {
          // Add to liked tracks
          await this.$axios.$put(
            'https://api.spotify.com/v1/me/tracks',
            {
              ids: [trackId],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          this.likedTracks.add(trackId);
        }

        // Update the track's liked status in search results
        if (this.results) {
          const trackIndex = this.results.findIndex(t => t.id === trackId);
          if (trackIndex !== -1) {
            this.results[trackIndex].isLiked = !isLiked;
          }
        }

        // Force a re-render
        this.$forceUpdate();

        // Show success message
        if (this.$toast) {
          this.$toast.success(isLiked ? 'Morceau retiré des titres likés' : 'Morceau ajouté aux titres likés');
        }

        // Reload liked tracks to ensure everything is in sync
        await this.loadLikedTracks();
      } catch (error) {
        console.error('Error toggling like:', error.response?.data || error.message);
        if (this.$toast) {
          this.$toast.error('Erreur lors de la modification des titres likés');
        }
      }
    },

    async loadLikedTracks() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        const response = await this.$axios.$get('https://api.spotify.com/v1/me/tracks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 50,
          },
        });

        if (response && response.items) {
          const trackIds = response.items.map(item => item.track.id);
          this.likedTracks = new Set(trackIds);
          
          // Update liked status in search results
          if (this.results) {
            this.results.forEach(track => {
              track.isLiked = this.likedTracks.has(track.id);
            });
          }
        }
      } catch (error) {
        console.error('Error loading liked tracks:', error.response?.data || error.message);
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

