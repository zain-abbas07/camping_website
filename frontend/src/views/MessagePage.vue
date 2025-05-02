<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();
const messages = ref([]);
const newMessage = ref('');
const loading = ref(false);
const user = JSON.parse(localStorage.getItem('user'));
const receiverId = route.query.receiverId; // Get receiverId from query params

if (!user) {
  alert('You must be logged in to view messages.');
  router.push('/login');
}

onMounted(async () => {
  try {
    loading.value = true;
    const res = await axios.get('http://localhost:3000/messages', {
      params: {
        senderId: user.id,
        receiverId,
      },
    });
    messages.value = res.data;
  } catch (err) {
    console.error('Error fetching messages:', err);
    alert('Failed to load messages.');
  } finally {
    loading.value = false;
  }
});

const sendMessage = async () => {
  if (!newMessage.value.trim()) {
    return alert('Message content cannot be empty.');
  }

  try {
    const res = await axios.post('http://localhost:3000/messages', {
      senderId: user.id,
      receiverId,
      content: newMessage.value.trim(),
    });
    messages.value.push(res.data);
    newMessage.value = ''; // Clear the input field
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Failed to send message.');
  }
};
</script>

<template>
  <div class="message-page">
    <h1>Messages</h1>

    <div v-if="loading">Loading messages...</div>
    <div v-else>
      <div v-for="message in messages" :key="message.id" class="message">
        <p :class="{ 'sent': message.senderId === user.id, 'received': message.senderId !== user.id }">
          {{ message.content }}
        </p>
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
</template>

<style scoped>
.message-page {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

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

.message-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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