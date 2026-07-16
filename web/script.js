/* ============================================
   SIMSALACLEAN — SCRIPT.JS
   ============================================ */

// --- Google Sheets Integration ---
// TODO: Ganti SHEET_URL dengan URL Google Apps Script Web App kamu setelah setup
// Cara setup: https://developers.google.com/apps-script/guides/web
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxP4BNcLLcE0ovKnJTZMDxwsLxLNSFN9sIhwwZnDlkIwBc8_QYQCwkbOq9jue_r94aM7w/exec';

// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// --- Hamburger menu ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// --- Success Modal ---
function openSuccess(nama, instagram) {
  document.getElementById('successName').textContent = nama;
  document.getElementById('successIg').textContent = instagram;
  document.getElementById('successModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeSuccess() {
  document.getElementById('successModal').classList.remove('active');
  document.body.style.overflow = '';
}
function closeSuccessOutside(e) {
  if (e.target === document.getElementById('successModal')) closeSuccess();
}
function openPrivacy() {
  document.getElementById('privacyModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closePrivacy() {
  document.getElementById('privacyModal').classList.remove('active');
  document.body.style.overflow = '';
}
function closePrivacyOutside(e) {
  if (e.target === document.getElementById('privacyModal')) closePrivacy();
}
// Close modals on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePrivacy();
    closeSuccess();
  }
});

// --- FAQ accordion ---
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const icon = btn.querySelector('.faq-icon');
  const isOpen = answer.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-a.open').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.faq-icon.open').forEach(el => el.classList.remove('open'));

  // Open clicked if it was closed
  if (!isOpen) {
    answer.classList.add('open');
    icon.classList.add('open');
  }
}

// --- Form validation & submission ---
function validateForm(form) {
  let valid = true;
  // Remove previous errors
  form.querySelectorAll('.form-error').forEach(el => el.remove());
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  const nama = form.querySelector('input[name="nama"]');
  const instagram = form.querySelector('input[name="instagram"]');
  const privacy = form.querySelector('input[type="checkbox"]');

  if (!nama.value.trim()) {
    showError(nama, 'Nama tidak boleh kosong.');
    valid = false;
  }
  if (!instagram.value.trim()) {
    showError(instagram, 'Username Instagram tidak boleh kosong.');
    valid = false;
  } else if (instagram.value.trim().startsWith('@')) {
    showError(instagram, 'Masukkan username tanpa tanda @');
    valid = false;
  }
  if (!privacy.checked) {
    showError(privacy, 'Kamu harus menyetujui Privacy Policy untuk melanjutkan.');
    valid = false;
  }
  return valid;
}

function showError(input, message) {
  input.classList.add('error');
  const err = document.createElement('p');
  err.className = 'form-error';
  err.textContent = message;
  input.parentElement.insertAdjacentElement('afterend', err);
}

async function submitToSheets(data) {
  // If SHEET_URL is not configured, log and skip
  if (SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.log('[Simsalaclean] Google Sheets belum dikonfigurasi. Data:', data);
    return true; // Simulate success for now
  }
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return true;
  } catch (err) {
    console.error('[Simsalaclean] Gagal submit ke Sheets:', err);
    return false;
  }
}

function handleFormSubmit(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    const payload = {
      nama: form.querySelector('input[name="nama"]').value.trim(),
      instagram: form.querySelector('input[name="instagram"]').value.trim(),
      source: form.querySelector('input[name="source"]').value,
      timestamp: new Date().toISOString(),
    };

    const success = await submitToSheets(payload);

    if (success) {
      // Push GA4 lead event to dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'generate_lead',
        form_source: payload.source,   // 'hero' atau 'early-access'
        lead_type: 'early_access',
      });
      console.log('[Simsalaclean] dataLayer pushed:', window.dataLayer);

      // Show success modal and reset form
      openSuccess(payload.nama, payload.instagram);
      form.reset();
      form.querySelectorAll('.form-error').forEach(el => el.remove());
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Coba Lagi';
      const errMsg = document.createElement('p');
      errMsg.className = 'form-error';
      errMsg.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
      form.appendChild(errMsg);
    }
  });
}

// Initialize forms
handleFormSubmit(document.getElementById('heroForm'));
handleFormSubmit(document.getElementById('earlyForm'));

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
