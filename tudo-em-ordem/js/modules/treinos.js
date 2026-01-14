(function () {
  const dayTitles = {
    "Segunda": "Quadriceps e Posterior",
    "Terca": "Costas e Biceps",
    "Quarta": "Ombros e Triceps",
    "Quinta": "Gluteos"
  };

  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules.treinos;
    const filterText = (data._meta && data._meta.filterText) || "";
    const filterValue = filterText.trim().toLowerCase();
    const match = (text) => !filterValue || String(text).toLowerCase().includes(filterValue);
    const filterBar = UI.createFilterBar("Filtrar exercicios", filterText, (value) => {
      StorageAPI.update("treinos", (moduleData) => {
        moduleData._meta = moduleData._meta || {};
        moduleData._meta.filterText = value;
      });
      render(view);
    });
    view.appendChild(filterBar);
    const grid = UI.el("div", "planner-grid");

    Object.keys(dayTitles).forEach((day, idx) => {
      const card = UI.el("div", "card");
      const header = UI.el("div", "card-header " + (idx % 2 === 0 ? "header-blue" : "header-green"));
      header.innerHTML = day.toUpperCase() + " - " + dayTitles[day];
      const body = UI.el("div", "card-body");

      const table = UI.el("table", "table");
      const headRow = UI.el("tr");
      ["Exercicio", "Repeticao e Carga", "Done", ""].forEach((text) => {
        headRow.appendChild(UI.el("th", null, text));
      });
      table.appendChild(UI.el("thead")).appendChild(headRow);
      const tbody = UI.el("tbody");

      const list = data.dias[day] || [];
      list.forEach((item, index) => {
        if (!match(item.exercicio)) return;
        const row = UI.el("tr");
        row.appendChild(UI.el("td", null, item.exercicio));
        row.appendChild(UI.el("td", null, item.reps));
        const doneCell = UI.el("td");
        const checkbox = UI.createCheckbox(item.done);
        checkbox.addEventListener("change", () => {
          StorageAPI.update("treinos", (moduleData) => {
            moduleData.dias[day][index].done = checkbox.checked;
          });
        });
        doneCell.appendChild(checkbox);
        row.appendChild(doneCell);
        const action = UI.el("td", "actions");
        const edit = UI.el("button", "icon-button", "editar");
        edit.addEventListener("click", () => {
          const novoExercicio = window.prompt("Editar exercicio:", item.exercicio);
          if (!novoExercicio) return;
          const novasReps = window.prompt("Editar repeticao e carga:", item.reps);
          StorageAPI.update("treinos", (moduleData) => {
            moduleData.dias[day][index].exercicio = novoExercicio.trim();
            moduleData.dias[day][index].reps = novasReps ? novasReps.trim() : "-";
          });
          render(view);
        });
        const remove = UI.el("button", "icon-button", "x");
        remove.addEventListener("click", () => {
          StorageAPI.update("treinos", (moduleData) => {
            moduleData.dias[day].splice(index, 1);
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
      const exerciseInput = document.createElement("input");
      exerciseInput.type = "text";
      exerciseInput.placeholder = "Novo exercicio";
      const repsInput = document.createElement("input");
      repsInput.type = "text";
      repsInput.placeholder = "Series e carga";
      const add = document.createElement("button");
      add.textContent = "Adicionar";
      add.addEventListener("click", () => {
        if (!exerciseInput.value.trim()) return;
        StorageAPI.update("treinos", (moduleData) => {
          moduleData.dias[day].push({
            exercicio: exerciseInput.value.trim(),
            reps: repsInput.value.trim() || "-",
            done: false
          });
        });
        exerciseInput.value = "";
        repsInput.value = "";
        render(view);
      });
      inputRow.appendChild(exerciseInput);
      inputRow.appendChild(repsInput);
      inputRow.appendChild(add);

      body.appendChild(inputRow);
      card.appendChild(header);
      card.appendChild(body);
      grid.appendChild(card);
    });

    view.appendChild(grid);
  }

  window.TreinosModule = { render };
})();
