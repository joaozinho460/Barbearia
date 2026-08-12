/* ============================================================================
   BARBEARIA RICKGINO · INTERAÇÕES GLOBAIS + PERFIL / LOGIN
============================================================================= */

(function () {
  "use strict";

  /* ==========================================================================
     CONFIGURAÇÃO DO SITE
  ========================================================================== */

  const SITE = window.SITE || {};

  /* ==========================================================================
     HEADER STICKY
  ========================================================================== */

  const header = document.getElementById("siteHeader");

  function onScroll() {
    if (!header) return;

    if (window.scrollY > 40) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ==========================================================================
     MENU MOBILE
  ========================================================================== */

  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");

  if (navToggle && nav) {
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
  }

  /* ==========================================================================
     REVEAL ON SCROLL
  ========================================================================== */

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
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealEls.forEach((el) => io.observe(el));

    revealEls.forEach((el) => {
      const r = el.getBoundingClientRect();

      if (r.top < window.innerHeight) {
        el.classList.add("is-visible");
      }
    });
  } else {
    revealEls.forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  /* ==========================================================================
     ANIMAÇÃO DOS CONTADORES
  ========================================================================== */

  function animateCount(el) {
    if (!el) return;

    const rawText = el.textContent || "";

    const target = parseFloat(
      el.dataset.count ||
        rawText.replace(/[^\d.,]/g, "").replace(",", ".") ||
        "0"
    );

    const decimals = parseInt(
      el.dataset.decimals || "0",
      10
    );

    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;

      if (decimals > 0) {
        el.textContent = value
          .toFixed(decimals)
          .replace(".", ",");
      } else {
        el.textContent = Math.round(value)
          .toLocaleString("pt-PT");
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  const counters = document.querySelectorAll(".stat-num");

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numEl =
              entry.target.querySelector("[data-count]") ||
              entry.target;

            animateCount(numEl);

            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.5
      }
    );

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach((counter) => {
      animateCount(counter);
    });
  }

  /* ==========================================================================
     ESCAPE HTML
  ========================================================================== */

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ==========================================================================
     RENDER · SERVIÇOS
  ========================================================================== */

  function renderServices() {
    const grid = document.getElementById("servicesGrid");

    if (!grid || !SITE.SERVICES) return;

    grid.innerHTML = "";

    SITE.SERVICES.forEach((service, index) => {
      const card = document.createElement("article");

      card.className = "service-card reveal";

      card.style.transitionDelay =
        index * 60 + "ms";

      card.innerHTML =
        '<div class="service-media">' +

          '<img src="' +
          escapeHtml(service.image || "") +
          '" alt="' +
          escapeHtml(service.name || "Serviço") +
          '" loading="lazy" />' +

          '<span class="service-tag">' +
          (
            service.duration &&
            service.duration !== "—"
              ? escapeHtml(service.duration)
              : "Duração a confirmar"
          ) +
          "</span>" +

        "</div>" +

        '<div class="service-body">' +

          '<div class="service-head">' +

            "<h3>" +
            escapeHtml(service.name || "Serviço") +
            "</h3>" +

            (
              service.price &&
              service.price !== "—"
                ? '<span class="service-price">' +
                  escapeHtml(service.price) +
                  "</span>"
                : '<span class="service-price price-unknown">' +
                  "Sob consulta" +
                  "</span>"
            ) +

          "</div>" +

          "<p>" +
          escapeHtml(service.description || "") +
          "</p>" +

          '<a href="#marcacao" class="service-link">' +
          "Marcar este serviço &#8594;" +
          "</a>" +

        "</div>";

      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     RENDER · BARBEIROS
  ========================================================================== */

  function renderBarbers() {
    const grid = document.getElementById("barbersGrid");

    if (!grid || !SITE.BARBERS) return;

    grid.innerHTML = "";

    SITE.BARBERS.forEach((barber, index) => {
      const card = document.createElement("article");

      card.className = "barber-card reveal";

      card.style.transitionDelay =
        index * 80 + "ms";

      const image = barber.image
        ? '<img src="' +
          escapeHtml(barber.image) +
          '" alt="' +
          escapeHtml(barber.name || "Barbeiro") +
          '" loading="lazy" />'
        : `
          <div class="barber-placeholder">
            <svg
              viewBox="0 0 80 80"
              width="54"
              height="54"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="40" cy="28" r="12"/>
              <path d="M20 66c0-11 9-17 20-17s20 6 20 17"/>
            </svg>
          </div>
        `;

      card.innerHTML =
        '<div class="barber-photo">' +
          image +
        "</div>" +

        '<div class="barber-body">' +

          "<h3>" +
          escapeHtml(barber.name || "A anunciar") +
          "</h3>" +

          '<p class="barber-specialty">' +
          escapeHtml(
            barber.specialty ||
            "Barbeiro profissional"
          ) +
          "</p>" +

          "<p>" +
          escapeHtml(
            barber.description ||
            "Brevemente vais conhecer os profissionais que fazem da RickGino um espaço de referência."
          ) +
          "</p>" +

        "</div>";

      grid.appendChild(card);
    });
  }

  /* ==========================================================================
     ANO DO FOOTER
  ========================================================================== */

  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent =
      new Date().getFullYear();
  }

  /* ==========================================================================
     SUPABASE · LOGIN / PERFIL
  ========================================================================== */

  const SUPABASE_URL =
    "https://yfbtcynkjewuggqxabqv.supabase.co";

  const SUPABASE_ANON_KEY =
    "sb_publishable_jBZxtMgKPbl601_8UmFIBw_lthLAMNn";

  /* ==========================================================================
     ELEMENTOS DO PERFIL
  ========================================================================== */

  const googleLoginBtn =
    document.getElementById("googleLoginBtn");

  const logoutBtn =
    document.getElementById("logoutBtn");

  const userMenu =
    document.getElementById("userMenu");

  const userAvatar =
    document.getElementById("userAvatar");

  const userName =
    document.getElementById("userName");

  /* ==========================================================================
     VERIFICAR SE SUPABASE FOI CARREGADO
  ========================================================================== */

  let supabaseClient = null;

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function" &&
    SUPABASE_ANON_KEY
  ) {
    try {
      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY
        );

      console.log("Supabase inicializado com sucesso.");
    } catch (error) {
      console.error(
        "Erro ao inicializar o Supabase:",
        error
      );
    }
  } else {
    console.warn(
      "Supabase não foi carregado. Verifica o script do Supabase no index.html."
    );
  }

  /* ==========================================================================
     ESTADO VISUAL · UTILIZADOR NÃO AUTENTICADO
  ========================================================================== */

  function showLoggedOutState() {
    if (googleLoginBtn) {
      googleLoginBtn.hidden = false;
      googleLoginBtn.disabled = false;
      googleLoginBtn.textContent = "Entrar";
    }

    if (userMenu) {
      userMenu.hidden = true;
    }

    if (userAvatar) {
      userAvatar.removeAttribute("src");
      userAvatar.alt = "Avatar";
    }

    if (userName) {
      userName.textContent = "";
    }
  }

  /* ==========================================================================
     ESTADO VISUAL · UTILIZADOR AUTENTICADO
  ========================================================================== */

  function showLoggedInState(user) {
    if (!user) {
      showLoggedOutState();
      return;
    }

    if (googleLoginBtn) {
      googleLoginBtn.hidden = true;
    }

    if (userMenu) {
      userMenu.hidden = false;
    }

    const metadata =
      user.user_metadata || {};

    const name =
      metadata.full_name ||
      metadata.name ||
      metadata.user_name ||
      user.email ||
      "Utilizador";

    const avatar =
      metadata.avatar_url ||
      metadata.picture ||
      "";

    if (userName) {
      userName.textContent = name;
    }

    if (userAvatar) {
      if (avatar) {
        userAvatar.src = avatar;
        userAvatar.alt =
          "Foto de perfil de " + name;
      } else {
        userAvatar.removeAttribute("src");
        userAvatar.alt = "Avatar";
      }
    }
  }

  /* ==========================================================================
     OBTER UTILIZADOR ATUAL
  ========================================================================== */

  async function updateUserInterface() {
    if (!supabaseClient) {
      showLoggedOutState();
      return;
    }

    try {
      const {
        data,
        error
      } = await supabaseClient.auth.getUser();

      if (error) {
        console.error(
          "Erro ao obter utilizador:",
          error
        );

        showLoggedOutState();
        return;
      }

      if (data && data.user) {
        showLoggedInState(data.user);
      } else {
        showLoggedOutState();
      }

    } catch (error) {
      console.error(
        "Erro ao verificar sessão:",
        error
      );

      showLoggedOutState();
    }
  }

  /* ==========================================================================
     LOGIN COM GOOGLE
  ========================================================================== */

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener(
      "click",
      async () => {

        if (!supabaseClient) {
          alert(
            "O Supabase não foi carregado. Verifica o index.html e a Publishable Key."
          );

          return;
        }

        try {
          googleLoginBtn.disabled = true;
          googleLoginBtn.textContent =
            "A entrar...";

          const {
            error
          } =
            await supabaseClient.auth.signInWithOAuth(
              {
                provider: "google",

                options: {
                  redirectTo:
                    window.location.origin
                }
              }
            );

          if (error) {
            console.error(
              "Erro ao entrar com Google:",
              error
            );

            alert(
              "Não foi possível iniciar o login com Google: " +
              error.message
            );

            googleLoginBtn.disabled = false;
            googleLoginBtn.textContent =
              "Entrar";
          }

        } catch (error) {

          console.error(
            "Erro no login:",
            error
          );

          alert(
            "Ocorreu um erro ao tentar entrar: " +
            error.message
          );

          googleLoginBtn.disabled = false;
          googleLoginBtn.textContent =
            "Entrar";
        }
      }
    );
  }

  /* ==========================================================================
     LOGOUT
  ========================================================================== */

  if (logoutBtn) {
    logoutBtn.addEventListener(
      "click",
      async () => {

        if (!supabaseClient) {
          return;
        }

        try {
          logoutBtn.disabled = true;
          logoutBtn.textContent =
            "A sair...";

          const {
            error
          } =
            await supabaseClient.auth.signOut();

          if (error) {
            console.error(
              "Erro ao sair:",
              error
            );

            alert(
              "Não foi possível terminar a sessão."
            );

            return;
          }

          showLoggedOutState();

        } catch (error) {

          console.error(
            "Erro ao terminar sessão:",
            error
          );

        } finally {

          logoutBtn.disabled = false;
          logoutBtn.textContent = "Sair";
        }
      }
    );
  }

  /* ==========================================================================
     DETETAR LOGIN / LOGOUT AUTOMATICAMENTE
  ========================================================================== */

  if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(
      (event, session) => {

        console.log(
          "Estado de autenticação:",
          event
        );

        if (session && session.user) {
          showLoggedInState(
            session.user
          );
        } else {
          showLoggedOutState();
        }
      }
    );
  }

  /* ==========================================================================
     VERIFICAR SESSÃO AO ABRIR O SITE
  ========================================================================== */

  updateUserInterface();

  /* ==========================================================================
     INICIALIZAR CONTEÚDO
  ========================================================================== */

  renderServices();
  renderBarbers();

  /* ==========================================================================
     RE-OBSERVAR ELEMENTOS CRIADOS DINAMICAMENTE
  ========================================================================== */

  document
    .querySelectorAll(".reveal")
    .forEach((el) => {

      if (
        !el.classList.contains(
          "is-visible"
        )
      ) {

        const rect =
          el.getBoundingClientRect();

        if (
          rect.top <
          window.innerHeight
        ) {
          el.classList.add(
            "is-visible"
          );
        }
      }
    });

})();
