const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const currentYear = document.getElementById("currentYear");
const navLinks = document.querySelectorAll("#mainNav a");
const sectionNavLinks = document.querySelectorAll("#mainNav a[href^='#']");
const navIndicator = mainNav ? mainNav.querySelector(".nav-indicator") : null;
const heroTrack = document.getElementById("heroTrack");
const heroCarousel = document.getElementById("heroCarousel");
const heroDots = document.querySelectorAll(".hero-dot");
const heroPrev = document.getElementById("heroPrev");
const heroNext = document.getElementById("heroNext");
const parallaxRoot = document.querySelector("[data-parallax-root]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const metricCards = document.querySelectorAll(".metric-card");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("nav-open");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (mainNav && mainNav.classList.contains("nav-open")) {
      mainNav.classList.remove("nav-open");
    }
  });
});

function updateNavIndicator(link) {
  if (!mainNav || !navIndicator || !link) return;
  const navRect = mainNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const left = linkRect.left - navRect.left;
  const width = linkRect.width;
  mainNav.style.setProperty("--indicator-left", `${left}px`);
  mainNav.style.setProperty("--indicator-width", `${width}px`);
}

function setActiveNavLink(activeLink) {
  if (!mainNav || !activeLink) return;
  sectionNavLinks.forEach((link) => link.classList.remove("active"));
  activeLink.classList.add("active");
  mainNav.classList.add("has-active");
  updateNavIndicator(activeLink);
}

const observedSections = Array.from(sectionNavLinks)
  .map((link) => {
    const section = document.querySelector(link.getAttribute("href"));
    return section ? { link, section } : null;
  })
  .filter(Boolean);

if (observedSections.length > 0) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length > 0) {
        const current = observedSections.find((item) => item.section === visible[0].target);
        if (current) setActiveNavLink(current.link);
      }
    },
    {
      root: null,
      threshold: [0.2, 0.35, 0.6],
      rootMargin: "-35% 0px -45% 0px",
    }
  );

  observedSections.forEach((item) => navObserver.observe(item.section));
  setActiveNavLink(observedSections[0].link);

  sectionNavLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveNavLink(link));
  });

  window.addEventListener("resize", () => {
    const activeLink = document.querySelector("#mainNav a.active");
    if (activeLink) updateNavIndicator(activeLink);
  });
}

if (heroTrack && heroDots.length > 0) {
  const totalSlides = heroDots.length;
  let currentSlide = 0;
  let autoplayTimer = null;

  function renderHeroSlide() {
    heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    heroDots.forEach((dot) => dot.classList.remove("is-active"));
    if (heroDots[currentSlide]) {
      heroDots[currentSlide].classList.add("is-active");
    }
  }

  function goToSlide(index) {
    if (index < 0) {
      currentSlide = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentSlide = 0;
    } else {
      currentSlide = index;
    }
    renderHeroSlide();
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 6500);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  heroDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = Number(dot.dataset.slide);
      goToSlide(index);
      startAutoplay();
    });
  });

  if (heroPrev) {
    heroPrev.addEventListener("click", () => {
      goToSlide(currentSlide - 1);
      startAutoplay();
    });
  }

  if (heroNext) {
    heroNext.addEventListener("click", () => {
      goToSlide(currentSlide + 1);
      startAutoplay();
    });
  }

  if (heroCarousel) {
    heroCarousel.addEventListener("mouseenter", stopAutoplay);
    heroCarousel.addEventListener("mouseleave", startAutoplay);
  }

  renderHeroSlide();
  startAutoplay();
}

function updateParallax(pointerX, pointerY, scrollY = 0) {
  parallaxItems.forEach((item) => {
    const depth = Number(item.getAttribute("data-depth")) || 0.1;
    const x = (pointerX - 0.5) * depth * 36;
    const y = (pointerY - 0.5) * depth * 22 + scrollY * depth * -0.08;
    item.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

if (parallaxRoot && parallaxItems.length > 0) {
  let pointerX = 0.5;
  let pointerY = 0.5;

  updateParallax(pointerX, pointerY, window.scrollY || 0);

  window.addEventListener("mousemove", (event) => {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    pointerX = event.clientX / width;
    pointerY = event.clientY / height;
    updateParallax(pointerX, pointerY, window.scrollY || 0);
  });

  window.addEventListener(
    "scroll",
    () => {
      updateParallax(pointerX, pointerY, window.scrollY || 0);
    },
    { passive: true }
  );
}

window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

const counters = document.querySelectorAll(".counter");

function animateCounter(counter) {
  const target = Number(counter.getAttribute("data-target")) || 0;
  const duration = 1100;
  const start = performance.now();

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.floor(eased * target).toString();
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counter.textContent = target.toString();
    }
  }

  requestAnimationFrame(step);
}

if (counters.length > 0) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.55 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

if (metricCards.length > 0) {
  metricCards.forEach((card, index) => {
    card.dataset.revealIndex = String(index);
  });

  const cardObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = (Number(entry.target.dataset.revealIndex) || 0) * 90;
          setTimeout(() => {
            entry.target.classList.add("revealed");
          }, delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  metricCards.forEach((card) => cardObserver.observe(card));
}

const STORAGE_KEYS = {
  events: "soldadinhos_events",
  memories: "soldadinhos_memories",
  summaries: "soldadinhos_summaries",
};

const DEFAULT_EVENTS = [
  {
    title: "Encontro de Março 2026",
    date: "2026-03-14",
    summary: "Brincadeiras, ensino bíblico e muito amor com a criançada.",
    photos: [
      {
        title: "Brincadeiras educativas",
        description: "Jogos cooperativos com aprendizado de valores.",
        image:
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
        alt: "Crianças participando de atividade em grupo",
      },
      {
        title: "Lanches comunitários",
        description: "Partilha e cuidado em um ambiente acolhedor.",
        image:
          "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=900&q=80",
        alt: "Mesa com lanche para encontro infantil",
      },
      {
        title: "Ensino com alegria",
        description: "Momentos de fé, amizade e crescimento espiritual.",
        image:
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
        alt: "Crianças sorrindo durante encontro",
      },
    ],
  },
];

const DEFAULT_SUMMARIES = [
  {
    tag: "Encontro",
    title: "Como foi nosso último sábado com a criançada",
    summary: "Resumo das atividades, lições bíblicas e depoimentos.",
    link: "#",
  },
  {
    tag: "Família",
    title: "5 valores para praticar com os filhos durante a semana",
    summary: "Dicas simples para fortalecer fé e bons costumes em casa.",
    link: "#",
  },
  {
    tag: "Voluntariado",
    title: "Como se tornar líder de turma no Soldadinhos",
    summary: "Conheça os passos para servir com organização e propósito.",
    link: "#",
  },
];

function readStorageArray(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatEventDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function eventKey(event, index) {
  const base = `${event.date || "sem-data"}-${event.title || `evento-${index + 1}`}`;
  return encodeURIComponent(
    base
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );
}

function getEventCover(event) {
  if (!event || !Array.isArray(event.photos) || event.photos.length === 0) return "";
  return event.photos[0].image || "";
}

function normalizeEvents() {
  const events = readStorageArray(STORAGE_KEYS.events, []);
  if (events.length > 0) return events;

  const legacyMemories = readStorageArray(STORAGE_KEYS.memories, []);
  if (legacyMemories.length > 0) {
    return [
      {
        title: "Último encontro",
        date: "",
        summary: "Momentos especiais registrados pela equipe.",
        photos: legacyMemories,
      },
    ];
  }

  return DEFAULT_EVENTS;
}

function pickLatestEvent(events) {
  if (!events || events.length === 0) return null;
  const withDate = events
    .map((event, index) => ({ event, index, ts: Date.parse(event.date || "") }))
    .filter((item) => Number.isFinite(item.ts));
  if (withDate.length === 0) return { event: events[0], index: 0 };
  withDate.sort((a, b) => b.ts - a.ts);
  return withDate[0];
}

function syncLatestEventToHero(events) {
  const latest = pickLatestEvent(events);
  if (!latest) return;
  const latestEvent = latest.event;
  const latestIndex = latest.index;
  const heroTitle = document.getElementById("heroLatestTitle");
  const heroSummary = document.getElementById("heroLatestSummary");
  const heroLink = document.getElementById("heroLatestGalleryLink");
  const heroBg = document.querySelector(".hero-meeting-bg");

  if (heroTitle) {
    heroTitle.textContent = latestEvent.title || "Último encontro";
  }
  if (heroSummary) {
    heroSummary.textContent =
      latestEvent.summary ||
      "Reviva os melhores momentos da criançada com fotos e vídeos especiais.";
  }
  if (heroLink) {
    heroLink.href = `gallery.html?event=${eventKey(latestEvent, latestIndex)}`;
  }
  if (heroBg) {
    const cover = getEventCover(latestEvent);
    if (cover) {
      heroBg.style.backgroundImage = `linear-gradient(130deg, rgba(12, 45, 27, 0.56), rgba(8, 28, 17, 0.42)), url('${cover}')`;
    }
  }
}

function renderEventsList() {
  const eventsList = document.getElementById("eventsList");
  if (!eventsList) return;

  const events = normalizeEvents();
  eventsList.innerHTML = events
    .map((event, index) => {
      const safeSummary = escapeHtml(event.summary || "");
      const cover = escapeHtml(
        getEventCover(event) ||
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80"
      );
      const key = eventKey(event, index);
      return `
      <article class="event-card">
        <img class="event-thumb" src="${cover}" alt="${escapeHtml(event.title || "Capa do evento")}" />
        <p class="event-date">${escapeHtml(formatEventDate(event.date))}</p>
        <h3>${escapeHtml(event.title || `Encontro ${index + 1}`)}</h3>
        <p>${safeSummary}</p>
        <a class="btn btn-outline" href="gallery.html?event=${key}">Ver galeria</a>
      </article>
    `;
    })
    .join("");

  syncLatestEventToHero(events);
}

function renderSummaries() {
  const summariesGrid = document.getElementById("summariesGrid");
  if (!summariesGrid) return;
  const summaries = readStorageArray(STORAGE_KEYS.summaries, DEFAULT_SUMMARIES);

  summariesGrid.innerHTML = summaries
    .map((post) => {
      const safeLink = post.link && post.link !== "#" ? escapeHtml(post.link) : "#";
      const linkAttrs =
        safeLink === "#"
          ? `href="#"`
          : `href="${safeLink}" target="_blank" rel="noopener noreferrer"`;
      return `
      <article class="post-card">
        <p class="post-tag">${escapeHtml(post.tag)}</p>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.summary)}</p>
        <a ${linkAttrs}>Ler post</a>
      </article>
    `;
    })
    .join("");
}

renderEventsList();
renderSummaries();
