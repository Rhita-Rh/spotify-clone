<template>
  <div class="flex h-screen bg-gray-900 text-white">
    <!-- Barre latérale -->
    <Sidebar />

    <!-- Contenu principal -->
    <main class="flex-1 overflow-y-auto">
      <!-- Header -->
      <header class="p-4 bg-gray-900">
        <h1 class="text-2xl font-bold">Votre Bibliothèque</h1>
      </header>

      <!-- Liked Songs Section -->
      
      <!-- Playlists Section -->
      <section class="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div
            v-for="playlist in userPlaylists"
            :key="playlist.id"
            @click="selectPlaylist(playlist)"
            class="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer"
          >
            <img
              :src="playlist.images?.[0]?.url || require('~/assets/default-album.png')"
              :alt="playlist.name"
              class="w-full h-48 object-cover mb-4 rounded"
            />
            <h3 class="text-lg font-semibold mb-1">{{ playlist.name }}</h3>
            <p class="text-gray-400">{{ playlist.tracks?.total || 0 }} titres</p>
          </div>
        </div>
      </section>

      <!-- Playlist Tracks Section -->
      <section v-if="selectedPlaylist" class="p-4">
        <div class="flex items-center mb-6">
          <button @click="selectedPlaylist = null" class="mr-4 text-gray-400 hover:text-white">
            <i class="material-icons">arrow_back</i>
          </button>
          <img
            :src="selectedPlaylist.images?.[0]?.url || require('~/assets/default-album.png')"
            :alt="selectedPlaylist.name"
            class="w-24 h-24 object-cover rounded mr-4"
          />
          <div>
            <h2 class="text-2xl font-bold">{{ selectedPlaylist.name }}</h2>
            <p class="text-gray-400">{{ selectedPlaylist.tracks?.total || 0 }} titres</p>
          </div>
        </div>

        <div class="space-y-2" style="margin-bottom: 500px;">
          <div
            v-for="(item, index) in playlistTracks"
            :key="item.track.id"
            class="flex items-center p-2 hover:bg-gray-800 rounded-lg group"
          >
            <span class="text-gray-400 w-8">{{ index + 1 }}</span>
            <img
              :src="item.track.album?.images?.[0]?.url || require('~/assets/default-album.png')"
              :alt="item.track.name"
              class="w-12 h-12 object-cover rounded mr-4"
            />
            <div class="flex-1">
              <h3 class="font-semibold">{{ item.track.name }}</h3>
              <p class="text-gray-400 text-sm">{{ item.track.artists?.map(a => a.name).join(', ') }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <button
                @click="toggleLike(item.track.id)"
                class="text-gray-400 hover:text-white transition-colors duration-200"
                :class="{ 'text-red-500': likedTracks.has(item.track.id) }"
              >
                <i class="material-icons">{{ likedTracks.has(item.track.id) ? 'favorite' : 'favorite_border' }}</i>
              </button>
              <button
                @click="playTrack(item.track.uri)"
                class="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <i class="material-icons">play_arrow</i>
              </button>
            </div>
          </div>
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
      userPlaylists: [],
      selectedPlaylist: null,
      playlistTracks: [],
      likedTracks: new Set(),
      isLikedSongsView: false,
    };
  },
  async mounted() {
    await this.loadUserPlaylists();
    await this.loadLikedTracks();
  },
  methods: {
    ...mapMutations(['setDeviceId']),
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
        }
      } catch (error) {
        console.error('Error loading liked tracks:', error.response?.data || error.message);
      }
    },

    async selectLikedSongs() {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        this.isLikedSongsView = true;
        this.selectedPlaylist = {
          name: 'Titres likés',
          images: [{ url: require('~/assets/default-album.png') }],
          tracks: { total: this.likedTracks.size }
        };

        const response = await this.$axios.$get('https://api.spotify.com/v1/me/tracks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 50,
          },
        });

        if (response && response.items) {
          this.playlistTracks = response.items;
        }
      } catch (error) {
        console.error('Error loading liked songs:', error.response?.data || error.message);
        if (this.$toast) {
          this.$toast.error('Erreur lors du chargement des titres likés');
        }
      }
    },

    async selectPlaylist(playlist) {
      this.isLikedSongsView = false;
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.error('No access token available');
          return;
        }

        this.selectedPlaylist = playlist;

        const response = await this.$axios.$get(
          `https://api.spotify.com/v1/playlists/${playlist.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response) {
          this.selectedPlaylist = response;
          const tracksResponse = await this.$axios.$get(
            `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                limit: 50,
              },
            }
          );

          if (tracksResponse && tracksResponse.items) {
            this.playlistTracks = tracksResponse.items;
          }
        }
      } catch (error) {
        console.error('Error loading playlist:', error.response?.data || error.message);
        if (this.$toast) {
          this.$toast.error('Erreur lors du chargement de la playlist');
        }
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

        if (isLiked) {
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

        if (this.$toast) {
          this.$toast.success(isLiked ? 'Morceau retiré des titres likés' : 'Morceau ajouté aux titres likés');
        }
      } catch (error) {
        console.error('Error toggling like:', error.response?.data || error.message);
        if (this.$toast) {
          this.$toast.error('Erreur lors de la modification des titres likés');
        }
      }
    },

    async playTrack(uri) {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!this.deviceId) {
          console.error('Device ID non disponible. Le lecteur n\'est pas prêt.');
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
      } catch (error) {
        console.error('Error playing track:', error.response?.data || error.message);
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

.material-icons {
  transition: transform 0.2s ease-in-out;
}

button:hover .material-icons {
  transform: scale(1.1);
}

/* Custom range input styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #64FFDA;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -5px;
}

input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #64FFDA;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 2px;
  background: rgba(100, 255, 218, 0.2);
  border-radius: 1px;
}

input[type="range"]::-moz-range-track {
  width: 100%;
  height: 2px;
  background: rgba(100, 255, 218, 0.2);
  border-radius: 1px;
}

/* Updated styles to match landing page */
.bg-gray-900 {
  background: linear-gradient(135deg, #0A192F 0%, #020c1b 100%);
}

.bg-gray-800 {
  background: rgba(10, 25, 47, 0.7);
  border: 1px solid rgba(100, 255, 218, 0.1);
  backdrop-filter: blur(10px);
}

.hover\:bg-gray-700:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: rgba(100, 255, 218, 0.3);
  box-shadow: 0 5px 15px rgba(100, 255, 218, 0.1);
}

.text-green-500 {
  color: #64FFDA;
}

.hover\:text-green-500:hover {
  color: #4CC9F0;
}

.bg-green-500 {
  background-color: #64FFDA;
  color: #0A192F;
}

.hover\:bg-green-600:hover {
  background-color: #4CC9F0;
}

/* Footer player styling */
footer {
  background: rgba(10, 25, 47, 0.95);
  border-top: 1px solid rgba(100, 255, 218, 0.1);
  backdrop-filter: blur(10px);
}

footer button {
  transition: all 0.3s ease;
}

footer button:hover {
  transform: translateY(-2px);
}

/* Progress bar styling */
.bg-gray-600 {
  background: rgba(100, 255, 218, 0.2);
}

.bg-white {
  background: #64FFDA;
}

/* Card hover effects */
.hover\:scale-105:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(100, 255, 218, 0.1);
}

/* Liked songs section */
.bg-gradient-to-r {
  background: linear-gradient(45deg, #64FFDA, #4CC9F0);
}

/* Playlist grid */
.grid {
  gap: 2rem;
}

/* Track list items */
.space-y-2 > div {
  transition: all 0.3s ease;
}

.space-y-2 > div:hover {
  background: rgba(100, 255, 218, 0.1);
  transform: translateX(5px);
}
</style>
