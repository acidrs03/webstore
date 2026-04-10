'use strict';

document.addEventListener('DOMContentLoaded', function () {
  // Auto-dismiss flash alerts after 5 seconds
  var alerts = document.querySelectorAll('.alert[data-bs-dismiss]');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      if (typeof bootstrap !== 'undefined') {
        var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
        if (bsAlert) bsAlert.close();
      }
    }, 5000);
  });

  // Product image gallery switcher
  var mainImage = document.getElementById('product-main-image');
  var thumbs = document.querySelectorAll('.product-thumb');
  thumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      if (mainImage) mainImage.src = thumb.dataset.src;
      thumbs.forEach(function (t) { t.classList.remove('active'); });
      thumb.classList.add('active');
    });
  });

  // Enforce quantity input bounds
  var qtyInputs = document.querySelectorAll('input[type="number"][name="quantity"]');
  qtyInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      var val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1) input.value = 1;
      if (val > 99) input.value = 99;
    });
  });
});
