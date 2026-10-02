(function () {
  var form = document.getElementById("reserve-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = form.elements.name.value.trim() || "friend";
    form.querySelector(".form-status").textContent =
      I18N.t(window.SITE_I18N, "formOk").replace("{name}", name);
    form.reset();
  });
})();
