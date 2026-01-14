(function () {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "habitos", label: "Habitos" },
    { id: "treinos", label: "Treinos" },
    { id: "casa", label: "Casa" },
    { id: "viagens", label: "Viagens" },
    { id: "saude", label: "Saude" },
    { id: "consultas", label: "Consultas" },
    { id: "estudos", label: "Estudos" },
    { id: "financas", label: "Financas" }
  ];

  function renderTabs() {
    const nav = document.getElementById("tabs");
    const workspaceBadge = document.querySelector(".workspace .badge");
    const isAuthed = window.FirebaseAPI && window.FirebaseAPI.isAuthenticated && window.FirebaseAPI.isAuthenticated();
    nav.innerHTML = "";
    if (!isAuthed) {
      if (workspaceBadge) workspaceBadge.textContent = "Workspace: visitante";
      return;
    }
    tabs.forEach((tab) => {
      const link = document.createElement("a");
      link.href = "#/" + tab.id;
      link.textContent = tab.label.toUpperCase();
      nav.appendChild(link);
    });
    if (workspaceBadge && window.FirebaseAPI.getUser) {
      const user = window.FirebaseAPI.getUser();
      workspaceBadge.textContent = user && user.email ? ("Workspace: " + user.email) : "Workspace: usuario";
    }
  }

  function applyTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("tudo-em-ordem-theme", theme);
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.textContent = theme === "dark" ? "Modo claro" : "Modo escuro";
    }
  }

  function initTheme() {
    const saved = localStorage.getItem("tudo-em-ordem-theme") || "light";
    applyTheme(saved);
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
      });
    }
  }

  function startApp() {
    renderTabs();
    initTheme();
    window.addEventListener("hashchange", Router.render);
    if (!window.location.hash) {
      window.location.hash = "#/dashboard";
    }
    Router.render();
  }

  function init() {
    const localData = StorageAPI.load();
    if (window.FirebaseAPI && window.FirebaseAPI.init()) {
      window.FirebaseAPI.onAuthStateChanged((user) => {
        if (!user) {
          startApp();
          Router.render();
          return;
        }
        const workspace = StorageAPI.getWorkspace();
        window.FirebaseAPI.pull(workspace)
          .then((remote) => {
            try {
              if (remote) {
                StorageAPI.saveFromRemote(remote);
              } else {
                window.FirebaseAPI.push(workspace, localData);
              }
            } catch (err) {
            }
          })
          .catch(() => {})
          .finally(() => {
            window.FirebaseAPI.subscribe(workspace, (remote) => {
              if (remote) {
                StorageAPI.saveFromRemote(remote);
                Router.render();
              }
            });
            startApp();
          });
      });
    } else {
      startApp();
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
