<template>
  <div class="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-green-300 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-heading font-bold text-green-700 mb-8 text-center">My Bookings</h1>
      <div v-if="bookings.length === 0" class="text-center text-gray-500">No bookings yet.</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="booking in activeBookings"
          :key="booking.id"
          class="group bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-2 relative border border-green-100 transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
          @click="goToCampsite(booking.campsite.id)"
        >
          <div class="flex items-center gap-4 mb-2">
            <img
              v-if="booking.campsite.image && booking.campsite.image.length"
              :src="`http://localhost:3000/${booking.campsite.image[0].url}`"
              alt="Campsite"
              class="w-24 h-20 object-cover rounded-lg border"
            />
            <div>
              <h2 class="text-xl font-semibold text-green-800">{{ booking.campsite.name }}</h2>
              <p class="text-gray-500 text-sm">
                {{ booking.campsite.location?.city || 'Unknown City' }}, {{ booking.campsite.location?.country || 'Unknown Country' }}
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <p>
              <span class="font-medium text-gray-700">Check-in:</span>
              {{ formatDate(booking.checkIn) }}
            </p>
            <p>
              <span class="font-medium text-gray-700">Check-out:</span>
              {{ formatDate(booking.checkOut) }}
            </p>
            <p>
              <span class="font-medium text-gray-700">Total Price:</span>
              <span class="text-green-700 font-semibold">${{ booking.totalPrice }}</span>
            </p>
          </div>
          <div class="mt-2">
            <span class="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              Upcoming
            </span>
          </div>
        </div>
      </div>
      <div v-if="expiredBookings.length" class="mt-12">
        <h2 class="text-lg font-bold text-gray-500 mb-4">Expired Bookings</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            v-for="booking in expiredBookings"
            :key="booking.id"
            class="group bg-gray-100 rounded-2xl shadow p-6 flex flex-col gap-2 opacity-60 border border-gray-200 transition-transform duration-300 hover:shadow-lg hover:-translate-y-1"
            @click="goToCampsite(booking.campsite.id)"
          >
            <div class="flex items-center gap-4 mb-2">
              <img
                v-if="booking.campsite.image && booking.campsite.image.length"
                :src="`http://localhost:3000/${booking.campsite.image[0].url}`"
                alt="Campsite"
                class="w-24 h-20 object-cover rounded-lg border"
              />
              <div>
                <h2 class="text-xl font-semibold text-gray-700">{{ booking.campsite.name }}</h2>
                <p class="text-gray-400 text-sm">
                  {{ booking.campsite.location?.city || 'Unknown City' }}, {{ booking.campsite.location?.country || 'Unknown Country' }}
                </p>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <p>
                <span class="font-medium text-gray-500">Check-in:</span>
                {{ formatDate(booking.checkIn) }}
              </p>
              <p>
                <span class="font-medium text-gray-500">Check-out:</span>
                {{ formatDate(booking.checkOut) }}
              </p>
              <p>
                <span class="font-medium text-gray-500">Total Price:</span>
                <span class="text-gray-700 font-semibold">${{ booking.totalPrice }}</span>
              </p>
            </div>
            <div class="mt-2">
              <span class="inline-block bg-gray-300 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                Expired
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from "vue-router"

const router = useRouter()
const bookings = ref([])

onMounted(async () => {
  try {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      alert("You must be logged in to view your bookings.")
      return router.push("/login")
    }
    const user = JSON.parse(storedUser)
    const userId = user.id
    const res = await axios.get(`http://localhost:3000/bookings?userId=${userId}`)
    bookings.value = res.data
  } catch (error) {
    console.error("Failed to load bookings:", error)
    alert("There was a problem loading your bookings.")
  }
})

// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Computed properties for active and expired bookings
const activeBookings = computed(() =>
  bookings.value.filter(b => new Date(b.checkOut) >= new Date())
)
const expiredBookings = computed(() =>
  bookings.value.filter(b => new Date(b.checkOut) < new Date())
)
function goToCampsite(campsiteId) {
  router.push(`/campsite/${campsiteId}`)
}
</script>