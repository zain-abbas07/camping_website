<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const bookings = ref([]);
const loading = ref(false);
const owner = JSON.parse(localStorage.getItem('user'));
const router = useRouter();

if (!owner || owner.role.toLowerCase() !== 'owner') {
  alert('You must be logged in as an owner to view bookings.');
  router.push('/login');
}

onMounted(async () => {
  try {
    loading.value = true;
    const res = await axios.get(`http://localhost:3000/owner/bookings?ownerId=${owner.id}`);
    bookings.value = res.data;
  } catch (err) {
    console.error('Error fetching bookings:', err);
    alert('Failed to load bookings.');
  } finally {
    loading.value = false;
  }
});

const cancelBooking = async (bookingId) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  try {
    loading.value = true;
    await axios.delete(`http://localhost:3000/bookings/${bookingId}`);
    bookings.value = bookings.value.filter((booking) => booking.id !== bookingId);
    alert('Booking canceled successfully.');
  } catch (err) {
    console.error('Error canceling booking:', err);
    alert('Failed to cancel booking.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="owner-bookings">
    <h1>Your Campsite Bookings</h1>

    <div v-if="loading">Loading bookings...</div>
    <div v-else-if="bookings.length === 0">No bookings found.</div>
    <div v-else>
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <h3>{{ booking.campsite.name }}</h3>
        <p><strong>Booked by:</strong> {{ booking.user.name }} ({{ booking.user.email }})</p>
        <p><strong>Check-in:</strong> {{ new Date(booking.checkIn).toLocaleDateString() }}</p>
        <p><strong>Check-out:</strong> {{ new Date(booking.checkOut).toLocaleDateString() }}</p>
        <p><strong>Total Price:</strong> ${{ booking.totalPrice }}</p>
        <button @click="cancelBooking(booking.id)" :disabled="loading">Cancel Booking</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.owner-bookings {
  max-width: 800px;
  margin: auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.booking-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
}

button {
  padding: 0.5rem 1rem;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #b71c1c;
}
</style>