const AUTH_KEY = "soldadinhos_admin_auth";

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginStatus = document.getElementById("loginStatus");

if (localStorage.getItem(AUTH_KEY) === "ok") {
  window.location.href = "admin.html";
}

function setStatus(message, isError = false) {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.classList.toggle("error", isError);
}

function getNextPage() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  return next && next.endsWith(".html") ? next : "admin.html";
}

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = (loginEmail?.value || "").trim().toLowerCase();
    const password = (loginPassword?.value || "").trim();

    const validEmail = "grdados.oficial@gmail.com";
    const validPassword = "123456";

    if (email === validEmail && password === validPassword) {
      localStorage.setItem(AUTH_KEY, "ok");
      setStatus("Login realizado com sucesso.");
      window.location.href = getNextPage();
      return;
    }

    setStatus("E-mail ou senha inválidos.", true);
  });
}
