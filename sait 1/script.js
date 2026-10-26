(() => {
  "use strict";

  const body = document.body;
  const header = document.getElementById("header");
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header on scroll ---------- */
  const syncHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* ---------- mobile menu ---------- */
  const isMenuOpen = () => body.classList.contains("menu-open");

  const focusMenu = () => {
    if (!isMenuOpen()) return;
    const firstLink = mobileMenu.querySelector(".mobile-nav a");
    const active = document.activeElement;
    const neutral =
      !active ||
      active === document.body ||
      active === burger ||
      active.classList.contains("skip-link");
    if (firstLink && neutral) firstLink.focus({ preventScroll: true });
  };

  const openMenu = () => {
    body.classList.add("menu-open");
    mobileMenu.classList.add("is-open");
    mobileMenu.removeAttribute("inert");
    mobileMenu.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Закрити меню");
    window.setTimeout(focusMenu, 140);
    window.setTimeout(focusMenu, 420);
  };

  const closeMenu = (restoreFocus = false) => {
    body.classList.remove("menu-open");
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("inert", "");
    mobileMenu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Відкрити меню");
    if (restoreFocus) burger.focus({ preventScroll: true });
  };

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      isMenuOpen() ? closeMenu(true) : openMenu();
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isMenuOpen()) closeMenu(true);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Tab" || !isMenuOpen()) return;

      const brand = header ? header.querySelector(".brand") : null;
      const phone = header ? header.querySelector(".header-cta") : null;
      const items = [brand, phone, burger, ...mobileMenu.querySelectorAll("a")].filter(
        (item) => {
          if (!item) return false;
          const style = window.getComputedStyle(item);
          return style.display !== "none" && style.visibility !== "hidden";
        }
      );
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (!items.includes(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1040 && isMenuOpen()) closeMenu(false);
    });
  }

  /* ---------- active section in navigation ---------- */
  const navLinks = [...document.querySelectorAll(".nav a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((section) => spy.observe(section));
  }

  /* ---------- menu tabs ---------- */
  const tabs = [...document.querySelectorAll("[data-tab]")];
  const panels = [...document.querySelectorAll(".menu-panel")];

  const activateTab = (name, focusTab = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    });

    panels.forEach((panel) => {
      const active = panel.id === `panel-${name}`;
      panel.classList.toggle("is-active", active);
      if (active) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.tab));

    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex;
      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else {
        const step = event.key === "ArrowRight" ? 1 : -1;
        nextIndex = (index + step + tabs.length) % tabs.length;
      }
      activateTab(tabs[nextIndex].dataset.tab, true);
    });
  });

  /* ---------- gallery lightbox ---------- */
  const dialog = document.getElementById("lightbox");

  if (dialog) {
    const lightboxImage = dialog.querySelector(".lightbox-img");
    const lightboxCaption = dialog.querySelector(".lightbox-caption");
    const closeButton = dialog.querySelector(".lightbox-close");

    document.querySelectorAll(".g-item").forEach((item) => {
      item.addEventListener("click", () => {
        lightboxImage.src = item.dataset.full || "";
        lightboxImage.alt = item.dataset.caption || "";
        lightboxCaption.textContent = item.dataset.caption || "";
        dialog.showModal();
        body.classList.add("lightbox-open");
      });
    });

    closeButton.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog || event.target.classList.contains("lightbox-inner")) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", () => {
      body.classList.remove("lightbox-open");
      lightboxImage.removeAttribute("src");
    });
  }

  /* ---------- live opening status ---------- */
  const status = document.querySelector("[data-status]");
  const statusText = document.querySelector("[data-status-text]");

  if (status && statusText) {
    let weekday;
    let currentTime;

    try {
      const timeParts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Europe/Kyiv",
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        })
          .formatToParts(new Date())
          .map((part) => [part.type, part.value])
      );
      weekday = timeParts.weekday;
      currentTime = parseInt(timeParts.hour, 10) + parseInt(timeParts.minute, 10) / 60;
    } catch (error) {
      const now = new Date();
      weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][now.getDay()];
      currentTime = now.getHours() + now.getMinutes() / 60;
    }

    const isWeekend = weekday === "Sat" || weekday === "Sun";
    const openHour = isWeekend ? 9 : 8;
    const closeHour = isWeekend ? 22 : 21;
    const isOpen = currentTime >= openHour && currentTime < closeHour;

    status.classList.toggle("is-open", isOpen);
    statusText.textContent = isOpen
      ? `Зараз відчинено · до ${closeHour}:00`
      : `Зачинено · відчиняємось о ${String(openHour).padStart(2, "0")}:00`;
  }

  /* ---------- footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- reveal on scroll ---------- */
  const revealItems = [...document.querySelectorAll("[data-reveal]")];

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  /* ---------- hero parallax ---------- */
  const heroVisual = document.querySelector(".hero-visual");
  const heroPhoto = document.querySelector(".hero-photo");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (heroVisual && heroPhoto && finePointer && !reducedMotion) {
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      heroPhoto.style.transform = `scale(1.06) translate(${(x * -14).toFixed(2)}px, ${(y * -14).toFixed(2)}px)`;
    });

    heroVisual.addEventListener("pointerleave", () => {
      heroPhoto.style.transform = "scale(1.04)";
    });
  }
})();
