<template>
    <form @submit.prevent="updateProfile" class="space-y-4">
      <div>
        <label>Name</label>
        <input v-model="form.name" class="border p-2 w-full" />
      </div>
      <div>
        <label>Email</label>
        <input v-model="form.email" class="border p-2 w-full" />
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Update Profile</button>
    </form>
  </template>
  
  <script setup>
  import { reactive, watch } from 'vue';
  const props = defineProps(['user']);
  const emit = defineEmits(['updated']);
  
  const form = reactive({ name: '', email: '' });
  
  watch(() => props.user, (newVal) => {
    form.name = newVal.name;
    form.email = newVal.email;
  });
  
  const updateProfile = async () => {
    await fetch('/api/account/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    emit('updated');
  };
  </script>
  