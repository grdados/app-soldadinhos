const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const currentYear = document.getElementById("currentYear");
const topbar = document.querySelector(".topbar");
const heroSection = document.getElementById("inicio");
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
const soldierSliderWindow = document.getElementById("soldierSliderWindow");
const soldierSliderTrack = document.getElementById("soldierSliderTrack");
const soldierPrev = document.getElementById("soldierPrev");
const soldierNext = document.getElementById("soldierNext");
const soldierDotsWrap = document.getElementById("soldierDots");
const backToTopButton = document.getElementById("backToTop");

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

function getHeaderOffset() {
  return topbar ? topbar.offsetHeight + 8 : 88;
}

function smoothScrollToY(targetY, duration = 900) {
  const startY = window.scrollY || window.pageYOffset;
  const distance = targetY - startY;
  const startTime = performance.now();

  const easeInOutQuart = (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = easeInOutQuart(progress);
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

sectionNavLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    smoothScrollToY(Math.max(0, y), 980);
  });
});

if (backToTopButton) {
  backToTopButton.addEventListener("click", () => {
    smoothScrollToY(0, 980);
  });
}

function handleScrollUi() {
  const scrollY = window.scrollY || window.pageYOffset;
  const heroHeight = heroSection ? heroSection.offsetHeight : 0;

  if (topbar) {
    topbar.classList.toggle("topbar-compact", scrollY > Math.max(120, heroHeight - 220));
  }

  if (backToTopButton) {
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const nearBottom = scrollY + window.innerHeight > docHeight - 220;
    backToTopButton.classList.toggle("show", nearBottom);
  }
}

window.addEventListener("scroll", handleScrollUi, { passive: true });
window.addEventListener("resize", handleScrollUi);
handleScrollUi();

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

function initScrollMotionEffects() {
  const revealSelector = [
    ".section-head",
    ".about-grid .card",
    ".roles-grid .card",
    ".event-card",
    ".post-card",
    ".donation-panel",
    ".location > div",
    ".church-logo-block",
    ".map-placeholder",
  ].join(", ");

  const revealTargets = Array.from(document.querySelectorAll(revealSelector));
  if (revealTargets.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  revealTargets.forEach((element, index) => {
    element.classList.add("scroll-reveal");
    element.style.setProperty("--reveal-order", String(index % 6));
    if (!reducedMotion) {
      element.classList.add("scroll-parallax-target");
    }
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("reveal-visible", entry.isIntersecting);
      });
    },
    {
      threshold: [0.06, 0.2, 0.35],
      rootMargin: "-6% 0px -8% 0px",
    }
  );

  revealTargets.forEach((target) => revealObserver.observe(target));

  if (reducedMotion) return;

  let rafId = null;
  const parallaxTargets = revealTargets;

  const updateParallaxByScroll = () => {
    rafId = null;
    const viewportHalf = window.innerHeight / 2;
    parallaxTargets.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = viewportHalf - center;
      const shift = Math.max(Math.min(distance / 38, 14), -14);
      element.style.setProperty("--scroll-parallax-y", `${shift.toFixed(2)}px`);
    });
  };

  const requestParallaxUpdate = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(updateParallaxByScroll);
  };

  requestParallaxUpdate();
  window.addEventListener("scroll", requestParallaxUpdate, { passive: true });
  window.addEventListener("resize", requestParallaxUpdate);
}

const STORAGE_KEYS = {
  events: "soldadinhos_events",
  memories: "soldadinhos_memories",
  summaries: "soldadinhos_summaries",
  soldiers: "soldadinhos_soldiers",
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

const DEFAULT_SOLDIERS = [
  {
    name: "Débora",
    role: "Educacao, felicidade e danca",
    photo: "assets/ester.png",
    traits: ["Educacao", "Brincalhona", "Feliz", "Comunicativa"],
    medals: ["Medalha da Alegria", "Medalha da Fe", "Medalha da Danca"],
  },
  {
    name: "Samuel",
    role: "Energia, estudos e brincadeiras",
    photo: "assets/samuel.png",
    traits: ["Energia", "Estudioso", "Lideranca", "Criatividade"],
    medals: ["Medalha da Coragem", "Medalha da Sabedoria", "Medalha da Missao"],
  },
  {
    name: "Levi",
    role: "Companheirismo e servico",
    photo:
      "https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&w=800&q=80",
    traits: ["Companheiro", "Pontual", "Ajudante", "Respeitoso"],
    medals: ["Medalha de Honra", "Medalha da Amizade", "Medalha da Perseveranca"],
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
      heroBg.style.backgroundImage = `linear-gradient(125deg, rgba(13, 74, 44, 0.75), rgba(9, 37, 24, 0.63)), url('${cover}')`;
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

function normalizeSoldiers() {
  const soldiers = readStorageArray(STORAGE_KEYS.soldiers, DEFAULT_SOLDIERS);
  const renamed = soldiers.map((soldier) =>
    soldier && soldier.name === "Ester" ? { ...soldier, name: "Débora" } : soldier
  );
  if (JSON.stringify(renamed) !== JSON.stringify(soldiers)) {
    localStorage.setItem(STORAGE_KEYS.soldiers, JSON.stringify(renamed));
  }
  return renamed;
}

function renderSoldiers() {
  if (!soldierSliderTrack || !soldierSliderWindow) return;

  const soldiers = normalizeSoldiers();
  if (!Array.isArray(soldiers) || soldiers.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;
  const dots = soldierDotsWrap ? Array.from(soldierDotsWrap.querySelectorAll(".soldier-dot")) : [];
  const SLOT_OFFSETS = [-3, -2, -1, 0, 1, 2, 3];

  if (soldiers.length <= 1) {
    if (soldierPrev) soldierPrev.style.display = "none";
    if (soldierNext) soldierNext.style.display = "none";
  }

  function soldierAt(offset) {
    const total = soldiers.length;
    const safeIndex = (currentIndex + offset + total * 20) % total;
    return soldiers[safeIndex];
  }

  function createCardMarkup(soldier, offset) {
    const traits = Array.isArray(soldier.traits) ? soldier.traits : [];
    const medals = Array.isArray(soldier.medals) ? soldier.medals : [];
    const featuredTrait = traits[0] || "Fiel";
    const featuredMedal = medals[0] || "Medalha da Fe";
    return `
      <article class="soldier-card slot-${offset}">
        <img class="soldier-card-logo" src="assets/logo-soldadinhos.png" alt="Logo Soldadinhos de Jesus" />
        <div class="soldier-photo-wrap">
          <img class="soldier-photo" src="${escapeHtml(soldier.photo || "assets/logo-soldadinhos.png")}" alt="${escapeHtml(soldier.name || "Soldadinho")}" />
        </div>
        <div class="soldier-content">
          <h3 class="soldier-name">${escapeHtml(soldier.name || "Soldadinho")}</h3>
          <p class="soldier-role">${escapeHtml(soldier.role || "Soldadinho de Deus")}</p>
          <div class="soldier-skills"><span class="skill-chip">${escapeHtml(featuredTrait)}</span></div>
          <div class="medals-row"><span class="medal-badge">${escapeHtml(featuredMedal)}</span></div>
        </div>
      </article>
    `;
  }

  function animateRotation(direction) {
    const rotateClass = direction < 0 ? "rotate-cw" : "rotate-ccw";
    soldierSliderTrack.classList.remove("rotate-cw", "rotate-ccw");
    void soldierSliderTrack.offsetWidth;
    soldierSliderTrack.classList.add(rotateClass);
    setTimeout(() => {
      soldierSliderTrack.classList.remove("rotate-cw", "rotate-ccw");
    }, 780);
  }

  function paint(withCenterTransition = false) {
    const previousCenter = withCenterTransition
      ? soldierSliderTrack.querySelector(".soldier-card.slot-0")
      : null;

    if (previousCenter) {
      const ghost = previousCenter.cloneNode(true);
      ghost.classList.add("soldier-center-ghost");
      soldierSliderWindow.appendChild(ghost);
      setTimeout(() => {
        ghost.remove();
      }, 760);
    }

    soldierSliderTrack.innerHTML = SLOT_OFFSETS.map((offset) => createCardMarkup(soldierAt(offset), offset)).join("");

    const newCenter = soldierSliderTrack.querySelector(".soldier-card.slot-0");
    if (newCenter && withCenterTransition) {
      newCenter.classList.add("center-enter");
      setTimeout(() => {
        newCenter.classList.remove("center-enter");
      }, 760);
    }

    if (dots.length > 0) {
      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
      });
    }
  }

  function goTo(index, direction = 1) {
    if (index < 0) {
      currentIndex = soldiers.length - 1;
    } else if (index >= soldiers.length) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    animateRotation(direction);
    paint(true);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      goTo(currentIndex - 1, -1);
    }, 4600);
  }

  if (soldierPrev) {
    soldierPrev.addEventListener("click", () => {
      goTo(currentIndex - 1, -1);
      startAutoplay();
    });
  }

  if (soldierNext) {
    soldierNext.addEventListener("click", () => {
      goTo(currentIndex + 1, 1);
      startAutoplay();
    });
  }

  if (dots.length > 0) {
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset.index || "0");
        goTo(index, index >= currentIndex ? 1 : -1);
        startAutoplay();
      });
    });
  }

  soldierSliderWindow.addEventListener("mouseenter", stopAutoplay);
  soldierSliderWindow.addEventListener("mouseleave", startAutoplay);

  paint();
  startAutoplay();
}

renderEventsList();
renderSummaries();
renderSoldiers();
initScrollMotionEffects();

const DONATION_CONFIG = {
  pixKey: "grdados.oficial@gmail.com",
  beneficiary: "SOLDADINHOS DE JESUS",
  city: "PONTA PORA",
  txidPrefix: "SOLD",
  transferBank: "Banco do Brasil",
  transferAgency: "0001",
  transferAccount: "12345-6",
  transferLinkBase: "https://wa.me/5567999999999",
};

const donationForm = document.getElementById("donationForm");
const donorNameInput = document.getElementById("donorName");
const donorDocumentInput = document.getElementById("donorDocument");
const donationMethodInput = document.getElementById("donationMethod");
const donationValueInput = document.getElementById("donationValue");
const donationSummary = document.getElementById("donationSummary");
const pixQrImage = document.getElementById("pixQrImage");
const copyPixCodeButton = document.getElementById("copyPixCode");
const transferLink = document.getElementById("transferLink");
const bankDetails = document.getElementById("bankDetails");
const donationWhatsapp = document.getElementById("donationWhatsapp");
const confirmReceiptButton = document.getElementById("confirmReceipt");
const receiptStatus = document.getElementById("receiptStatus");
const pixBox = document.getElementById("pixBox");
const transferBox = document.getElementById("transferBox");
const paymentModal = document.getElementById("paymentModal");
const paymentModalBackdrop = document.getElementById("paymentModalBackdrop");
const closePaymentModal = document.getElementById("closePaymentModal");
const receiptFileInput = document.getElementById("receiptFile");
const sendReceiptProofButton = document.getElementById("sendReceiptProof");

let currentPixPayload = "";

function digitsOnly(value) {
  return String(value || "").replace(/\D+/g, "");
}

function maskCpfCnpj(value) {
  const digits = digitsOnly(value).slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function tlv(id, value) {
  const safe = String(value || "");
  return `${id}${String(safe.length).padStart(2, "0")}${safe}`;
}

function crc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function sanitizePixText(value, maxLength) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]+/g, "")
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

function generatePixPayload({ amount, donorName }) {
  const merchantAccountInfo = tlv("26", tlv("00", "BR.GOV.BCB.PIX") + tlv("01", DONATION_CONFIG.pixKey));
  const txid = sanitizePixText(
    `${DONATION_CONFIG.txidPrefix}${Date.now().toString().slice(-6)}${(donorName || "DOADOR").slice(0, 4)}`,
    25
  );
  const additionalData = tlv("62", tlv("05", txid));

  const basePayload =
    tlv("00", "01") +
    tlv("01", "12") +
    merchantAccountInfo +
    tlv("52", "0000") +
    tlv("53", "986") +
    tlv("54", Number(amount).toFixed(2)) +
    tlv("58", "BR") +
    tlv("59", sanitizePixText(DONATION_CONFIG.beneficiary, 25)) +
    tlv("60", sanitizePixText(DONATION_CONFIG.city, 15)) +
    additionalData +
    "6304";

  return `${basePayload}${crc16(basePayload)}`;
}

function buildTransferMessage({ donorName, document, amount }) {
  return [
    "Ola, quero contribuir com o projeto Soldadinhos de Jesus.",
    `Nome: ${donorName}`,
    `CPF/CNPJ: ${document}`,
    `Valor: R$ ${Number(amount).toFixed(2).replace(".", ",")}`,
  ].join("\n");
}

function setReceiptStatus(message, isError = false) {
  if (!receiptStatus) return;
  receiptStatus.textContent = message;
  receiptStatus.classList.toggle("error", isError);
}

function openPaymentModal() {
  if (!paymentModal) return;
  paymentModal.classList.add("is-open");
  paymentModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closePaymentModalFn() {
  if (!paymentModal) return;
  paymentModal.classList.remove("is-open");
  paymentModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

if (donorDocumentInput) {
  donorDocumentInput.addEventListener("input", () => {
    donorDocumentInput.value = maskCpfCnpj(donorDocumentInput.value);
  });
}

if (donationForm) {
  donationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const donorName = (donorNameInput?.value || "").trim();
    const document = (donorDocumentInput?.value || "").trim();
    const method = donationMethodInput?.value || "pix";
    const amount = Number(donationValueInput?.value || "0");

    if (!donorName || !document || !amount || amount <= 0) {
      setReceiptStatus("Preencha os campos corretamente para gerar o pagamento.", true);
      return;
    }

    currentPixPayload = generatePixPayload({ amount, donorName });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(currentPixPayload)}`;
    if (pixQrImage) {
      pixQrImage.src = qrUrl;
    }

    const transferMessage = buildTransferMessage({ donorName, document, amount });
    const transferHref = `${DONATION_CONFIG.transferLinkBase}?text=${encodeURIComponent(transferMessage)}`;
    if (transferLink) {
      transferLink.href = transferHref;
    }
    if (donationWhatsapp) {
      donationWhatsapp.href = transferHref;
    }

    if (bankDetails) {
      bankDetails.innerHTML = `
        <strong>${escapeHtml(DONATION_CONFIG.transferBank)}</strong><br />
        Ag.: ${escapeHtml(DONATION_CONFIG.transferAgency)} | Conta: ${escapeHtml(DONATION_CONFIG.transferAccount)}<br />
        Favorecido: ${escapeHtml(DONATION_CONFIG.beneficiary)}
      `;
    }

    if (donationSummary) {
      donationSummary.textContent = `Contribuicao gerada para ${donorName}. Valor: R$ ${amount
        .toFixed(2)
        .replace(".", ",")} via ${method === "pix" ? "PIX" : "Transferencia"}.`;
    }

    if (pixBox) {
      pixBox.hidden = method === "transferencia";
    }
    if (transferBox) {
      transferBox.hidden = method === "pix";
    }

    setReceiptStatus("Pagamento gerado com sucesso. Finalize e clique em confirmar recebimento.");
    openPaymentModal();
  });
}

if (donationMethodInput) {
  donationMethodInput.addEventListener("change", () => {
    const method = donationMethodInput.value || "pix";
    if (pixBox) pixBox.hidden = method === "transferencia";
    if (transferBox) transferBox.hidden = method === "pix";
  });
}

if (copyPixCodeButton) {
  copyPixCodeButton.addEventListener("click", async () => {
    if (!currentPixPayload) {
      setReceiptStatus("Gere primeiro o pagamento PIX para copiar o codigo.", true);
      return;
    }
    try {
      await navigator.clipboard.writeText(currentPixPayload);
      setReceiptStatus("Codigo PIX copiado com sucesso.");
    } catch (error) {
      setReceiptStatus("Nao foi possivel copiar automaticamente. Tente novamente.", true);
    }
  });
}

if (confirmReceiptButton) {
  confirmReceiptButton.addEventListener("click", () => {
    const protocol = `SDJ-${new Date().getTime().toString().slice(-8)}`;
    setReceiptStatus(`Recebimento confirmado na hora. Protocolo ${protocol}.`);
  });
}

if (sendReceiptProofButton) {
  sendReceiptProofButton.addEventListener("click", () => {
    const selectedFile = receiptFileInput?.files && receiptFileInput.files.length > 0
      ? receiptFileInput.files[0]
      : null;
    if (!selectedFile) {
      setReceiptStatus("Selecione um comprovante para enviar.", true);
      return;
    }
    const protocol = `CPV-${new Date().getTime().toString().slice(-8)}`;
    setReceiptStatus(`Comprovante "${selectedFile.name}" enviado com sucesso. Protocolo ${protocol}.`);
  });
}

if (closePaymentModal) {
  closePaymentModal.addEventListener("click", closePaymentModalFn);
}

if (paymentModalBackdrop) {
  paymentModalBackdrop.addEventListener("click", closePaymentModalFn);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && paymentModal?.classList.contains("is-open")) {
    closePaymentModalFn();
  }
});



