<template>
    <form @submit.prevent="updatePassword" class="space-y-4">
      <div>
        <label>New Password</label>
        <input type="password" v-model="password" class="border p-2 w-full" />
      </div>
      <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Change Password</button>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  const password = ref('');
  
  const updatePassword = async () => {
    await fetch('/api/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    });
    password.value = '';
  };
  </script>
  