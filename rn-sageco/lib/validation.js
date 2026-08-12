/**
 * SageCo Evergreen — Input Validation Utilities
 * ==============================================
 * Fixes audit finding: "No input validation on API routes"
 * Provides reusable validation for all forms and API inputs.
 */

// ─── Email Validation ──────────────────────────────────────────
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ─── Phone Validation (Ugandan format) ─────────────────────────
// Accepts: 07XXXXXXXX, +2567XXXXXXXX, 2567XXXXXXXX
export function isValidUgPhone(phone) {
  const cleaned = phone.replace(/\s|-/g, '');
  const phoneRegex = /^(?:\+?256|0)?7\d{8}$/;
  return phoneRegex.test(cleaned);
}

// Normalize phone to international format (2567XXXXXXXX)
export function normalizePhone(phone) {
  const cleaned = phone.replace(/\s|-/g, '').replace(/^\+/, '');
  if (cleaned.startsWith('256')) return cleaned;
  if (cleaned.startsWith('0')) return '256' + cleaned.slice(1);
  return cleaned;
}

// ─── Price Validation ──────────────────────────────────────────
export function isValidPrice(price) {
  const num = parseFloat(price);
  return !isNaN(num) && num > 0 && num < 100000000000; // Max 100 billion UGX
}

// ─── Required Field Check ──────────────────────────────────────
export function validateRequired(data, fields) {
  const errors = {};
  for (const field of fields) {
    if (!data[field] || String(data[field]).trim() === '') {
      errors[field] = `${field.replace(/_/g, ' ')} is required`;
    }
  }
  return errors;
}

// ─── Property Validation ───────────────────────────────────────
export function validateProperty(data) {
  const errors = {};

  // Title: required, 5-100 chars
  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be under 100 characters';
  }

  // Price: required, positive number
  if (!data.price || !isValidPrice(data.price)) {
    errors.price = 'Price must be a positive number';
  }

  // Location: required
  if (!data.location || data.location.trim().length < 3) {
    errors.location = 'Location is required';
  }

  // Category: must be one of valid categories
  const validCategories = ['Residential', 'Commercial', 'Land', 'Green Project'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.category = 'Invalid category';
  }

  // Optional numeric fields
  if (data.bedrooms && isNaN(parseInt(data.bedrooms))) {
    errors.bedrooms = 'Bedrooms must be a number';
  }
  if (data.bathrooms && isNaN(parseInt(data.bathrooms))) {
    errors.bathrooms = 'Bathrooms must be a number';
  }
  if (data.area_sqft && isNaN(parseFloat(data.area_sqft))) {
    errors.area_sqft = 'Area must be a number';
  }

  return errors;
}

// ─── Booking Validation ───────────────────────────────────────
export function validateBooking(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Name is required';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.phone || !isValidUgPhone(data.phone)) {
    errors.phone = 'Valid Ugandan phone number required (e.g. 07XX XXX XXX)';
  }

  // Date: if provided, must be a valid date and in the future
  if (data.date) {
    const parsed = new Date(data.date);
    if (isNaN(parsed.getTime())) {
      errors.date = 'Invalid date format';
    } else if (parsed < new Date()) {
      errors.date = 'Date must be in the future';
    }
  }

  return errors;
}

// ─── Broker Registration Validation ────────────────────────────
export function validateBroker(data) {
  const errors = {};

  if (!data.full_name || data.full_name.trim().length < 3) {
    errors.full_name = 'Full name is required (min 3 characters)';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required';
  }

  if (!data.phone || !isValidUgPhone(data.phone)) {
    errors.phone = 'Valid Ugandan phone number required';
  }

  if (!data.location || data.location.trim().length < 2) {
    errors.location = 'Location is required';
  }

  return errors;
}

// ─── Sanitize String Input (prevent XSS) ──────────────────────
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')     // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove JS protocol
    .trim();
}
