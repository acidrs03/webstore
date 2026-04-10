'use strict';

document.addEventListener('DOMContentLoaded', function () {
  // Auto-dismiss flash alerts after 4 seconds
  var alerts = document.querySelectorAll('.alert[data-bs-dismiss]');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      if (typeof bootstrap !== 'undefined') {
        var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
        if (bsAlert) bsAlert.close();
      }
    }, 4000);
  });

  // Auto-generate slug from title field
  var titleInput = document.getElementById('title');
  var slugInput = document.getElementById('slug');
  if (titleInput && slugInput) {
    // Mark as manual if user types in slug field
    slugInput.addEventListener('input', function () {
      slugInput.dataset.manual = 'true';
    });
    titleInput.addEventListener('input', function () {
      if (!slugInput.dataset.manual) {
        slugInput.value = titleInput.value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
    });
  }

  // Character counters for SEO fields
  function addCounter(inputId, max) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var counter = document.createElement('small');
    counter.className = 'form-text';
    counter.textContent = input.value.length + '/' + max + ' characters';
    input.parentNode.appendChild(counter);
    input.addEventListener('input', function () {
      counter.textContent = input.value.length + '/' + max + ' characters';
      counter.className = input.value.length > max ? 'form-text text-danger' : 'form-text text-muted';
    });
  }
  addCounter('seoTitle', 70);
  addCounter('seoDescription', 160);

  // Confirm delete / destructive actions
  var confirmBtns = document.querySelectorAll('[data-confirm]');
  confirmBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      var msg = btn.dataset.confirm || 'Are you sure?';
      if (!confirm(msg)) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  });

  // Image preview for file inputs
  var imageInputs = document.querySelectorAll('input[type="file"][data-preview]');
  imageInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      var previewEl = document.getElementById(input.dataset.preview);
      if (previewEl && input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) { previewEl.src = e.target.result; };
        reader.readAsDataURL(input.files[0]);
      }
    });
  });
});
