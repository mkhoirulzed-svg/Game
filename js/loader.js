document.addEventListener("DOMContentLoaded", () => {
  loadLayout();
});

async function loadLayout() {
  await loadComponent("header", getComponentPath("header.html"));
  await loadComponent("footer", getComponentPath("footer.html"));

  setupHeader();
  setupFooterActive();
}

async function loadComponent(targetId, filePath) {
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error("Gagal memuat " + filePath);
    }

    target.innerHTML = await response.text();
  } catch (error) {
    console.error(error);
  }
}

function getComponentPath(fileName) {
  const isInsideFolder = location.pathname.includes("/games/");
  return isInsideFolder ? "../data/" + fileName : "data/" + fileName;
}

function setupHeader() {
  const body = document.body;

  const title = body.dataset.title || "Boring Game";
  const subtitle = body.dataset.subtitle || "Mini Games";
  const showSearch = body.dataset.search !== "false";

  const headerTitle = document.querySelector(".brand h1");
  const headerSubtitle = document.getElementById("pageSubtitle");
  const searchContainer = document.getElementById("searchContainer");

  if (headerTitle) headerTitle.textContent = title;
  if (headerSubtitle) headerSubtitle.textContent = subtitle;

  if (searchContainer && !showSearch) {
    searchContainer.style.display = "none";
  }
}

function setupFooterActive() {
  const path = location.pathname;

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");

    const nav = item.dataset.nav;

    if (
      (nav === "home" && path.endsWith("index.html")) ||
      (nav === "home" && path === "/") ||
      (nav === "favorite" && path.includes("favorite")) ||
      (nav === "recent" && path.includes("recent")) ||
      (nav === "settings" && path.includes("settings"))
    ) {
      item.classList.add("active");
    }
  });
}
