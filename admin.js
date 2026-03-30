const STORAGE_KEYS = {
  events: "soldadinhos_events",
  memories: "soldadinhos_memories",
  summaries: "soldadinhos_summaries",
  cloudName: "soldadinhos_cloud_name",
  uploadPreset: "soldadinhos_upload_preset",
};

const DEFAULT_EVENTS = [
  {
    title: "Encontro de Março 2026",
    date: "2026-03-14",
    summary: "Brincadeiras, ensino bíblico e momentos especiais da criançada.",
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

const DEFAULT_MEMORIES = [
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

function readList(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [...fallback];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [...fallback];
  } catch (error) {
    return [...fallback];
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

let memories = readList(STORAGE_KEYS.memories, DEFAULT_MEMORIES);
let summaries = readList(STORAGE_KEYS.summaries, DEFAULT_SUMMARIES);
let events = readList(STORAGE_KEYS.events, DEFAULT_EVENTS);

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

function clearMemoryForm() {
  memoryForm.reset();
  memoryIndex.value = "";
}

function clearSummaryForm() {
  summaryForm.reset();
  summaryIndex.value = "";
}

function clearEventForm() {
  eventForm.reset();
  eventIndex.value = "";
  if (eventPhotoFiles) {
    eventPhotoFiles.value = "";
  }
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

function renderEventList() {
  if (!eventList) return;
  eventList.innerHTML = events
    .map((item, index) => {
      const count = Array.isArray(item.photos) ? item.photos.length : 0;
      return `
      <article class="list-item">
        <div>
          <p class="item-title">${escapeHtml(item.title)} (${escapeHtml(item.date || "sem data")})</p>
          <p class="item-sub">${escapeHtml(item.summary || "")}</p>
          <p class="item-sub">${count} foto(s) neste evento</p>
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

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

  // Fallback: if folder parameter is blocked by preset settings, retry without folder.
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

function renderMemoryList() {
  memoryList.innerHTML = memories
    .map(
      (item, index) => `
      <article class="list-item">
        <div>
          <p class="item-title">${escapeHtml(item.title)}</p>
          <p class="item-sub">${escapeHtml(item.description)}</p>
          <p class="item-sub">${escapeHtml(item.image)}</p>
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
      if (uploadStatus) uploadStatus.textContent = "Upload concluído.";
    }

    if (!imageUrl) {
      showStatus(
        memoryStatus,
        "Informe a URL da imagem ou selecione um arquivo para upload.",
        "error"
      );
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
    if (memoryFile) {
      memoryFile.value = "";
    }
    showStatus(memoryStatus, "Memória salva com sucesso.", "success");
  } catch (error) {
    if (String(error.message).includes("cloud_config_missing")) {
      showStatus(
        memoryStatus,
        "Preencha Cloud Name e Upload Preset para enviar arquivo.",
        "error"
      );
      return;
    }
    showStatus(memoryStatus, "Erro ao salvar memória.", "error");
  }
});

summaryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
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
  } catch (error) {
    showStatus(summaryStatus, "Erro ao salvar resumo.", "error");
  }
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

    const photos = allPhotoUrls.map((url, index) => ({
      title: `Foto ${index + 1}`,
      description: "Registro do encontro",
      image: url,
      alt: `Foto ${index + 1} do evento`,
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
      showStatus(
        eventStatus,
        "Preencha Cloud Name e Upload Preset para enviar arquivos.",
        "error"
      );
      return;
    }
    showStatus(eventStatus, "Erro ao salvar evento.", "error");
  }
});

if (cloudForm) {
  const { cloudName, uploadPreset } = getCloudConfig();
  cloudNameInput.value = cloudName;
  uploadPresetInput.value = uploadPreset;

  cloudForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      localStorage.setItem(STORAGE_KEYS.cloudName, cloudNameInput.value.trim());
      localStorage.setItem(
        STORAGE_KEYS.uploadPreset,
        uploadPresetInput.value.trim()
      );
      showStatus(cloudStatus, "Configuração salva com sucesso.", "success");
    } catch (error) {
      showStatus(cloudStatus, "Erro ao salvar configuração.", "error");
    }
  });
}

if (uploadMemoryImage) {
  uploadMemoryImage.addEventListener("click", async () => {
    if (!memoryFile || !memoryFile.files || memoryFile.files.length === 0) {
      if (uploadStatus) uploadStatus.textContent = "Selecione uma imagem.";
      showStatus(memoryStatus, "Selecione uma imagem para enviar.", "error");
      return;
    }

    const { cloudName, uploadPreset } = getCloudConfig();
    if (!cloudName || !uploadPreset) {
      if (uploadStatus) {
        uploadStatus.textContent = "Preencha Cloud Name e Upload Preset.";
      }
      showStatus(memoryStatus, "Preencha Cloud Name e Upload Preset.", "error");
      return;
    }

    const file = memoryFile.files[0];

    if (uploadStatus) uploadStatus.textContent = "Enviando imagem...";

    try {
      memoryImage.value = await uploadImageToCloudinary(file);
      if (!memoryAlt.value.trim()) {
        memoryAlt.value = memoryTitle.value.trim() || "Foto do encontro";
      }
      if (uploadStatus) uploadStatus.textContent = "Upload concluído.";
      showStatus(memoryStatus, "Imagem enviada com sucesso.", "success");
    } catch (error) {
      if (uploadStatus) uploadStatus.textContent = "Erro ao enviar imagem.";
      showStatus(memoryStatus, "Erro ao enviar imagem para o Cloudinary.", "error");
    }
  });
}

cancelMemoryEdit.addEventListener("click", clearMemoryForm);
cancelSummaryEdit.addEventListener("click", clearSummaryForm);
cancelEventEdit.addEventListener("click", clearEventForm);

resetMemories.addEventListener("click", () => {
  memories = [...DEFAULT_MEMORIES];
  writeList(STORAGE_KEYS.memories, memories);
  renderMemoryList();
  clearMemoryForm();
  showStatus(memoryStatus, "Memórias restauradas.", "success");
});

resetSummaries.addEventListener("click", () => {
  summaries = [...DEFAULT_SUMMARIES];
  writeList(STORAGE_KEYS.summaries, summaries);
  renderSummaryList();
  clearSummaryForm();
  showStatus(summaryStatus, "Resumos restaurados.", "success");
});

resetEvents.addEventListener("click", () => {
  events = [...DEFAULT_EVENTS];
  writeList(STORAGE_KEYS.events, events);
  renderEventList();
  clearEventForm();
  showStatus(eventStatus, "Eventos restaurados.", "success");
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
    memoryTitle.value = item.title;
    memoryDescription.value = item.description;
    memoryImage.value = item.image;
    memoryAlt.value = item.alt;
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
    summaryTag.value = item.tag;
    summaryTitle.value = item.title;
    summaryText.value = item.summary;
    summaryLink.value = item.link === "#" ? "" : item.link;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

renderEventList();
renderMemoryList();
renderSummaryList();
