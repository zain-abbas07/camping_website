<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const showLogoutModal = ref(false);

const confirmLogout = () => {
  auth.logoutUser();
  showLogoutModal.value = false;
};
</script>

<template>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/bookings">My Bookings</router-link>
      <router-link v-if="auth.currentUser" to="/account">My Account</router-link>
  
      <span v-if="auth.currentUser">
        Welcome, {{ auth.currentUser.name }} |
        <button @click="showLogoutModal = true">Logout</button>
      </span>
      <span v-else>
        <router-link to="/login">Login</router-link> |
        <router-link to="/signup">Signup</router-link>
      </span>
    </nav>
  
    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="modal-overlay">
      <div class="modal">
        <p>Are you sure you want to log out?</p>
        <button @click="confirmLogout">Yes, Logout</button>
        <button @click="showLogoutModal = false">Cancel</button>
      </div>
    </div>
  </template>

<style scoped>
nav {
  background: #eee;
  padding: 1rem;
}
a {
  margin: 0 1rem;
  text-decoration: none;
}
button {
  margin-left: 0.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}
.modal button {
  margin: 0 1rem;
}
</style>