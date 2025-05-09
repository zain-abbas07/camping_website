<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = JSON.parse(localStorage.getItem('user'));
const conversations = ref([]);
const loading = ref(false);

if (!user) {
  alert('You must be logged in to view messages.');
  router.push('/login');
}

onMounted(async () => {
  try {
    loading.value = true;
    const res = await axios.get(`http://localhost:3000/messages/inbox?userId=${user.id}`);
    conversations.value = res.data;
  } catch (err) {
    console.error('Error fetching conversations:', err);
    alert('Failed to load conversations.');
  } finally {
    loading.value = false;
  }
});

function openChat(conversation) {
  router.push({
    path: '/messages/chat',
    query: {
      receiverId: conversation.partnerId,
      campsiteId: conversation.campsiteId,
    },
  });
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}
</script>
<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <!-- Header Section -->
    <h1 class="text-4xl font-bold text-green-700 mb-8 text-center">Messages</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center text-gray-500 py-12">
      Loading conversations...
    </div>

    <!-- No Conversations -->
    <div v-else-if="conversations.length === 0" class="text-center text-gray-400 py-12">
      <p class="text-lg">You have no conversations yet.</p>
    </div>

    <!-- Conversations List -->
    <ul v-else class="space-y-6">
      <li
        v-for="conv in conversations"
        :key="conv.partnerId + '-' + conv.campsiteId"
        @click="conv.campsiteId ? openChat(conv) : null"
        :class="[
          'flex items-center gap-4 bg-white rounded-lg shadow-md p-5 transition-all duration-300',
          conv.campsiteId ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'opacity-50 cursor-not-allowed'
        ]"
      >
        <!-- Partner Avatar -->
        <div class="flex-shrink-0 w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
          {{ conv.partnerName.charAt(0) }}
        </div>

        <!-- Conversation Details -->
        <div class="flex-1">
          <div class="font-semibold text-green-800 text-lg">{{ conv.partnerName }}</div>
          <div class="text-sm text-gray-500 truncate">{{ conv.lastMessage }}</div>
          <div v-if="!conv.campsiteId" class="text-sm text-red-500 mt-1">No campsite linked</div>
        </div>

        <!-- Timestamp -->
        <div class="text-sm text-gray-400">
          {{ formatDate(conv.lastMessageTime) }}
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Container Styling */
.max-w-4xl {
  max-width: 64rem;
}

/* List Item Styling */
li {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

li:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Avatar Styling */
.flex-shrink-0 {
  width: 3.5rem;
  height: 3.5rem;
  background-color: #e6f4ea;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #2e7d32;
  font-size: 1.25rem;
}

/* Timestamp Styling */
.text-sm {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Header Styling */
h1 {
  font-size: 2.25rem;
  font-weight: bold;
  color: #2e7d32;
  text-align: center;
  margin-bottom: 2rem;
}
</style>