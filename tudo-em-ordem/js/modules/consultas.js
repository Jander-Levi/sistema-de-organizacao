(function () {
  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules.consultas;
    const filterText = (data._meta && data._meta.filterText) || "";
    const filterValue = filterText.trim().toLowerCase();
    const match = (text) => !filterValue || String(text).toLowerCase().includes(filterValue);
    const filterBar = UI.createFilterBar("Filtrar consultas e exames", filterText, (value) => {
      StorageAPI.update("consultas", (moduleData) => {
        moduleData._meta = moduleData._meta || {};
        moduleData._meta.filterText = value;
      });
      render(view);
    });
    view.appendChild(filterBar);
    const split = UI.el("div", "split");
    const sidebar = UI.el("div", "sidebar");
    sidebar.appendChild(UI.el("h3", null, "Marcar Consulta"));
    sidebar.appendChild(UI.el("p", "card-muted", "Especialidades sugeridas"));
    const pills = UI.el("div", "pill-list");
    data.especialidades.forEach((esp) => {
      pills.appendChild(UI.el("span", "pill", esp));
    });
    sidebar.appendChild(pills);

    const addSpecRow = UI.el("div", "input-row");
    const specInput = document.createElement("input");
    specInput.type = "text";
    specInput.placeholder = "Nova especialidade";
    const addSpec = document.createElement("button");
    addSpec.textContent = "Adicionar";
    addSpec.addEventListener("click", () => {
      if (!specInput.value.trim()) return;
      StorageAPI.update("consultas", (moduleData) => {
        moduleData.especialidades.push(specInput.value.trim());
      });
      specInput.value = "";
      render(view);
    });
    addSpecRow.appendChild(specInput);
    addSpecRow.appendChild(addSpec);
    sidebar.appendChild(addSpecRow);

    const main = UI.el("div", "grid stack");

    const consultasCard = UI.el("div", "card");
    consultasCard.appendChild(UI.el("div", "card-header header-blue", "CONSULTAS"));
    const consultasBody = UI.el("div", "card-body");
    const consultasTable = UI.el("table", "table");
    const headRow = UI.el("tr");
    ["Especialidade", "Data", "Horario", "Endereco", ""].forEach((h) => headRow.appendChild(UI.el("th", null, h)));
    consultasTable.appendChild(UI.el("thead")).appendChild(headRow);
    const consultasTbody = UI.el("tbody");

    data.consultas.forEach((item, index) => {
      if (!match(item.especialidade)) return;
      const row = UI.el("tr");
      const esp = document.createElement("input");
      esp.type = "text";
      esp.value = item.especialidade;
      esp.addEventListener("input", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.consultas[index].especialidade = esp.value;
        });
      });
      const dataInput = document.createElement("input");
      dataInput.type = "date";
      dataInput.value = item.data;
      dataInput.addEventListener("input", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.consultas[index].data = dataInput.value;
        });
      });
      const horaInput = document.createElement("input");
      horaInput.type = "time";
      horaInput.value = item.horario;
      horaInput.addEventListener("input", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.consultas[index].horario = horaInput.value;
        });
      });
      const endInput = document.createElement("input");
      endInput.type = "text";
      endInput.value = item.endereco;
      endInput.addEventListener("input", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.consultas[index].endereco = endInput.value;
        });
      });

      row.appendChild(UI.el("td")).appendChild(esp);
      row.appendChild(UI.el("td")).appendChild(dataInput);
      row.appendChild(UI.el("td")).appendChild(horaInput);
      row.appendChild(UI.el("td")).appendChild(endInput);
      const action = UI.el("td", "actions");
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novaEsp = window.prompt("Editar especialidade:", item.especialidade);
        if (!novaEsp) return;
        const novaData = window.prompt("Editar data (AAAA-MM-DD):", item.data);
        const novoHorario = window.prompt("Editar horario:", item.horario);
        const novoEndereco = window.prompt("Editar endereco:", item.endereco);
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.consultas[index].especialidade = novaEsp.trim();
          moduleData.consultas[index].data = novaData || "";
          moduleData.consultas[index].horario = novoHorario || "";
          moduleData.consultas[index].endereco = novoEndereco ? novoEndereco.trim() : "";
        });
        render(view);
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.consultas.splice(index, 1);
        });
        render(view);
      });
      action.appendChild(edit);
      action.appendChild(remove);
      row.appendChild(action);
      consultasTbody.appendChild(row);
    });

    consultasTable.appendChild(consultasTbody);
    consultasBody.appendChild(consultasTable);

    const addRow = UI.el("div", "input-row");
    const espAdd = document.createElement("input");
    espAdd.type = "text";
    espAdd.placeholder = "Especialidade";
    const dataAdd = document.createElement("input");
    dataAdd.type = "date";
    const horaAdd = document.createElement("input");
    horaAdd.type = "time";
    const endAdd = document.createElement("input");
    endAdd.type = "text";
    endAdd.placeholder = "Endereco";
    const addBtn = document.createElement("button");
    addBtn.textContent = "Adicionar";
    addBtn.addEventListener("click", () => {
      if (!espAdd.value.trim()) return;
      StorageAPI.update("consultas", (moduleData) => {
        moduleData.consultas.push({
          especialidade: espAdd.value.trim(),
          data: dataAdd.value,
          horario: horaAdd.value,
          endereco: endAdd.value.trim()
        });
      });
      espAdd.value = "";
      dataAdd.value = "";
      horaAdd.value = "";
      endAdd.value = "";
      render(view);
    });
    addRow.appendChild(espAdd);
    addRow.appendChild(dataAdd);
    addRow.appendChild(horaAdd);
    addRow.appendChild(endAdd);
    addRow.appendChild(addBtn);
    consultasBody.appendChild(addRow);

    consultasCard.appendChild(consultasBody);
    main.appendChild(consultasCard);

    const examesCard = UI.el("div", "card");
    examesCard.appendChild(UI.el("div", "card-header header-green", "EXAMES"));
    const examesBody = UI.el("div", "card-body");
    const examesTable = UI.el("table", "table");
    const exHeadRow = UI.el("tr");
    ["Nome", "Data", "Horario", "Endereco", ""].forEach((h) => exHeadRow.appendChild(UI.el("th", null, h)));
    examesTable.appendChild(UI.el("thead")).appendChild(exHeadRow);
    const examesTbody = UI.el("tbody");

    data.exames.forEach((item, index) => {
      if (!match(item.nome)) return;
      const row = UI.el("tr");
      const nome = document.createElement("input");
      nome.type = "text";
      nome.value = item.nome;
      nome.addEventListener("input", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.exames[index].nome = nome.value;
        });
      });
      const dataInput = document.createElement("input");
      dataInput.type = "date";
      dataInput.value = item.data;
      dataInput.addEventListener("input", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.exames[index].data = dataInput.value;
        });
      });
      const horaInput = document.createElement("input");
      horaInput.type = "time";
      horaInput.value = item.horario;
      horaInput.addEventListener("input", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.exames[index].horario = horaInput.value;
        });
      });
      const endInput = document.createElement("input");
      endInput.type = "text";
      endInput.value = item.endereco;
      endInput.addEventListener("input", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.exames[index].endereco = endInput.value;
        });
      });

      row.appendChild(UI.el("td")).appendChild(nome);
      row.appendChild(UI.el("td")).appendChild(dataInput);
      row.appendChild(UI.el("td")).appendChild(horaInput);
      row.appendChild(UI.el("td")).appendChild(endInput);
      const action = UI.el("td", "actions");
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novoNome = window.prompt("Editar nome:", item.nome);
        if (!novoNome) return;
        const novaData = window.prompt("Editar data (AAAA-MM-DD):", item.data);
        const novoHorario = window.prompt("Editar horario:", item.horario);
        const novoEndereco = window.prompt("Editar endereco:", item.endereco);
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.exames[index].nome = novoNome.trim();
          moduleData.exames[index].data = novaData || "";
          moduleData.exames[index].horario = novoHorario || "";
          moduleData.exames[index].endereco = novoEndereco ? novoEndereco.trim() : "";
        });
        render(view);
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.exames.splice(index, 1);
        });
        render(view);
      });
      action.appendChild(edit);
      action.appendChild(remove);
      row.appendChild(action);
      examesTbody.appendChild(row);
    });

    examesTable.appendChild(examesTbody);
    examesBody.appendChild(examesTable);

    const exRow = UI.el("div", "input-row");
    const nomeAdd = document.createElement("input");
    nomeAdd.type = "text";
    nomeAdd.placeholder = "Nome";
    const dataEx = document.createElement("input");
    dataEx.type = "date";
    const horaEx = document.createElement("input");
    horaEx.type = "time";
    const endEx = document.createElement("input");
    endEx.type = "text";
    endEx.placeholder = "Endereco";
    const addEx = document.createElement("button");
    addEx.textContent = "Adicionar";
    addEx.addEventListener("click", () => {
      if (!nomeAdd.value.trim()) return;
      StorageAPI.update("consultas", (moduleData) => {
        moduleData.exames.push({
          nome: nomeAdd.value.trim(),
          data: dataEx.value,
          horario: horaEx.value,
          endereco: endEx.value.trim()
        });
      });
      nomeAdd.value = "";
      dataEx.value = "";
      horaEx.value = "";
      endEx.value = "";
      render(view);
    });
    exRow.appendChild(nomeAdd);
    exRow.appendChild(dataEx);
    exRow.appendChild(horaEx);
    exRow.appendChild(endEx);
    exRow.appendChild(addEx);
    examesBody.appendChild(exRow);

    examesCard.appendChild(examesBody);
    main.appendChild(examesCard);

    const vitCard = UI.el("div", "card");
    vitCard.appendChild(UI.el("div", "card-header header-purple", "VITAMINAS E REMEDIOS"));
    const vitBody = UI.el("div", "card-body");
    const vitList = UI.el("div", "list");
    data.vitaminas.forEach((item, index) => {
      if (!match(item.nome)) return;
      const row = UI.el("div", "list-row");
      const label = UI.el("div", "label");
      label.appendChild(UI.el("span", null, item.nome + " - " + item.horario));
      label.appendChild(UI.el("span", "tag", item.tag));
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novoNome = window.prompt("Editar nome:", item.nome);
        if (!novoNome) return;
        const novoHorario = window.prompt("Editar horario:", item.horario);
        const novaTag = window.prompt("Editar tag:", item.tag);
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.vitaminas[index].nome = novoNome.trim();
          moduleData.vitaminas[index].horario = novoHorario || "";
          moduleData.vitaminas[index].tag = novaTag ? novaTag.trim() : "";
        });
        render(view);
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => {
        StorageAPI.update("consultas", (moduleData) => {
          moduleData.vitaminas.splice(index, 1);
        });
        render(view);
      });
      row.appendChild(label);
      row.appendChild(edit);
      row.appendChild(remove);
      vitList.appendChild(row);
    });
    vitBody.appendChild(vitList);

    const vitRow = UI.el("div", "input-row");
    const vitNome = document.createElement("input");
    vitNome.type = "text";
    vitNome.placeholder = "Nome";
    const vitHora = document.createElement("input");
    vitHora.type = "time";
    const vitTag = document.createElement("input");
    vitTag.type = "text";
    vitTag.placeholder = "Tag";
    const vitAdd = document.createElement("button");
    vitAdd.textContent = "Adicionar";
    vitAdd.addEventListener("click", () => {
      if (!vitNome.value.trim()) return;
      StorageAPI.update("consultas", (moduleData) => {
        moduleData.vitaminas.push({
          nome: vitNome.value.trim(),
          horario: vitHora.value,
          tag: vitTag.value.trim() || "Rotina"
        });
      });
      vitNome.value = "";
      vitHora.value = "";
      vitTag.value = "";
      render(view);
    });
    vitRow.appendChild(vitNome);
    vitRow.appendChild(vitHora);
    vitRow.appendChild(vitTag);
    vitRow.appendChild(vitAdd);
    vitBody.appendChild(vitRow);

    vitCard.appendChild(vitBody);
    main.appendChild(vitCard);

    split.appendChild(sidebar);
    split.appendChild(main);
    view.appendChild(split);
  }

  window.ConsultasModule = { render };
})();
