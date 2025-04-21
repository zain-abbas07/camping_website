<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const owner = JSON.parse(localStorage.getItem('user'));

if (!owner || owner.role.toLowerCase() !== 'owner') {
  alert('You must be logged in as an owner to add a listing.');
  router.push('/login');
}

const form = ref({
  name: '',
  description: '',
  price: '',
  location: {
    country: '',
    state: '',
    city: '',
    address: '',
  },
  amenities: [],
  availability: [],
  images: [],
});

const loading = ref(false);
const availableAmenities = ref(['WiFi', 'Parking', 'Swimming Pool', 'BBQ', 'Pet Friendly']);
const selectedAmenities = ref([]);

const handleFileChange = (event) => {
  const files = event.target.files;
  form.value.images = Array.from(files);
};

const addAvailability = () => {
  form.value.availability.push({ date: '', available: true });
};

const removeAvailability = (index) => {
  form.value.availability.splice(index, 1);
};

const submitListing = async () => {
  if (!form.value.name || !form.value.description || !form.value.price || !form.value.location.city) {
    return alert('Please fill in all required fields.');
  }

  const formData = new FormData();
  formData.append('ownerId', owner.id);
  formData.append('name', form.value.name);
  formData.append('description', form.value.description);
  formData.append('price', form.value.price);
  formData.append('location', JSON.stringify(form.value.location));
  formData.append('amenities', JSON.stringify(selectedAmenities.value));
  formData.append('availability', JSON.stringify(form.value.availability));

  form.value.images.forEach((image, index) => {
    formData.append(`images[${index}]`, image);
  });

  try {
    loading.value = true;
    await axios.post('http://localhost:3000/campsites', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    alert('Campsite added successfully!');
    router.push('/owner/dashboard');
  } catch (err) {
    console.error('Error adding campsite:', err);
    alert('Failed to add campsite. Please try again.');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="add-listing">
    <h1>Add a New Campsite</h1>
    <form @submit.prevent="submitListing">
      <!-- Basic Details -->
      <div>
        <label for="name">Campsite Name</label>
        <input v-model="form.name" type="text" id="name" placeholder="Enter campsite name" required />
      </div>

      <div>
        <label for="description">Description</label>
        <textarea
          v-model="form.description"
          id="description"
          placeholder="Enter a description"
          required
        ></textarea>
      </div>

      <div>
        <label for="price">Price per Night ($)</label>
        <input v-model="form.price" type="number" id="price" placeholder="Enter price" required />
      </div>

      <!-- Location Details -->
      <div>
        <label for="country">Country</label>
        <input v-model="form.location.country" type="text" id="country" placeholder="Enter country" required />
      </div>

      <div>
        <label for="state">State</label>
        <input v-model="form.location.state" type="text" id="state" placeholder="Enter state" />
      </div>

      <div>
        <label for="city">City</label>
        <input v-model="form.location.city" type="text" id="city" placeholder="Enter city" required />
      </div>

      <div>
        <label for="address">Address</label>
        <input v-model="form.location.address" type="text" id="address" placeholder="Enter address" />
      </div>

      <!-- Amenities -->
      <div>
        <label>Amenities</label>
        <div>
          <label v-for="amenity in availableAmenities" :key="amenity">
            <input
              type="checkbox"
              :value="amenity"
              v-model="selectedAmenities"
            />
            {{ amenity }}
          </label>
        </div>
      </div>

      <!-- Availability -->
      <div>
        <label>Availability</label>
        <div v-for="(slot, index) in form.availability" :key="index" class="availability-slot">
          <input
            type="date"
            v-model="slot.date"
            placeholder="Select date"
            required
          />
          <select v-model="slot.available">
            <option :value="true">Available</option>
            <option :value="false">Not Available</option>
          </select>
          <button type="button" @click="removeAvailability(index)">Remove</button>
        </div>
        <button type="button" @click="addAvailability">Add Availability</button>
      </div>

      <!-- Images -->
      <div>
        <label for="images">Upload Images</label>
        <input type="file" id="images" multiple @change="handleFileChange" />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Submitting...' : 'Add Listing' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.add-listing {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

form div {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.8rem;
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

.availability-slot {
  display: flex;
  gap: 1rem;
  align-items: center;
}
</style>