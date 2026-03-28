const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const currentYear = document.getElementById("currentYear");
const navLinks = document.querySelectorAll("#mainNav a");
const sectionNavLinks = document.querySelectorAll("#mainNav a[href^='#']");
const navIndicator = mainNav ? mainNav.querySelector(".nav-indicator") : null;
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
