<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import L from 'leaflet'

const route = useRoute();
const router = useRouter();
const campsite = ref(null);
const map = ref(null)
const messages = ref([]); // Stores messages between the user and the owner
const newMessage = ref(''); // Tracks the new message content
const user = JSON.parse(localStorage.getItem('user')); // Get the logged-in user

onMounted(async () => {
  try {
    const id = route.params.id;
    const res = await axios.get(`http://localhost:3000/campsites/${id}`);
    campsite.value = res.data;

    
    // Initialize the map after campsite data is loaded
    if (
      campsite.value.location &&
      campsite.value.location.latitude !== undefined &&
      campsite.value.location.longitude !== undefined
    ) {
      await nextTick();
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map container not found in the DOM.');
        return;
      }
      initializeMap(campsite.value.location);
    } else {
      console.error("Invalid location data:", campsite.value.location);
      alert("Location data is missing or invalid for this campsite.");
    }

    // Fetch messages between the user and the owner
    if (user && campsite.value.owner) {
      await fetchMessages();
    }
  } catch (err) {
    console.error("Failed to fetch campsite details", err);
    alert("Couldn't find campsite.");
    router.push('/');
  }
});

const initializeMap = (location) => {
  const { latitude, longitude } = location

  // Initialize the map
  map.value = L.map('map').setView([latitude, longitude], 13)

  // Add a tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map.value)

  // Add a marker
  L.marker([latitude, longitude]).addTo(map.value).bindPopup('Campsite Location').openPopup()
};

function goToBooking() {
  const user = localStorage.getItem("user");
  if (!user) {
    alert("Please log in to book this spot.");
    return router.push('/login');
  }

  router.push(`/campsite/${route.params.id}/book`);
};

const fetchMessages = async () => {
  if (!user || !campsite.value.owner) {
    console.error('User or campsite owner is undefined.');
    return;
  }
  try {
    const res = await axios.get('http://localhost:3000/messages', {
      params: {
        senderId: user.id,
        receiverId: campsite.value.owner.id, // Owner of the campsite
      },
    });
    messages.value = res.data;
  } catch (err) {
    console.error('Error fetching messages:', err);
    alert('Failed to load messages.');
  }
};

const sendMessage = async () => {
  if (!user || !campsite.value.owner) {
    console.error('User or campsite owner is undefined.');
    return alert('Unable to send message. Please try again later.');
  }
  if (!newMessage.value.trim()) {
    return alert('Message content cannot be empty.');
  }

  try {
    const res = await axios.post('http://localhost:3000/messages', {
      senderId: user.id,
      receiverId: campsite.value.owner.id, // Send message to the owner
      content: newMessage.value.trim(),
    });
    messages.value.push(res.data); // Add the new message to the list
    newMessage.value = ''; // Clear the input field
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Failed to send message.');
  }
};
</script>

<template>
  <div v-if="campsite" class="campsite-details">
    <h1>{{ campsite.name }}</h1>
    <p>{{ campsite.description }}</p>
    <p>
      <strong>Location:</strong>
      {{ campsite.location?.city || 'Unknown City' }}, {{ campsite.location?.country || 'Unknown Country' }}
    </p>
    <p><strong>Price:</strong> ${{ campsite.price }}/night</p>

    <!-- Owner Details -->
    <p v-if="campsite.owner">
      <strong>Owner:</strong> {{ campsite.owner.name }} ({{ campsite.owner.email }})
    </p>

    <!-- Placeholder for gallery -->
    <div class="gallery">
      <img
        v-for="image in campsite.image"
        :key="image.id"
        :src="`http://localhost:3000/${image.url}`"
        alt="Campsite Image"
      />
    </div>

    <!-- Map Section -->
    <h3>Map</h3>
    <div id="map" style="height: 400px; border-radius: 8px;"></div>

    <!-- Placeholder for booking button -->
    <button @click="goToBooking">Book This Spot</button>
  <!-- Messaging Section -->
  <div v-if="user && campsite.owner" class="messaging">
      <h3>Message the Owner</h3>
      <div class="messages">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="{ 'sent': message.senderId === user.id, 'received': message.senderId !== user.id }"
        >
          <p>{{ message.content }}</p>
        </div>
      </div>
      <div class="message-input">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading campsite...</p>
  </div>
</template>

<style scoped>
.campsite-details {
  max-width: 600px;
  margin: 0 auto;
  text-align: left;
}
.gallery img {
  width: 100%;
  border-radius: 12px;
  margin: 20px 0;
}
button {
  background-color: #2e7d32;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #1b5e20;
}
.messaging {
  margin-top: 2rem;
}
.messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}
.messages div {
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}
.messages div.sent {
  background-color: #d1e7dd;
  margin-left: auto;
}
.messages div.received {
  background-color: #f8d7da;
}
.message-input {
  display: flex;
  gap: 0.5rem;
}
.message-input input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.message-input button {
  padding: 0.8rem 1.5rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.message-input button:hover {
  background-color: #1b5e20;
}
</style>