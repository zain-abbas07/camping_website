<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const campsites = ref([]);
const user = ref(null)
const router = useRouter();

onMounted(async () => {
  const res = await axios.get("http://localhost:3000/campsites");
  campsites.value = res.data;

  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
  }
});

const logout = () => {
  const confirmed = confirm("Are you sure you want to log out?");
  if (confirmed) {
    localStorage.removeItem('user');
    user.value = null;
  }
};

</script>

<template>
  <div>
    <h1>Available Campsites</h1>

    <div v-if="user">
      <p>Welcome, {{ user.name }} 👋</p>
      <button @click="logout">Logout</button>
    </div>
    <div v-else>
      <p>You are not logged in.</p>
      <router-link to="/login">Login</router-link> |
      <router-link to="/signup">Sign Up</router-link>
    </div>

    <div v-for="site in campsites" :key="site.id" @click="router.push(`/campsite/${site.id}`)">
      <h3>{{ site.name }}</h3>
      <p>{{ site.location }}</p>
      <p>${{ site.price }}/night</p>
    </div>
  </div>
</template>
