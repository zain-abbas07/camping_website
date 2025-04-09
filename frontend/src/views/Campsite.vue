<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const campsite = ref(null);

onMounted(async () => {
  const res = await axios.get(`http://localhost:3000/campsites/${route.params.id}`);
  campsite.value = res.data;
});
</script>

<template>
  <div v-if="campsite">
    <h1>{{ campsite.name }}</h1>
    <p>{{ campsite.description }}</p>
    <p>Location: {{ campsite.location }}</p>
    <p>Price: ${{ campsite.price }}/night</p>
  </div>
  <div v-else>
    <p>Loading campsite...</p>
  </div>
</template>
