<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const user = computed(() => auth.currentUser);
const showLogoutModal = ref(false); // Tracks if the logout confirmation modal is visible

const confirmLogout = () => {
  auth.logoutUser();
  router.push('/');
  showLogoutModal.value = false;
};

const unreadMessages = ref(0) // Fetch this from your backend or store

function goToMessages() {
  router.push('/messages')
}
</script>

<template>
  <nav class="fixed top-0 left-0 w-full bg-white shadow-md z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left side - Logo/Brand -->
        <div class="flex items-center">
          <router-link 
            to="/" 
            class="text-xl font-heading font-bold text-green-700 hover:text-green-800"
          >
            🏕️ TrailBlazer
          </router-link>
        </div>

        <!-- Right side - Navigation Links -->
        <div class="flex items-center space-x-4">
          <!-- Welcome message -->
          <span v-if="user" class="text-gray-700 font-medium">
            Welcome, {{ user.name }} 👋
          </span>

          <!-- Links for logged-in users -->
          <template v-if="user">
            <!-- Owner-specific links -->
            <div v-if="user.role.toLowerCase() === 'owner'" class="flex items-center space-x-4">
              <router-link 
                to="/owner/dashboard"
                class="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
                :class="{ 'text-green-600 font-semibold': $route.path === '/owner/dashboard' }"
              >
                Dashboard
              </router-link>

              <router-link 
                to="/owner/add-listing"
                class="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
                :class="{ 'text-green-600 font-semibold': $route.path === '/owner/add-listing' }"
              >
                Add Listing
              </router-link>

              <router-link 
                to="/owner/bookings"
                class="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
                :class="{ 'text-green-600 font-semibold': $route.path === '/owner/bookings' }"
              >
                Bookings
              </router-link>
            </div>

            <!-- Common user links -->
            <router-link 
              to="/account"
              class="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
              :class="{ 'text-green-600 font-semibold': $route.path === '/account' }"
            >
              My Account
            </router-link>

            <!-- User-specific links -->
            <router-link 
              v-if="user.role.toLowerCase() === 'user'" 
              to="/bookings"
              class="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
              :class="{ 'text-green-600 font-semibold': $route.path === '/bookings' }"
            >
              My Bookings
            </router-link>

            <button
              @click="goToMessages"
              class="relative px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
              aria-label="Messages"
              >
              <!-- Bell or chat icon (Heroicons example) -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <!-- Notification badge (show only if unreadMessages > 0) -->
              <span v-if="unreadMessages > 0"
                class="absolute top-1 right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {{ unreadMessages }}
              </span>
            </button>

            <!-- Logout Button -->
            <button 
              @click="showLogoutModal = true"
              class="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
            >
              Logout
            </button>
          </template>

          <!-- Links for guests -->
          <template v-else>
            <router-link 
              to="/login"
              class="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors duration-200"
              :class="{ 'text-green-600 font-semibold': $route.path === '/login' }"
            >
              Login
            </router-link>

            <router-link 
              to="/signup"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
              :class="{ 'bg-green-700': $route.path === '/signup' }"
            >
              Sign Up
            </router-link>
          </template>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Confirm Logout</h3>
        <p class="text-gray-600 mb-6">Are you sure you want to log out?</p>
        <div class="flex justify-end space-x-4">
          <button 
            @click="showLogoutModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-300"
          >
            Cancel
          </button>
          <button 
            @click="confirmLogout"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>


<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #f8f8f8;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.navbar a {
  margin: 0 1rem;
  text-decoration: none;
  color: #333;
}

button {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  text-decoration: underline;
}

.navbar a.router-link-active {
  font-weight: bold;
  color: #2e7d32;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.modal-content button {
  margin: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.modal-content button:hover {
  background-color: #1b5e20;
}

.modal-content button:last-child {
  background-color: #d32f2f;
}

.modal-content button:last-child:hover {
  background-color: #b71c1c;
}
</style>