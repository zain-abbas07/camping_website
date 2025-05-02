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
    await axios.put(`http://localhost:3000/users/${userId}`, {
      [editField.value]: newValue.value,
    });
    form.value[editField.value] = newValue.value;
    cancelEdit();
    alert(`${editField.value} updated successfully!`);
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
    router.push('/signup');
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
  <div class="account">
    <h1>My Account</h1>

    <!-- Display User Info -->
    <div class="info">
      <p>
        <strong>Name:</strong> {{ form.name }}
        <button class="change-btn" @click="startEdit('name')">Change</button>
      </p>
      <p>
        <strong>Email:</strong> {{ form.email }}
        <button class="change-btn" @click="startEdit('email')">Change</button>
      </p>
      <p>
        <strong>Username:</strong> {{ form.username }}
        <button class="change-btn" @click="startEdit('username')">Change</button>
      </p>
      <p>
        <strong>Phone Number:</strong> {{ form.phoneNumber }}
        <button class="change-btn" @click="startEdit('phoneNumber')">Change</button>
      </p>
    </div>

    <!-- Password Validation Modal -->
    <div v-if="showPasswordModal" class="modal">
      <div class="modal-content">
        <p>Please enter your password to proceed.</p>
        <input v-model="password" type="password" placeholder="Enter your password" />
        <button @click="validatePassword" :disabled="loading">
          {{ loading ? 'Validating...' : 'Submit' }}
        </button>
        <button @click="showPasswordModal = false">Cancel</button>
      </div>
    </div>

    <!-- Edit Field -->
    <div v-if="editField && showUpdateModal" class="edit-field">
      <h2>Change {{ editField }}</h2>
      <label for="newValue">New {{ editField }}</label>
      <input v-model="newValue" id="newValue" type="text" required />

      <label for="confirmValue">Confirm New {{ editField }}</label>
      <input v-model="confirmValue" id="confirmValue" type="text" required />

      <button @click="updateField" :disabled="loading">
        {{ loading ? 'Updating...' : 'Update' }}
      </button>
      <button @click="cancelEdit">Cancel</button>
    </div>

    <!-- Error Modal -->
    <div v-if="showErrorModal" class="modal">
      <div class="modal-content">
        <p>{{ errorMessage }}</p>
        <button @click="showErrorModal = false">Close</button>
      </div>
    </div>

    <hr />

    <!-- Delete Account -->
    <button class="delete-account" @click="showDeleteModal = true">
      Delete Account
    </button>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal">
      <div class="modal-content">
        <p>Please enter your password to delete your account.</p>
        <input v-model="password" type="password" placeholder="Enter your password" />
        <button @click="deleteAccount" :disabled="loading">
          {{ loading ? 'Deleting...' : 'Yes, Delete' }}
        </button>
        <button @click="showDeleteModal = false">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account {
  max-width: 600px;
  margin: auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info {
  margin-bottom: 2rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 0.6rem 1rem;
  background-color: #2e7d32;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

button.change-btn {
  padding: 0.3rem 0.5rem;
  font-size: 0.7rem;
  background-color: #4caf50;
}

button.change-btn:hover {
  background-color: #388e3c;
}

button.delete-account {
  background-color: #d32f2f;
}

button:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #1b5e20;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
}

.modal-content button {
  margin: 0.5rem;
}
</style>