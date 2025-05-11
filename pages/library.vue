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
      <section class="p-4">
        <div
          @click="selectLikedSongs"
          class="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg mb-6 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div class="flex items-center">
            <div class="w-24 h-24 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
              <i class="material-icons text-4xl">favorite</i>
            </div>
            <div>
              <h2 class="text-2xl font-bold">Titres likés</h2>
              <p class="text-white text-opacity-80">{{ likedTracks.size }} titres</p>
            </div>
          </div>
        </div>
      </section>

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

        <div class="space-y-2">
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
  background: white;
  border-radius: 50%;
  cursor: pointer;
  margin-top: -5px;
}

input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
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
  background: #4a4a4a;
  border-radius: 1px;
}

input[type="range"]::-moz-range-track {
  width: 100%;
  height: 2px;
  background: #4a4a4a;
  border-radius: 1px;
}
</style>
