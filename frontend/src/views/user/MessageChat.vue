<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const messages = ref([]);
const newMessage = ref('');
const loading = ref(false);
const user = JSON.parse(localStorage.getItem('user'));
const receiverId = route.query.receiverId;
const campsiteId = route.query.campsiteId;
const campsite = ref(null);

onMounted(async () => {
  if (!user || !receiverId || !campsiteId) {
    alert('Missing chat information.');
    return;
  }
  try {
    loading.value = true;
    // Fetch messages for this user, owner, and campsite
    const res = await axios.get('http://localhost:3000/messages', {
      params: {
        senderId: user.id,
        receiverId,
        campsiteId,
      },
    });
    messages.value = res.data;

    // Fetch campsite details
    const campsiteRes = await axios.get(`http://localhost:3000/campsites/${campsiteId}`);
    campsite.value = campsiteRes.data;
  } catch (err) {
    console.error('Error fetching messages or campsite:', err);
    alert('Failed to load messages or campsite.');
  } finally {
    loading.value = false;
  }
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) {
    return alert('Message content cannot be empty.');
  }
  try {
    const payload = {
      senderId: user.id,
      receiverId,
      content: newMessage.value.trim(),
      campsiteId,
    };
    const res = await axios.post('http://localhost:3000/messages', payload);
    messages.value.push(res.data);
    newMessage.value = '';
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Failed to send message.');
  }
};
</script>

<template>
  <div class="chat-wrapper flex items-center justify-center min-h-screen bg-gray-100">
    <div class="chat-container max-w-4xl w-full py-8 px-4">
      <!-- Header Section -->
      <div v-if="campsite" class="chat-header flex items-center gap-4 p-4 bg-green-50 rounded-lg shadow">
        <img
          v-if="campsite.image && campsite.image.length"
          :src="`http://localhost:3000/${campsite.image[0].url}`"
          alt="Campsite"
          class="w-16 h-16 object-cover rounded-lg border"
        />
        <div>
          <h2 class="text-lg font-semibold text-green-800">{{ campsite.name }}</h2>
          <p class="text-gray-500 text-sm">{{ campsite.location?.city }}, {{ campsite.location?.country }}</p>
        </div>
      </div>

      <!-- Messages Section -->
      <div v-if="loading" class="text-center text-gray-500 mt-4">Loading messages...</div>
      <div v-else class="chat-messages bg-white rounded-lg shadow p-4 mt-4 overflow-y-auto">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message mb-4"
        >
          <p
            :class="{
              'sent': message.senderId === user.id,
              'received': message.senderId !== user.id
            }"
            class="p-3 rounded-lg max-w-xs"
          >
            {{ message.content }}
          </p>
        </div>
      </div>

      <!-- Input Section -->
      <div class="chat-input flex items-center gap-2 mt-4">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type your message..."
          class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          @keyup.enter="sendMessage"
        />
        <button
          @click="sendMessage"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-header {
  display: flex;
  align-items: center;
}

.chat-messages {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f9f9f9;
}

.message {
  display: flex;
}

.message p {
  padding: 0.8rem;
  border-radius: 8px;
  max-width: 70%;
  word-wrap: break-word;
}

.message p.sent {
  background-color: #d1e7dd;
  margin-left: auto;
}

.message p.received {
  background-color: #f8d7da;
}

.chat-input input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.chat-input button {
  padding: 0.8rem 1.5rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #1b5e20;
}
</style>