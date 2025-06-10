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
            <button
              v-if="booking.status !== 'CANCELLED'"
              @click.stop="openCancelModal(booking)"
              class="cancel-btn mt-2"
            >
              Cancel Booking
            </button>
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
      <!-- Add this at the end of your template -->
<div v-if="showCancelModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
  <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
    <h3 class="text-lg font-semibold mb-4 text-red-700">Cancel Booking</h3>
    <p class="mb-6">
      Are you sure you want to cancel your booking for
      <strong>{{ bookingToCancel?.campsite?.name }}</strong>?
    </p>
    <div class="flex justify-end gap-3">
      <button @click="closeCancelModal" class="cancel-btn">No, Keep</button>
      <button @click="confirmCancelBooking" :disabled="loading" class="confirm-btn">
        {{ loading ? 'Cancelling...' : 'Yes, Cancel' }}
      </button>
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

const showCancelModal = ref(false);
const bookingToCancel = ref(null);
const loading = ref(false);
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
  bookings.value.filter(
    b => new Date(b.checkOut) >= new Date() && b.status !== 'CANCELLED'
  )
)
const expiredBookings = computed(() =>
  bookings.value.filter(b => new Date(b.checkOut) < new Date())
)
function goToCampsite(campsiteId) {
  router.push(`/campsite/${campsiteId}`)
}

function openCancelModal(booking) {
  bookingToCancel.value = booking;
  showCancelModal.value = true;
}
function closeCancelModal() {
  showCancelModal.value = false;
  bookingToCancel.value = null;
}
async function confirmCancelBooking() {
  if (!bookingToCancel.value) return;
  try {
    loading.value = true;
    await axios.patch(`http://localhost:3000/bookings/${bookingToCancel.value.id}/cancel`);
    bookingToCancel.value.status = 'CANCELLED';
    closeCancelModal();
    // Optionally, reload bookings from backend here
  } catch (err) {
    alert('Failed to cancel booking.');
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.cancel-btn {
  background: #fff;
  color: #d32f2f;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-weight: bold;
  padding: 0.5rem 1.2rem;
  transition: background 0.2s;
}
.cancel-btn:hover {
  background: #f5f5f5;
}
.confirm-btn {
  background: #d32f2f;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  padding: 0.5rem 1.2rem;
  transition: background 0.2s;
}
.confirm-btn:hover:not(:disabled) {
  background: #b71c1c;
}
</style>