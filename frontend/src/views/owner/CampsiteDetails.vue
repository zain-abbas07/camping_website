<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';



const route = useRoute();
const router = useRouter();
const campsite = ref(null);
const loading = ref(false);
const editing = ref(false); // Tracks if the owner is in edit mode
const newImages = ref([]); // Tracks newly uploaded images
const imagesToRemove = ref([]); // Tracks images to be removed
const map = ref(null); // Leaflet map instance

onMounted(async () => {
  try {
    const id = route.params.id;
    const res = await axios.get(`http://localhost:3000/campsites/${id}`);
    campsite.value = res.data;
    console.log('Campsite data loaded:', campsite.value);

    // Wait for the DOM to render the #map element before initializing the map
    if (campsite.value.location && campsite.value.location.latitude && campsite.value.location.longitude) {
      await nextTick(); // Ensure the DOM is updated
      const mapElement = document.getElementById('map');
      console.log('Map element:', mapElement);
      if (!mapElement) {
        console.error('Map container not found in the DOM.');
        return;
      }
      initializeMap(campsite.value.location);
    } else {
      console.error('Invalid location data:', campsite.value.location);
      alert('Location data is missing or invalid for this campsite.');
    }
  } catch (err) {
    console.error('Failed to fetch campsite details', err);
    alert("Couldn't find campsite.");
    router.push('/owner/dashboard');
  }
});

const initializeMap = (location) => {
  if (map.value) {
    console.warn('Map is already initialized.');
    return;
  }
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

const handleFileChange = (event) => {
  const files = event.target.files;
  newImages.value = Array.from(files);
};

const removeImage = (imageId) => {
  imagesToRemove.value.push(imageId);
  campsite.value.image = campsite.value.image.filter((img) => img.id !== imageId);
};

const updateCampsite = async () => {
  try {
    loading.value = true;

    // Ensure location and amenities are properly formatted
    const formattedLocation = JSON.stringify(campsite.value.location || {});
    const formattedAmenities = (campsite.value.amenities || []).map((amenity) => amenity.name);

    const formData = new FormData();
    formData.append('name', campsite.value.name);
    formData.append('description', campsite.value.description);
    formData.append('price', campsite.value.price);
    formData.append('location', formattedLocation);
    formData.append('amenities', JSON.stringify(formattedAmenities));

    // Add new images to the form data
    newImages.value.forEach((image) => {
      formData.append('newImages', image);
    });

    // Add images to remove
    formData.append('imagesToRemove', JSON.stringify(imagesToRemove.value));

    await axios.patch(`http://localhost:3000/campsites/${campsite.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    alert('Campsite updated successfully!');
    editing.value = false; // Exit edit mode after successful update
  } catch (err) {
    console.error('Error updating campsite:', err.response?.data || err.message);
    alert('Failed to update campsite. Please try again.');
  } finally {
    loading.value = false;
  }
};

const toggleEditMode = () => {
  editing.value = !editing.value;
};
</script>

<template>
  <div v-if="campsite" class="min-h-screen bg-green-50 py-10 px-4 flex justify-center">

    <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10 space-y-10">
      
      <!-- Image Gallery at Top -->
      <div>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Gallery</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <img
            v-for="image in campsite.image"
            :key="image.id"
            :src="`http://localhost:3000/${image.url}`"
            alt="Campsite Image"
            class="rounded-xl w-full h-64 object-cover shadow"
          />
        </div>
      </div>

      <!-- Header -->
      <div class="flex justify-between items-center">
        <h1 class="text-4xl font-bold text-green-800">{{ campsite.name }}</h1>
        <button 
          v-if="!editing" 
          @click="toggleEditMode" 
          class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Edit
        </button>
      </div>

      <!-- Map Section -->
      <div>
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Location</h2>
        <GMapMap
          v-if="campsite.location && campsite.location.latitude && campsite.location.longitude"
          :center="{ lat: campsite.location.latitude, lng: campsite.location.longitude }"
          :zoom="13"
          style="width: 100%; height: 400px; border-radius: 16px; z-index: 1;"
        >
          <GMapMarker
            :position="{ lat: campsite.location.latitude, lng: campsite.location.longitude }"
          />
        </GMapMap>
      </div>

      <!-- Form Section -->
      <form v-if="editing" @submit.prevent="updateCampsite" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input v-model="campsite.name" type="text" required
              class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Price</label>
            <input v-model="campsite.price" type="number" required
              class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-2" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">City</label>
            <input v-model="campsite.location.city" type="text" required
              class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Country</label>
            <input v-model="campsite.location.country" type="text" required
              class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-2" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="campsite.description" rows="4" required
            class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 px-4 py-2"></textarea>
        </div>

        <!-- Image Management -->
        <div>
          <h3 class="text-lg font-semibold text-gray-700">Manage Images</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3">
            <div v-for="image in campsite.image" :key="image.id" class="relative group">
              <img :src="`http://localhost:3000/${image.url}`" alt="Campsite Image"
                class="rounded-lg object-cover w-full h-32">
              <button type="button"
                @click="removeImage(image.id)"
                class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-700"
              >✕</button>
            </div>
          </div>
          <input type="file" multiple @change="handleFileChange"
            class="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700" />
        </div>

        <div class="flex justify-end gap-4">
          <button type="submit" :disabled="loading"
            class="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">
            {{ loading ? 'Updating...' : 'Save Changes' }}
          </button>
          <button type="button" @click="toggleEditMode"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">
            Cancel
          </button>
        </div>
      </form>

      <!-- View-Only Details -->
      <div v-else class="space-y-4">
        <p class="text-gray-700"><strong>Description:</strong> {{ campsite.description }}</p>
        <p class="text-gray-700"><strong>Price:</strong> ${{ campsite.price }}/night</p>
        <p class="text-gray-700"><strong>Location:</strong> {{ campsite.location?.city }}, {{ campsite.location?.country }}</p>

        <div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Amenities</h3>
          <ul class="list-disc pl-5 space-y-1 text-gray-600">
            <li v-for="amenity in campsite.amenities" :key="amenity.id">{{ amenity.name }}</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>
