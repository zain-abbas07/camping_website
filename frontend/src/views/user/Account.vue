<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = JSON.parse(localStorage.getItem('user'));
const userId = user?.id || null;

const form = ref({ name: '', email: '', username: '', phoneNumber: '' });
const editField = ref(null); // Tracks which field is being edited
const newValue = ref(''); // Stores the new value to be updated
const confirmValue = ref(''); // Stores the confirmation value
const password = ref(''); // Stores the password for validation
const loading = ref(false);
const showDeleteModal = ref(false);
const showPasswordModal = ref(false); // Tracks if the password validation modal is visible
const showUpdateModal = ref(false); // Tracks if the update confirmation modal is visible
const showErrorModal = ref(false); // Tracks if the error modal is visible
const errorMessage = ref(''); // Stores the error message for the error modal

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost:3000/users/${userId}`);
    form.value = {
      name: res.data.user.name,
      email: res.data.user.email,
      username: res.data.user.username,
      phoneNumber: res.data.user.phoneNumber || '',
    };
  } catch (err) {
    console.error('Failed to fetch user info', err);
    showError('Failed to load account details.');
  }
});

const startEdit = (field) => {
  editField.value = field;
  password.value = '';
  newValue.value = '';
  confirmValue.value = '';
  showPasswordModal.value = true;
};

const cancelEdit = () => {
  editField.value = null;
};

const showError = (message) => {
  errorMessage.value = message;
  showErrorModal.value = true;
};

const validatePassword = async () => {
  try {
    loading.value = true;
    await axios.post(`http://localhost:3000/users/${userId}/verify-password`, {
      password: password.value,
    });
    showPasswordModal.value = false;
    showUpdateModal.value = true;
  } catch (err) {
    console.error('Password validation failed', err);
    showError('Incorrect password. Please try again.');
  } finally {
    loading.value = false;
  }
};

const validateUpdate = () => {
  if (!newValue.value || !confirmValue.value) {
    showError(`New ${editField.value} and confirmation are required.`);
    return false;
  }
  if (newValue.value !== confirmValue.value) {
    showError(`New ${editField.value} and confirmation do not match.`);
    return false;
  }
  return true;
};

const confirmUpdate = () => {
  if (validateUpdate()) {
    showUpdateModal.value = true;
  }
};

const updateField = async () => {
  try {
    loading.value = true;
    if (editField.value === 'password') {
      // Send to the password endpoint with both current and new password
      await axios.put(`http://localhost:3000/users/${userId}/password`, {
        currentPassword: password.value,
        newPassword: newValue.value,
      });
      alert('Password updated successfully!');
    } else {
      // For other fields, update as before
      await axios.put(`http://localhost:3000/users/${userId}`, {
        [editField.value]: newValue.value,
      });
      form.value[editField.value] = newValue.value;
      alert(`${editField.value} updated successfully!`);
    }
    cancelEdit();
  } catch (err) {
    console.error(`Failed to update ${editField.value}`, err);
    showError(err.response?.data?.error || `Failed to update ${editField.value}.`);
  } finally {
    loading.value = false;
    showUpdateModal.value = false;
  }
};

const deleteAccount = async () => {
  try {
    loading.value = true;
    await axios.post(`http://localhost:3000/users/${userId}/verify-password`, {
      password: password.value,
    });
    await axios.delete(`http://localhost:3000/users/${userId}`);
    alert('Account deleted successfully.');
    localStorage.removeItem('user');
    if (typeof auth !== 'undefined' && auth.logoutUser) {
      auth.logoutUser();
    }
    router.push('/signup').then(() => window.location.reload());
  } catch (err) {
    console.error('Failed to delete account', err);
    showError('Incorrect password or failed to delete account. Please try again.');
  } finally {
    loading.value = false;
    showDeleteModal.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-green-200 via-green-100 to-green-300 py-12 flex items-center justify-center">
    <div class="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
       <h1 class="text-3xl font-heading font-bold text-green-700 mb-6 text-center">My Account</h1>

      <!-- User Info Section -->
      <div class="space-y-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0 w-16 h-16 bg-green-200 rounded-full flex items-center justify-center text-2xl font-bold text-green-700">
            {{ form.name?.charAt(0) || 'U' }}
          </div>
          <div>
            <p class="text-xl font-semibold text-gray-800">{{ form.name }}</p>
            <p class="text-gray-500">{{ form.email }}</p>
            <p class="text-gray-400 text-sm">Username: {{ form.username }}</p>
            <p class="text-gray-400 text-sm">Phone: {{ form.phoneNumber || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Editable Fields -->
      <div class="divide-y divide-gray-200">
        <div class="py-4 flex items-center justify-between">
          <span class="font-medium text-gray-700">Name</span>
          <span class="text-gray-900">{{ form.name }}</span>
          <button
            class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 text-sm font-semibold"
            @click="startEdit('name')"
          >Change</button>
        </div>
        <div class="py-4 flex items-center justify-between">
          <span class="font-medium text-gray-700">Email</span>
          <span class="text-gray-900">{{ form.email }}</span>
          <button
            class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 text-sm font-semibold"
            @click="startEdit('email')"
          >Change</button>
        </div>
        <div class="py-4 flex items-center justify-between">
          <span class="font-medium text-gray-700">Username</span>
          <span class="text-gray-900">{{ form.username }}</span>
          <button
            class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 text-sm font-semibold"
            @click="startEdit('username')"
          >Change</button>
        </div>
        <div class="py-4 flex items-center justify-between">
          <span class="font-medium text-gray-700">Phone Number</span>
          <span class="text-gray-900">{{ form.phoneNumber || 'N/A' }}</span>
          <button
            class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 text-sm font-semibold"
            @click="startEdit('phoneNumber')"
          >Change</button>
        </div>
      </div>

      <!-- Password Section -->
      <div class="mt-8 flex items-center justify-between">
        <span class="font-medium text-gray-700">Password</span>
        <button
          class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 text-sm font-semibold"
          @click="startEdit('password')"
        >Change Password</button>
      </div>

      <!-- Delete Account -->
      <div class="mt-8 text-center">
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 font-semibold"
          @click="showDeleteModal = true"
        >
          Delete Account
        </button>
      </div>
    </div>

    <!-- Modals -->
    <div v-if="showPasswordModal" class="modal">
      <div class="modal-content">
        <p class="mb-4">Please enter your password to proceed.</p>
        <input
          v-model="password"
          type="password"
          placeholder="Enter your password"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg "
        />
        <div class="flex justify-end gap-2 mt-4">
          <button
            @click="validatePassword"
            :disabled="loading"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {{ loading ? 'Validating...' : 'Submit' }}
          </button>
          <button
            @click="showPasswordModal = false"
            class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="editField && showUpdateModal" class="modal">
      <div class="modal-content">
        <h2 class="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors duration-200 text-sm font-semibold">
          Change {{ editField }}
        </h2>
        <label class="block mb-2" :for="editField">New {{ editField }}</label>
        <input
          v-model="newValue"
          :id="editField"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg "
        />
        <label class="block mb-2" :for="'confirm' + editField">Confirm New {{ editField }}</label>
        <input
          v-model="confirmValue"
          :id="'confirm' + editField"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg "
        />
        <div class="flex justify-end gap-2">
          <button
            @click="updateField"
            :disabled="loading"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {{ loading ? 'Updating...' : 'Update' }}
          </button>
          <button
            @click="cancelEdit"
            class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <p class="mb-4">Please enter your password to delete your account.</p>
        <input
          v-model="password"
          type="password"
          placeholder="Enter your password"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg "
        />
        <div class="flex justify-end gap-2 mt-4">
          <button
            @click="deleteAccount"
            :disabled="loading"
            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            {{ loading ? 'Deleting...' : 'Yes, Delete' }}
          </button>
          <button
            @click="showDeleteModal = false"
            class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >Cancel</button>
        </div>
      </div>
    </div>

    <div v-if="showErrorModal" class="modal">
      <div class="modal-content">
        <p>{{ errorMessage }}</p>
        <button
          @click="showErrorModal = false"
          class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 mt-4"
        >Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-heading {
  font-family: var(--font-heading);
}
.modal {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal-content {
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  text-align: left;
}
</style>