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
</script>

<template>
  <nav class="navbar">
    <router-link to="/">Home</router-link>

    <!-- Links for logged-in users -->
    <template v-if="user">
      <router-link v-if="user.role.toLowerCase() === 'owner'" to="/owner/dashboard">Dashboard</router-link>
      <router-link v-if="user.role.toLowerCase() === 'owner'" to="/owner/add-listing">Add Listing</router-link>
      <router-link v-if="user.role.toLowerCase() === 'owner'" to="/owner/bookings">Bookings</router-link> <!-- Added this -->
      <router-link to="/account">My Account</router-link>
      <router-link v-if="user.role.toLowerCase() === 'user'" to="/bookings">My Bookings</router-link>
      <router-link to="/messages?receiverId=1">Messages</router-link> <!-- Example link -->
      <button @click="showLogoutModal = true">Logout</button>
    </template>

    <!-- Links for guests -->
    <template v-else>
      <router-link to="/login">Login</router-link>
      <router-link to="/signup">Sign Up</router-link>
    </template>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal">
      <div class="modal-content">
        <p>Are you sure you want to log out?</p>
        <button @click="confirmLogout">Yes, Logout</button>
        <button @click="showLogoutModal = false">Cancel</button>
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