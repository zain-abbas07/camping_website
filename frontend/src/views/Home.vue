<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const campsites = ref([]);
const router = useRouter();

onMounted(async () => {
  const res = await axios.get("http://localhost:3000/campsites");
  campsites.value = res.data;
});
</script>

<template>
  <h1>Available Campsites</h1>
  <div v-for="site in campsites" :key="site.id" @click="router.push(`/campsite/${site.id}`)">
    <h3>{{ site.name }}</h3>
    <p>{{ site.location }}</p>
    <p>${{ site.price }}/night</p>
  </div>
</template>
