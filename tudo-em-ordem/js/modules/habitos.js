(function () {
  const HEADER_CLASSES = ["header-yellow", "header-blue", "header-purple", "header-green", "header-pink"];

  function getCheck(moduleData, day, habit) {
    if (!moduleData.checks[day]) moduleData.checks[day] = {};
    return !!moduleData.checks[day][habit];
  }

  function setCheck(moduleData, day, habit, value) {
    if (!moduleData.checks[day]) moduleData.checks[day] = {};
    moduleData.checks[day][habit] = value;
  }

  function getRoutineCheck(row, day) {
    if (!row.checks[day]) row.checks[day] = false;
    return row.checks[day];
  }

  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules.habitos;
    const filterText = (data._meta && data._meta.filterText) || "";
    const filterValue = filterText.trim().toLowerCase();
    const match = (text) => !filterValue || String(text).toLowerCase().includes(filterValue);
    const filterBar = UI.createFilterBar("Filtrar urgencias", filterText, (value) => {
      StorageAPI.update("habitos", (moduleData) => {
        moduleData._meta = moduleData._meta || {};
        moduleData._meta.filterText = value;
      });
      render(view);
    });
    view.appendChild(filterBar);
    const grid = UI.el("div", "planner-grid");

    const habitosCard = UI.el("div", "card large");
    const header = UI.el("div", "card-header header-yellow");
    const progress = UI.el("span", "progress");
    header.innerHTML = "HABITOS DIARIOS";
    header.appendChild(progress);
    const body = UI.el("div", "card-body");

    const table = UI.el("table", "table");
    const thead = UI.el("thead");
    const headRow = UI.el("tr");
    headRow.appendChild(UI.el("th", null, "Dia"));
    data.habits.forEach((habit) => headRow.appendChild(UI.el("th", null, habit)));
    thead.appendChild(headRow);

    const tbody = UI.el("tbody");
    let checkedCount = 0;
    let totalCount = 0;

    data.days.forEach((day) => {
      const row = UI.el("tr");
      row.appendChild(UI.el("td", null, day));
      data.habits.forEach((habit) => {
        const cell = UI.el("td");
        const checkbox = UI.createCheckbox(getCheck(data, day, habit));
        checkbox.addEventListener("change", () => {
          StorageAPI.update("habitos", (moduleData) => {
            setCheck(moduleData, day, habit, checkbox.checked);
          });
          render(view);
        });
        if (checkbox.checked) checkedCount += 1;
        totalCount += 1;
        cell.appendChild(checkbox);
        row.appendChild(cell);
      });
      tbody.appendChild(row);
    });

    progress.textContent = totalCount ? Math.round((checkedCount / totalCount) * 100) + "%" : "0%";

    table.appendChild(thead);
    table.appendChild(tbody);
    body.appendChild(table);
    habitosCard.appendChild(header);
    habitosCard.appendChild(body);

    const mediaCard = UI.el("div", "card");
    const mediaHeader = UI.el("div", "card-header header-purple", "INSPIRACAO");
    const mediaBody = UI.el("div", "media", "Hoje e um bom dia para colocar tudo em ordem.");
    mediaCard.appendChild(mediaHeader);
    mediaCard.appendChild(mediaBody);

    const rotinaCard = UI.el("div", "card large");
    const rotinaHeader = UI.el("div", "card-header header-blue", "ROTINA SEMANAL");
    const rotinaBody = UI.el("div", "card-body");
    const rotinaTable = UI.el("table", "table");
    const rotinaHead = UI.el("tr");
    rotinaHead.appendChild(UI.el("th", null, "Horario"));
    data.days.forEach((day) => rotinaHead.appendChild(UI.el("th", null, day)));
    rotinaTable.appendChild(UI.el("thead")).appendChild(rotinaHead);

    const rotinaTbody = UI.el("tbody");
    data.rotina.forEach((rowItem, idx) => {
      const row = UI.el("tr");
      row.appendChild(UI.el("td", null, rowItem.hora));
      data.days.forEach((day) => {
        const cell = UI.el("td");
        const checkbox = UI.createCheckbox(getRoutineCheck(rowItem, day));
        checkbox.addEventListener("change", () => {
          StorageAPI.update("habitos", (moduleData) => {
            moduleData.rotina[idx].checks[day] = checkbox.checked;
          });
        });
        cell.appendChild(checkbox);
        row.appendChild(cell);
      });
      rotinaTbody.appendChild(row);
    });

    rotinaTable.appendChild(rotinaTbody);
    rotinaBody.appendChild(rotinaTable);
    rotinaCard.appendChild(rotinaHeader);
    rotinaCard.appendChild(rotinaBody);

    const urgenciasCard = UI.el("div", "card");
    const urgHeader = UI.el("div", "card-header header-pink", "URGENCIAS");
    const urgBody = UI.el("div", "card-body");
    const list = UI.el("div", "list");

    data.urgencias.forEach((item, index) => {
      if (!match(item.text)) return;
      const row = UI.el("div", "list-row");
      const label = UI.el("div", "label");
      const checkbox = UI.createCheckbox(item.done);
      checkbox.addEventListener("change", () => {
        StorageAPI.update("habitos", (moduleData) => {
          moduleData.urgencias[index].done = checkbox.checked;
        });
      });
      label.appendChild(checkbox);
      label.appendChild(UI.el("span", null, item.text));
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novoTexto = window.prompt("Editar urgencia:", item.text);
        if (!novoTexto) return;
        StorageAPI.update("habitos", (moduleData) => {
          moduleData.urgencias[index].text = novoTexto.trim();
        });
        render(view);
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => {
        StorageAPI.update("habitos", (moduleData) => {
          moduleData.urgencias.splice(index, 1);
        });
        render(view);
      });
      row.appendChild(label);
      row.appendChild(edit);
      row.appendChild(remove);
      list.appendChild(row);
    });

    const inputRow = UI.el("div", "input-row");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Nova urgencia";
    const add = document.createElement("button");
    add.textContent = "Adicionar";
    add.addEventListener("click", () => {
      if (!input.value.trim()) return;
      StorageAPI.update("habitos", (moduleData) => {
        moduleData.urgencias.push({ text: input.value.trim(), done: false });
      });
      input.value = "";
      render(view);
    });
    inputRow.appendChild(input);
    inputRow.appendChild(add);

    urgBody.appendChild(list);
    urgBody.appendChild(inputRow);
    urgenciasCard.appendChild(urgHeader);
    urgenciasCard.appendChild(urgBody);

    grid.appendChild(habitosCard);
    grid.appendChild(mediaCard);
    grid.appendChild(rotinaCard);
    grid.appendChild(urgenciasCard);

    view.appendChild(grid);
  }

  window.HabitosModule = { render };
})();
