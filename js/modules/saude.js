(function () {
  function renderList(cardBody, items, onUpdate, withLink, match) {
    const list = UI.el("div", "list");
    items.forEach((item, index) => {
      const textValue = item.text || item.nome || "";
      if (match && !match(textValue)) return;
      const row = UI.el("div", "list-row");
      const label = UI.el("div", "label");
      if ("done" in item) {
        const checkbox = UI.createCheckbox(item.done);
        checkbox.addEventListener("change", () => onUpdate(index, { done: checkbox.checked }));
        label.appendChild(checkbox);
      }
      const text = UI.el("span", null, item.text || item.nome || "");
      label.appendChild(text);
      if (withLink && item.link) {
        const link = UI.el("a", "small", "link");
        link.href = item.link;
        link.target = "_blank";
        link.textContent = "abrir";
        label.appendChild(link);
      }
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novoTexto = window.prompt("Editar item:", item.text || "");
        if (!novoTexto) return;
        let novoLink = item.link;
        if (withLink) {
          novoLink = window.prompt("Editar link:", item.link || "https://");
        }
        onUpdate(index, { text: novoTexto.trim(), link: novoLink });
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => onUpdate(index, null));
      row.appendChild(label);
      row.appendChild(edit);
      row.appendChild(remove);
      list.appendChild(row);
    });
    cardBody.appendChild(list);
  }

  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules.saude;
    const filterText = (data._meta && data._meta.filterText) || "";
    const filterValue = filterText.trim().toLowerCase();
    const match = (text) => !filterValue || String(text).toLowerCase().includes(filterValue);
    const filterBar = UI.createFilterBar("Filtrar cuidados", filterText, (value) => {
      StorageAPI.update("saude", (moduleData) => {
        moduleData._meta = moduleData._meta || {};
        moduleData._meta.filterText = value;
      });
      render(view);
    });
    view.appendChild(filterBar);
    const grid = UI.el("div", "planner-grid");

    const sections = [
      { key: "corpo", title: "CORPO", color: "header-green", type: "check" },
      { key: "skincareManha", title: "SKINCARE MANHA", color: "header-yellow", type: "check" },
      { key: "skincareNoite", title: "SKINCARE NOITE", color: "header-blue", type: "check" },
      { key: "cronograma", title: "CRONOGRAMA CAPILAR", color: "header-purple", type: "check" },
      { key: "produtos", title: "PRODUTOS PARA COMPRAR", color: "header-pink", type: "link" },
      { key: "tutoriais", title: "TUTORIAIS", color: "header-green", type: "link" }
    ];

    sections.forEach((section) => {
      const card = UI.el("div", "card");
      const header = UI.el("div", "card-header " + section.color, section.title);
      const body = UI.el("div", "card-body");

      renderList(body, data[section.key], (index, updates) => {
        StorageAPI.update("saude", (moduleData) => {
          if (updates === null) {
            moduleData[section.key].splice(index, 1);
          } else {
            Object.assign(moduleData[section.key][index], updates);
          }
        });
        render(view);
      }, section.type === "link", match);

      const inputRow = UI.el("div", "input-row");
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = section.type === "link" ? "Descricao" : "Nova tarefa";
      inputRow.appendChild(input);
      let linkInput = null;
      if (section.type === "link") {
        linkInput = document.createElement("input");
        linkInput.type = "url";
        linkInput.placeholder = "Link";
        inputRow.appendChild(linkInput);
      }
      const add = document.createElement("button");
      add.textContent = "Adicionar";
      add.addEventListener("click", () => {
        if (!input.value.trim()) return;
        StorageAPI.update("saude", (moduleData) => {
          const item = { text: input.value.trim() };
          if (section.type === "check") item.done = false;
          if (section.type === "link") item.link = linkInput.value.trim() || "https://";
          moduleData[section.key].push(item);
        });
        input.value = "";
        if (linkInput) linkInput.value = "";
        render(view);
      });
      inputRow.appendChild(add);

      body.appendChild(inputRow);
      card.appendChild(header);
      card.appendChild(body);
      grid.appendChild(card);
    });

    const motivation = UI.el("div", "card");
    const motHeader = UI.el("div", "card-header header-purple", "MOTIVACAO");
    const motBody = UI.el("div", "media", "Cuidar de voce e prioridade.");
    motivation.appendChild(motHeader);
    motivation.appendChild(motBody);
    grid.appendChild(motivation);

    view.appendChild(grid);
  }

  window.SaudeModule = { render };
})();
