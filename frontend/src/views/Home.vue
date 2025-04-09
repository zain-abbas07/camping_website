<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const campsites = ref([]);
const user = ref(null)
const router = useRouter();

onMounted(async () => {
  const res = await axios.get("http://localhost:3000/campsites");
  campsites.value = res.data;

  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
  }
});

const logout = () => {
  const confirmed = confirm("Are you sure you want to log out?");
  if (confirmed) {
    localStorage.removeItem('user');
    user.value = null;
  }
};

const viewDetails = (id) => {
  router.push(`/campsite/${id}`);
};

</script>

<template>
  <div class="container">
    <h1>🏕️ Available Campsites</h1>

    <div class="auth">
      <template v-if="user">
        <p>Welcome, {{ user.name }} 👋</p>
        <button @click="logout">Logout</button>
      </template>
      <template v-else>
        <p>You are not logged in.</p>
        <router-link to="/login">Login</router-link> |
        <router-link to="/signup">Sign Up</router-link>
      </template>
    </div>

    <div class="cards">
      <div
        v-for="site in campsites"
        :key="site.id"
        class="card"
        @click="viewDetails(site.id)"
      >
        <img
          src="https://source.unsplash.com/400x200/?camping,forest,{{ site.name }}"
          alt="Campsite Image"
        />
        <div class="card-content">
          <h3>{{ site.name }}</h3>
          <p>{{ site.location }}</p>
          <p><strong>${{ site.price }}</strong>/night</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: auto;
  padding: 2rem;
  text-align: center;
}

.auth {
  margin-bottom: 1.5rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease;
  cursor: pointer;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-content {
  padding: 1rem;
}
</style>