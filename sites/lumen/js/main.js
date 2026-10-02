(function () {
  var buttons = document.querySelectorAll("[data-mode]");
  var panels = {
    edit: document.querySelector('[data-panel="edit"]'),
    about: document.querySelector('[data-panel="about"]'),
    contact: document.querySelector('[data-panel="contact"]')
  };

  function setMode(mode) {
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-mode") === mode ? "true" : "false");
    });
    Object.keys(panels).forEach(function (key) {
      if (!panels[key]) return;
      panels[key].hidden = key !== mode;
    });
    if (mode !== "edit") {
      panels[mode].scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      document.getElementById("work").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      setMode(button.getAttribute("data-mode"));
    });
  });

  var rail = document.getElementById("rail");
  var cat = document.querySelector(".cap-cat");
  var title = document.querySelector(".cap-title");

  function updateCaption() {
    if (!rail) return;
    var frames = Array.prototype.slice.call(rail.querySelectorAll(".frame"));
    var active = frames[0];
    var mid = rail.scrollLeft + rail.clientWidth * 0.28;
    frames.forEach(function (frame) {
      var left = frame.offsetLeft;
      var right = left + frame.offsetWidth;
      if (mid >= left && mid <= right) active = frame;
    });
    if (active) {
      var catKey = active.getAttribute("data-cat-key");
      cat.textContent = catKey ? I18N.t(window.SITE_I18N, catKey) : active.getAttribute("data-cat");
      title.textContent = active.getAttribute("data-title");
    }
  }

  if (rail) {
    rail.addEventListener("scroll", updateCaption, { passive: true });
    updateCaption();
    document.addEventListener("langchange", updateCaption);
  }

  var form = document.getElementById("lumen-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      form.querySelector(".form-status").textContent = I18N.t(window.SITE_I18N, "formOk");
      form.reset();
    });
  }

  var cursor = document.querySelector(".cursor");
  if (cursor && window.matchMedia("(pointer: fine)").matches) {
    cursor.hidden = false;
    window.addEventListener("pointermove", function (event) {
      cursor.style.left = event.clientX + "px";
      cursor.style.top = event.clientY + "px";
    });
  }
})();
