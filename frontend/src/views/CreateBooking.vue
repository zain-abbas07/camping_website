<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const showModal = ref(false); // Tracks if the modal is visible
const loading = ref(false); // Tracks if the booking is being submitted

const checkIn = ref('');
const checkOut = ref('');
const campsite = ref(null);

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const nights = computed(() => {
  const inDate = new Date(checkIn.value);
  const outDate = new Date(checkOut.value);
  const diff = outDate - inDate;
  return diff > 0 ? diff / (1000 * 60 * 60 * 24) : 0;
});

const totalPrice = computed(() => {
  return campsite.value && nights.value > 0
    ? (campsite.value.price * nights.value).toFixed(2)
    : '0.00';
});

const fetchCampsite = async () => {
  const res = await axios.get(`http://localhost:3000/campsites/${route.params.id}`);
  campsite.value = res.data;
};
const openModal = () => {
  if (!checkIn.value || !checkOut.value) {
    return alert('Please select both check-in and check-out dates.');
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleFormSubmit = async () => {
  if (!checkIn.value || !checkOut.value) {
    return alert('Please select both check-in and check-out dates.');
  }

  const now = new Date();
  const inDate = new Date(checkIn.value);
  const outDate = new Date(checkOut.value);

  if (inDate < now.setHours(0, 0, 0, 0)) {
    return alert("You can't book a check-in date in the past.");
  }

  if (outDate <= inDate) {
    return alert("Check-out must be after check-in.");
  }

  if (!auth.currentUser) {
    return router.push('/login');
  }

  try {
    loading.value = true;
    const duplicateCheck = await axios.get('http://localhost:3000/bookings/check-duplicate', {
      params: {
        userId: auth.currentUser.id,
        campsiteId: campsite.value.id,
        checkIn: checkIn.value,
        checkOut: checkOut.value,
      },
    });

    if (duplicateCheck.data.isDuplicate) {
      alert('You already have a booking for this campsite during the selected dates.');
      return;
    }

    // All checks passed, show the modal
    showModal.value = true;
  } catch (err) {
    alert('Failed to check booking. Please try again.');
  } finally {
    loading.value = false;
  }
};

const confirmBooking = async () => {
  try {
    loading.value = true;
    await axios.post('http://localhost:3000/bookings', {
      userId: auth.currentUser.id,
      campsiteId: campsite.value.id,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      totalPrice: parseFloat(totalPrice.value),
    });
    alert('Booking successful!');
    router.push('/bookings');
  } catch (err) {
    alert('Booking failed. Please try again.');
  } finally {
    loading.value = false;
    closeModal();
  }
};
onMounted(fetchCampsite);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 py-10 flex items-center justify-center">
    <div class="booking-card">
      <h1 class="text-2xl font-bold text-green-800 mb-4">{{ campsite?.name }}</h1>
      <div class="flex flex-col md:flex-row gap-6 mb-6">
        <img
          v-if="campsite?.image?.length"
          :src="`http://localhost:3000/${campsite.image[0].url}`"
          alt="Campsite"
          class="rounded-xl object-cover w-full md:w-64 h-40 border"
        />
        <div class="flex-1">
          <p class="mb-2 text-gray-700">{{ campsite?.description }}</p>
          <p class="mb-1 text-gray-600">
            <strong>Location:</strong>
            {{ campsite?.location?.city || 'Unknown City' }}, {{ campsite?.location?.country || 'Unknown Country' }}
          </p>
          <p class="mb-1 text-green-700 font-semibold">
            <strong>Price per night:</strong> ${{ campsite?.price }}
          </p>
        </div>
      </div>
      <form @submit.prevent="handleFormSubmit" class="space-y-4">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-gray-700 mb-1">Check-in</label>
            <input type="date" v-model="checkIn" :min="today" required class="input" />
          </div>
          <div class="flex-1">
            <label class="block text-gray-700 mb-1">Check-out</label>
            <input type="date" v-model="checkOut" :min="checkIn || today" required class="input" />
          </div>
        </div>
        <div class="flex items-center gap-6">
          <span class="text-gray-700">Total nights: <strong>{{ nights }}</strong></span>
          <span class="text-green-700 font-bold">Total: ${{ totalPrice }}</span>
        </div>
        <button type="submit" class="book-btn w-full mt-2">Confirm Booking</button>
      </form>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0  flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Confirm Booking</h3>
        <p class="text-gray-600 mb-6">
          Are you sure you want to book <strong>{{ campsite?.name }}</strong> from
          <strong>{{ checkIn }}</strong> to <strong>{{ checkOut }}</strong> for
          <strong>${{ totalPrice }}</strong>?
        </p>
        <div class="flex justify-end space-x-4">
          <button
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            @click="confirmBooking"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300"
            :disabled="loading"
          >
            {{ loading ? 'Booking...' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-card {
  background: linear-gradient(135deg, #e8f5e9 60%, #c8e6c9 100%);
  border-radius: 22px;
  box-shadow: 0 4px 32px 0 rgba(44, 101, 62, 0.10);
  border: 1.5px solid #b2dfdb;
  max-width: 540px;
  width: 100%;
  padding: 2.5rem 2rem;
}
.input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1.5px solid #b2dfdb;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
.input:focus {
  border-color: #43a047;
}
.book-btn {
  padding: 0.8rem 0;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(46,125,50,0.08);
  letter-spacing: 0.01em;
}
.book-btn:hover {
  background-color: #1b5e20;
}
</style>