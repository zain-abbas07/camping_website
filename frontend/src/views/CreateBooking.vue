<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const checkIn = ref('');
const checkOut = ref('');

const book = async () => {
  const userId = localStorage.getItem("userId");
  const campsiteId = route.params.id;
  const days = (new Date(checkOut.value) - new Date(checkIn.value)) / (1000 * 60 * 60 * 24);
  const pricePerNight = 100; // Or fetch from backend
  const totalPrice = days * pricePerNight;

  await axios.post('http://localhost:3000/bookings', {
    userId,
    campsiteId,
    checkIn,
    checkOut,
    totalPrice,
  });

  alert('Booking successful!');
};
</script>

<template>
  <h1>Book This Campsite</h1>
  <form @submit.prevent="book">
    <label>Check-in:</label>
    <input type="date" v-model="checkIn" required />

    <label>Check-out:</label>
    <input type="date" v-model="checkOut" required />

    <button type="submit">Book Now</button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin: auto;
  gap: 10px;
}
</style>
