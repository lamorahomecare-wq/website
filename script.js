/* ==========================================================================
   Lamora Home Care — site behaviour
   1. Text size buttons (remembered between visits)
   2. Mobile menu
   3. Request form: validation + automatic email delivery
   ========================================================================== */

/* --------------------------------------------------------------------------
   WHERE REQUESTS ARE SENT
   FormSubmit delivers the form straight to this inbox. No account required —
   the first time someone submits, FormSubmit emails this address once asking
   you to confirm. Click that link and every request after it arrives instantly.
   To change the destination address, edit the line below.
   -------------------------------------------------------------------------- */
var DESTINATION_EMAIL = 'lamorahomecare@gmail.com';
var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + DESTINATION_EMAIL;

/* ==========================================================================
   1. Text size
   ========================================================================== */
(function textSize() {
  var buttons = document.querySelectorAll('.textsize-btn');
  var saved = null;

  try { saved = localStorage.getItem('lamora-textsize'); } catch (e) { /* private mode */ }
  if (saved) { apply(saved); }

  function apply(size) {
    document.documentElement.setAttribute('data-textsize', size);
    buttons.forEach(function (btn) {
      var active = btn.dataset.size === size;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      apply(btn.dataset.size);
      try { localStorage.setItem('lamora-textsize', btn.dataset.size); } catch (e) { /* ignore */ }
    });
  });
})();

/* ==========================================================================
   2. Mobile menu
   ========================================================================== */
(function mobileMenu() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  if (!toggle || !nav) { return; }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close the menu after choosing a link
  nav.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ==========================================================================
   3. Request form
   ========================================================================== */
(function requestForm() {
  var form = document.getElementById('request-form');
  if (!form) { return; }

  var statusBox = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');

  var RULES = [
    { id: 'first-name', label: 'first name' },
    { id: 'last-name',  label: 'last name' },
    { id: 'email',      label: 'email address', type: 'email' },
    { id: 'phone',      label: 'phone number',  type: 'phone' },
    { id: 'service',    label: 'service',       message: 'Please choose what we can help you with.' }
  ];

  function fieldError(rule) {
    var input = document.getElementById(rule.id);
    var value = input.value.trim();

    if (!value) {
      return rule.message || 'Please enter your ' + rule.label + '.';
    }
    if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      return 'Please enter a valid email address, like name@example.com.';
    }
    if (rule.type === 'phone' && value.replace(/\D/g, '').length < 10) {
      return 'Please enter a full phone number with area code, like (555) 123-4567.';
    }
    return '';
  }

  function showError(rule, message) {
    var input = document.getElementById(rule.id);
    var box = document.getElementById(rule.id + '-error');
    box.textContent = message;
    box.classList.toggle('is-shown', Boolean(message));
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  // Re-check a field once the visitor has already seen an error on it
  RULES.forEach(function (rule) {
    var input = document.getElementById(rule.id);
    var revalidate = function () {
      if (input.getAttribute('aria-invalid') === 'true') { showError(rule, fieldError(rule)); }
    };
    input.addEventListener('input', revalidate);
    input.addEventListener('change', revalidate);
    input.addEventListener('blur', function () {
      if (input.value.trim()) { showError(rule, fieldError(rule)); }
    });
  });

  function setStatus(kind, html) {
    statusBox.className = 'form-status is-shown is-' + kind;
    statusBox.innerHTML = html;
    statusBox.setAttribute('tabindex', '-1');
    statusBox.focus();
    statusBox.scrollIntoView({ block: 'center' });
  }

  /* Fallback: if the sending service cannot be reached, hand the visitor a
     ready-to-send email so their request is never lost. */
  function mailtoFallback(data) {
    var body =
      'Name: ' + data['First Name'] + ' ' + data['Last Name'] + '\n' +
      'Email: ' + data.Email + '\n' +
      'Phone: ' + data.Phone + '\n' +
      'Service needed: ' + data['Service Needed'] + '\n' +
      'Preferred contact: ' + (data['Preferred Contact'] || 'Either is fine') + '\n\n' +
      'Details:\n' + (data['Request Details'] || '(none provided)');

    return 'mailto:' + DESTINATION_EMAIL +
      '?subject=' + encodeURIComponent('Website request from ' + data['First Name'] + ' ' + data['Last Name']) +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // --- Validate ---
    var firstBad = null;
    RULES.forEach(function (rule) {
      var message = fieldError(rule);
      showError(rule, message);
      if (message && !firstBad) { firstBad = rule; }
    });

    if (firstBad) {
      setStatus('error',
        '<p><strong>We need a little more information.</strong></p>' +
        '<p>Please check the boxes marked in red below, then press Send again.</p>');
      document.getElementById(firstBad.id).focus();
      return;
    }

    // --- Collect ---
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (key !== '_honey') { data[key] = typeof value === 'string' ? value.trim() : value; }
    });
    data._subject = 'New website request from ' + data['First Name'] + ' ' + data['Last Name'];
    data._template = 'table';
    data._captcha = 'false';

    // --- Send ---
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending your request…';
    setStatus('success', '<p>Sending your request, please wait…</p>');

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (response) {
        if (!response.ok) { throw new Error('Request failed'); }
        return response.json();
      })
      .then(function () {
        form.reset();
        setStatus('success',
          '<p><strong>Thank you, ' + escapeHtml(data['First Name']) + '! Your request has been sent.</strong></p>' +
          '<p>It went straight to our team at ' + DESTINATION_EMAIL + '. ' +
          'We will contact you at <strong>' + escapeHtml(data.Email) + '</strong> or ' +
          '<strong>' + escapeHtml(data.Phone) + '</strong> within one business day.</p>' +
          '<p>If you need help sooner, please call us at ' +
          '<a href="tel:+15551234567">(555) 123-4567</a>.</p>');
      })
      .catch(function () {
        setStatus('error',
          '<p><strong>Sorry — we could not send your request automatically.</strong></p>' +
          '<p>Nothing you typed was lost. Please choose one of these instead:</p>' +
          '<p><a href="' + mailtoFallback(data) + '">Send it using your own email program</a>' +
          ' &nbsp;•&nbsp; Call us at <a href="tel:+15551234567">(555) 123-4567</a>' +
          ' &nbsp;•&nbsp; Email <a href="mailto:' + DESTINATION_EMAIL + '">' + DESTINATION_EMAIL + '</a></p>');
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send My Request';
      });
  });

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }
})();

/* Footer year */
(function year() {
  var slot = document.getElementById('year');
  if (slot) { slot.textContent = new Date().getFullYear(); }
})();
