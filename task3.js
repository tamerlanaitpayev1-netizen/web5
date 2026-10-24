/**
 * ============================================================================
 * Task 3: Form with Live Validation & Live Preview
 * Option A: Event Ticket Builder with Inventory & Constraint Validation API
 * 
 * Course: Web Technologies (AITU) - Assignment #5
 * Student: Aitpayev Tamerlan | Group: IT-2510
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. CONSTANTS & INVENTORY DATA
// ----------------------------------------------------------------------------
const TICKET_TIERS = [
  {
    type: 'standard',
    name: 'Standard Pass',
    price: 50,
    seatsLeft: 12,
    perks: 'General Admission & Material Kit'
  },
  {
    type: 'vip',
    name: 'VIP All-Access',
    price: 150,
    seatsLeft: 4,
    perks: 'Keynote Lounge, Networking Dinner & Workshop'
  },
  {
    type: 'student',
    name: 'Student Pass',
    price: 25,
    seatsLeft: 8,
    perks: 'General Admission & Mentorship Sessions'
  }
];

const BLACKOUT_DATES = [
  '2026-11-15',
  '2026-12-25',
  '2026-12-31'
];

const VALID_PROMO_CODES = {
  'AITU20': { discount: 0.20, label: '20% AITU University Discount' },
  'DEV2026': { discount: 0.15, label: '15% Early Developer Discount' },
  'STUDENT50': { discount: 0.50, label: '50% Student Scholarship Discount' }
};

// ----------------------------------------------------------------------------
// 2. DOM ELEMENT REFERENCES
// ----------------------------------------------------------------------------
const formEl = document.getElementById('ticket-form');
const errorSummaryEl = document.getElementById('form-error-summary');
const errorCountTextEl = document.getElementById('error-count-text');

const eventSelectEl = document.getElementById('field-event');
const dateInputEl = document.getElementById('field-date');
const typeSelectEl = document.getElementById('field-type');
const quantityInputEl = document.getElementById('field-quantity');
const nameInputEl = document.getElementById('field-name');
const emailInputEl = document.getElementById('field-email');
const promoInputEl = document.getElementById('field-promo');

const previewEventEl = document.getElementById('preview-event-name');
const previewTierEl = document.getElementById('preview-tier-name');
const previewDateEl = document.getElementById('preview-date-text');
const previewNameEl = document.getElementById('preview-attendee-name');
const previewEmailEl = document.getElementById('preview-attendee-email');
const previewQtyEl = document.getElementById('preview-quantity-text');
const previewBasePriceEl = document.getElementById('preview-base-price');
const previewDiscountRowEl = document.getElementById('preview-discount-row');
const previewDiscountTextEl = document.getElementById('preview-discount-text');
const previewTotalPriceEl = document.getElementById('preview-total-price');
const seatsLeftHintEl = document.getElementById('seats-left-hint');

const successCardEl = document.getElementById('booking-success-card');
const successReceiptContainerEl = document.getElementById('success-receipt-container');
const btnBookAnotherEl = document.getElementById('btn-book-another');

// ----------------------------------------------------------------------------
// 3. VALIDATION TRACKING STATE
// ----------------------------------------------------------------------------
const touchedFields = new Set();

// ----------------------------------------------------------------------------
// 4. RULE VALIDATION FUNCTIONS
// ----------------------------------------------------------------------------
function validateTicketInventory() {
  const selectedType = typeSelectEl.value;
  const quantity = parseInt(quantityInputEl.value, 10);
  const tierObj = TICKET_TIERS.find(t => t.type === selectedType);

  if (!tierObj) {
    return { isValid: false, message: 'Please select a valid ticket tier.' };
  }

  if (isNaN(quantity) || quantity < 1) {
    return { isValid: false, message: 'Quantity must be at least 1 ticket.' };
  }

  if (quantity > tierObj.seatsLeft) {
    return {
      isValid: false,
      message: `Capacity exceeded: Only ${tierObj.seatsLeft} ${tierObj.name} seats remaining in inventory.`
    };
  }

  return { isValid: true, message: '' };
}

function validateEventDate() {
  const dateVal = dateInputEl.value;
  if (!dateVal) {
    return { isValid: false, message: 'Event date is required.' };
  }

  if (BLACKOUT_DATES.includes(dateVal)) {
    return {
      isValid: false,
      message: 'This date is completely sold out or closed for registration. Please select another date.'
    };
  }

  const selectedDate = new Date(dateVal + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = selectedDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { isValid: false, message: 'Cannot select a date in the past.' };
  }

  if (diffDays < 2) {
    return {
      isValid: false,
      message: 'Advance notice required: Ticket bookings must be made at least 2 days prior to the event.'
    };
  }

  return { isValid: true, message: '' };
}

function validatePromoCode() {
  const code = promoInputEl.value.trim().toUpperCase();
  if (code === '') {
    return { isValid: true, discountRate: 0, message: '' };
  }

  if (Object.prototype.hasOwnProperty.call(VALID_PROMO_CODES, code)) {
    const promo = VALID_PROMO_CODES[code];
    return { isValid: true, discountRate: promo.discount, message: `Promo applied: ${promo.label}` };
  }

  return {
    isValid: false,
    discountRate: 0,
    message: 'Unrecognized promo code. Try "AITU20", "DEV2026", or "STUDENT50".'
  };
}

function validateFullName() {
  const name = nameInputEl.value.trim();
  if (!name) {
    return { isValid: false, message: 'Full name is required.' };
  }

  const nameRegex = /^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі\- ]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: 'Full name must contain only letters and hyphens (no numbers or symbols).' };
  }

  const tokens = name.split(/\s+/).filter(part => part.length > 0);
  if (tokens.length < 2) {
    return { isValid: false, message: 'Please enter both your First Name and Last Name (at least two words).' };
  }

  for (const token of tokens) {
    if (token.length < 2) {
      return { isValid: false, message: 'Each name token must be at least 2 characters long.' };
    }
  }

  return { isValid: true, message: '' };
}

function validateEmail() {
  const email = emailInputEl.value.trim();
  if (!email) {
    return { isValid: false, message: 'Email address is required.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. student@astanait.edu.kz).' };
  }

  return { isValid: true, message: '' };
}

// ----------------------------------------------------------------------------
// 5. FIELD VALIDATION DISPATCHER
// ----------------------------------------------------------------------------
function validateField(inputEl, isSubmitting = false) {
  const fieldId = inputEl.id;
  const isTouched = touchedFields.has(fieldId) || isSubmitting;

  let validationResult = { isValid: true, message: '' };

  switch (fieldId) {
    case 'field-name':
      validationResult = validateFullName();
      break;
    case 'field-email':
      validationResult = validateEmail();
      break;
    case 'field-date':
      validationResult = validateEventDate();
      break;
    case 'field-type':
    case 'field-quantity':
      validationResult = validateTicketInventory();
      break;
    case 'field-promo':
      validationResult = validatePromoCode();
      break;
    case 'field-event':
      if (!eventSelectEl.value) {
        validationResult = { isValid: false, message: 'Please select an event.' };
      }
      break;
  }

  if (!validationResult.isValid) {
    inputEl.setCustomValidity(validationResult.message);
  } else {
    inputEl.setCustomValidity('');
  }

  const formGroup = inputEl.closest('.form-group');
  if (!formGroup) return validationResult.isValid;

  const errorEl = formGroup.querySelector('.field-error');

  if (isTouched) {
    if (!validationResult.isValid) {
      formGroup.classList.add('has-error');
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');
      inputEl.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = validationResult.message;
      }
    } else {
      formGroup.classList.remove('has-error');
      inputEl.classList.remove('is-invalid');
      if (inputEl.value.trim() !== '') {
        inputEl.classList.add('is-valid');
      } else {
        inputEl.classList.remove('is-valid');
      }
      inputEl.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
      }
    }
  }

  return validationResult.isValid;
}

// ----------------------------------------------------------------------------
// 6. LIVE PREVIEW UPDATE
// ----------------------------------------------------------------------------
function updateLiveTicketPreview() {
  const selectedEventOption = eventSelectEl.options[eventSelectEl.selectedIndex];
  previewEventEl.textContent = selectedEventOption ? selectedEventOption.text : 'Select an Event';

  const selectedType = typeSelectEl.value;
  const tierObj = TICKET_TIERS.find(t => t.type === selectedType) || TICKET_TIERS[0];
  previewTierEl.textContent = tierObj.name;
  seatsLeftHintEl.textContent = `${tierObj.seatsLeft} seats left (${tierObj.perks})`;

  if (dateInputEl.value) {
    const d = new Date(dateInputEl.value + 'T00:00:00');
    previewDateEl.textContent = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } else {
    previewDateEl.textContent = 'Date: TBD';
  }

  previewNameEl.textContent = nameInputEl.value.trim() || 'Attendee Name';
  previewEmailEl.textContent = emailInputEl.value.trim() || 'attendee@example.com';

  const qty = parseInt(quantityInputEl.value, 10) || 1;
  previewQtyEl.textContent = `${qty} ${qty === 1 ? 'Pass' : 'Passes'}`;

  const baseTotal = tierObj.price * qty;
  previewBasePriceEl.textContent = `$${baseTotal.toFixed(2)}`;

  const promoRes = validatePromoCode();
  const discountAmount = promoRes.isValid && promoRes.discountRate > 0 
    ? baseTotal * promoRes.discountRate 
    : 0;

  if (discountAmount > 0) {
    previewDiscountRowEl.style.display = 'flex';
    previewDiscountTextEl.textContent = `-$${discountAmount.toFixed(2)} (${Math.round(promoRes.discountRate * 100)}%)`;
  } else {
    previewDiscountRowEl.style.display = 'none';
  }

  const finalTotal = Math.max(0, baseTotal - discountAmount);
  previewTotalPriceEl.textContent = `$${finalTotal.toFixed(2)}`;
}

// ----------------------------------------------------------------------------
// 7. FORM SUBMISSION HANDLER
// ----------------------------------------------------------------------------
function handleFormSubmit(event) {
  event.preventDefault();

  const allFields = [
    eventSelectEl,
    dateInputEl,
    typeSelectEl,
    quantityInputEl,
    nameInputEl,
    emailInputEl,
    promoInputEl
  ];

  allFields.forEach(f => touchedFields.add(f.id));

  let invalidFieldCount = 0;
  let firstInvalidEl = null;

  for (const field of allFields) {
    const isValid = validateField(field, true);
    if (!isValid) {
      invalidFieldCount++;
      if (!firstInvalidEl) {
        firstInvalidEl = field;
      }
    }
  }

  if (invalidFieldCount > 0) {
    errorSummaryEl.style.display = 'flex';
    errorCountTextEl.textContent = `Form contains ${invalidFieldCount} ${invalidFieldCount === 1 ? 'error' : 'errors'}. Please review the highlighted fields below.`;
    
    if (firstInvalidEl) {
      firstInvalidEl.focus();
    }
    return;
  }

  errorSummaryEl.style.display = 'none';

  buildSuccessConfirmation();

  formEl.reset();
  touchedFields.clear();

  allFields.forEach(f => {
    f.classList.remove('is-valid', 'is-invalid');
    const group = f.closest('.form-group');
    if (group) group.classList.remove('has-error');
  });

  updateLiveTicketPreview();
}

function buildSuccessConfirmation() {
  const bookingCode = `TKT-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  while (successReceiptContainerEl.firstChild) {
    successReceiptContainerEl.removeChild(successReceiptContainerEl.firstChild);
  }

  const receiptCard = document.createElement('div');
  receiptCard.classList.add('card');
  receiptCard.style.border = '1px solid var(--border-strong)';
  receiptCard.style.backgroundColor = 'var(--bg-surface-elevated)';
  receiptCard.style.padding = '1.25rem';
  receiptCard.style.marginTop = '0.75rem';

  const h3 = document.createElement('h3');
  h3.classList.add('card-title');
  h3.style.fontSize = '1.05rem';
  h3.textContent = 'Pass Reference Generated';

  const pCode = document.createElement('p');
  pCode.style.fontSize = '0.9375rem';
  pCode.style.margin = '0.5rem 0';
  pCode.textContent = 'Reference Code: ';
  
  const strongCode = document.createElement('strong');
  strongCode.style.fontFamily = 'var(--font-mono)';
  strongCode.style.color = 'var(--color-primary)';
  strongCode.textContent = bookingCode;
  pCode.appendChild(strongCode);

  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.display = 'flex';
  ul.style.flexDirection = 'column';
  ul.style.gap = '0.3rem';
  ul.style.margin = '0.75rem 0 0 0';
  ul.style.fontSize = '0.875rem';
  ul.style.color = 'var(--text-secondary)';

  const details = [
    `Summit: ${eventSelectEl.options[eventSelectEl.selectedIndex].text}`,
    `Date: ${dateInputEl.value}`,
    `Attendee: ${nameInputEl.value.trim()}`,
    `Tier: ${typeSelectEl.options[typeSelectEl.selectedIndex].text}`,
    `Quantity: ${quantityInputEl.value} Pass(es)`,
    `Total Charged: ${previewTotalPriceEl.textContent}`
  ];

  for (const text of details) {
    const li = document.createElement('li');
    li.textContent = `— ${text}`;
    ul.appendChild(li);
  }

  receiptCard.appendChild(h3);
  receiptCard.appendChild(pCode);
  receiptCard.appendChild(ul);

  successReceiptContainerEl.appendChild(receiptCard);
  successCardEl.classList.add('is-visible');
  successCardEl.scrollIntoView({ behavior: 'smooth' });
}

// ----------------------------------------------------------------------------
// 8. EVENT ATTACHMENTS
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  formEl.noValidate = true;

  const monitoredFields = [
    eventSelectEl,
    dateInputEl,
    typeSelectEl,
    quantityInputEl,
    nameInputEl,
    emailInputEl,
    promoInputEl
  ];

  monitoredFields.forEach(field => {
    field.addEventListener('blur', () => {
      touchedFields.add(field.id);
      validateField(field);
    });

    field.addEventListener('input', () => {
      if (touchedFields.has(field.id)) {
        validateField(field);
      }
      updateLiveTicketPreview();
    });

    field.addEventListener('change', () => {
      if (touchedFields.has(field.id)) {
        validateField(field);
      }
      updateLiveTicketPreview();
    });
  });

  typeSelectEl.addEventListener('change', () => {
    if (touchedFields.has(quantityInputEl.id)) {
      validateField(quantityInputEl);
    }
  });

  formEl.addEventListener('submit', handleFormSubmit);

  if (btnBookAnotherEl) {
    btnBookAnotherEl.addEventListener('click', () => {
      successCardEl.classList.remove('is-visible');
      formEl.scrollIntoView({ behavior: 'smooth' });
      nameInputEl.focus();
    });
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateIso = minDate.toISOString().split('T')[0];
  dateInputEl.min = minDateIso;

  updateLiveTicketPreview();
});
