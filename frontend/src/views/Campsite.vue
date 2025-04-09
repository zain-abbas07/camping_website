<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const campsite = ref(null);

onMounted(async () => {
  try {
    const id = route.params.id;
    const res = await axios.get(`http://localhost:3000/campsites/${id}`);
    campsite.value = res.data;
  } catch (err) {
    console.error("Failed to fetch campsite details", err);
    alert("Couldn't find campsite.");
    router.push('/');
  }
});

// onMounted(async () => {
//   const res = await axios.get(`http://localhost:3000/campsites/${route.params.id}`);
//   campsite.value = res.data;
// });

function goToBooking() {
  const user = localStorage.getItem("user");
  if (!user) {
    alert("Please log in to book this spot.");
    return router.push('/login');
  }

  router.push(`/campsite/${route.params.id}/book`);
}
</script>

<template>
  <div v-if="campsite" class="campsite-details">
    <h1>{{ campsite.name }}</h1>
    <p>{{ campsite.description }}</p>
    <p>Location: {{ campsite.location }}</p>
    <p>Price: ${{ campsite.price }}/night</p>

    <!-- Placeholder for gallery -->
    <div class="gallery">
      <img src="https://source.unsplash.com/800x400/?camping" alt="Campsite image" />
    </div>

    <!-- Placeholder for booking button -->
    <button @click="goToBooking">Book This Spot</button>
  </div>
  <div v-else>
    <p>Loading campsite...</p>
  </div>
</template>

<style scoped>
.campsite-details {
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
}
.gallery img {
  width: 100%;
  border-radius: 12px;
  margin: 20px 0;
}
button {
  background-color: #2e7d32;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #1b5e20;
}
</style>