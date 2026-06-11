/* ============================================================
   ONLINE LIBRARY MANAGEMENT SYSTEM — script.js
   ============================================================ */

/* ── Live Date & Time ── */
function updateDateTime() {
  const el = document.getElementById('live-date');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  el.textContent = now.toLocaleDateString('en-US', opts);
}
updateDateTime();

/* ── Mobile Hamburger ── */
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

/* ── Active Nav Link ── */
(function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();

/* ── Toast Notification ── */
function showToast(msg, icon = '✓') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="toast-icon">${icon}</span>${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3600);
}

/* ── jQuery Image Slider (Home) ── */
$(function () {

  /* --- Slider --- */
  let current = 0;
  const $slides = $('.slide');
  const total   = $slides.length;
  const $dots   = $('.slider-dot');

  function goToSlide(n) {
    current = (n + total) % total;
    $('.slider').css('transform', `translateX(-${current * 100}%)`);
    $dots.removeClass('active').eq(current).addClass('active');
  }

  $('.slider-btn.next').on('click', () => goToSlide(current + 1));
  $('.slider-btn.prev').on('click', () => goToSlide(current - 1));
  $dots.on('click', function () { goToSlide($(this).index()); });

  let autoSlide = setInterval(() => goToSlide(current + 1), 4500);
  $('.slider-wrap').on('mouseenter', () => clearInterval(autoSlide))
                   .on('mouseleave', () => { autoSlide = setInterval(() => goToSlide(current + 1), 4500); });

  /* --- Animated counters on home stats --- */
  function animateCounter($el) {
    const target = parseInt($el.data('target'));
    if (isNaN(target)) return;
    $({ val: 0 }).animate({ val: target }, {
      duration: 1800,
      easing: 'swing',
      step: function () { $el.text(Math.floor(this.val).toLocaleString()); },
      complete: function () { $el.text(target.toLocaleString() + ($el.data('suffix') || '')); }
    });
  }

  const statsDone = { run: false };
  function checkStats() {
    if (statsDone.run) return;
    const $strip = $('.stats-strip');
    if (!$strip.length) return;
    const top  = $strip.offset().top;
    const bot  = $(window).scrollTop() + $(window).height();
    if (bot > top + 60) {
      statsDone.run = true;
      $('[data-target]').each(function () { animateCounter($(this)); });
    }
  }
  $(window).on('scroll', checkStats);
  checkStats();

  /* --- Book catalog search/filter (books.html) --- */
  function filterTable() {
    const title  = $('#search-title').val().toLowerCase();
    const author = $('#search-author').val().toLowerCase();
    const cat    = $('#filter-cat').val().toLowerCase();
    $('#book-table tbody tr').each(function () {
      const t  = $(this).find('td:eq(1)').text().toLowerCase();
      const a  = $(this).find('td:eq(2)').text().toLowerCase();
      const c  = $(this).find('td:eq(3)').text().toLowerCase();
      const ok = t.includes(title) && a.includes(author) && (cat === '' || c.includes(cat));
      $(this).toggle(ok);
    });
  }
  $('#search-title, #search-author, #filter-cat').on('input change', filterTable);
  $('#btn-reset').on('click', function () {
    $('#search-title, #search-author').val('');
    $('#filter-cat').val('');
    filterTable();
  });

  /* --- Book Details Modal --- */
  $(document).on('click', '.btn-details', function () {
    const row   = $(this).closest('tr');
    const id    = row.data('id');
    const title = row.data('title');
    const auth  = row.data('author');
    const cat   = row.data('cat');
    const status= row.data('status');
    const emoji = row.data('emoji');
    const desc  = row.data('desc');
    $('#modal-cover').text(emoji).removeClass().addClass('modal-cover book-cover-c1');
    $('#modal-title').text(title);
    $('#modal-author').text('by ' + auth);
    $('#modal-cat').text(cat);
    $('#modal-id').text('Book ID: ' + id);
    $('#modal-status').text(status).removeClass().addClass('status-pill status-' + status.toLowerCase());
    $('#modal-desc').text(desc);
    $('#book-modal').addClass('open');
  });
  $('#modal-close, #book-modal').on('click', function (e) {
    if (e.target === this) $('#book-modal').removeClass('open');
  });

  /* --- My Account: Accordion --- */
  $('.accordion-header').on('click', function () {
    const isOpen = $(this).hasClass('open');
    $('.accordion-header').removeClass('open');
    $('.accordion-body').removeClass('open');
    if (!isOpen) {
      $(this).addClass('open');
      $(this).next('.accordion-body').addClass('open');
    }
  });

  /* --- My Account: Show/Hide reading history --- */
  $('#toggle-history').on('click', function () {
    const $hist = $('#reading-history');
    const hidden = $hist.is(':hidden');
    $hist.slideToggle(300);
    $(this).text(hidden ? 'Hide History' : 'Show History');
  });

  /* --- Sidebar nav active tab --- */
  $('.sidebar-nav a').on('click', function (e) {
    e.preventDefault();
    $('.sidebar-nav a').removeClass('active');
    $(this).addClass('active');
    const target = $(this).data('target');
    $('.account-panel').hide();
    $('#' + target).show();
  });

});

/* ============================================================
   FORM VALIDATION — Membership
   ============================================================ */
(function membershipValidation() {
  const form = document.getElementById('membership-form');
  if (!form) return;

  const rules = {
    'full-name':  { required: true, minLen: 3,   label: 'Full name' },
    'email':      { required: true, email: true,  label: 'Email address' },
    'phone':      { required: true, phone: true,  label: 'Phone number' },
    'dob':        { required: true,               label: 'Date of birth' },
    'address':    { required: true, minLen: 10,   label: 'Address' },
    'mem-type':   { required: true,               label: 'Membership type' },
    'password':   { required: true, minLen: 8,    label: 'Password', password: true },
    'confirm-pw': { required: true, match: 'password', label: 'Password confirmation' },
    'terms':      { required: true, checkbox: true, label: 'Terms agreement' }
  };

  function setField(id, ok, msg) {
    const inp = document.getElementById(id);
    const err = document.getElementById(id + '-err');
    if (!inp) return;
    inp.classList.toggle('error',   !ok);
    inp.classList.toggle('success', ok);
    if (err) { err.textContent = msg; err.classList.toggle('show', !ok); }
  }

  function validateField(id) {
    const rule = rules[id];
    if (!rule) return true;
    const el = document.getElementById(id);
    if (!el) return true;
    const val = rule.checkbox ? el.checked : el.value.trim();

    if (rule.required && (rule.checkbox ? !val : val === '' || val === '0' )) {
      setField(id, false, rule.label + ' is required.'); return false;
    }
    if (rule.minLen && val.length < rule.minLen) {
      setField(id, false, rule.label + ` must be at least ${rule.minLen} characters.`); return false;
    }
    if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setField(id, false, 'Please enter a valid email address.'); return false;
    }
    if (rule.phone && !/^\+?[\d\s\-()]{7,15}$/.test(val)) {
      setField(id, false, 'Please enter a valid phone number.'); return false;
    }
    if (rule.match) {
      const matchVal = document.getElementById(rule.match)?.value;
      if (val !== matchVal) { setField(id, false, 'Passwords do not match.'); return false; }
    }
    setField(id, true, ''); return true;
  }

  Object.keys(rules).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateField(id));
    if (el && el.type === 'checkbox') el.addEventListener('change', () => validateField(id));
  });

  /* Password strength meter */
  const pwInput = document.getElementById('password');
  if (pwInput) {
    pwInput.addEventListener('input', function () {
      const val = this.value;
      let score = 0;
      if (val.length >= 8)              score++;
      if (/[A-Z]/.test(val))            score++;
      if (/[0-9]/.test(val))            score++;
      if (/[^A-Za-z0-9]/.test(val))     score++;

      const fill  = document.querySelector('.strength-bar-fill');
      const label = document.querySelector('.strength-text');
      const levels = [
        { w: '0%',   c: '#dc3545', t: '' },
        { w: '25%',  c: '#dc3545', t: 'Weak' },
        { w: '50%',  c: '#fd7e14', t: 'Fair' },
        { w: '75%',  c: '#ffc107', t: 'Good' },
        { w: '100%', c: '#28a745', t: 'Strong' }
      ];
      const lv = levels[Math.min(score, 4)];
      if (fill)  { fill.style.width = lv.w; fill.style.background = lv.c; }
      if (label)  label.textContent = lv.t;
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;
    Object.keys(rules).forEach(id => { if (!validateField(id)) valid = false; });
    if (valid) {
      form.reset();
      document.querySelectorAll('.form-group input, .form-group select')
              .forEach(el => el.classList.remove('success', 'error'));
      showToast('🎉 Registration successful! Welcome to BibliOS Library.');
    } else {
      const firstErr = form.querySelector('.error');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
(function contactValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function validate() {
    const name    = form.querySelector('#c-name').value.trim();
    const email   = form.querySelector('#c-email').value.trim();
    const subject = form.querySelector('#c-subject').value.trim();
    const msg     = form.querySelector('#c-msg').value.trim();
    let ok = true;

    [['c-name', name.length >= 2, 'Please enter your name.'],
     ['c-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter a valid email.'],
     ['c-subject', subject.length >= 3, 'Please enter a subject.'],
     ['c-msg', msg.length >= 10, 'Message must be at least 10 characters.']
    ].forEach(([id, valid, msg]) => {
      const el  = document.getElementById(id);
      const err = document.getElementById(id + '-err');
      el?.classList.toggle('error', !valid);
      if (err) { err.textContent = msg; err.classList.toggle('show', !valid); }
      if (!valid) ok = false;
    });
    return ok;
  }

  ['c-name','c-email','c-subject','c-msg'].forEach(id => {
    document.getElementById(id)?.addEventListener('blur', validate);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validate()) {
      form.reset();
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
      showToast('Message sent! We'll get back to you within 24 hours.', '📬');
    }
  });
})();
