const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const currentYear = document.getElementById("currentYear");
const navLinks = document.querySelectorAll("#mainNav a");
const parallaxRoot = document.querySelector("[data-parallax-root]");
const parallaxItems = document.querySelectorAll("[data-parallax]");

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
