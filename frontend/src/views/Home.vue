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
  <div class="min-h-screen bg-gray-100">
    
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-green-800 to-green-600 text-white py-16">
      <div class="container mx-auto px-6">
        <h1 class="text-4xl md:text-5xl font-bold text-center mb-6">
          Discover Your Perfect Camping Spot
        </h1>
        <p class="text-xl text-center text-green-100 mb-8">
          Find and book unique camping experiences across the country
        </p>
      </div>
    </div>

    <!-- Main Content with consistent background -->
    <div class="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-green-300 py-10">
      <div class="container mx-auto px-6">
        <!-- Search Bar -->
        <form @submit.prevent="fetchCampsites" class="flex flex-col md:flex-row gap-4 items-center justify-center bg-white/80 p-4 rounded-xl shadow mb-6">
          <input
            v-model="location"
            type="text"
            placeholder="Search by location"
            class="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
          />
          <input
            v-model="minPrice"
            type="number"
            min="0"
            placeholder="Min price"
            class="w-full md:w-1/6 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
          />
          <input
            v-model="maxPrice"
            type="number"
            min="0"
            placeholder="Max price"
            class="w-full md:w-1/6 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300"
          >
            Search
          </button>
          <button
            type="button"
            @click="showFilters = !showFilters"
            class="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-300"
          >
            {{ showFilters ? 'Hide Filters' : 'More Filters' }}
          </button>
        </form>

        <div class="h-4"></div>

<!-- Filters Section -->
          <div 
            v-if="showFilters"
            class="bg-white rounded-xl shadow-lg p-6 mb-12 transition-all duration-300"
          >
          <!-- ...filters content... -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <!-- Add your advanced filters here -->
          </div>
          <div>
            <label class="block text-gray-700 text-xl font-medium mb-2">Amenities</label>
            
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <label
                v-for="amenity in availableAmenities"
                :key="amenity"
                class="flex items-center space-x-2 text-gray-700"
              >
                <input
                  type="checkbox"
                  :value="amenity"
                  v-model="selectedAmenities"
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>{{ amenity }}</span>
              </label>
            </div>
          </div>
        </div>
        <div class="h-4"></div>
        <!-- Optional: Add a button to clear filters -->
        <button
          v-if="showFilters"
          @click="() => { minPrice = ''; maxPrice = ''; location = ''; selectedAmenities = [] }"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 mb-6"
        >
          Clear Filters
        </button>
        <div class="h-4"></div>
      

      <!-- Campsites Grid -->
      <div v-if="loading" class="text-center py-12">
          <p class="text-lg text-gray-600">Loading amazing camping spots...</p>
        </div>
        <div v-else-if="error" class="text-center text-red-500 py-12">
          {{ error }}
        </div>
        <div 
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6"
        >
          <!-- Campsite Cards -->
          <div
            v-for="site in campsites"
            :key="site.id"
            @click="viewDetails(site.id)"
            class="group bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
    <div class="relative overflow-hidden">
        <img
          :src="site.image?.[0]?.url
            ? `http://localhost:3000/${site.image[0].url}`
            : 'https://via.placeholder.com/400x200?text=No+Image+Available'"
          alt="Campsite Image"
          class="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
              />
        <!-- Optional Price Badge -->
        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span class="text-green-600 font-bold">${{ site.price }}/night</span>
        </div>
      </div>

          <div class="p-6 space-y-3">
        <h3 class="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
          {{ site.name }}
        </h3>
        <div class="flex items-center text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>{{ site.location }}</p>
        </div>
        <!-- Optional Amenities Preview -->
        <div class="pt-4 border-t border-gray-100">
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="amenity in site.amenity?.slice(0, 3)" 
              :key="amenity.name"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              {{ amenity.name }}
            </span>
            <span 
              v-if="site.amenity?.length > 3" 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              +{{ site.amenity.length - 3 }} more
            </span>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  </div>
      </div>
    
  
</template>

<style scoped>
.container {
  max-width: none !important;
  width: 100% !important;
}

/* Ensure proper spacing on larger screens */
@media (min-width: 1280px) {
  .container {
    padding-left: 3rem !important;  /* Increased padding */
    padding-right: 3rem !important; /* Increased padding */
    padding-bottom: 4rem !important; /* Added bottom padding */
  }
}
</style>