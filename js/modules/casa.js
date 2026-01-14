(function () {
  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules.casa;
    const filterText = (data._meta && data._meta.filterText) || "";
    const filterValue = filterText.trim().toLowerCase();
    const match = (text) => !filterValue || String(text).toLowerCase().includes(filterValue);
    const filterBar = UI.createFilterBar("Filtrar itens", filterText, (value) => {
      StorageAPI.update("casa", (moduleData) => {
        moduleData._meta = moduleData._meta || {};
        moduleData._meta.filterText = value;
      });
      render(view);
    });
    view.appendChild(filterBar);
    const grid = UI.el("div", "planner-grid");

    Object.keys(data.categorias).forEach((category, idx) => {
      const card = UI.el("div", "card");
      const header = UI.el("div", "card-header " + (idx % 2 === 0 ? "header-green" : "header-yellow"));
      header.innerHTML = category.toUpperCase();
      const body = UI.el("div", "card-body");
      const list = UI.el("div", "list");

      data.categorias[category].forEach((item, index) => {
        if (!match(item.text)) return;
        const row = UI.el("div", "list-row");
        const label = UI.el("div", "label");
        const checkbox = UI.createCheckbox(item.done);
        checkbox.addEventListener("change", () => {
          StorageAPI.update("casa", (moduleData) => {
            moduleData.categorias[category][index].done = checkbox.checked;
          });
        });
        label.appendChild(checkbox);
        label.appendChild(UI.el("span", null, item.text));
        const edit = UI.el("button", "icon-button", "editar");
        edit.addEventListener("click", () => {
          const novoTexto = window.prompt("Editar item:", item.text);
          if (!novoTexto) return;
          StorageAPI.update("casa", (moduleData) => {
            moduleData.categorias[category][index].text = novoTexto.trim();
          });
          render(view);
        });
        const remove = UI.el("button", "icon-button", "x");
        remove.addEventListener("click", () => {
          StorageAPI.update("casa", (moduleData) => {
            moduleData.categorias[category].splice(index, 1);
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
      input.placeholder = "Adicionar item";
      const add = document.createElement("button");
      add.textContent = "Adicionar";
      add.addEventListener("click", () => {
        if (!input.value.trim()) return;
        StorageAPI.update("casa", (moduleData) => {
          moduleData.categorias[category].push({ text: input.value.trim(), done: false });
        });
        input.value = "";
        render(view);
      });
      inputRow.appendChild(input);
      inputRow.appendChild(add);

      body.appendChild(list);
      body.appendChild(inputRow);
      card.appendChild(header);
      card.appendChild(body);
      grid.appendChild(card);
    });

    view.appendChild(grid);
  }

  window.CasaModule = { render };
})();
