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
