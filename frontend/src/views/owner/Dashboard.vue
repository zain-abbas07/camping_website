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
  <div class="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-green-300 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-green-700 mb-8 text-center">Owner Dashboard</h1>
      <section>
        <h2 class="text-xl font-semibold text-green-800 mb-4">Your Campsites</h2>
        <div v-if="campsites.length === 0" class="text-center text-gray-500">No campsites found.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="site in campsites"
            :key="site.id"
            @click="goToCampsiteDetails(site.id)"
            class="group bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div class="relative overflow-hidden">
              <img
                :src="site.image?.[0]?.url ? `http://localhost:3000/${site.image[0].url}` : 'https://via.placeholder.com/400x200?text=No+Image+Available'"
                alt="Campsite Image"
                class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <span class="text-green-600 font-bold">${{ site.price }}/night</span>
              </div>
            </div>
            <div class="p-6 space-y-2">
              <h3 class="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                {{ site.name }}
              </h3>
              <div class="flex items-center text-gray-600 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{{ site.location || 'Unknown Location' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-center mt-8">
          <button @click="goToAddListing" class="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300">
            Add New Listing
          </button>
        </div>
      </section>
    </div>
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