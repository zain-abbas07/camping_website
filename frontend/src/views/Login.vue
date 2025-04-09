<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const res = await axios.post('http://localhost:3000/login', {
      email: email.value,
      password: password.value
    });
    localStorage.setItem('user', JSON.stringify(res.data));
    alert('Login successful!');
    router.push('/');
  } catch (err) {
    alert('Login failed: ' + err.response.data.error);
  }
};
</script>

<template>
  <h2>Login</h2>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
</template>
