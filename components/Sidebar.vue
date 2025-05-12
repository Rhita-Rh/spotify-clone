<template>
    <aside class="w-64 bg-gray-800 p-4">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-center mb-2 melodify-logo">Melodify</h1>
        <p class="text-sm text-center text-gray-400">Live Your Melody</p>
      </div>
      <!-- Menu de navigation -->
      <nav>
        <ul>
          <li class="mb-4">
            <nuxt-link
              to="/"
              exact
              class="flex items-center text-white hover:text-green-500 transition-colors duration-200"
              active-class="text-green-500"
            >
              <span class="material-icons mr-4">home</span>
              Accueil
            </nuxt-link>
          </li>
          <li class="mb-4">
            <nuxt-link
              to="/dashboard"
              class="flex items-center text-white hover:text-green-500 transition-colors duration-200"
              active-class="text-green-500"
            >
              <span class="material-icons mr-4">search</span>
              Rechercher
            </nuxt-link>
          </li>
          <li class="mb-4">
            <nuxt-link
              to="/library"
              class="flex items-center text-white hover:text-green-500 transition-colors duration-200"
              active-class="text-green-500"
            >
              <span class="material-icons mr-4">library_music</span>
              Votre Bibliothèque
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </aside>
  </template>
  
  <script>
  export default {
    name: 'Sidebar',
  };
  </script>
  
  <style scoped>
  .bg-gray-800 {
    background: rgba(10, 25, 47, 0.7);
    border-right: 1px solid rgba(100, 255, 218, 0.1);
    backdrop-filter: blur(10px);
  }

  .melodify-logo {
    background: linear-gradient(45deg, #64FFDA, #4CC9F0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .text-green-500 {
    color: #64FFDA;
  }

  .hover\:text-green-500:hover {
    color: #4CC9F0;
  }

  .material-icons {
    transition: transform 0.2s ease-in-out;
  }

  a:hover .material-icons {
    transform: scale(1.1);
  }
  </style>
  