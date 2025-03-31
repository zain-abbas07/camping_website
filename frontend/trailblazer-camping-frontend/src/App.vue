<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const campsites = ref([]);

onMounted(async () => {
  const response = await axios.get("http://localhost:3000/campsites");
  campsites.value = response.data;
});
</script>

<template>
  <h1>Epic Camping Spots</h1>
  <ul>
    <li v-for="site in campsites" :key="site.id">
      <h3>{{ site.name }}</h3>
      <p>{{ site.description }}</p>
      <p>Location: {{ site.location }}</p>
      <p>Price: ${{ site.price }}/night</p>
    </li>
  </ul>
</template>

<style>
body {
  font-family: Arial, sans-serif;
  text-align: center;
}
</style>
