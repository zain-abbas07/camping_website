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
    street: '',
    houseNumber: '',
    city: '',
    state: '',
    country: '',
  },
  amenities: [],
  availability: [],
  images: [],
});

const loading = ref(false);
const availableAmenities = ref([
  'Fire Pit',
  'Water Access',
  'Electricity',
  'Showers',
  'WiFi',
  'Parking',
  'Swimming Pool',
  'BBQ',
  'Pet Friendly',
]);
const selectedAmenities = ref([]);
const customAmenities = ref([{ id: Date.now(), name: '' }]);
const imagePreviews = ref([]);

const handleFileChange = (event) => {
  const files = Array.from(event.target.files);
  form.value.images = files;

  imagePreviews.value = files.map(file => URL.createObjectURL(file));
};


const addCustomAmenity = () => {
  showCustomAmenitySection.value = true; // Show the custom amenity section
  customAmenities.value.push({ id: Date.now(), name: '' });
};

const removeCustomAmenity = (id) => {
  customAmenities.value = customAmenities.value.filter((amenity) => amenity.id !== id);
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
  formData.append(
    'amenities',
    JSON.stringify([
      ...selectedAmenities.value,
      ...customAmenities.value.map((amenity) => amenity.name).filter((name) => name.trim() !== ''),
    ])
  );
  formData.append('availability', JSON.stringify(form.value.availability));

  form.value.images.forEach((image, index) => {
    formData.append(`images`, image);
  });
  console.log('Form data being sent:', formData); // Log the form data

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



const handleDrop = (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  form.value.images = files;
  imagePreviews.value = files.map(file => URL.createObjectURL(file));
};

const handleDragOver = (event) => {
  event.preventDefault();
};

const showModal = ref(false);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const confirmSubmit = () => {
  closeModal();
  submitListing(); // Call the actual form submit
};


</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-green-300 py-12 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
      <h1 class="text-3xl font-bold text-green-700 mb-8 text-center">Add a New Campsite</h1>
    <form @submit.prevent="submitListing">
      <!-- Basic Details -->
      <div>
        <label for="name">Campsite Name</label>
        <input v-model="form.name" type="text" id="name" placeholder="Enter campsite name" required />
      </div>

      <div>
          <label class="block text-gray-700 font-medium mb-1">Description</label>
          <textarea v-model="form.description" rows="5" class="input"></textarea>
        </div>

      <div>
        <label for="price">Price per Night ($)</label>
        <input v-model="form.price" type="number" id="price" placeholder="Enter price" required />
      </div>

      <!-- Location Details -->
      <div>
        <label for="street">Street Name</label>
        <input v-model="form.location.street" type="text" id="street" placeholder="Enter street name" required />
      </div>
      <div>
        <label for="houseNumber">House Number</label>
        <input v-model="form.location.houseNumber" type="text" id="houseNumber" placeholder="Enter house number" required />
      </div>
      <div>
        <label for="city">City</label>
        <input v-model="form.location.city" type="text" id="city" placeholder="Enter city" required />
      </div>
      <div>
        <label for="state">State/Province</label>
        <input v-model="form.location.state" type="text" id="state" placeholder="Enter state/province" />
      </div>
      <div>
        <label for="country">Country</label>
        <input v-model="form.location.country" type="text" id="country" placeholder="Enter country" required />
      </div>

      <!-- Amenities -->
      <div>
          <label class="block text-gray-700 font-medium mb-1">Amenities</label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label v-for="amenity in availableAmenities" :key="amenity" class="flex items-center gap-2 text-gray-700">
              <input type="checkbox" :value="amenity" v-model="selectedAmenities" class="rounded border-gray-300 text-green-600 focus:ring-green-500" />
              <span>{{ amenity }}</span>
            </label>
          </div>
        
        <button type="button" @click="addCustomAmenity">Add Custom Amenity</button>

        <div v-if="showCustomAmenitySection">
          <h3>Custom Amenities</h3>
          <ul>
            <li v-for="(amenity, index) in customAmenities" :key="amenity.id">
              <input
                v-model="amenity.name"
                type="text"
                placeholder="Enter custom amenity"
              />
              <button type="button" @click="removeCustomAmenity(amenity.id)">Remove</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Images -->
      <!-- Image Upload -->
      <div>
        <label>Upload Images</label>
        <div
          class="image-upload-dropzone"
          @dragover="handleDragOver"
          @drop="handleDrop"
          @click="$refs.fileInput.click()"
        >
          <p>Click or drag images here to upload</p>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            multiple
            accept="image/*"
            @change="handleFileChange"
          />
        </div>

        <!-- Preview Thumbnails -->
        <div class="image-preview-grid" v-if="imagePreviews.length">
          <div v-for="(img, index) in imagePreviews" :key="index" class="thumbnail">
            <img :src="img" alt="Preview" />
          </div>
        </div>
      </div>

      <button type="button" @click="openModal" :disabled="loading">
        {{ loading ? 'Submitting...' : 'Add Listing' }}
      </button>

      <!-- <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300">
          Add Listing
        </button> -->

      <!-- Confirmation Modal -->
<div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
  <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
    <h3 class="text-lg font-semibold mb-4">Confirm Listing</h3>
    <p class="text-gray-600 mb-6">
      Are you sure you want to submit the listing for
      <strong>{{ form.name || 'your campsite' }}</strong> at
      <strong>{{ form.location.city || 'the selected city' }}</strong>?
    </p>
    <div class="flex justify-end space-x-3">
    <button
      @click="closeModal"
      class="cancel-btn px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300"
    >
      Cancel
    </button>
    <button
      @click="confirmSubmit"
      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
      :disabled="loading"
    >
      Confirm
    </button>
  </div>

  </div>
</div>


      
    </form>
  </div>
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
.add-listing-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2e7d32;
  text-align: center;
  margin-bottom: 2rem;
  letter-spacing: 0.01em;
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
.cancel-btn {
  background: #fff;
  color: #2e7d32;
  border: 1px solid #ccc;
  margin-right: 1rem;
  transition: background 0.2s;
}
.cancel-btn:hover {
  background: #f5f5f5;
}
.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Two columns */
  gap: 0.5rem 1.5rem;
  margin-top: 0.5rem;
}

.amenity-item {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem;
}
.image-upload-dropzone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #777;
  cursor: pointer;
  background-color: #fafafa;
  transition: border 0.3s ease;
}

.image-upload-dropzone:hover {
  border-color: #2e7d32;
}

.image-preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ccc;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #b2dfdb;
  border-radius: 8px;
  background: #f9fafb;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
.input:focus {
  border-color: #43a047;
  background: #fff;
}

</style>