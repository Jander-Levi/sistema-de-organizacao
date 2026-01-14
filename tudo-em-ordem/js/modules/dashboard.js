(function () {
  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("pt-BR");
  }

  function addUpdateLine(lines, moduleData) {
    const updated = moduleData._meta && moduleData._meta.lastUpdated ? moduleData._meta.lastUpdated : "";
    lines.push("Atualizado: " + formatDate(updated));
    return lines;
  }

  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules;
    const grid = UI.el("div", "planner-grid");

    const cards = [
      {
        title: "HABITOS",
        color: "header-yellow",
        body: () => {
          const habitos = data.habitos;
          let checked = 0;
          let total = 0;
          habitos.days.forEach((day) => {
            habitos.habits.forEach((habit) => {
              total += 1;
              if (habitos.checks[day] && habitos.checks[day][habit]) checked += 1;
            });
          });
          return addUpdateLine([
            "Progresso semanal: " + (total ? Math.round((checked / total) * 100) : 0) + "%",
            "Urgencias: " + habitos.urgencias.length
          ], habitos);
        }
      },
      {
        title: "TREINOS",
        color: "header-blue",
        body: () => {
          const treinos = data.treinos;
          let total = 0;
          let done = 0;
          Object.keys(treinos.dias).forEach((day) => {
            treinos.dias[day].forEach((item) => {
              total += 1;
              if (item.done) done += 1;
            });
          });
          return addUpdateLine(["Exercicios: " + total, "Concluidos: " + done], treinos);
        }
      },
      {
        title: "CASA",
        color: "header-green",
        body: () => {
          const casa = data.casa;
          let total = 0;
          let done = 0;
          Object.keys(casa.categorias).forEach((cat) => {
            casa.categorias[cat].forEach((item) => {
              total += 1;
              if (item.done) done += 1;
            });
          });
          return addUpdateLine(["Itens: " + total, "Comprados: " + done], casa);
        }
      },
      {
        title: "VIAGENS",
        color: "header-purple",
        body: () => {
          const viagens = data.viagens;
          let est = 0;
          let real = 0;
          Object.keys(viagens.categorias).forEach((cat) => {
            viagens.categorias[cat].forEach((item) => {
              est += Number(item.estimado) || 0;
              real += Number(item.real) || 0;
            });
          });
          return addUpdateLine([
            "Destino: " + viagens.destino,
            "Estimado: " + UI.formatMoney(est),
            "Real: " + UI.formatMoney(real)
          ], viagens);
        }
      },
      {
        title: "SAUDE",
        color: "header-pink",
        body: () => {
          const saude = data.saude;
          const lists = [saude.corpo, saude.skincareManha, saude.skincareNoite, saude.cronograma];
          let total = 0;
          let done = 0;
          lists.forEach((list) => {
            list.forEach((item) => {
              total += 1;
              if (item.done) done += 1;
            });
          });
          return addUpdateLine(["Rotinas: " + total, "Concluidas: " + done], saude);
        }
      },
      {
        title: "CONSULTAS",
        color: "header-blue",
        body: () => {
          const consultas = data.consultas;
          return addUpdateLine([
            "Consultas: " + consultas.consultas.length,
            "Exames: " + consultas.exames.length,
            "Vitaminas: " + consultas.vitaminas.length
          ], consultas);
        }
      },
      {
        title: "ESTUDOS",
        color: "header-green",
        body: () => {
          const estudos = data.estudos;
          let tarefas = 0;
          Object.keys(estudos.tarefasSemana).forEach((day) => {
            tarefas += estudos.tarefasSemana[day].length;
          });
          return addUpdateLine([
            "Topicos: " + estudos.conteudo.length,
            "Tarefas semana: " + tarefas
          ], estudos);
        }
      },
      {
        title: "FINANCAS",
        color: "header-purple",
        body: () => {
          const fin = data.financas;
          const receitas = (fin.receitasLancamentos || []).reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
          const despesas = (fin.despesasLancamentos || []).reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
          const investimentos = (fin.investimentosLancamentos || []).reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
          return addUpdateLine([
            "Receitas: " + UI.formatMoney(receitas),
            "Despesas: " + UI.formatMoney(despesas),
            "Investimentos: " + UI.formatMoney(investimentos)
          ], fin);
        }
      }
    ];

    const lastUpdate = StorageAPI.load().lastUpdatedGlobal || null;
    const banner = UI.el("div", "card");
    banner.appendChild(UI.el("div", "card-header header-yellow", "ATUALIZACOES ESSENCIAIS"));
    const bannerBody = UI.el("div", "card-body");
    bannerBody.appendChild(UI.el("p", "card-muted", "Ultima atualizacao: " + formatDate(lastUpdate)));
    banner.appendChild(bannerBody);
    grid.appendChild(banner);

    cards.forEach((item) => {
      const card = UI.el("div", "card");
      card.appendChild(UI.el("div", "card-header " + item.color, item.title));
      const body = UI.el("div", "card-body");
      const list = UI.el("div", "list");
      item.body().forEach((line) => {
        list.appendChild(UI.el("div", "list-row", "<span>" + line + "</span>"));
      });
      body.appendChild(list);
      card.appendChild(body);
      grid.appendChild(card);
    });

    view.appendChild(grid);
  }

  window.DashboardModule = { render };
})();
