<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';


const route = useRoute();
const router = useRouter();
const campsite = ref(null);
const map = ref(null)
const messages = ref([]); // Stores messages between the user and the owner
const newMessage = ref(''); // Tracks the new message content
const user = JSON.parse(localStorage.getItem('user')); // Get the logged-in user
const currentImageIndex = ref(0)

onMounted(async () => {
  try {
    const id = route.params.id;
    const res = await axios.get(`http://localhost:3000/campsites/${id}`);
    campsite.value = res.data;

    
  

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
        receiverId: campsite.value.owner.id, // Assuming the owner ID is used as receiverId
        campsiteId: route.params.id, // Assuming the campsite ID is used to filter messages
      },
    });
    messages.value = res.data;
  } catch (err) {
    console.error('Error fetching messages:', err);
    alert('Failed to load messages.');
  }
};
const sendMessage = async () => {
  if (!newMessage.value.trim()) {
    return alert('Message content cannot be empty.');
  }
  try {
    const payload = {
      senderId: user.id,
      receiverId: campsite.value.owner.id, // Ensure the owner ID is used as the receiver
      content: newMessage.value.trim(),
      campsiteId: route.params.id, // Include the campsite ID to associate the message with the correct listing
    };
    const res = await axios.post('http://localhost:3000/messages', payload);
    messages.value.push(res.data); // Add the new message to the messages list
    newMessage.value = ''; // Clear the input field
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Failed to send message.');
  }
};

function prevImage() {
  if (currentImageIndex.value > 0) currentImageIndex.value--
}
function nextImage() {
  if (campsite.value.image && currentImageIndex.value < campsite.value.image.length - 1)
    currentImageIndex.value++
}
function goToImage(idx) {
  currentImageIndex.value = idx
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 py-10">
  <div v-if="campsite" class="campsite-details-container">
    <!-- Title & Location -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-green-800 mb-2">{{ campsite.name }}</h1>
        <p class="text-gray-600">
          <span class="font-semibold">Location:</span>
          {{ campsite.location?.city || 'Unknown City' }}, {{ campsite.location?.country || 'Unknown Country' }}
        </p>
      </div>
      <div class="text-lg text-green-700 font-semibold mt-2 md:mt-0">
        ${{ campsite.price }}/night
      </div>
    </div>

    <!-- Image Gallery -->
    <div class="gallery-carousel mb-8">
    <div class="carousel-container">
      <button
        class="carousel-btn left"
        @click="prevImage"
        :disabled="currentImageIndex === 0"
        aria-label="Previous image"
      >
        ‹
      </button>
      <img
        v-if="campsite.image && campsite.image.length"
        :src="`http://localhost:3000/${campsite.image[currentImageIndex].url}`"
        alt="Campsite Image"
        class="carousel-img"
      />
      <button
        class="carousel-btn right"
        @click="nextImage"
        :disabled="currentImageIndex === (campsite.image.length - 1)"
        aria-label="Next image"
      >
        ›
      </button>
    </div>
    <div class="carousel-indicator">
      <span v-for="(img, idx) in campsite.image" :key="img.id"
        :class="['dot', { active: idx === currentImageIndex }]"
        @click="goToImage(idx)"
      ></span>
    </div>
  </div>

    <!-- Description & Amenities -->
    <div class="bg-white rounded-xl shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-green-700 mb-2">Description</h2>
      <p class="text-gray-800 mb-4">{{ campsite.description }}</p>
      <h3 class="text-lg font-semibold text-green-700 mb-2">Amenities</h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="amenity in campsite.amenity"
          :key="amenity.id"
          class="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"
        >
          {{ amenity.name }}
        </span>
      </div>
    </div>

    <!-- Owner Details -->
    <div class="bg-white rounded-xl shadow p-6 mb-8 flex items-center gap-4">
      <div class="flex-shrink-0 w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-xl font-bold text-green-700">
        {{ campsite.owner?.name?.charAt(0) || '?' }}
      </div>
      <div>
        <div class="font-semibold text-green-800">{{ campsite.owner?.name }}</div>
        <div class="text-gray-500 text-sm">{{ campsite.owner?.email }}</div>
      </div>
    </div>

    <!-- Map Section -->
    <div class="bg-white rounded-xl shadow p-6 mb-8">
      <h3 class="text-lg font-semibold text-green-700 mb-2">Map</h3>
      <GMapMap
      v-if="campsite.location && campsite.location.latitude && campsite.location.longitude"
      :center="{ lat: campsite.location.latitude, lng: campsite.location.longitude }"
      :zoom="13"
      style="width: 100%; height: 320px; border-radius: 12px; z-index: 1;"
    >
      <GMapMarker
        :position="{ lat: campsite.location.latitude, lng: campsite.location.longitude }"
      />
    </GMapMap>
    </div>

    <!-- Booking & Messaging Section -->
    <div class="flex flex-col md:flex-row gap-8">
      <button @click="goToBooking" class="book-btn mb-4 md:mb-0">
        Book This Spot
      </button>
      <div v-if="user && campsite.owner" class="messaging flex-1">
        <h3 class="text-lg font-semibold text-green-700 mb-2">Message the Owner</h3>
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
  </div>
  <div v-else>
    <p>Loading campsite...</p>
  </div>
  </div>
</template>

<style scoped>
.campsite-details-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}
.gallery-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  background: #e0e0e0;
}
.campsite-map {
  width: 100%;
  height: 320px;
  border-radius: 12px;
  margin-top: 1rem;
  position: relative; /* Ensure it doesn't have `position: fixed` or `absolute` */
  z-index: 1; 
}
.book-btn {
  padding: 0.65rem 1.5rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(46,125,50,0.08);
  letter-spacing: 0.01em;
}
.book-btn:hover {
  background-color: #1b5e20;
}
.messaging {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
  padding: 1.5rem;
  min-width: 300px;
}
.messages {
  max-height: 220px;
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


.carousel-container {
  position: relative;
  width: 100%;
  max-width: 520px;
  aspect-ratio: 4/3; /* Makes the container landscape, works in modern browsers */
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 16px;
  overflow: hidden;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* This will crop the image to fill the container */
  display: block;
  margin: auto;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.8);
  border: none;
  font-size: 2.5rem;
  color: #2e7d32;
  padding: 0 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  transition: background 0.2s;
}
.carousel-btn.left { left: 8px; }
.carousel-btn.right { right: 8px; }
.carousel-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.carousel-indicator {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
  gap: 0.5rem;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c8e6c9;
  cursor: pointer;
  transition: background 0.2s;
}
.dot.active {
  background: #2e7d32;
}

</style>