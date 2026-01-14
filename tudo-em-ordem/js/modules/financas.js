(function () {
  function calcBalance(month) {
    return (Number(month.receitas) || 0) - ((Number(month.fixos) || 0) + (Number(month.variaveis) || 0) + (Number(month.dividas) || 0));
  }

  function getMonthKey(value) {
    if (!value) return "";
    return String(value).slice(0, 7);
  }

  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules.financas;
    data.receitasLancamentos = data.receitasLancamentos || [];
    data.despesasLancamentos = data.despesasLancamentos || [];
    data.investimentosLancamentos = data.investimentosLancamentos || [];
    const filterText = (data._meta && data._meta.filterText) || "";
    const filterValue = filterText.trim().toLowerCase();
    const match = (text) => !filterValue || String(text).toLowerCase().includes(filterValue);
    const grid = UI.el("div", "planner-grid");

    const filterBar = UI.createFilterBar("Filtrar movimentacoes", filterText, (value) => {
      StorageAPI.update("financas", (moduleData) => {
        moduleData._meta = moduleData._meta || {};
        moduleData._meta.filterText = value;
      });
      render(view);
    });
    view.appendChild(filterBar);

    const root = StorageAPI.load();
    const selectedMonth = root.filters.monthYear || new Date().toISOString().slice(0, 7);

    const totalsFromMeses = data.meses.reduce(
      (acc, month) => {
        acc.receitas += Number(month.receitas) || 0;
        acc.fixos += Number(month.fixos) || 0;
        acc.variaveis += Number(month.variaveis) || 0;
        acc.dividas += Number(month.dividas) || 0;
        return acc;
      },
      { receitas: 0, fixos: 0, variaveis: 0, dividas: 0 }
    );

    const receitasMes = data.receitasLancamentos.filter((item) => getMonthKey(item.data) === selectedMonth || !item.data);
    const despesasMes = data.despesasLancamentos.filter((item) => getMonthKey(item.data) === selectedMonth || !item.data);
    const investimentosMes = data.investimentosLancamentos.filter((item) => getMonthKey(item.data) === selectedMonth || !item.data);

    const totalReceitas = receitasMes.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
    const totalDespesas = despesasMes.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);
    const totalInvestimentos = investimentosMes.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);

    const cards = [
      { label: "RECEITAS", value: totalReceitas, color: "header-yellow" },
      { label: "DESPESAS", value: totalDespesas, color: "header-blue" },
      { label: "DIVIDAS", value: totalsFromMeses.dividas, color: "header-purple" },
      { label: "INVESTIMENTOS", value: totalInvestimentos, color: "header-green" }
    ];

    cards.forEach((cardInfo) => {
      const card = UI.el("div", "card");
      card.appendChild(UI.el("div", "card-header " + cardInfo.color, cardInfo.label));
      const body = UI.el("div", "card-body");
      body.appendChild(UI.el("h3", null, UI.formatMoney(cardInfo.value)));
      body.appendChild(UI.el("p", "card-muted", "Atualizado automaticamente"));
      card.appendChild(body);
      grid.appendChild(card);
    });

    const filterCard = UI.el("div", "card");
    filterCard.appendChild(UI.el("div", "card-header header-yellow", "CALENDARIO (MES/ANO)"));
    const filterBody = UI.el("div", "card-body");
    const filterRow = UI.el("div", "input-row");
    const monthInput = document.createElement("input");
    monthInput.type = "month";
    monthInput.value = selectedMonth;
    monthInput.addEventListener("change", () => {
      StorageAPI.update("financas", (moduleData, rootData) => {
        rootData.filters.monthYear = monthInput.value;
      });
      render(view);
    });
    filterRow.appendChild(monthInput);
    filterBody.appendChild(filterRow);
    filterBody.appendChild(UI.el("p", "card-muted", "Movimentacoes filtradas por mes."));
    filterCard.appendChild(filterBody);
    grid.appendChild(filterCard);

    const createLaunchCard = (title, color, listKey) => {
      const card = UI.el("div", "card");
      card.appendChild(UI.el("div", "card-header " + color, title));
      const body = UI.el("div", "card-body");
      const list = UI.el("div", "list");

      data[listKey].forEach((item, index) => {
        if (!match(item.descricao)) return;
        const row = UI.el("div", "list-row");
        row.appendChild(UI.el("span", null, item.descricao + " - " + UI.formatMoney(item.valor) + " (" + (item.data || "-") + ")"));
        const edit = UI.el("button", "icon-button", "editar");
        edit.addEventListener("click", () => {
          const novaDescricao = window.prompt("Editar descricao:", item.descricao);
          if (!novaDescricao) return;
          const novoValor = window.prompt("Editar valor:", item.valor);
          const novaData = window.prompt("Editar data (AAAA-MM-DD):", item.data || "");
          StorageAPI.update("financas", (moduleData) => {
            moduleData[listKey][index].descricao = novaDescricao.trim();
            moduleData[listKey][index].valor = UI.parseNumber(novoValor);
            moduleData[listKey][index].data = novaData || "";
          });
          render(view);
        });
        const remove = UI.el("button", "icon-button", "x");
        remove.addEventListener("click", () => {
          StorageAPI.update("financas", (moduleData) => {
            moduleData[listKey].splice(index, 1);
          });
          render(view);
        });
        row.appendChild(edit);
        row.appendChild(remove);
        list.appendChild(row);
      });

      const inputRow = UI.el("div", "input-row");
      const descricao = document.createElement("input");
      descricao.type = "text";
      descricao.placeholder = "Descricao";
      const valor = document.createElement("input");
      valor.type = "number";
      valor.placeholder = "Valor";
      const dataInput = document.createElement("input");
      dataInput.type = "date";
      const add = document.createElement("button");
      add.textContent = "Adicionar";
      add.addEventListener("click", () => {
        if (!descricao.value.trim()) return;
        StorageAPI.update("financas", (moduleData) => {
          moduleData[listKey].push({
            descricao: descricao.value.trim(),
            valor: UI.parseNumber(valor.value),
            data: dataInput.value || ""
          });
        });
        descricao.value = "";
        valor.value = "";
        dataInput.value = "";
        render(view);
      });
      inputRow.appendChild(descricao);
      inputRow.appendChild(valor);
      inputRow.appendChild(dataInput);
      inputRow.appendChild(add);

      body.appendChild(list);
      body.appendChild(inputRow);
      card.appendChild(body);
      return card;
    };

    grid.appendChild(createLaunchCard("LANCAR RECEITAS", "header-yellow", "receitasLancamentos"));
    grid.appendChild(createLaunchCard("LANCAR DESPESAS", "header-blue", "despesasLancamentos"));
    grid.appendChild(createLaunchCard("LANCAR INVESTIMENTOS", "header-green", "investimentosLancamentos"));

    const movCard = UI.el("div", "card");
    movCard.appendChild(UI.el("div", "card-header header-purple", "MOVIMENTACOES DO MES"));
    const movBody = UI.el("div", "card-body");
    const movList = UI.el("div", "list");

    const rows = [
      { label: "Receitas", total: totalReceitas, count: receitasMes.length },
      { label: "Despesas", total: totalDespesas, count: despesasMes.length },
      { label: "Investimentos", total: totalInvestimentos, count: investimentosMes.length }
    ];

    rows.forEach((row) => {
      movList.appendChild(UI.el("div", "list-row", "<span>" + row.label + " (" + row.count + ")</span><strong>" + UI.formatMoney(row.total) + "</strong>"));
    });
    movBody.appendChild(movList);
    movCard.appendChild(movBody);
    grid.appendChild(movCard);

    const monthlyCard = UI.el("div", "card");
    monthlyCard.appendChild(UI.el("div", "card-header header-blue", "ORCAMENTO MENSAL"));
    const monthlyBody = UI.el("div", "card-body");
    const monthsList = UI.el("div", "months");

    data.meses.forEach((month, index) => {
      const btn = UI.el("button", index === (data.selectedMes || 0) ? "active" : "", month.mes);
      btn.addEventListener("click", () => {
        StorageAPI.update("financas", (moduleData) => {
          moduleData.selectedMes = index;
        });
        render(view);
      });
      monthsList.appendChild(btn);
    });

    const selected = data.meses[data.selectedMes || 0] || data.meses[0];
    const resumo = UI.el("div", "list");
    resumo.appendChild(UI.el("div", "list-row", "<span>Receitas</span><strong>" + UI.formatMoney(selected.receitas) + "</strong>"));
    resumo.appendChild(UI.el("div", "list-row", "<span>Fixos</span><strong>" + UI.formatMoney(selected.fixos) + "</strong>"));
    resumo.appendChild(UI.el("div", "list-row", "<span>Variaveis</span><strong>" + UI.formatMoney(selected.variaveis) + "</strong>"));
    resumo.appendChild(UI.el("div", "list-row", "<span>Dividas</span><strong>" + UI.formatMoney(selected.dividas) + "</strong>"));
    resumo.appendChild(UI.el("div", "list-row", "<span>Balanco</span><strong>" + UI.formatMoney(calcBalance(selected)) + "</strong>"));

    monthlyBody.appendChild(monthsList);
    monthlyBody.appendChild(resumo);
    monthlyCard.appendChild(monthlyBody);
    grid.appendChild(monthlyCard);

    const calcCard = UI.el("div", "card");
    calcCard.appendChild(UI.el("div", "card-header header-purple", "CALCULADORA"));
    const calcBody = UI.el("div", "card-body");
    const calculator = UI.el("div", "calculator");
    const in1 = document.createElement("input");
    in1.type = "number";
    in1.placeholder = "Valor 1";
    const in2 = document.createElement("input");
    in2.type = "number";
    in2.placeholder = "Valor 2";
    const result = UI.el("div", "card-muted", "Resultado: 0");
    const sumBtn = document.createElement("button");
    sumBtn.textContent = "Somar";
    sumBtn.addEventListener("click", () => {
      const total = UI.parseNumber(in1.value) + UI.parseNumber(in2.value);
      result.textContent = "Resultado: " + UI.formatMoney(total);
    });
    calculator.appendChild(in1);
    calculator.appendChild(in2);
    calculator.appendChild(sumBtn);
    calculator.appendChild(result);
    calcBody.appendChild(calculator);
    calcCard.appendChild(calcBody);
    grid.appendChild(calcCard);

    const linksCard = UI.el("div", "card");
    linksCard.appendChild(UI.el("div", "card-header header-green", "LINKS IMPORTANTES"));
    const linksBody = UI.el("div", "card-body");
    const linksList = UI.el("div", "list");
    data.links.forEach((item, index) => {
      if (!match(item.text)) return;
      const row = UI.el("div", "list-row");
      const link = UI.el("a", null, item.text);
      link.href = item.url;
      link.target = "_blank";
      row.appendChild(link);
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novoTexto = window.prompt("Editar nome:", item.text);
        if (!novoTexto) return;
        const novaUrl = window.prompt("Editar URL:", item.url);
        StorageAPI.update("financas", (moduleData) => {
          moduleData.links[index].text = novoTexto.trim();
          moduleData.links[index].url = novaUrl ? novaUrl.trim() : "https://";
        });
        render(view);
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => {
        StorageAPI.update("financas", (moduleData) => {
          moduleData.links.splice(index, 1);
        });
        render(view);
      });
      row.appendChild(edit);
      row.appendChild(remove);
      linksList.appendChild(row);
    });
    linksBody.appendChild(linksList);

    const linkRow = UI.el("div", "input-row");
    const linkText = document.createElement("input");
    linkText.type = "text";
    linkText.placeholder = "Nome do link";
    const linkUrl = document.createElement("input");
    linkUrl.type = "url";
    linkUrl.placeholder = "URL";
    const addLink = document.createElement("button");
    addLink.textContent = "Adicionar";
    addLink.addEventListener("click", () => {
      if (!linkText.value.trim()) return;
      StorageAPI.update("financas", (moduleData) => {
        moduleData.links.push({ text: linkText.value.trim(), url: linkUrl.value.trim() || "https://" });
      });
      linkText.value = "";
      linkUrl.value = "";
      render(view);
    });
    linkRow.appendChild(linkText);
    linkRow.appendChild(linkUrl);
    linkRow.appendChild(addLink);
    linksBody.appendChild(linkRow);

    linksCard.appendChild(linksBody);
    grid.appendChild(linksCard);

    view.appendChild(grid);
  }

  window.FinancasModule = { render };
})();
