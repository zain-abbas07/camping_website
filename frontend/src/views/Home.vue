<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const campsites = ref([])
const user = ref(null)
const userLoading = ref(true) // Track user loading state
const loading = ref(true)
const error = ref(null)
const showFilters = ref(false)

// Filter state
const minPrice = ref('')
const maxPrice = ref('')
const location = ref('')
const selectedAmenities = ref([])
const availableAmenities = [
  'Fire Pit',
  'Water Access',
  'Electricity',
  'Showers',
  'WiFi',
  'Parking',
  'Swimming Pool',
  'BBQ',
  'Pet Friendly',
]

const router = useRouter()

const fetchCampsites = async () => {
  loading.value = true
  try {
    const params = {
      ...(minPrice.value && { minPrice: minPrice.value }),
      ...(maxPrice.value && { maxPrice: maxPrice.value }),
      ...(location.value && { location: location.value }),
      ...(selectedAmenities.value.length && {
        amenities: selectedAmenities.value.join(','),
      }),
    }

    const res = await axios.get('http://localhost:3000/campsites', { params })
    campsites.value = res.data
  } catch (err) {
    error.value = 'Failed to load campsites'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Load campsites
  await fetchCampsites()

  // Load user data
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
  }
  userLoading.value = false // Mark user loading as complete
})

watch([minPrice, maxPrice, location, selectedAmenities], fetchCampsites)

const viewDetails = (id) => {
  router.push(`/campsite/${id}`)
}
</script>

<template>
  <div class="container">
    <h1>🏕️ Available Campsites</h1>

    <!-- Filters Toggle Button -->
    <button class="toggle-filters" @click="showFilters = !showFilters">
      {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
    </button>

    <!-- Filters Section -->
    <div v-if="showFilters" class="filters">
      <div class="filter-item">
        <label for="minPrice">Min Price</label>
        <input v-model="minPrice" type="number" id="minPrice" placeholder="Min Price" />
      </div>
      <div class="filter-item">
        <label for="maxPrice">Max Price</label>
        <input v-model="maxPrice" type="number" id="maxPrice" placeholder="Max Price" />
      </div>
      <div class="filter-item">
        <label for="location">Location</label>
        <input v-model="location" type="text" id="location" placeholder="City or Location" />
      </div>
      <div class="filter-item">
        <label>Amenities</label>
        <div class="amenities-grid">
          <label v-for="amenity in availableAmenities" :key="amenity" class="amenity-item">
            <input type="checkbox" :value="amenity" v-model="selectedAmenities" />
            {{ amenity }}
          </label>
        </div>
      </div>
    </div>

    <div class="auth">
      <template v-if="!userLoading">
        <template v-if="user">
          <p>Welcome, {{ user.name }} 👋</p>
        </template>
        <template v-else>
          <p>You are not logged in.</p>
          <router-link to="/login">Login</router-link> |
          <router-link to="/signup">Sign Up</router-link>
        </template>
      </template>
    </div>

    <div v-if="loading">Loading campsites...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="cards">
      <div v-for="site in campsites" :key="site.id" class="card" @click="viewDetails(site.id)">
        <img
          :src="site.image?.[0]?.url
            ? `http://localhost:3000/${site.image[0].url}`
            : 'https://via.placeholder.com/400x200?text=No+Image+Available'"
          alt="Campsite Image"
        />
        <div class="card-content">
          <h3>{{ site.name }}</h3>
          <p>{{ site.location }}</p>
          <p><strong>${{ site.price }}</strong>/night</p>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>


.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}
.filter-item {
  flex: 1 1 calc(33.333% - 1rem); /* Adjust width for three items per row */
  min-width: 200px;
}
.filters h3 {
  margin-bottom: 1rem;
}

.filters div {
  margin-bottom: 1rem;
}

.toggle-filters {
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.toggle-filters:hover {
  background-color: #1b5e20;
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}
.container {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
  text-align: center;
  margin-top: 5rem; /* Add margin to account for the fixed navbar */
}

.auth {
  margin-bottom: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
  justify-content: center;
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

.amenity-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>