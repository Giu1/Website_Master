(function (global) {
  var KEY = "portfolio-lang";

  function detect() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "pt") return saved;
    } catch (error) {}
    var nav = String(navigator.language || "en").toLowerCase();
    return nav.indexOf("pt") === 0 ? "pt" : "en";
  }

  function apply(dict, lang) {
    var pack = dict[lang] || dict.en;
    var page = document.documentElement.getAttribute("data-i18n-page") || "";
    document.documentElement.lang = lang === "pt" ? "pt-PT" : "en";
    document.documentElement.dataset.lang = lang;

    if (pack["title." + page]) document.title = pack["title." + page];
    else if (pack.title) document.title = pack.title;

    var meta = document.querySelector('meta[name="description"]');
    if (meta) {
      if (pack["desc." + page]) meta.setAttribute("content", pack["desc." + page]);
      else if (pack.desc) meta.setAttribute("content", pack.desc);
    }

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      if (pack[key] != null) node.innerHTML = pack[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-placeholder");
      if (pack[key] != null) node.setAttribute("placeholder", pack[key]);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-aria");
      if (pack[key] != null) node.setAttribute("aria-label", pack[key]);
    });

    document.querySelectorAll("[data-lang]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-lang") === lang ? "true" : "false");
    });

    try { localStorage.setItem(KEY, lang); } catch (error) {}
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang, pack: pack } }));
  }

  var lang = detect();

  global.I18N = {
    key: KEY,
    lang: lang,
    t: function (dict, key) {
      var pack = dict[this.lang] || dict.en;
      return pack[key] != null ? pack[key] : key;
    },
    start: function (dict) {
      apply(dict, this.lang);
      document.addEventListener("click", function (event) {
        var button = event.target.closest("[data-lang]");
        if (!button) return;
        I18N.lang = button.getAttribute("data-lang");
        apply(dict, I18N.lang);
      });
    }
  };
})(window);
