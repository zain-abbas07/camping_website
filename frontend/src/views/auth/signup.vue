<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const name = ref('');
const username = ref('');
const email = ref('');
const password = ref('');
const phoneNumber = ref('');
const role = ref('USER'); // Default role

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
    // localStorage.setItem('user', JSON.stringify(res.data));
    router.push('/login');
  } catch (err) {
    alert('Signup failed: ' + err.response.data.error);
  }
};
</script>

<template>
  <h2>Signup</h2>
  <form @submit.prevent="handleSignup">
    <input v-model="name" type="text" placeholder="Full Name" required />
    <input v-model="username" type="text" placeholder="Username" required />
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <input v-model="phoneNumber" type="text" placeholder="Phone Number (optional)" />

    <label>
      Role:
      <select v-model="role">
        <option value="USER">User</option>
        <option value="OWNER">Owner</option>
      </select>
    </label>

    <button type="submit">Sign Up</button>
  </form>
</template>


<style scoped>
.signup-container {
  max-width: 400px;
  margin: auto;
}
form input {
  display: block;
  margin-bottom: 10px;
  padding: 8px;
  width: 100%;
}
button {
  padding: 8px 12px;
}
</style>