<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const campsites = ref([]);
const owner = ref(JSON.parse(localStorage.getItem('user')));
const router = useRouter();

onMounted(async () => {
  try {
    // Fetch campsites by owner ID
    const resCampsites = await axios.get(`http://localhost:3000/campsites?ownerId=${owner.value.id}`);
    campsites.value = resCampsites.data;
  } catch (err) {
    console.error("Error loading dashboard", err);
  }
});

const goToAddListing = () => {
  router.push('/owner/add-listing');
};

const goToCampsiteDetails = (id) => {
    console.log('Navigating to campsite with ID:', id);
  router.push(`/owner/campsite/${id}`);
};
</script>

<template>
  <div class="dashboard">
    <h1>Owner Dashboard</h1>

    <section>
      <h2>Your Campsites</h2>
      <div v-if="campsites.length === 0">No campsites found.</div>
      <div v-else class="cards">
        <div
          v-for="site in campsites"
          :key="site.id"
          class="card"
          @click="goToCampsiteDetails(site.id)"
        >
        <img
  :src="site.image?.[0]?.url ? `http://localhost:3000/${site.image[0].url}` : 'https://via.placeholder.com/400x200?text=No+Image+Available'"
  alt="Campsite Image"
/>
          <div class="card-content">
            <h3>{{ site.name }}</h3>
            <p>{{ site.location?.city || 'Unknown Location' }}</p>
            <p><strong>${{ site.price }}</strong>/night</p>
          </div>
        </div>
      </div>
      <button @click="goToAddListing">Add New Listing</button>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
  cursor: pointer;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
}

button {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background-color: #1b5e20;
}
</style>