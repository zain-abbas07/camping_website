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
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const userId = 1 // replace with actual user ID from auth/session
  
  const form = ref({ name: '', email: '' })
  const passwords = ref({ current: '', new: '' })
  
  onMounted(async () => {
    const res = await axios.get(`http://localhost:3000/users/${userId}`)
    form.value = {
      name: res.data.name,
      email: res.data.email
    }
  })
  
  const updateProfile = async () => {
    try {
      await axios.put(`http://localhost:3000/users/${userId}`, form.value)
      alert("Profile updated!")
    } catch (err) {
      alert("Failed to update.")
      console.error(err)
    }
  }
  
  const changePassword = async () => {
    try {
      await axios.put(`http://localhost:3000/users/${userId}/password`, passwords.value)
      alert("Password updated!")
    } catch (err) {
      alert("Failed to change password.")
      console.error(err)
    }
  }
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
  