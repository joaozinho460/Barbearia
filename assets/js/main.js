/* ============================================================================
   BARBEARIA RICKGINO · INTERAÇÕES GLOBAIS
   ============================================================================ */
(function () {
  "use strict";

  const SITE = window.SITE;

  /* ---------------- header sticky ---------------- */
  const header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------- mobile nav ---------------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  navToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("nav-locked", open);
  });
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-locked");
    });
  });

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
    /* garante que elementos já visíveis aparecem imediatamente */
    revealEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("is-visible");
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------- animação de contadores ---------------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count || el.textContent.replace(/\D/g, "") || "0");
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const isDecimal = decimals > 0;
    const dur = 1400;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isDecimal
        ? val.toFixed(decimals).replace(".", ",")
        : Math.round(val).toLocaleString("pt-PT");
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numEl = entry.target.querySelector("[data-count]") || entry.target;
            animateCount(numEl);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => animateCount(c));
  }

  /* ---------------- render: serviços ---------------- */
  function renderServices() {
    const grid = document.getElementById("servicesGrid");
    if (!grid || !SITE.SERVICES) return;
    SITE.SERVICES.forEach((s, i) => {
      const card = document.createElement("article");
      card.className = "service-card reveal";
      card.style.transitionDelay = (i * 60) + "ms";
      card.innerHTML =
        '<div class="service-media">' +
        '<img src="' + s.image + '" alt="' + escapeHtml(s.name) + '" loading="lazy" />' +
        '<span class="service-tag">' +
        (s.duration && s.duration !== "—"
          ? escapeHtml(s.duration)
          : "duração a confirmar") +
        "</span>" +
        "</div>" +
        '<div class="service-body">' +
        '<div class="service-head"><h3>' + escapeHtml(s.name) + "</h3>" +
        (s.price && s.price !== "—"
          ? '<span class="service-price">' + escapeHtml(s.price) + "</span>"
          : '<span class="service-price price-unknown">sob consulta</span>') +
        "</div>" +
        "<p>" + escapeHtml(s.description) + "</p>" +
        '<a href="#marcacao" class="service-link">Marcar este serviço &#8594;</a>' +
        "</div>";
      grid.appendChild(card);
    });
  }

  /* ---------------- render: barbeiros ---------------- */
  function renderBarbers() {
    const grid = document.getElementById("barbersGrid");
    if (!grid || !SITE.BARBERS) return;
    SITE.BARBERS.forEach((b, i) => {
      const card = document.createElement("article");
      card.className = "barber-card reveal";
      card.style.transitionDelay = (i * 80) + "ms";
      card.innerHTML =
        '<div class="barber-photo">' +
        (b.image
          ? '<img src="' + b.image + '" alt="' + escapeHtml(b.name) + '" loading="lazy" />'
          : '<div class="barber-placeholder"><svg viewBox="0 0 80 80" width="54" height="54" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="40" cy="28" r="12"/><path d="M20 66c0-11 9-17 20-17s20 6 20 17"/></svg></div>') +
        "</div>" +
        '<div class="barber-body">' +
        "<h3>" + escapeHtml(b.name || "A anunciar") + "</h3>" +
        '<p class="barber-specialty">' + escapeHtml(b.specialty || "Barbeiro profissional") + "</p>" +
        "<p>" +
        (b.description
          ? escapeHtml(b.description)
          : "Brevemente vais conhecer os profissionais que fazem da RickGino um espaço de referência.") +
        "</p>" +
        "</div>";
      grid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ---------------- ano no footer ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();


   /* ---------------- LOGIN GOOGLE / SUPABASE ---------------- */

const SUPABASE_URL = "https://yfbtcynkjewuggqxabqv.supabase.co";
const SUPABASE_ANON_KEY = "A_TUA_PUBLISHABLE_KEY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userMenu = document.getElementById("userMenu");
const userAvatar = document.getElementById("userAvatar");
const userName = document.getElementById("userName");


/* Entrar com Google */
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      googleLoginBtn.disabled = true;
      googleLoginBtn.textContent = "A entrar...";

      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error("Erro ao entrar com Google:", error);
        alert("Não foi possível iniciar o login com Google.");
        googleLoginBtn.disabled = false;
        googleLoginBtn.textContent = "Entrar";
      }

    } catch (error) {
      console.error(error);
      googleLoginBtn.disabled = false;
      googleLoginBtn.textContent = "Entrar";
    }
  });
}


/* Atualizar interface do utilizador */
async function updateUserInterface() {
  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (user) {
    if (googleLoginBtn) {
      googleLoginBtn.hidden = true;
    }

    if (userMenu) {
      userMenu.hidden = false;
    }

    if (userName) {
      userName.textContent =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        "Utilizador";
    }

    if (userAvatar) {
      userAvatar.src =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        "";
    }

  } else {
    if (googleLoginBtn) {
      googleLoginBtn.hidden = false;
    }

    if (userMenu) {
      userMenu.hidden = true;
    }
  }
}


/* Sair */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error);
      return;
    }

    updateUserInterface();
  });
}


/* Detetar login/logout */
supabaseClient.auth.onAuthStateChange(() => {
  updateUserInterface();
});


/* Verificar sessão ao abrir o site */
updateUserInterface();

  /* ---------------- init ---------------- */
  renderServices();
  renderBarbers();

  /* re-observa os cards renderizados dinamicamente */
  document.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("is-visible")) {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("is-visible");
    }
  });
})();
