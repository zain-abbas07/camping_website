<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import L from 'leaflet'; // Import Leaflet for map functionality

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
  <div v-if="campsite" class="campsite-details">
    <h1>{{ campsite.name }}</h1>

    <h3>Map</h3>
    <div id="map" style="height: 400px; border-radius: 8px;"></div>
    <form v-if="editing" @submit.prevent="updateCampsite">
      <!-- Editable Fields -->
      <label for="name">Name</label>
      <input v-model="campsite.name" type="text" id="name" required />

      <label for="description">Description</label>
      <textarea v-model="campsite.description" id="description" required></textarea>

      <label for="price">Price</label>
      <input v-model="campsite.price" type="number" id="price" required />

      <label for="location-city">City</label>
      <input v-model="campsite.location.city" type="text" id="location-city" required />

      <label for="location-country">Country</label>
      <input v-model="campsite.location.country" type="text" id="location-country" required />

      

      <!-- Edit Images -->
      <h3>Edit Images</h3>
      <div class="gallery">
        <div v-for="image in campsite.image" :key="image.id" class="image-item">
          <img :src="`http://localhost:3000/${image.url}`" alt="Campsite Image" />
          <button type="button" @click="removeImage(image.id)">Remove</button>
        </div>
      </div>
      <label for="new-images">Add New Images</label>
      <input type="file" id="new-images" multiple @change="handleFileChange" />

      <!-- Buttons -->
      <div class="button-group">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Updating...' : 'Save Changes' }}
        </button>
        <button type="button" @click="toggleEditMode" class="cancel-btn">
          Cancel
        </button>
      </div>
    </form>

    <div v-else>
      <!-- Read-Only Details -->
      <p><strong>Description:</strong> {{ campsite.description }}</p>
      <p><strong>Price:</strong> ${{ campsite.price }}/night</p>
      <p><strong>Location:</strong> {{ campsite.location?.city || 'Unknown City' }}, {{ campsite.location?.country || 'Unknown Country' }}</p>
      <h3>Amenities</h3>
      <ul>
        <li v-for="amenity in campsite.amenities" :key="amenity.id">{{ amenity.name }}</li>
      </ul>

      <h3>Images</h3>
      <div class="gallery">
        <img
          v-for="image in campsite.image"
          :key="image.id"
          :src="`http://localhost:3000/${image.url}`"
          alt="Campsite Image"
        />
      </div>

      <!-- Edit Button -->
      <div class="button-group">
        <button @click="toggleEditMode" class="edit-btn">Edit</button>
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
  margin: auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

form input,
form textarea {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 0.8rem 1.5rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #1b5e20;
}

.cancel-btn {
  background-color: #d32f2f;
  margin-left: 1rem;
}

.cancel-btn:hover {
  background-color: #b71c1c;
}

.edit-btn {
  background-color: #4caf50;
}

.edit-btn:hover {
  background-color: #388e3c;
}

.button-group {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  margin-top: 1rem;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.gallery img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.image-item {
  position: relative;
}

.image-item button {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #d32f2f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 0.8rem;
  cursor: pointer;
}

.image-item button:hover {
  background-color: #b71c1c;
}
#map {
  height: 400px;
  width: 100%;
  border-radius: 8px;
}
</style>