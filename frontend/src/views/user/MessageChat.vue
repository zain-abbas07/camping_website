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
  <div class="max-w-xl mx-auto py-8">
    <div v-if="campsite" class="mb-4 p-4 bg-green-50 rounded-lg shadow flex items-center gap-4">
      <img v-if="campsite.image && campsite.image.length"
           :src="`http://localhost:3000/${campsite.image[0].url}`"
           alt="Campsite"
           class="w-20 h-16 object-cover rounded-lg border" />
      <div>
        <h2 class="text-lg font-semibold text-green-800">{{ campsite.name }}</h2>
        <p class="text-gray-500 text-sm">{{ campsite.location?.city }}, {{ campsite.location?.country }}</p>
      </div>
    </div>
    <div v-if="loading">Loading messages...</div>
    <div v-else>
      <div v-for="message in messages" :key="message.id" class="message">
        <p :class="{ 'sent': message.senderId === user.id, 'received': message.senderId !== user.id }">
          {{ message.content }}
        </p>
      </div>
    </div>
    <div class="message-input flex gap-2 mt-4">
      <input
        v-model="newMessage"
        type="text"
        placeholder="Type your message..."
        @keyup.enter="sendMessage"
        class="flex-1 px-4 py-2 border rounded"
      />
      <button @click="sendMessage" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Send</button>
    </div>
  </div>
</template>

<style scoped>
.message {
  margin-bottom: 1rem;
}
.message p {
  padding: 0.8rem;
  border-radius: 8px;
  max-width: 70%;
}
.message p.sent {
  background-color: #d1e7dd;
  margin-left: auto;
}
.message p.received {
  background-color: #f8d7da;
}
</style>