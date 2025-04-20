<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

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

const submitBooking = async () => {
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
    console.error(err);
    alert('Booking failed. Please try again.');
  }
};

onMounted(fetchCampsite);
</script>

<template>
  <div class="container">
    <h1>Book {{ campsite?.name }}</h1>
    <p>{{ campsite?.description }}</p>
    <p>Location: {{ campsite?.location }}</p>
    <p>Price per night: ${{ campsite?.price }}</p>

    <form @submit.prevent="submitBooking">
      <label>Check-in</label>
      <input type="date" v-model="checkIn" :min="today" required />

      <label>Check-out</label>
      <input type="date" v-model="checkOut" :min="checkIn || today" required />

      <p>Total nights: {{ nights }}</p>
      <p>Total price: ${{ totalPrice }}</p>

      <button type="submit">Confirm Booking</button>
    </form>
  </div>
</template>

<style scoped>
.container {
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  border-radius: 10px;
  background: #f8f8f8;
}

label {
  display: block;
  margin: 1rem 0 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background: #1b5e20;
}
</style>
