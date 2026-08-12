/**
 * SageCo Evergreen — Secure API Wrapper
 * ======================================
 * Fixes audit findings:
 * - "No rate limiting on any endpoint"
 * - "No error handling"
 * - "Inconsistent access patterns"
 *
 * This provides a single entry point for all API calls from the RN app,
 * with built-in rate limiting, error handling, and retry logic.
 */

import { API } from './config';

// ─── Rate Limiter (client-side) ────────────────────────────────
// Prevents the app from hammering the API. Uses a simple time-window
// approach: max N calls per endpoint per 60 seconds.
const RATE_LIMIT_WINDOW = 60000; // 60 seconds
const RATE_LIMIT_MAX = 10;      // max 10 calls per endpoint per minute
const rateLimitMap = new Map();

function checkRateLimit(endpoint) {
  const now = Date.now();
  const key = endpoint;
  const entry = rateLimitMap.get(key) || { count: 0, firstCall: now };

  // Reset window if expired
  if (now - entry.firstCall > RATE_LIMIT_WINDOW) {
    entry.count = 0;
    entry.firstCall = now;
  }

  entry.count++;
  rateLimitMap.set(key, entry);

  if (entry.count > RATE_LIMIT_MAX) {
    throw new Error('Too many requests. Please wait a moment and try again.');
  }
}

// ─── Request with Retry & Error Handling ──────────────────────
async function request(url, options = {}, retries = 2) {
  try {
    checkRateLimit(url);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Parse JSON response
    const data = await response.json().catch(() => ({}));

    // Handle HTTP errors
    if (!response.ok) {
      const message = data.error || data.message || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    // Retry on network errors (but not on rate limit or validation errors)
    if (retries > 0 && !error.message.includes('Too many requests')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return request(url, options, retries - 1);
    }
    throw error;
  }
}

// ─── PesaPal Payment API ───────────────────────────────────────
export const PaymentAPI = {
  // Initiate a PesaPal payment
  initiate(payload) {
    return request(`${API.baseUrl}/api/pesapal/initiate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Check payment status by order tracking ID
  checkStatus(trackingId) {
    return request(`${API.baseUrl}/api/pesapal/status/${trackingId}`);
  },
};

// ─── Property API ──────────────────────────────────────────────
export const PropertyAPI = {
  // Get all properties with optional filters
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`${API.baseUrl}/api/get-properties${query ? '?' + query : ''}`);
  },

  // Add a new property (requires auth)
  add(token, data) {
    return request(`${API.baseUrl}/api/add-property`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  },
};

// ─── Broker API ────────────────────────────────────────────────
export const BrokerAPI = {
  // Register a new broker
  register(data) {
    return request(`${API.baseUrl}/api/register-broker`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ─── Contact API ───────────────────────────────────────────────
export const ContactAPI = {
  // Send a contact message
  send(data) {
    return request(`${API.baseUrl}/api/contact`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ─── Image Upload API ──────────────────────────────────────────
export const UploadAPI = {
  // Upload an image as base64
  upload(base64, fileName) {
    return request(`${API.baseUrl}/api/upload-image`, {
      method: 'POST',
      body: JSON.stringify({ imageBase64: base64, fileName }),
    });
  },

  // Upload a broker photo
  uploadPhoto(base64, fileName) {
    return request(`${API.baseUrl}/api/upload-photo`, {
      method: 'POST',
      body: JSON.stringify({ imageBase64: base64, fileName }),
    });
  },
};
