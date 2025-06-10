<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const email = ref('');
const password = ref('');
const router = useRouter();
const auth = useAuthStore();
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    const res = await axios.post('http://localhost:3000/login', {
      email: email.value,
      password: password.value
    });
    const user = res.data?.user;
    auth.loginUser(user);
    // alert('Login successful!');
    if (user.role.toLowerCase() === 'owner') {
      router.push('/owner/dashboard')
    } else {
      router.push('/') // or '/' if you prefer
    }
  } catch (err) {
      if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Something went wrong. Please try again.");
      }
  }  finally {
    loading.value = false
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-50 to-green-200 py-10">
    <div class="login-card bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <h2 class="text-3xl font-bold text-green-700 mb-6 text-center">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <input v-model="email" type="email" placeholder="Email" required class="input" />
        <input v-model="password" type="password" placeholder="Password" required class="input" />
        <button type="submit" :disabled="loading" class="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p class="mt-6 text-center text-gray-500 text-sm">
        Don't have an account?
        <router-link to="/signup" class="text-green-700 hover:underline font-medium">Sign Up</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 2rem;
  border-radius: 12px;
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.login-card {
  box-shadow: 0 4px 32px 0 rgba(44, 101, 62, 0.10);
  border: 1.5px solid #b2dfdb;
}
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #b2dfdb;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
  margin-bottom: 0.5rem;
}
.input:focus {
  border-color: #43a047;
  background: #fff;
}

button {
  width: 100%;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  background-color: #2e7d32;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #1b5e20;
}
</style>