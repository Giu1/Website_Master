(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = form.querySelector(".form-status");
      var name = form.elements.name.value.trim();
      if (!name) {
        status.textContent = I18N.t(window.SITE_I18N, "formNeed");
        return;
      }
      status.textContent = I18N.t(window.SITE_I18N, "formOk").replace("{name}", name);
      form.reset();
    });
  }
})();
