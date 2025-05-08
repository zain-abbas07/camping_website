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
    // Fetch all conversations for the user
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
      // If you group by listing, also pass listingId: conversation.listingId
    }
  });
}
</script>

<template>
  <div class="max-w-2xl mx-auto py-8">
    <h1 class="text-2xl font-bold mb-6">Messages</h1>
    <div v-if="loading" class="text-center text-gray-500">Loading...</div>
    <div v-else-if="conversations.length === 0" class="text-center text-gray-400">No conversations yet.</div>
    <ul v-else class="space-y-4">
      <li
        v-for="conv in conversations"
        :key="conv.partnerId + '-' + conv.campsiteId"
        @click="conv.campsiteId ? openChat(conv) : null"
        :class="[
          'flex items-center gap-4 bg-white rounded-xl shadow p-4 transition',
          conv.campsiteId ? 'cursor-pointer hover:bg-green-50' : 'opacity-50 cursor-not-allowed'
        ]"
      >
        <div class="flex-1">
          <div class="font-semibold text-green-800">{{ conv.partnerName }}</div>
          <div class="text-xs text-gray-400 truncate">{{ conv.lastMessage }}</div>
          <div v-if="!conv.campsiteId" class="text-xs text-red-500">No campsite linked</div>
        </div>
      </li>
    </ul>
  </div>
</template>