<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(JSON.parse(localStorage.getItem('user')));

const logout = () => {
  localStorage.removeItem('user');
  user.value = null;
  router.push('/login');
};
</script>

<template>
  <nav>
    <a href="/" @click.prevent="router.push('/')">Home</a>
    <a href="/bookings" @click.prevent="router.push('/bookings')">My Bookings</a>
    <span v-if="user">Welcome, {{ user.name }} | <button @click="logout">Logout</button></span>
    <span v-else>
      <a href="/login" @click.prevent="router.push('/login')">Login</a> |
      <a href="/signup" @click.prevent="router.push('/signup')">Signup</a>
    </span>
  </nav>
</template>

<style>
nav {
  background: #eee;
  padding: 1rem;
}
a {
  margin: 0 1rem;
}
</style>
