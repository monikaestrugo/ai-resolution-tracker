const TOTAL = 10;
const STORAGE_KEY = "ai-resolution-tracker-v1";
const PROFILE_KEY = "ai-resolution-tracker-v1-profile";

const listEl = document.getElementById("weekendList");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const resetBtn = document.getElementById("resetBtn");
const profileSelect = document.getElementById("profileSelect");

function defaultState() {
  return Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    done: false,
    notes: "",
    links: ""
  }));
}

function storageKeyFor(profile) {
  return `${STORAGE_KEY}:${profile}`;
}

function loadProfile() {
  const stored = localStorage.getItem(PROFILE_KEY);
  return stored === "Klaus" ? "Klaus" : "Monika";
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, profile);
}

function loadState(profile) {
  const raw = localStorage.getItem(storageKeyFor(profile));
  if (!raw) return defaultState();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== TOTAL) {
      return defaultState();
    }
    return parsed.map((item, i) => ({
      id: i + 1,
      done: !!item.done,
      notes: String(item.notes || ""),
      links: String(item.links || "")
    }));
  } catch {
    return defaultState();
  }
}

function saveState(profile, state) {
  localStorage.setItem(storageKeyFor(profile), JSON.stringify(state));
}

function updateProgress(state) {
  const completed = state.filter((w) => w.done).length;
  const percent = Math.round((completed / TOTAL) * 100);
  progressText.textContent = `${completed}/${TOTAL} completed`;
  progressPercent.textContent = `${percent}%`;
  progressFill.style.width = `${percent}%`;
}

function render(profile) {
  const state = loadState(profile);
  listEl.innerHTML = "";
  state.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      state[index].done = checkbox.checked;
      saveState(profile, state);
      updateProgress(state);
    });

    const title = document.createElement("h2");
    title.textContent = `Weekend ${item.id}`;

    header.appendChild(checkbox);
    header.appendChild(title);

    const notesWrap = document.createElement("div");
    const notesLabel = document.createElement("div");
    notesLabel.className = "label";
    notesLabel.textContent = "Notes";
    const notes = document.createElement("textarea");
    notes.value = item.notes;
    notes.placeholder = "What did you work on?";
    notes.addEventListener("input", () => {
      state[index].notes = notes.value;
      saveState(profile, state);
    });
    notesWrap.appendChild(notesLabel);
    notesWrap.appendChild(notes);

    const linksWrap = document.createElement("div");
    const linksLabel = document.createElement("div");
    linksLabel.className = "label";
    linksLabel.textContent = "Links (one per line)";
    const links = document.createElement("textarea");
    links.value = item.links;
    links.placeholder = "https://example.com";
    links.addEventListener("input", () => {
      state[index].links = links.value;
      saveState(profile, state);
    });
    linksWrap.appendChild(linksLabel);
    linksWrap.appendChild(links);

    card.appendChild(header);
    card.appendChild(notesWrap);
    card.appendChild(linksWrap);
    listEl.appendChild(card);
  });

  updateProgress(state);
}

resetBtn.addEventListener("click", () => {
  const ok = confirm("Reset all weekends and clear notes/links?");
  if (!ok) return;
  const profile = profileSelect.value;
  const state = defaultState();
  saveState(profile, state);
  render(profile);
});

const initialProfile = loadProfile();
profileSelect.value = initialProfile;
render(initialProfile);

profileSelect.addEventListener("change", () => {
  const profile = profileSelect.value;
  saveProfile(profile);
  render(profile);
});
