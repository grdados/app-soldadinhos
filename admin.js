const AUTH_KEY = "soldadinhos_admin_auth";

if (localStorage.getItem(AUTH_KEY) !== "ok") {
  window.location.href = "login.html?next=admin.html";
}

const STORAGE_KEYS = {
  events: "soldadinhos_events",
  memories: "soldadinhos_memories",
  summaries: "soldadinhos_summaries",
  soldiers: "soldadinhos_soldiers",
  cloudName: "soldadinhos_cloud_name",
  uploadPreset: "soldadinhos_upload_preset",
};

const DEFAULT_EVENTS = [
  {
    title: "Encontro de Marco 2026",
    date: "2026-03-14",
    summary: "Brincadeiras, ensino biblico e momentos especiais da criancada.",
    photos: [
      {
        title: "Brincadeiras educativas",
        description: "Jogos cooperativos com aprendizado de valores.",
        image:
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
        alt: "Criancas participando de atividade em grupo",
      },
    ],
  },
];

const DEFAULT_MEMORIES = [
  {
    title: "Encontro com alegria",
    description: "Louvor, brincadeiras e palavra de Deus em comunhao.",
    image:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    alt: "Criancas durante encontro",
  },
];

const DEFAULT_SUMMARIES = [
  {
    tag: "Encontro",
    title: "Como foi o ultimo sabado com a criancada",
    summary: "Resumo das atividades, licoes biblicas e testemunhos.",
    link: "#",
  },
];

const DEFAULT_SOLDIERS = [
  {
    name: "Débora",
    role: "Educacao, alegria e danca",
    photo: "assets/ester.png",
    traits: ["Educacao", "Brincalhona", "Feliz", "Danca"],
    medals: ["Medalha da Alegria", "Medalha da Fe", "Medalha da Amizade"],
  },
  {
    name: "Samuel",
    role: "Energia, estudos e brincadeiras",
    photo: "assets/samuel.png",
    traits: ["Energia", "Estudioso", "Criativo", "Companheiro"],
    medals: ["Medalha da Coragem", "Medalha da Sabedoria", "Medalha da Missao"],
  },
];

function readList(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return structuredClone(fallback);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return structuredClone(fallback);
    return parsed;
  } catch (error) {
    return structuredClone(fallback);
  }
}

function writeList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function showStatus(element, message, type = "success") {
  if (!element) return;
  element.textContent = message;
  element.classList.remove("success", "error");
  element.classList.add(type);
  setTimeout(() => {
    if (element.textContent === message) {
      element.textContent = "";
      element.classList.remove("success", "error");
    }
  }, 3500);
}

function getCloudConfig() {
  return {
    cloudName: (localStorage.getItem(STORAGE_KEYS.cloudName) || "").trim(),
    uploadPreset: (localStorage.getItem(STORAGE_KEYS.uploadPreset) || "").trim(),
  };
}

async function uploadImageToCloudinary(file, options = {}) {
  const { cloudName, uploadPreset } = getCloudConfig();
  if (!cloudName || !uploadPreset) {
    throw new Error("cloud_config_missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (options.folder) {
    formData.append("folder", options.folder);
  }

  let response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok && options.folder) {
    const fallbackData = new FormData();
    fallbackData.append("file", file);
    fallbackData.append("upload_preset", uploadPreset);
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      {
        method: "POST",
        body: fallbackData,
      }
    );
  }

  if (!response.ok) {
    throw new Error("upload_failed");
  }

  const data = await response.json();
  return data.secure_url || "";
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseCsv(text) {
  return String(text || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToCsv(list) {
  if (!Array.isArray(list)) return "";
  return list.join(", ");
}

let memories = readList(STORAGE_KEYS.memories, DEFAULT_MEMORIES);
let summaries = readList(STORAGE_KEYS.summaries, DEFAULT_SUMMARIES);
let events = readList(STORAGE_KEYS.events, DEFAULT_EVENTS);
let soldiers = readList(STORAGE_KEYS.soldiers, DEFAULT_SOLDIERS);

if (Array.isArray(soldiers)) {
  const renamed = soldiers.map((item) =>
    item && item.name === "Ester" ? { ...item, name: "Débora" } : item
  );
  if (JSON.stringify(renamed) !== JSON.stringify(soldiers)) {
    soldiers = renamed;
    writeList(STORAGE_KEYS.soldiers, soldiers);
  }
}

const tabButtons = Array.from(document.querySelectorAll(".admin-tab"));
const tabPanels = Array.from(document.querySelectorAll(".admin-tab-panel"));

const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");
const eventIndex = document.getElementById("eventIndex");
const eventTitle = document.getElementById("eventTitle");
const eventDate = document.getElementById("eventDate");
const eventSummary = document.getElementById("eventSummary");
const eventPhotoUrls = document.getElementById("eventPhotoUrls");
const eventPhotoFiles = document.getElementById("eventPhotoFiles");
const cancelEventEdit = document.getElementById("cancelEventEdit");
const resetEvents = document.getElementById("resetEvents");
const eventStatus = document.getElementById("eventStatus");

const memoryForm = document.getElementById("memoryForm");
const memoryList = document.getElementById("memoryList");
const memoryIndex = document.getElementById("memoryIndex");
const memoryTitle = document.getElementById("memoryTitle");
const memoryDescription = document.getElementById("memoryDescription");
const memoryImage = document.getElementById("memoryImage");
const memoryFile = document.getElementById("memoryFile");
const memoryAlt = document.getElementById("memoryAlt");
const uploadMemoryImage = document.getElementById("uploadMemoryImage");
const uploadStatus = document.getElementById("uploadStatus");
const memoryStatus = document.getElementById("memoryStatus");
const cancelMemoryEdit = document.getElementById("cancelMemoryEdit");
const resetMemories = document.getElementById("resetMemories");

const soldierForm = document.getElementById("soldierForm");
const soldierList = document.getElementById("soldierList");
const soldierIndex = document.getElementById("soldierIndex");
const soldierName = document.getElementById("soldierName");
const soldierRole = document.getElementById("soldierRole");
const soldierTraits = document.getElementById("soldierTraits");
const soldierMedals = document.getElementById("soldierMedals");
const soldierPhoto = document.getElementById("soldierPhoto");
const soldierFile = document.getElementById("soldierFile");
const uploadSoldierImage = document.getElementById("uploadSoldierImage");
const soldierUploadStatus = document.getElementById("soldierUploadStatus");
const soldierStatus = document.getElementById("soldierStatus");
const cancelSoldierEdit = document.getElementById("cancelSoldierEdit");
const resetSoldiers = document.getElementById("resetSoldiers");

const cloudForm = document.getElementById("cloudForm");
const cloudNameInput = document.getElementById("cloudName");
const uploadPresetInput = document.getElementById("uploadPreset");
const cloudStatus = document.getElementById("cloudStatus");

const summaryForm = document.getElementById("summaryForm");
const summaryList = document.getElementById("summaryList");
const summaryIndex = document.getElementById("summaryIndex");
const summaryTag = document.getElementById("summaryTag");
const summaryTitle = document.getElementById("summaryTitle");
const summaryText = document.getElementById("summaryText");
const summaryLink = document.getElementById("summaryLink");
const summaryStatus = document.getElementById("summaryStatus");
const cancelSummaryEdit = document.getElementById("cancelSummaryEdit");
const resetSummaries = document.getElementById("resetSummaries");
const logoutAdmin = document.getElementById("logoutAdmin");

function activateTab(tabKey) {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabKey);
  });
  tabPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.panel === tabKey);
  });
}

function clearEventForm() {
  eventForm.reset();
  eventIndex.value = "";
  if (eventPhotoFiles) {
    eventPhotoFiles.value = "";
  }
}

function clearMemoryForm() {
  memoryForm.reset();
  memoryIndex.value = "";
}

function clearSummaryForm() {
  summaryForm.reset();
  summaryIndex.value = "";
}

function clearSoldierForm() {
  soldierForm.reset();
  soldierIndex.value = "";
}

function renderEventList() {
  eventList.innerHTML = events
    .map((item, index) => {
      const count = Array.isArray(item.photos) ? item.photos.length : 0;
      return `
      <article class="list-item">
        <div>
          <p class="item-title">${escapeHtml(item.title)} (${escapeHtml(item.date || "sem data")})</p>
          <p class="item-sub">${escapeHtml(item.summary || "")}</p>
          <p class="item-sub">${count} foto(s) no evento</p>
        </div>
        <div class="item-actions">
          <button type="button" class="edit-btn" data-type="event" data-index="${index}">Editar</button>
          <button type="button" class="delete-btn" data-type="event" data-index="${index}">Excluir</button>
        </div>
      </article>
    `;
    })
    .join("");
}

function renderMemoryList() {
  memoryList.innerHTML = memories
    .map(
      (item, index) => `
      <article class="list-item">
        <div>
          <p class="item-title">${escapeHtml(item.title)}</p>
          <p class="item-sub">${escapeHtml(item.description)}</p>
          <p class="item-sub">${escapeHtml(item.image || "")}</p>
        </div>
        <div class="item-actions">
          <button type="button" class="edit-btn" data-type="memory" data-index="${index}">Editar</button>
          <button type="button" class="delete-btn" data-type="memory" data-index="${index}">Excluir</button>
        </div>
      </article>
    `
    )
    .join("");
}

function renderSummaryList() {
  summaryList.innerHTML = summaries
    .map(
      (item, index) => `
      <article class="list-item">
        <div>
          <p class="item-title">${escapeHtml(item.tag)} - ${escapeHtml(item.title)}</p>
          <p class="item-sub">${escapeHtml(item.summary)}</p>
          <p class="item-sub">${escapeHtml(item.link || "#")}</p>
        </div>
        <div class="item-actions">
          <button type="button" class="edit-btn" data-type="summary" data-index="${index}">Editar</button>
          <button type="button" class="delete-btn" data-type="summary" data-index="${index}">Excluir</button>
        </div>
      </article>
    `
    )
    .join("");
}

function renderSoldierList() {
  soldierList.innerHTML = soldiers
    .map((item, index) => {
      const traits = listToCsv(item.traits);
      const medals = listToCsv(item.medals);
      return `
      <article class="list-item soldier-item">
        <div>
          <p class="item-title">${escapeHtml(item.name)} - ${escapeHtml(item.role)}</p>
          <p class="item-sub">Habilidades: ${escapeHtml(traits || "-")}</p>
          <p class="item-sub">Medalhas: ${escapeHtml(medals || "-")}</p>
        </div>
        <img class="soldier-preview" src="${escapeHtml(item.photo || "assets/logo-soldadinhos.png")}" alt="${escapeHtml(item.name || "Soldadinho")}" />
        <div class="item-actions">
          <button type="button" class="edit-btn" data-type="soldier" data-index="${index}">Editar</button>
          <button type="button" class="delete-btn" data-type="soldier" data-index="${index}">Excluir</button>
        </div>
      </article>
    `;
    })
    .join("");
}

if (cloudForm) {
  const { cloudName, uploadPreset } = getCloudConfig();
  cloudNameInput.value = cloudName;
  uploadPresetInput.value = uploadPreset;

  cloudForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEYS.cloudName, cloudNameInput.value.trim());
      localStorage.setItem(STORAGE_KEYS.uploadPreset, uploadPresetInput.value.trim());
      showStatus(cloudStatus, "Configuracao salva com sucesso.", "success");
    } catch (error) {
      showStatus(cloudStatus, "Erro ao salvar configuracao.", "error");
    }
  });
}

memoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    let imageUrl = memoryImage.value.trim();
    const selectedFile =
      memoryFile && memoryFile.files && memoryFile.files.length > 0
        ? memoryFile.files[0]
        : null;

    if (selectedFile) {
      if (uploadStatus) uploadStatus.textContent = "Enviando imagem...";
      imageUrl = await uploadImageToCloudinary(selectedFile, {
        folder: "soldadinhos/memorias",
      });
      memoryImage.value = imageUrl;
      if (uploadStatus) uploadStatus.textContent = "Upload concluido.";
    }

    if (!imageUrl) {
      showStatus(memoryStatus, "Informe URL da imagem ou selecione um arquivo.", "error");
      return;
    }

    const payload = {
      title: memoryTitle.value.trim(),
      description: memoryDescription.value.trim(),
      image: imageUrl,
      alt: memoryAlt.value.trim() || memoryTitle.value.trim(),
    };

    const editIndex = Number(memoryIndex.value);
    if (Number.isInteger(editIndex) && memoryIndex.value !== "") {
      memories[editIndex] = payload;
    } else {
      memories.unshift(payload);
    }

    writeList(STORAGE_KEYS.memories, memories);
    renderMemoryList();
    clearMemoryForm();
    if (memoryFile) memoryFile.value = "";
    showStatus(memoryStatus, "Memoria salva com sucesso.", "success");
  } catch (error) {
    if (String(error.message).includes("cloud_config_missing")) {
      showStatus(memoryStatus, "Preencha Cloud Name e Upload Preset.", "error");
      return;
    }
    showStatus(memoryStatus, "Erro ao salvar memoria.", "error");
  }
});

summaryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const payload = {
    tag: summaryTag.value.trim(),
    title: summaryTitle.value.trim(),
    summary: summaryText.value.trim(),
    link: summaryLink.value.trim() || "#",
  };

  const editIndex = Number(summaryIndex.value);
  if (Number.isInteger(editIndex) && summaryIndex.value !== "") {
    summaries[editIndex] = payload;
  } else {
    summaries.unshift(payload);
  }

  writeList(STORAGE_KEYS.summaries, summaries);
  renderSummaryList();
  clearSummaryForm();
  showStatus(summaryStatus, "Resumo salvo com sucesso.", "success");
});

eventForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const urlsFromText = eventPhotoUrls.value
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    const uploadedPhotos = [];
    const files =
      eventPhotoFiles && eventPhotoFiles.files
        ? Array.from(eventPhotoFiles.files)
        : [];

    if (files.length > 0) {
      showStatus(eventStatus, "Enviando fotos do evento...", "success");
      const eventSlug = slugify(eventTitle.value.trim()) || "evento";
      const dateSlug = (eventDate.value || "").replaceAll("-", "") || "sem-data";
      const eventFolder = `soldadinhos/encontros/${dateSlug}-${eventSlug}`;
      for (const file of files) {
        const uploadedUrl = await uploadImageToCloudinary(file, {
          folder: eventFolder,
        });
        uploadedPhotos.push(uploadedUrl);
      }
    }

    const allPhotoUrls = [...urlsFromText, ...uploadedPhotos];
    if (allPhotoUrls.length === 0) {
      showStatus(eventStatus, "Adicione ao menos 1 foto (URL ou arquivo).", "error");
      return;
    }

    const photos = allPhotoUrls.map((url) => ({
      title: "Registro do encontro",
      description: "Memoria do projeto",
      image: url,
      alt: "Foto do encontro",
    }));

    const payload = {
      title: eventTitle.value.trim(),
      date: eventDate.value || "",
      summary: eventSummary.value.trim(),
      photos,
    };

    const editIndex = Number(eventIndex.value);
    if (Number.isInteger(editIndex) && eventIndex.value !== "") {
      events[editIndex] = payload;
    } else {
      events.unshift(payload);
    }

    writeList(STORAGE_KEYS.events, events);
    renderEventList();
    clearEventForm();
    showStatus(
      eventStatus,
      `Evento salvo com sucesso. ${allPhotoUrls.length} foto(s) vinculada(s).`,
      "success"
    );
  } catch (error) {
    if (String(error.message).includes("cloud_config_missing")) {
      showStatus(eventStatus, "Preencha Cloud Name e Upload Preset.", "error");
      return;
    }
    showStatus(eventStatus, "Erro ao salvar evento.", "error");
  }
});

soldierForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    let photoUrl = soldierPhoto.value.trim();
    const selectedFile =
      soldierFile && soldierFile.files && soldierFile.files.length > 0
        ? soldierFile.files[0]
        : null;

    if (selectedFile) {
      if (soldierUploadStatus) soldierUploadStatus.textContent = "Enviando foto...";
      photoUrl = await uploadImageToCloudinary(selectedFile, {
        folder: "soldadinhos/soldadinhos",
      });
      soldierPhoto.value = photoUrl;
      if (soldierUploadStatus) soldierUploadStatus.textContent = "Upload concluido.";
    }

    if (!photoUrl) {
      showStatus(soldierStatus, "Informe URL da foto ou envie um arquivo.", "error");
      return;
    }

    const payload = {
      name: soldierName.value.trim(),
      role: soldierRole.value.trim(),
      photo: photoUrl,
      traits: parseCsv(soldierTraits.value),
      medals: parseCsv(soldierMedals.value),
    };

    const editIndex = Number(soldierIndex.value);
    if (Number.isInteger(editIndex) && soldierIndex.value !== "") {
      soldiers[editIndex] = payload;
    } else {
      soldiers.unshift(payload);
    }

    writeList(STORAGE_KEYS.soldiers, soldiers);
    renderSoldierList();
    clearSoldierForm();
    if (soldierFile) soldierFile.value = "";
    showStatus(soldierStatus, "Soldadinho salvo com sucesso.", "success");
  } catch (error) {
    if (String(error.message).includes("cloud_config_missing")) {
      showStatus(soldierStatus, "Preencha Cloud Name e Upload Preset.", "error");
      return;
    }
    showStatus(soldierStatus, "Erro ao salvar soldadinho.", "error");
  }
});

if (uploadMemoryImage) {
  uploadMemoryImage.addEventListener("click", async () => {
    if (!memoryFile || !memoryFile.files || memoryFile.files.length === 0) {
      if (uploadStatus) uploadStatus.textContent = "Selecione uma imagem.";
      showStatus(memoryStatus, "Selecione uma imagem para enviar.", "error");
      return;
    }

    try {
      const file = memoryFile.files[0];
      if (uploadStatus) uploadStatus.textContent = "Enviando imagem...";
      memoryImage.value = await uploadImageToCloudinary(file, {
        folder: "soldadinhos/memorias",
      });
      if (!memoryAlt.value.trim()) {
        memoryAlt.value = memoryTitle.value.trim() || "Memoria do encontro";
      }
      if (uploadStatus) uploadStatus.textContent = "Upload concluido.";
      showStatus(memoryStatus, "Imagem enviada com sucesso.", "success");
    } catch (error) {
      if (uploadStatus) uploadStatus.textContent = "Erro no upload.";
      showStatus(memoryStatus, "Erro ao enviar imagem.", "error");
    }
  });
}

if (uploadSoldierImage) {
  uploadSoldierImage.addEventListener("click", async () => {
    if (!soldierFile || !soldierFile.files || soldierFile.files.length === 0) {
      if (soldierUploadStatus) soldierUploadStatus.textContent = "Selecione uma foto.";
      showStatus(soldierStatus, "Selecione uma foto para enviar.", "error");
      return;
    }

    try {
      const file = soldierFile.files[0];
      if (soldierUploadStatus) soldierUploadStatus.textContent = "Enviando foto...";
      soldierPhoto.value = await uploadImageToCloudinary(file, {
        folder: "soldadinhos/soldadinhos",
      });
      if (soldierUploadStatus) soldierUploadStatus.textContent = "Upload concluido.";
      showStatus(soldierStatus, "Foto enviada com sucesso.", "success");
    } catch (error) {
      if (soldierUploadStatus) soldierUploadStatus.textContent = "Erro no upload.";
      showStatus(soldierStatus, "Erro ao enviar foto.", "error");
    }
  });
}

if (cancelEventEdit) cancelEventEdit.addEventListener("click", clearEventForm);
if (cancelMemoryEdit) cancelMemoryEdit.addEventListener("click", clearMemoryForm);
if (cancelSummaryEdit) cancelSummaryEdit.addEventListener("click", clearSummaryForm);
if (cancelSoldierEdit) cancelSoldierEdit.addEventListener("click", clearSoldierForm);

if (resetEvents) {
  resetEvents.addEventListener("click", () => {
    events = structuredClone(DEFAULT_EVENTS);
    writeList(STORAGE_KEYS.events, events);
    renderEventList();
    clearEventForm();
    showStatus(eventStatus, "Eventos restaurados.", "success");
  });
}

if (resetMemories) {
  resetMemories.addEventListener("click", () => {
    memories = structuredClone(DEFAULT_MEMORIES);
    writeList(STORAGE_KEYS.memories, memories);
    renderMemoryList();
    clearMemoryForm();
    showStatus(memoryStatus, "Memorias restauradas.", "success");
  });
}

if (resetSummaries) {
  resetSummaries.addEventListener("click", () => {
    summaries = structuredClone(DEFAULT_SUMMARIES);
    writeList(STORAGE_KEYS.summaries, summaries);
    renderSummaryList();
    clearSummaryForm();
    showStatus(summaryStatus, "Resumos restaurados.", "success");
  });
}

if (resetSoldiers) {
  resetSoldiers.addEventListener("click", () => {
    soldiers = structuredClone(DEFAULT_SOLDIERS);
    writeList(STORAGE_KEYS.soldiers, soldiers);
    renderSoldierList();
    clearSoldierForm();
    showStatus(soldierStatus, "Soldadinhos restaurados.", "success");
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTab(button.dataset.tab || "memories");
  });
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const button = target.closest("button[data-type]");
  if (!button) return;

  const index = Number(button.dataset.index);
  const type = button.dataset.type;
  const isDelete = button.classList.contains("delete-btn");

  if (type === "memory") {
    if (isDelete) {
      memories.splice(index, 1);
      writeList(STORAGE_KEYS.memories, memories);
      renderMemoryList();
      clearMemoryForm();
      return;
    }
    const item = memories[index];
    memoryIndex.value = String(index);
    memoryTitle.value = item.title || "";
    memoryDescription.value = item.description || "";
    memoryImage.value = item.image || "";
    memoryAlt.value = item.alt || "";
    activateTab("memories");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (type === "summary") {
    if (isDelete) {
      summaries.splice(index, 1);
      writeList(STORAGE_KEYS.summaries, summaries);
      renderSummaryList();
      clearSummaryForm();
      return;
    }
    const item = summaries[index];
    summaryIndex.value = String(index);
    summaryTag.value = item.tag || "";
    summaryTitle.value = item.title || "";
    summaryText.value = item.summary || "";
    summaryLink.value = item.link === "#" ? "" : item.link || "";
    activateTab("summaries");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (type === "event") {
    if (isDelete) {
      events.splice(index, 1);
      writeList(STORAGE_KEYS.events, events);
      renderEventList();
      clearEventForm();
      showStatus(eventStatus, "Evento removido.", "success");
      return;
    }
    const item = events[index];
    eventIndex.value = String(index);
    eventTitle.value = item.title || "";
    eventDate.value = item.date || "";
    eventSummary.value = item.summary || "";
    eventPhotoUrls.value = Array.isArray(item.photos)
      ? item.photos.map((photo) => photo.image || "").filter(Boolean).join("\n")
      : "";
    activateTab("memories");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (type === "soldier") {
    if (isDelete) {
      soldiers.splice(index, 1);
      writeList(STORAGE_KEYS.soldiers, soldiers);
      renderSoldierList();
      clearSoldierForm();
      return;
    }
    const item = soldiers[index];
    soldierIndex.value = String(index);
    soldierName.value = item.name || "";
    soldierRole.value = item.role || "";
    soldierTraits.value = listToCsv(item.traits);
    soldierMedals.value = listToCsv(item.medals);
    soldierPhoto.value = item.photo || "";
    activateTab("soldiers");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

renderEventList();
renderMemoryList();
renderSummaryList();
renderSoldierList();
activateTab("memories");

if (logoutAdmin) {
  logoutAdmin.addEventListener("click", () => {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = "login.html";
  });
}


