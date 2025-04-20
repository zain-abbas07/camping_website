<template>
  <div class="account">
    <h1>My Account</h1>

    <form @submit.prevent="updateProfile">
      <div>
        <label>Name:</label>
        <input v-model="form.name" required />
      </div>

      <div>
        <label>Email:</label>
        <input v-model="form.email" type="email" required />
      </div>

      <button type="submit">Update Profile</button>
    </form>

    <hr />

    <form @submit.prevent="changePassword">
      <h2>Change Password</h2>
      <div>
        <label>Current Password:</label>
        <input v-model="passwords.current" type="password" required />
      </div>

      <div>
        <label>New Password:</label>
        <input v-model="passwords.new" type="password" required />
      </div>

      <button type="submit">Change Password</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = JSON.parse(localStorage.getItem('user'));
const userId = user?.id || 1;

const form = ref({ name: '', email: '' });
const passwords = ref({ current: '', new: '' });

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:3000/users/${userId}`);
    form.value = {
      name: res.data.name,
      email: res.data.email
    };
  } catch (err) {
    console.error("Failed to fetch user info", err);
  }
});

const updateProfile = async () => {
  try {
    await axios.put(`http://localhost:3000/users/${userId}`, form.value);
    alert("Profile updated!");
  } catch (err) {
    alert("Failed to update profile.");
    console.error(err);
  }
};

const changePassword = async () => {
  try {
    await axios.put(`http://localhost:3000/users/${userId}/password`, passwords.value);
    alert("Password changed successfully!");
  } catch (err) {
    alert("Failed to change password.");
    console.error(err);
  }
};
</script>

<style scoped>
.account {
  max-width: 500px;
  margin: auto;
  padding: 2rem;
}
form {
  margin-bottom: 2rem;
}
input {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.5rem;
}
</style>