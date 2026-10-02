(function () {
  var login = document.getElementById("login");
  var app = document.getElementById("app");
  var authKey = "aura-desk-auth";

  function signedIn() {
    return sessionStorage.getItem(authKey) === "1";
  }

  function showApp(on) {
    login.hidden = on;
    app.hidden = !on;
  }

  showApp(signedIn());

  document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var user = event.target.elements.user.value.trim();
    var pass = event.target.elements.pass.value;
    var status = event.target.querySelector(".form-status");
    if (user === "demo" && pass === "demo") {
      sessionStorage.setItem(authKey, "1");
      showApp(true);
      render();
    } else {
      status.textContent = I18N.t(window.SITE_I18N, "loginFail");
    }
  });

  document.getElementById("logout").addEventListener("click", function () {
    sessionStorage.removeItem(authKey);
    showApp(false);
  });

  document.querySelectorAll("[data-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      var view = button.getAttribute("data-view");
      document.querySelectorAll("[data-view]").forEach(function (item) {
        item.setAttribute("aria-current", item === button ? "page" : "false");
      });
      document.querySelectorAll("[data-panel]").forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-panel") !== view;
      });
    });
  });

  function rows(headers, body) {
    return "<table><thead><tr>" + headers.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" + body + "</tbody></table>";
  }

  function t(key) { return I18N.t(window.SITE_I18N, key); }

  var statusLabel = { confirmed: "stConfirmed", done: "stDone", cancelled: "stCancelled" };

  function render() {
    var data = AuraStore.load();
    var confirmed = data.bookings.filter(function (item) { return item.status === "confirmed"; });

    document.getElementById("stats").innerHTML =
      '<article class="stat"><span>' + t("confirmed") + "</span><strong>" + confirmed.length + "</strong></article>" +
      '<article class="stat"><span>' + t("live") + "</span><strong>" + AuraStore.visibleServices().length + "</strong></article>" +
      '<article class="stat"><span>' + t("staff") + "</span><strong>" + data.staff.length + "</strong></article>";

    function bookingBody(list) {
      return list.map(function (item) {
        return "<tr><td>" + item.date + " " + item.time + "</td><td>" + item.client + "</td><td>" + item.service +
          '</td><td><span class="pill ' + item.status + '">' + t(statusLabel[item.status] || item.status) + "</span></td><td>" +
          '<select data-booking="' + item.id + '">' +
          ["confirmed", "done", "cancelled"].map(function (status) {
            return '<option value="' + status + '"' + (status === item.status ? " selected" : "") + ">" + t(statusLabel[status]) + "</option>";
          }).join("") +
          "</select></td></tr>";
      }).join("");
    }

    document.getElementById("dash-bookings").innerHTML = rows([t("when"), t("client"), t("service"), t("status"), t("update")], bookingBody(data.bookings.slice(0, 4)));
    document.getElementById("bookings-table").innerHTML = rows([t("when"), t("client"), t("service"), t("status"), t("update")], bookingBody(data.bookings));

    document.getElementById("services-table").innerHTML = rows([t("name"), t("price"), t("min"), t("visible"), ""], data.services.map(function (item) {
      return "<tr><td>" + item.name + "</td><td>€" + item.price + "</td><td>" + item.duration +
        '</td><td><button type="button" data-toggle="' + item.id + '">' + (item.visible ? t("on") : t("hidden")) +
        '</button></td><td><button type="button" data-del-service="' + item.id + '">' + t("remove") + "</button></td></tr>";
    }).join(""));

    document.getElementById("staff-table").innerHTML = rows([t("name"), t("role"), t("days"), ""], data.staff.map(function (person) {
      return "<tr><td>" + person.name + "</td><td>" + person.role + "</td><td>" + person.days +
        '</td><td><button type="button" data-del-staff="' + person.id + '">' + t("remove") + "</button></td></tr>";
    }).join(""));

    var hoursForm = document.getElementById("hours-form");
    hoursForm.innerHTML = Object.keys(data.hours).map(function (day) {
      return "<label>" + t(day) + ' <input name="' + day + '" value="' + data.hours[day] + '"></label>';
    }).join("") + '<button type="submit">' + t("saveHours") + '</button><p class="form-status" role="status"></p>';

    var content = document.getElementById("content-form");
    content.elements.announcement.value = data.announcement;
    content.elements.hero.value = data.hero;
  }

  document.getElementById("app").addEventListener("change", function (event) {
    var id = event.target.getAttribute("data-booking");
    if (!id) return;
    var data = AuraStore.load();
    data.bookings = data.bookings.map(function (item) {
      if (item.id === id) item.status = event.target.value;
      return item;
    });
    AuraStore.save(data);
    render();
  });

  document.getElementById("app").addEventListener("click", function (event) {
    var toggle = event.target.getAttribute("data-toggle");
    var delService = event.target.getAttribute("data-del-service");
    var delStaff = event.target.getAttribute("data-del-staff");
    var data = AuraStore.load();
    if (toggle) {
      data.services = data.services.map(function (item) {
        if (item.id === toggle) item.visible = !item.visible;
        return item;
      });
      AuraStore.save(data);
      render();
    }
    if (delService) {
      data.services = data.services.filter(function (item) { return item.id !== delService; });
      AuraStore.save(data);
      render();
    }
    if (delStaff) {
      data.staff = data.staff.filter(function (person) { return person.id !== delStaff; });
      AuraStore.save(data);
      render();
    }
  });

  document.getElementById("service-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var data = AuraStore.load();
    data.services.push({
      id: AuraStore.uid("s"),
      name: event.target.elements.name.value.trim(),
      price: Number(event.target.elements.price.value),
      duration: Number(event.target.elements.duration.value),
      visible: true
    });
    AuraStore.save(data);
    event.target.reset();
    render();
  });

  document.getElementById("staff-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var data = AuraStore.load();
    data.staff.push({
      id: AuraStore.uid("p"),
      name: event.target.elements.name.value.trim(),
      role: event.target.elements.role.value.trim(),
      days: event.target.elements.days.value.trim()
    });
    AuraStore.save(data);
    event.target.reset();
    render();
  });

  document.getElementById("hours-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var data = AuraStore.load();
    Object.keys(data.hours).forEach(function (day) {
      data.hours[day] = event.target.elements[day].value;
    });
    AuraStore.save(data);
    render();
    document.querySelector("#hours-form .form-status").textContent = t("hoursOk");
  });

  document.getElementById("content-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var data = AuraStore.load();
    data.announcement = event.target.elements.announcement.value;
    data.hero = event.target.elements.hero.value;
    AuraStore.save(data);
    event.target.querySelector(".form-status").textContent = t("copyOk");
  });

  document.addEventListener("langchange", function () {
    if (signedIn()) render();
  });

  if (signedIn()) render();
})();
