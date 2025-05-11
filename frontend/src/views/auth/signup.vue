<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const name = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const phoneNumber = ref('');
const role = ref('USER');
const router = useRouter();

const handleSignup = async () => {
  try {
    const res = await axios.post('http://localhost:3000/signup', {
      name: name.value,
      username: username.value,
      email: email.value,
      password: password.value,
      phoneNumber: phoneNumber.value || null,
      role: role.value
    });

    alert('Signup successful! Please login.');
    router.push('/login');
  } catch (err) {
    alert('Signup failed: ' + err.response.data.error);
  }
};
</script>


<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-green-50 to-green-200 py-10">
    <div class="signup-card bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
      <h2 class="text-3xl font-bold text-green-700 mb-6 text-center">Create Your Account</h2>
      <form @submit.prevent="handleSignup" class="space-y-4">
        <input v-model="name" type="text" placeholder="Full Name" required class="input" />
        <input v-model="username" type="text" placeholder="Username" required class="input" />
        <input v-model="email" type="email" placeholder="Email" required class="input" />
        <input v-model="password" type="password" placeholder="Password" required class="input" />
        <input v-model="phoneNumber" type="text" placeholder="Phone Number (optional)" class="input" />

        <label class="block text-gray-700 font-medium mb-1">Role:</label>
        <select v-model="role" class="input">
          <option value="USER">User</option>
          <option value="OWNER">Owner</option>
        </select>

        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300">
          Sign Up
        </button>
      </form>
      <p class="mt-6 text-center text-gray-500 text-sm">
        Already have an account?
        <router-link to="/login" class="text-green-700 hover:underline font-medium">Login</router-link>
      </p>
    </div>
  </div>
</template>


<style scoped>
.signup-card {
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
button[type="submit"] {
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>