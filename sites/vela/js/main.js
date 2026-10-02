(function () {
  var blob = document.querySelector(".blob");
  if (blob && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.addEventListener("pointermove", function (event) {
      blob.style.transform = "translate(" + (event.clientX / 18) + "px," + (event.clientY / 20) + "px)";
    });
  }

  var form = document.getElementById("vela-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      form.querySelector(".form-status").textContent = I18N.t(window.SITE_I18N, "formOk");
      form.reset();
    });
  }
})();
