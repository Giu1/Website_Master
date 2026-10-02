(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var serviceKeys = {
    "Cut & finish": "svcCut",
    "Blow-dry": "svcBlow",
    Balayage: "svcBalayage",
    Gloss: "svcGloss",
    "Repair ritual": "svcTreatment"
  };
  var roleKeys = { Colour: "roleColour", Cut: "roleCut", Texture: "roleTexture" };

  function t(key) { return I18N.t(window.SITE_I18N, key); }

  function serviceName(name) {
    return serviceKeys[name] ? t(serviceKeys[name]) : name;
  }

  function render() {
    var data = window.AuraStore ? AuraStore.load() : null;
    if (!data) return;

    document.querySelectorAll("[data-announce]").forEach(function (node) {
      node.textContent = data.announcement === AuraStore.defaults.announcement
        ? t("announceDefault")
        : data.announcement;
    });

    document.querySelectorAll("[data-hero]").forEach(function (node) {
      node.textContent = data.hero === AuraStore.defaults.hero ? t("heroDefault") : data.hero;
    });

    var serviceBox = document.querySelector("[data-services]");
    if (serviceBox) {
      serviceBox.innerHTML = AuraStore.visibleServices().map(function (item) {
        return '<article class="card"><h3>' + serviceName(item.name) + '</h3><p class="price">€' + item.price + "</p><p>" + item.duration + " min</p></article>";
      }).join("");
    }

    var staffBox = document.querySelector("[data-staff]");
    if (staffBox) {
      staffBox.innerHTML = data.staff.map(function (person) {
        var role = roleKeys[person.role] ? t(roleKeys[person.role]) : person.role;
        return '<article class="card"><h3>' + person.name + "</h3><p>" + role + "</p><p>" + person.days + "</p></article>";
      }).join("");
    }

    var hoursBox = document.querySelector("[data-hours]");
    if (hoursBox) {
      hoursBox.innerHTML = Object.keys(data.hours).map(function (day) {
        var value = data.hours[day] === "Closed" ? t("closed") : data.hours[day];
        return "<li><span>" + t(day) + "</span><span>" + value + "</span></li>";
      }).join("");
    }

    var gallery = document.querySelector("[data-gallery]");
    if (gallery) {
      gallery.innerHTML = data.gallery.map(function (shot) {
        return '<img src="' + shot.url + '" alt="' + shot.alt + '">';
      }).join("");
    }

    var select = document.querySelector("[data-service-select]");
    if (select) {
      select.innerHTML = AuraStore.visibleServices().map(function (item) {
        return '<option value="' + item.name + '">' + serviceName(item.name) + " · €" + item.price + "</option>";
      }).join("");
    }
  }

  document.addEventListener("langchange", render);
  render();

  var booking = document.getElementById("booking-form");
  if (booking) {
    booking.addEventListener("submit", function (event) {
      event.preventDefault();
      var next = AuraStore.load();
      next.bookings.push({
        id: AuraStore.uid("b"),
        client: booking.elements.name.value.trim(),
        service: booking.elements.service.value,
        date: booking.elements.date.value,
        time: booking.elements.time.value,
        status: "confirmed"
      });
      AuraStore.save(next);
      booking.querySelector(".form-status").textContent = t("bookOk");
      booking.reset();
    });
  }

  var contact = document.getElementById("contact-form");
  if (contact) {
    contact.addEventListener("submit", function (event) {
      event.preventDefault();
      contact.querySelector(".form-status").textContent = t("contactOk");
      contact.reset();
    });
  }
})();
