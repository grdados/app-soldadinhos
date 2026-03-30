const STORAGE_KEYS = {
  memories: "soldadinhos_memories",
  summaries: "soldadinhos_summaries",
  cloudName: "soldadinhos_cloud_name",
  uploadPreset: "soldadinhos_upload_preset",
};

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

memoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const payload = {
      title: memoryTitle.value.trim(),
      description: memoryDescription.value.trim(),
      image: memoryImage.value.trim(),
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
    showStatus(memoryStatus, "Memória salva com sucesso.", "success");
  } catch (error) {
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    if (uploadStatus) uploadStatus.textContent = "Enviando imagem...";

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(
          cloudName
        )}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Falha no upload");
      }

      const data = await response.json();
      memoryImage.value = data.secure_url || "";
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
  }
});

renderMemoryList();
renderSummaryList();
