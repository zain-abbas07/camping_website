<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const user = computed(() => auth.currentUser);

const logout = () => {
  auth.logoutUser();
  router.push('/');
};
</script>

<template>
  <nav class="navbar">
    <router-link to="/">Home</router-link>

    <!-- Links for logged-in users -->
    <template v-if="user">
      <router-link v-if="user.role.toLowerCase() === 'owner'" to="/owner/dashboard">Dashboard</router-link>
      <router-link v-if="user.role.toLowerCase() === 'owner'" to="/owner/add-listing">Add Listing</router-link>
      <router-link to="/account">My Account</router-link>
      <router-link v-if="user.role.toLowerCase() === 'user'" to="/bookings">My Bookings</router-link>
      <button @click="logout">Logout</button>
    </template>

    <!-- Links for guests -->
    <template v-else>
      <router-link to="/login">Login</router-link>
      <router-link to="/signup">Sign Up</router-link>
    </template>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f8f8;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

a {
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
</style>