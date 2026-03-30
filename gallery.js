const STORAGE_KEYS = {
  events: "soldadinhos_events",
};

const DEFAULT_EVENTS = [
  {
    title: "Encontro de Março 2026",
    date: "2026-03-14",
    summary: "Brincadeiras, ensino bíblico e momentos especiais da criançada.",
    photos: [
      {
        image:
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
        alt: "Crianças participando de atividade em grupo",
      },
      {
        image:
          "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=900&q=80",
        alt: "Mesa com lanche para encontro infantil",
      },
      {
        image:
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80",
        alt: "Crianças sorrindo durante encontro",
      },
    ],
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

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const events = readStorageArray(STORAGE_KEYS.events, DEFAULT_EVENTS);
const params = new URLSearchParams(window.location.search);
const eventParam = params.get("event");
const matchIndex = events.findIndex(
  (event, index) => eventKey(event, index) === eventParam
);
const selectedEvent = matchIndex >= 0 ? events[matchIndex] : events[0];

const galleryTitle = document.getElementById("galleryTitle");
const gallerySummary = document.getElementById("gallerySummary");
const photoGrid = document.getElementById("photoGrid");

if (selectedEvent) {
  const dateText = formatDate(selectedEvent.date);
  galleryTitle.textContent = dateText
    ? `${selectedEvent.title} - ${dateText}`
    : selectedEvent.title || "Galeria do Encontro";
  gallerySummary.textContent =
    selectedEvent.summary || "Registros especiais do encontro.";

  const photos = Array.isArray(selectedEvent.photos) ? selectedEvent.photos : [];
  photoGrid.innerHTML = photos
    .map(
      (photo) =>
        `<img src="${photo.image}" alt="${photo.alt || selectedEvent.title || "Foto do encontro"}" />`
    )
    .join("");
}
