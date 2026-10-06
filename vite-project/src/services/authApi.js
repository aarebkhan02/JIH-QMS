import { api } from './api.js';
import { getRefreshToken, clearAuth } from '../utils/auth.js';

/**
 * Calls backend POST /api/v1/auth/logout to atomically revoke
 * the active access token and refresh token on the server.
 *
 * Always clears client-side credentials in finally block.
 *
 * @returns {Promise<string>} The status message
 */
export async function logoutUser() {
  const refreshToken = getRefreshToken();
  let message = 'You have been signed out.';

  try {
    if (refreshToken) {
      const response = await api.post('/api/v1/auth/logout', { refreshToken });
      if (response.data?.message) {
        message = response.data.message;
      }
    }
  } catch (error) {
    console.warn(
      'Backend logout notice (proceeding with local signout):',
      error?.response?.data?.message || error.message
    );
  } finally {
    clearAuth();
  }

  return message;
}
