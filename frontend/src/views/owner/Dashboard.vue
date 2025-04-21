<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const campsites = ref([]);
const bookings = ref([]);
const owner = ref(JSON.parse(localStorage.getItem('user')));
const router = useRouter();

onMounted(async () => {
  try {
    // Fetch campsites by owner ID
    const resCampsites = await axios.get(`http://localhost:3000/campsites?ownerId=${owner.value.id}`);
    campsites.value = resCampsites.data;

    // Fetch bookings for owner's campsites
    const resBookings = await axios.get(`http://localhost:3000/owner/bookings?ownerId=${owner.value.id}`);

    // axios.get('http://localhost:3000/bookings?_expand=campsite');
    bookings.value = resBookings.data.filter(booking =>
      campsites.value.some(site => site.id === booking.campsiteId))
      console.log("Owner dashboard loaded"
        
    );
    // <div v-if="bookings.length === 0">No bookings yet.</div>
  } catch (err) {
    console.error('Error loading dashboard', err);
  }
});
const goToAddListing = () => {
    router.push('/owner/add-listing');
    };
</script>

<template>
  <div class="dashboard">
    <h1>Owner Dashboard</h1>

    <section>
      <h2>Your Campsites</h2>
      <div v-if="campsites.length === 0">No campsites found.</div>
      <ul>
        <li v-for="site in campsites" :key="site.id">
          <strong>{{ site.name }}</strong> — ${{ site.price }}/night
        </li>
      </ul>
      <button @click="goToAddListing">Add New Listing</button>
    </section>

    <section style="margin-top: 2rem">
      <h2>Bookings for Your Campsites</h2>
      <div v-if="bookings.length === 0">No bookings yet.</div>
      <table v-else>
        <thead>
          <tr>
            <th>Campsite</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Total ($)</th>
            <th>User ID</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.id">
            <td>{{ booking.campsite.name }}</td>
            <td>{{ booking.checkIn }}</td>
            <td>{{ booking.checkOut }}</td>
            <td>{{ booking.totalPrice }}</td>
            <td>{{ booking.userId }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: auto;
  padding: 2rem;
}

button {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
button:hover {
  background-color: #1b5e20;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  padding: 0.5rem;
  border: 1px solid #ccc;
  text-align: left;
}
</style>
