(function () {
  "use strict";

  /* ---------- Mobile hamburger menu ---------- */
  var hamburger = document.getElementById("hamburger-btn");
  var mobileMenu = document.getElementById("mobile-menu");

  function closeMobileMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.toggle("is-open");
      hamburger.classList.toggle("is-open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    });

    // Close menu on link click or outside click
    mobileMenu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMobileMenu();
    });
    document.addEventListener("click", function (e) {
      if (
        mobileMenu.classList.contains("is-open") &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileMenu();
    });
  }

  /* ---------- Categories dropdown (desktop, click + keyboard) ---------- */
  var dropdowns = document.querySelectorAll(".has-dropdown");
  dropdowns.forEach(function (dropdown) {
    var toggle = dropdown.querySelector(".nav-dropdown-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    dropdown.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdown.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  });

  document.addEventListener("click", function () {
    dropdowns.forEach(function (dropdown) {
      dropdown.classList.remove("is-open");
      var toggle = dropdown.querySelector(".nav-dropdown-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Newsletter forms (client-side only, GitHub Pages has no backend) ---------- */
  var newsletterForms = document.querySelectorAll("[data-newsletter-form]");
  newsletterForms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.parentElement.querySelector("[data-newsletter-msg]");
      var input = form.querySelector('input[type="email"]');
      if (!input || !input.value || !input.checkValidity()) {
        if (msg) msg.textContent = "Please enter a valid email address.";
        return;
      }
      if (msg) {
        msg.textContent = "Thanks for subscribing! (Newsletter integration coming soon.)";
      }
      form.reset();
    });
  });

  /* ---------- Copy link button on post pages ---------- */
  var copyBtns = document.querySelectorAll("[data-copy-url]");
  copyBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-copy-url");
      var originalText = btn.textContent;
      function done(success) {
        btn.textContent = success ? "Copied!" : "Copy failed";
        setTimeout(function () {
          btn.textContent = originalText;
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          done(true);
        }, function () {
          done(false);
        });
      } else {
        try {
          var temp = document.createElement("textarea");
          temp.value = url;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand("copy");
          document.body.removeChild(temp);
          done(true);
        } catch (err) {
          done(false);
        }
      }
    });
  });

  /* ---------- Client-side search ---------- */
  var searchInput = document.getElementById("search-input");
  var resultsContainer = document.getElementById("search-results");
  var searchDataEl = document.getElementById("search-data");

  if (searchInput && resultsContainer && searchDataEl) {
    var posts = [];
    try {
      posts = JSON.parse(searchDataEl.textContent);
    } catch (err) {
      posts = [];
    }

    function renderResults(list) {
      if (!list.length) {
        resultsContainer.innerHTML = '<p class="search-empty">No results found.</p>';
        return;
      }
      var html = list
        .map(function (post) {
          var tags = (post.tags || []).join(", ");
          return (
            '<a class="search-result-item" href="' + post.url + '">' +
              '<div class="search-result-thumb">' +
                '<img src="' + post.image + '" alt="" loading="lazy" ' +
                'onerror="this.onerror=null;this.style.display=\'none\';">' +
              "</div>" +
              "<div>" +
                '<div class="search-result-title">' + escapeHtml(post.title) + "</div>" +
                '<div class="search-result-meta">' +
                  escapeHtml(post.category || "") + " &bull; " + escapeHtml(post.date || "") +
                  (tags ? " &bull; " + escapeHtml(tags) : "") +
                "</div>" +
                '<div class="search-result-excerpt">' + escapeHtml(post.excerpt || "") + "</div>" +
              "</div>" +
            "</a>"
          );
        })
        .join("");
      resultsContainer.innerHTML = html;
    }

    function escapeHtml(str) {
      var div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    function doSearch(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        resultsContainer.innerHTML = "";
        return;
      }
      var filtered = posts.filter(function (post) {
        var haystack = [
          post.title,
          post.category,
          post.excerpt,
          (post.tags || []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.indexOf(q) !== -1;
      });
      renderResults(filtered);
    }

    var debounceTimer;
    searchInput.addEventListener("input", function () {
      clearTimeout(debounceTimer);
      var value = searchInput.value;
      debounceTimer = setTimeout(function () {
        doSearch(value);
      }, 150);
    });

    // Support ?q= in URL for linking directly to a search
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery) {
      searchInput.value = initialQuery;
      doSearch(initialQuery);
    }
  }
})();
