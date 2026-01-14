(function () {
  function calculateDays(ida, volta) {
    if (!ida || !volta) return 0;
    const start = new Date(ida);
    const end = new Date(volta);
    const diff = end - start;
    if (Number.isNaN(diff)) return 0;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  function sumCategory(items, key) {
    return items.reduce((acc, item) => acc + (Number(item[key]) || 0), 0);
  }

  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules.viagens;
    const filterText = (data._meta && data._meta.filterText) || "";
    const filterValue = filterText.trim().toLowerCase();
    const match = (text) => !filterValue || String(text).toLowerCase().includes(filterValue);
    const filterBar = UI.createFilterBar("Filtrar itens de viagem", filterText, (value) => {
      StorageAPI.update("viagens", (moduleData) => {
        moduleData._meta = moduleData._meta || {};
        moduleData._meta.filterText = value;
      });
      render(view);
    });
    view.appendChild(filterBar);
    const grid = UI.el("div", "planner-grid");

    const destinoCard = UI.el("div", "card");
    const destHeader = UI.el("div", "card-header header-purple", "DESTINO");
    const destBody = UI.el("div", "card-body");
    const days = calculateDays(data.ida, data.volta);

    destBody.innerHTML = `
      <div class="list">
        <div class="list-row"><span>Destino</span><strong>${data.destino}</strong></div>
        <div class="list-row"><span>Ida</span><strong>${data.ida || "-"}</strong></div>
        <div class="list-row"><span>Volta</span><strong>${data.volta || "-"}</strong></div>
        <div class="list-row"><span>Total de dias</span><strong>${days}</strong></div>
      </div>
    `;

    const destInput = UI.el("div", "input-row");
    const destName = document.createElement("input");
    destName.type = "text";
    destName.placeholder = "Novo destino";
    const idaInput = document.createElement("input");
    idaInput.type = "date";
    const voltaInput = document.createElement("input");
    voltaInput.type = "date";
    const save = document.createElement("button");
    save.textContent = "Salvar";
    save.addEventListener("click", () => {
      StorageAPI.update("viagens", (moduleData) => {
        if (destName.value.trim()) moduleData.destino = destName.value.trim();
        if (idaInput.value) moduleData.ida = idaInput.value;
        if (voltaInput.value) moduleData.volta = voltaInput.value;
      });
      render(view);
    });
    destInput.appendChild(destName);
    destInput.appendChild(idaInput);
    destInput.appendChild(voltaInput);
    destInput.appendChild(save);
    destBody.appendChild(destInput);

    destinoCard.appendChild(destHeader);
    destinoCard.appendChild(destBody);
    grid.appendChild(destinoCard);

    let totalEstimado = 0;
    let totalReal = 0;

    Object.keys(data.categorias).forEach((category, idx) => {
      const card = UI.el("div", "card");
      const header = UI.el("div", "card-header " + (idx % 2 === 0 ? "header-blue" : "header-green"));
      header.innerHTML = category.toUpperCase();
      const body = UI.el("div", "card-body");

      const table = UI.el("table", "table");
      const headRow = UI.el("tr");
      ["Descricao", "Valor Estimado", "Valor Real", ""].forEach((text) => {
        headRow.appendChild(UI.el("th", null, text));
      });
      table.appendChild(UI.el("thead")).appendChild(headRow);
      const tbody = UI.el("tbody");

      const list = data.categorias[category];
      list.forEach((item, index) => {
        if (!match(item.desc)) return;
        const row = UI.el("tr");
        row.appendChild(UI.el("td", null, item.desc));
        row.appendChild(UI.el("td", null, UI.formatMoney(item.estimado)));
        row.appendChild(UI.el("td", null, UI.formatMoney(item.real)));
        const action = UI.el("td", "actions");
        const edit = UI.el("button", "icon-button", "editar");
        edit.addEventListener("click", () => {
          const novaDesc = window.prompt("Editar descricao:", item.desc);
          if (!novaDesc) return;
          const novoEstimado = window.prompt("Valor estimado:", item.estimado);
          const novoReal = window.prompt("Valor real:", item.real);
          StorageAPI.update("viagens", (moduleData) => {
            moduleData.categorias[category][index].desc = novaDesc.trim();
            moduleData.categorias[category][index].estimado = UI.parseNumber(novoEstimado);
            moduleData.categorias[category][index].real = UI.parseNumber(novoReal);
          });
          render(view);
        });
        const remove = UI.el("button", "icon-button", "x");
        remove.addEventListener("click", () => {
          StorageAPI.update("viagens", (moduleData) => {
            moduleData.categorias[category].splice(index, 1);
          });
          render(view);
        });
        action.appendChild(edit);
        action.appendChild(remove);
        row.appendChild(action);
        tbody.appendChild(row);
      });

      table.appendChild(tbody);
      body.appendChild(table);

      const inputRow = UI.el("div", "input-row");
      const desc = document.createElement("input");
      desc.type = "text";
      desc.placeholder = "Descricao";
      const estimado = document.createElement("input");
      estimado.type = "number";
      estimado.placeholder = "Estimado";
      const real = document.createElement("input");
      real.type = "number";
      real.placeholder = "Real";
      const add = document.createElement("button");
      add.textContent = "Adicionar";
      add.addEventListener("click", () => {
        if (!desc.value.trim()) return;
        StorageAPI.update("viagens", (moduleData) => {
          moduleData.categorias[category].push({
            desc: desc.value.trim(),
            estimado: UI.parseNumber(estimado.value),
            real: UI.parseNumber(real.value)
          });
        });
        desc.value = "";
        estimado.value = "";
        real.value = "";
        render(view);
      });
      inputRow.appendChild(desc);
      inputRow.appendChild(estimado);
      inputRow.appendChild(real);
      inputRow.appendChild(add);
      body.appendChild(inputRow);

      const totalEst = sumCategory(list, "estimado");
      const totalRealCard = sumCategory(list, "real");
      totalEstimado += totalEst;
      totalReal += totalRealCard;
      body.appendChild(UI.el("p", "small", "Total: " + UI.formatMoney(totalEst) + " | Real: " + UI.formatMoney(totalRealCard)));

      card.appendChild(header);
      card.appendChild(body);
      grid.appendChild(card);
    });

    const totalCard = UI.el("div", "card");
    const totalHeader = UI.el("div", "card-header header-pink", "TOTAL GERAL");
    const totalBody = UI.el("div", "card-body");
    totalBody.innerHTML = `
      <div class="list">
        <div class="list-row"><span>Estimado</span><strong>${UI.formatMoney(totalEstimado)}</strong></div>
        <div class="list-row"><span>Real</span><strong>${UI.formatMoney(totalReal)}</strong></div>
      </div>
    `;
    totalCard.appendChild(totalHeader);
    totalCard.appendChild(totalBody);
    grid.appendChild(totalCard);

    view.appendChild(grid);
  }

  window.ViagensModule = { render };
})();
