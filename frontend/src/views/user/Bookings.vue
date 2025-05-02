<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from "vue-router";


const router = useRouter();
const bookings = ref([]);

// onMounted(async () => {
//   const userId = localStorage.getItem("userId");
//   if (!userId) return alert("Not logged in");

//   const res = await axios.get(`http://localhost:3000/bookings?userId=${userId}`);
//   bookings.value = res.data;
// });

onMounted(async () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("You must be logged in to view your bookings.");
      return router.push("/login");
    }

    const user = JSON.parse(storedUser);
    const userId = user.id;

    const res = await axios.get(`http://localhost:3000/bookings?userId=${userId}`);
    bookings.value = res.data;
  } catch (error) {
    console.error("Failed to load bookings:", error);
    alert("There was a problem loading your bookings.");
  }
});


// Helper function to format dates
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
</script>

<template>
  <h1>Your Bookings</h1>
  <div v-if="bookings.length === 0">No bookings yet.</div>
  <div v-else>
    <div v-for="booking in bookings" :key="booking.id" class="card">
      <h3>{{ booking.campsite.name }}</h3>
      <p>Check-in: {{ formatDate(booking.checkIn) }} after 5 PM</p>
      <p>Check-out: {{ formatDate(booking.checkOut) }} before 12 PM</p>
      <p>Price to be paid: ${{ booking.totalPrice }}</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  padding: 1rem;
  margin: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
