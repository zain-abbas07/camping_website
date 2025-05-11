<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const bookings = ref([]);
const loading = ref(false);
const owner = JSON.parse(localStorage.getItem('user'));
const router = useRouter();
const showCancelModal = ref(false);
const bookingToCancel = ref(null);
const showApproveModal = ref(false);
const bookingToApprove = ref(null);

const openApproveModal = (booking) => {
  bookingToApprove.value = booking;
  showApproveModal.value = true;
};

const closeApproveModal = () => {
  showApproveModal.value = false;
  bookingToApprove.value = null;
};

const confirmApproveBooking = async () => {
  if (!bookingToApprove.value) return;
  try {
    loading.value = true;
    await axios.patch(`http://localhost:3000/bookings/${bookingToApprove.value.id}/approve`);
    bookingToApprove.value.status = 'CONFIRMED';
    closeApproveModal();
  } catch (err) {
    alert('Failed to approve booking.');
  } finally {
    loading.value = false;
  }
};

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

const isExpired = (booking) => {
  return booking.status !== 'CANCELLED' && new Date(booking.checkOut) < new Date(new Date().setHours(0,0,0,0));
};
const isActive = (booking) => {
  return booking.status !== 'CANCELLED' && new Date(booking.checkOut) >= new Date(new Date().setHours(0,0,0,0));
};
const isCancelled = (booking) => {
  return booking.status === 'CANCELLED';
};
const isPending = (booking) => {
  return booking.status === 'PENDING';
};

const openCancelModal = (booking) => {
  bookingToCancel.value = booking;
  showCancelModal.value = true;
};

const closeCancelModal = () => {
  showCancelModal.value = false;
  bookingToCancel.value = null;
};
const confirmCancelBooking = async () => {
  if (!bookingToCancel.value) return;
  try {
    loading.value = true;
    await axios.patch(`http://localhost:3000/bookings/${bookingToCancel.value.id}/cancel`);
    bookingToCancel.value.status = 'CANCELLED';
    closeCancelModal();
    // Optionally, reload bookings from backend here
  } catch (err) {
    console.error('Error canceling booking:', err);
    alert('Failed to cancel booking.');
  } finally {
    loading.value = false;
  }
};

const approveBooking = async (booking) => {
  try {
    loading.value = true;
    await axios.patch(`http://localhost:3000/bookings/${booking.id}/approve`);
    booking.status = 'CONFIRMED';
  } catch (err) {
    alert('Failed to approve booking.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  
  
  <div class="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-green-300 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-green-700 mb-8 text-center">Your Campsite Bookings</h1>
      <div v-if="loading" class="text-center text-gray-500 py-12">Loading bookings...</div>
      <div v-else-if="bookings.length === 0" class="text-center text-gray-400 py-12">No bookings found.</div>
      <div v-else class="flex flex-col items-center !space-y-6">
        <div
          v-for="booking in bookings"
          :key="booking.id"
          class="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl"
        >
          <h3 class="text-lg font-semibold text-green-800 mb-2">{{ booking.campsite.name }}</h3>
          <p class="text-gray-600 mb-1"><strong>Booked by:</strong> {{ booking.user.name }} ({{ booking.user.email }})</p>
          <p class="text-gray-600 mb-1"><strong>Check-in:</strong> {{ new Date(booking.checkIn).toLocaleDateString() }}</p>
          <p class="text-gray-600 mb-1"><strong>Check-out:</strong> {{ new Date(booking.checkOut).toLocaleDateString() }}</p>
          <p class="text-green-700 font-semibold mb-2"><strong>Total Price:</strong> ${{ booking.totalPrice }}</p>
          <div v-if="isExpired(booking)" class="inline-block bg-gray-300 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold mt-2">
            Expired
          </div>
          <div v-else-if="isCancelled(booking)" class="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold mt-2">
            Cancelled
          </div>
          <div v-else-if="isPending(booking)">
            <span class="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold mt-2 mr-2">
              Pending
            </span>
            <button @click="openApproveModal(booking)" :disabled="loading" class="approve-btn mr-2">Approve</button>
            <button @click="openCancelModal(booking)" :disabled="loading" class="cancel-btn">Cancel</button>
          </div>
          <button v-else-if="isActive(booking)" @click="openCancelModal(booking)" class="cancel-btn mt-2">Cancel Booking</button>
        </div>
      </div>

    <!-- Cancel Booking Modal -->
    <div v-if="showCancelModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="text-lg font-semibold mb-4 text-red-700">Cancel Booking</h3>
        <p class="mb-6">
          Are you sure you want to cancel the booking for
          <strong>{{ bookingToCancel?.campsite?.name }}</strong>
          ({{ bookingToCancel?.user?.name }})?
        </p>
        <div class="flex justify-end gap-3">
          <button @click="closeCancelModal" class="cancel-btn">No, Keep</button>
          <button @click="confirmCancelBooking" :disabled="loading" class="confirm-btn">
            {{ loading ? 'Cancelling...' : 'Yes, Cancel' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Approve Booking Modal -->
    <div v-if="showApproveModal" class="modal-overlay">
  <div class="modal-content">
    <h3 class="text-lg font-semibold mb-4 text-green-700">Approve Booking</h3>
    <p class="mb-6">
      Are you sure you want to approve the booking for
      <strong>{{ bookingToApprove?.campsite?.name }}</strong>
      ({{ bookingToApprove?.user?.name }})?
    </p>
    <div class="flex justify-end gap-3">
      <button @click="closeApproveModal" class="cancel-btn">No, Keep Pending</button>
      <button @click="confirmApproveBooking" :disabled="loading" class="approve-btn">
        {{ loading ? 'Approving...' : 'Yes, Approve' }}
      </button>
    </div>
  </div>
</div>
  </div>
  </div>
  
</template>

<style scoped>
.owner-bookings {
  max-width: 800px;
  /* margin: auto; */
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.booking-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  /* padding: 1rem; */
  /* margin-bottom: 6rem; */
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal-content {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  text-align: center;
}
.cancel-btn {
  background: #fff;
  color: #2e7d32;
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

.approve-btn {
  background: #43a047;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  padding: 0.5rem 1.2rem;
  transition: background 0.2s;
}
.approve-btn:hover:not(:disabled) {
  background: #2e7d32;
}
</style>