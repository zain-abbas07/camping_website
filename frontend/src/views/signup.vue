<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const router = useRouter();

const handleSignup = async () => {
  try {
    const res = await axios.post('http://localhost:3000/signup', {
      name: name.value,
      email: email.value,
      password: password.value
    });
    alert('Signup successful!');
    localStorage.setItem('user', JSON.stringify(res.data));
    router.push('/');
  } catch (err) {
    alert('Signup failed: ' + err.response.data.error);
  }
};
</script>

<template>
  <h2>Signup</h2>
  <form @submit.prevent="handleSignup">
    <input v-model="name" placeholder="Name" required />
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit">Sign Up</button>
  </form>
</template>
