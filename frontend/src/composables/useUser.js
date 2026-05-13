// ./frontend/src/composables/useUser.js

import { ref } from 'vue';

const user = ref(null);
const isLoading = ref(false);

export async function ensureToken() {
  if (localStorage.getItem('jwt_token')) return;
  try {
    const res = await fetch('/api/auth/dummy-login');
    const data = await res.json();
    if (data.token) localStorage.setItem('jwt_token', data.token);
  } catch (e) {
    console.error('Auto-login failed:', e);
  }
}

export function useUser() {
  const fetchUser = async () => {
    await ensureToken();
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      user.value = null;
      return;
    }

    isLoading.value = true;
    try {
      const response = await fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      user.value = await response.json();
      console.log("User state updated:", user.value);
    } catch (error) {
      console.error(error);
      user.value = null; // Сбрасываем пользователя при ошибке
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user,
    isLoading,
    fetchUser
  };
}