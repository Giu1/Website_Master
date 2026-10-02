(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      form.querySelector(".form-status").textContent = I18N.t(window.SITE_I18N, "formOk");
      form.reset();
    });
  }
})();
