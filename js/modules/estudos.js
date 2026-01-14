(function () {
  const weekDays = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"];

  function render(view) {
    view.innerHTML = "";
    const data = StorageAPI.load().modules.estudos;
    const filterText = (data._meta && data._meta.filterText) || "";
    const filterValue = filterText.trim().toLowerCase();
    const match = (text) => !filterValue || String(text).toLowerCase().includes(filterValue);
    const filterBar = UI.createFilterBar("Filtrar estudos", filterText, (value) => {
      StorageAPI.update("estudos", (moduleData) => {
        moduleData._meta = moduleData._meta || {};
        moduleData._meta.filterText = value;
      });
      render(view);
    });
    view.appendChild(filterBar);
    const grid = UI.el("div", "planner-grid");

    const conteudoCard = UI.el("div", "card large");
    conteudoCard.appendChild(UI.el("div", "card-header header-yellow", "CONTEUDO"));
    const conteudoBody = UI.el("div", "card-body");
    const table = UI.el("table", "table");
    const headRow = UI.el("tr");
    ["Topico", "Leitura", "Resumo", "Exercicio", "Revisao", ""].forEach((text) => headRow.appendChild(UI.el("th", null, text)));
    table.appendChild(UI.el("thead")).appendChild(headRow);
    const tbody = UI.el("tbody");

    data.conteudo.forEach((item, index) => {
      if (!match(item.topico)) return;
      const row = UI.el("tr");
      row.appendChild(UI.el("td", null, item.topico));
      ["leitura", "resumo", "exercicio", "revisao"].forEach((key) => {
        const cell = UI.el("td");
        const checkbox = UI.createCheckbox(item[key]);
        checkbox.addEventListener("change", () => {
          StorageAPI.update("estudos", (moduleData) => {
            moduleData.conteudo[index][key] = checkbox.checked;
          });
        });
        cell.appendChild(checkbox);
        row.appendChild(cell);
      });
      const action = UI.el("td", "actions");
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novoTopico = window.prompt("Editar topico:", item.topico);
        if (!novoTopico) return;
        StorageAPI.update("estudos", (moduleData) => {
          moduleData.conteudo[index].topico = novoTopico.trim();
        });
        render(view);
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => {
        StorageAPI.update("estudos", (moduleData) => {
          moduleData.conteudo.splice(index, 1);
        });
        render(view);
      });
      action.appendChild(edit);
      action.appendChild(remove);
      row.appendChild(action);
      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    conteudoBody.appendChild(table);

    const addRow = UI.el("div", "input-row");
    const topico = document.createElement("input");
    topico.type = "text";
    topico.placeholder = "Novo topico";
    const add = document.createElement("button");
    add.textContent = "Adicionar";
    add.addEventListener("click", () => {
      if (!topico.value.trim()) return;
      StorageAPI.update("estudos", (moduleData) => {
        moduleData.conteudo.push({
          topico: topico.value.trim(),
          leitura: false,
          resumo: false,
          exercicio: false,
          revisao: false
        });
      });
      topico.value = "";
      render(view);
    });
    addRow.appendChild(topico);
    addRow.appendChild(add);
    conteudoBody.appendChild(addRow);

    conteudoCard.appendChild(conteudoBody);
    grid.appendChild(conteudoCard);

    const provasCard = UI.el("div", "card");
    provasCard.appendChild(UI.el("div", "card-header header-blue", "PROVAS, TRABALHOS E ENTREGAS"));
    const provasBody = UI.el("div", "card-body");
    const provasList = UI.el("div", "list");
    data.provas.forEach((item, index) => {
      if (!match(item.titulo)) return;
      const row = UI.el("div", "list-row");
      row.appendChild(UI.el("span", null, item.titulo + " - " + item.data));
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novoTitulo = window.prompt("Editar titulo:", item.titulo);
        if (!novoTitulo) return;
        const novaData = window.prompt("Editar data (AAAA-MM-DD):", item.data);
        StorageAPI.update("estudos", (moduleData) => {
          moduleData.provas[index].titulo = novoTitulo.trim();
          moduleData.provas[index].data = novaData || "";
        });
        render(view);
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => {
        StorageAPI.update("estudos", (moduleData) => {
          moduleData.provas.splice(index, 1);
        });
        render(view);
      });
      row.appendChild(edit);
      row.appendChild(remove);
      provasList.appendChild(row);
    });
    provasBody.appendChild(provasList);
    const provasRow = UI.el("div", "input-row");
    const titulo = document.createElement("input");
    titulo.type = "text";
    titulo.placeholder = "Titulo";
    const dataInput = document.createElement("input");
    dataInput.type = "date";
    const addProva = document.createElement("button");
    addProva.textContent = "Adicionar";
    addProva.addEventListener("click", () => {
      if (!titulo.value.trim()) return;
      StorageAPI.update("estudos", (moduleData) => {
        moduleData.provas.push({ titulo: titulo.value.trim(), data: dataInput.value });
      });
      titulo.value = "";
      dataInput.value = "";
      render(view);
    });
    provasRow.appendChild(titulo);
    provasRow.appendChild(dataInput);
    provasRow.appendChild(addProva);
    provasBody.appendChild(provasRow);
    provasCard.appendChild(provasBody);
    grid.appendChild(provasCard);

    const tarefasCard = UI.el("div", "card large");
    tarefasCard.appendChild(UI.el("div", "card-header header-green", "TAREFAS DA SEMANA"));
    const tarefasBody = UI.el("div", "card-body");
    weekDays.forEach((day) => {
      tarefasBody.appendChild(UI.el("p", "small", day.toUpperCase()));
      const list = UI.el("div", "list");
      (data.tarefasSemana[day] || []).forEach((item, index) => {
        if (!match(item.text)) return;
        const row = UI.el("div", "list-row");
        const label = UI.el("div", "label");
        const checkbox = UI.createCheckbox(item.done);
        checkbox.addEventListener("change", () => {
          StorageAPI.update("estudos", (moduleData) => {
            moduleData.tarefasSemana[day][index].done = checkbox.checked;
          });
        });
        label.appendChild(checkbox);
        label.appendChild(UI.el("span", null, item.text));
        const edit = UI.el("button", "icon-button", "editar");
        edit.addEventListener("click", () => {
          const novoTexto = window.prompt("Editar tarefa:", item.text);
          if (!novoTexto) return;
          StorageAPI.update("estudos", (moduleData) => {
            moduleData.tarefasSemana[day][index].text = novoTexto.trim();
          });
          render(view);
        });
        const remove = UI.el("button", "icon-button", "x");
        remove.addEventListener("click", () => {
          StorageAPI.update("estudos", (moduleData) => {
            moduleData.tarefasSemana[day].splice(index, 1);
          });
          render(view);
        });
        row.appendChild(label);
        row.appendChild(edit);
        row.appendChild(remove);
        list.appendChild(row);
      });
      tarefasBody.appendChild(list);
      const inputRow = UI.el("div", "input-row");
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Nova tarefa";
      const add = document.createElement("button");
      add.textContent = "Adicionar";
      add.addEventListener("click", () => {
        if (!input.value.trim()) return;
        StorageAPI.update("estudos", (moduleData) => {
          moduleData.tarefasSemana[day].push({ text: input.value.trim(), done: false });
        });
        input.value = "";
        render(view);
      });
      inputRow.appendChild(input);
      inputRow.appendChild(add);
      tarefasBody.appendChild(inputRow);
    });
    tarefasCard.appendChild(tarefasBody);
    grid.appendChild(tarefasCard);

    const gradeCard = UI.el("div", "card");
    gradeCard.appendChild(UI.el("div", "card-header header-purple", "GRADE FACULDADE"));
    const gradeBody = UI.el("div", "card-body");
    const gradeTable = UI.el("table", "table");
    const gradeHead = UI.el("tr");
    ["Disciplina", "Dia", "Horario", "Sala", ""].forEach((t) => gradeHead.appendChild(UI.el("th", null, t)));
    gradeTable.appendChild(UI.el("thead")).appendChild(gradeHead);
    const gradeBodyTable = UI.el("tbody");
    data.grade.forEach((item, index) => {
      if (!match(item.disciplina)) return;
      const row = UI.el("tr");
      row.appendChild(UI.el("td", null, item.disciplina));
      row.appendChild(UI.el("td", null, item.dia));
      row.appendChild(UI.el("td", null, item.horario));
      row.appendChild(UI.el("td", null, item.sala));
      const action = UI.el("td", "actions");
      const edit = UI.el("button", "icon-button", "editar");
      edit.addEventListener("click", () => {
        const novaDisciplina = window.prompt("Editar disciplina:", item.disciplina);
        if (!novaDisciplina) return;
        const novoDia = window.prompt("Editar dia:", item.dia);
        const novoHorario = window.prompt("Editar horario:", item.horario);
        const novaSala = window.prompt("Editar sala:", item.sala);
        StorageAPI.update("estudos", (moduleData) => {
          moduleData.grade[index].disciplina = novaDisciplina.trim();
          moduleData.grade[index].dia = novoDia ? novoDia.trim() : "";
          moduleData.grade[index].horario = novoHorario ? novoHorario.trim() : "";
          moduleData.grade[index].sala = novaSala ? novaSala.trim() : "";
        });
        render(view);
      });
      const remove = UI.el("button", "icon-button", "x");
      remove.addEventListener("click", () => {
        StorageAPI.update("estudos", (moduleData) => {
          moduleData.grade.splice(index, 1);
        });
        render(view);
      });
      action.appendChild(edit);
      action.appendChild(remove);
      row.appendChild(action);
      gradeBodyTable.appendChild(row);
    });
    gradeTable.appendChild(gradeBodyTable);
    gradeBody.appendChild(gradeTable);

    const gradeRow = UI.el("div", "input-row");
    const discInput = document.createElement("input");
    discInput.type = "text";
    discInput.placeholder = "Disciplina";
    const diaInput = document.createElement("input");
    diaInput.type = "text";
    diaInput.placeholder = "Dia";
    const horaInput = document.createElement("input");
    horaInput.type = "text";
    horaInput.placeholder = "Horario";
    const salaInput = document.createElement("input");
    salaInput.type = "text";
    salaInput.placeholder = "Sala";
    const addGrade = document.createElement("button");
    addGrade.textContent = "Adicionar";
    addGrade.addEventListener("click", () => {
      if (!discInput.value.trim()) return;
      StorageAPI.update("estudos", (moduleData) => {
        moduleData.grade.push({
          disciplina: discInput.value.trim(),
          dia: diaInput.value.trim(),
          horario: horaInput.value.trim(),
          sala: salaInput.value.trim()
        });
      });
      discInput.value = "";
      diaInput.value = "";
      horaInput.value = "";
      salaInput.value = "";
      render(view);
    });
    gradeRow.appendChild(discInput);
    gradeRow.appendChild(diaInput);
    gradeRow.appendChild(horaInput);
    gradeRow.appendChild(salaInput);
    gradeRow.appendChild(addGrade);
    gradeBody.appendChild(gradeRow);

    gradeCard.appendChild(gradeBody);
    grid.appendChild(gradeCard);

    view.appendChild(grid);
  }

  window.EstudosModule = { render };
})();
