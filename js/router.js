(function () {
  const routes = {
    "login": window.LoginModule,
    "dashboard": window.DashboardModule,
    "habitos": window.HabitosModule,
    "treinos": window.TreinosModule,
    "casa": window.CasaModule,
    "viagens": window.ViagensModule,
    "saude": window.SaudeModule,
    "consultas": window.ConsultasModule,
    "estudos": window.EstudosModule,
    "financas": window.FinancasModule
  };

  function getRoute() {
    const hash = window.location.hash || "#/habitos";
    const match = hash.replace("#/", "");
    return routes[match] ? match : "dashboard";
  }

  function render() {
    const view = document.getElementById("view");
    const route = getRoute();
    const requiresAuth = route !== "login";
    if (requiresAuth && window.FirebaseAPI && window.FirebaseAPI.isAuthenticated && !window.FirebaseAPI.isAuthenticated()) {
      window.location.hash = "#/login";
      return;
    }
    view.innerHTML = "";
    routes[route].render(view);

    const tabs = document.querySelectorAll(".tabs a");
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.getAttribute("href") === "#/" + route);
    });
  }

  window.Router = {
    render,
    getRoute
  };
})();
