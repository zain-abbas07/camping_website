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
  <div class="px-4 py-8">
    <h1 class="text-3xl font-bold text-center mb-6">🏕️ Available Campsites</h1>

    <!-- Filters Toggle Button -->
    <button
      class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
      @click="showFilters = !showFilters"
    >
      {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
    </button>

    <!-- Filters Section -->
    <div v-if="showFilters" class="bg-gray-100 p-4 rounded shadow-md mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label for="minPrice" class="block font-medium mb-1">Min Price</label>
          <input
            v-model="minPrice"
            type="number"
            id="minPrice"
            placeholder="Min Price"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label for="maxPrice" class="block font-medium mb-1">Max Price</label>
          <input
            v-model="maxPrice"
            type="number"
            id="maxPrice"
            placeholder="Max Price"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label for="location" class="block font-medium mb-1">Location</label>
          <input
            v-model="location"
            type="text"
            id="location"
            placeholder="City or Location"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>
      <div class="mt-4">
        <label class="block font-medium mb-2">Amenities</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label
            v-for="amenity in availableAmenities"
            :key="amenity"
            class="flex items-center space-x-2"
          >
            <input
              type="checkbox"
              :value="amenity"
              v-model="selectedAmenities"
              class="rounded border-gray-300"
            />
            <span>{{ amenity }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- User Info -->
    <div class="text-center mb-6">
      <template v-if="!userLoading">
        <template v-if="user">
          <p class="text-lg">Welcome, {{ user.name }} 👋</p>
        </template>
        <template v-else>
          <p class="text-lg">You are not logged in.</p>
          <router-link to="/login" class="text-blue-500 hover:underline">Login</router-link> |
          <router-link to="/signup" class="text-blue-500 hover:underline">Sign Up</router-link>
        </template>
      </template>
    </div>

    <!-- Campsites -->
    <div v-if="loading" class="text-center">Loading campsites...</div>
    <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="site in campsites"
        :key="site.id"
        class="bg-white shadow-md rounded overflow-hidden cursor-pointer hover:shadow-lg"
        @click="viewDetails(site.id)"
      >
        <img
          :src="site.image?.[0]?.url
            ? `http://localhost:3000/${site.image[0].url}`
            : 'https://via.placeholder.com/400x200?text=No+Image+Available'"
          alt="Campsite Image"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h3 class="text-lg font-bold">{{ site.name }}</h3>
          <p class="text-gray-600">{{ site.location }}</p>
          <p class="text-green-600 font-bold">${{ site.price }}/night</p>
        </div>
      </div>
    </div>
  </div>
</template>