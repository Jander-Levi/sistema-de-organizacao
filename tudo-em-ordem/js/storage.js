(function () {
  const STORAGE_KEY = "tudo-em-ordem";
  const WORKSPACE = "local";
  let suppressRemotePush = false;

  function getWorkspace() {
    if (window.FirebaseAPI && window.FirebaseAPI.getUser) {
      const user = window.FirebaseAPI.getUser();
      if (user && user.uid) return user.uid;
    }
    return WORKSPACE;
  }

  const seed = {
    workspace: WORKSPACE,
    lastUpdatedGlobal: "",
    filters: {
      monthYear: ""
    },
    modules: {
      habitos: {
        habits: ["Acordar 6h", "Devocional", "Exercicio Fisico", "Ler 10 paginas", "Tomar 2L de agua"],
        days: ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"],
        checks: {},
        rotina: [
          { hora: "06:00", checks: {} },
          { hora: "12:00", checks: {} },
          { hora: "18:00", checks: {} },
          { hora: "22:00", checks: {} }
        ],
        urgencias: [
          { text: "Atualizar documentos", done: false },
          { text: "Comprar medicamentos", done: true }
        ]
      },
      treinos: {
        dias: {
          "Segunda": [
            { exercicio: "Agachamento", reps: "4x12", done: false },
            { exercicio: "Leg Press", reps: "3x15", done: true }
          ],
          "Terca": [
            { exercicio: "Remada", reps: "4x10", done: false }
          ],
          "Quarta": [
            { exercicio: "Desenvolvimento", reps: "4x12", done: false }
          ],
          "Quinta": [
            { exercicio: "Gluteo no cabo", reps: "3x15", done: false }
          ]
        }
      },
      casa: {
        categorias: {
          "Hortifruti": [
            { text: "Banana", done: true },
            { text: "Tomate", done: false }
          ],
          "Acougue e Peixaria": [
            { text: "Frango", done: false }
          ],
          "Laticinios e Frios": [
            { text: "Iogurte", done: true }
          ],
          "Mercearia": [
            { text: "Arroz", done: false }
          ],
          "Padaria": [
            { text: "Pao integral", done: false }
          ],
          "Congelados": [
            { text: "Vegetais", done: false }
          ],
          "Limpeza": [
            { text: "Detergente", done: true }
          ],
          "Higiene Pessoal": [
            { text: "Sabonete", done: false }
          ],
          "Bebidas": [
            { text: "Agua com gas", done: false }
          ]
        }
      },
      viagens: {
        destino: "Lisboa",
        ida: "2025-07-10",
        volta: "2025-07-18",
        categorias: {
          "Passagens": [
            { desc: "Aereo ida e volta", estimado: 3200, real: 0 }
          ],
          "Hotel": [
            { desc: "Hospedagem 7 noites", estimado: 4200, real: 0 }
          ],
          "Passeios/Turismo": [
            { desc: "Museus e tours", estimado: 800, real: 0 }
          ],
          "Alimentacao": [
            { desc: "Restaurantes", estimado: 1200, real: 0 }
          ]
        }
      },
      saude: {
        corpo: [
          { text: "Alongamento", done: true },
          { text: "Hidratacao", done: false }
        ],
        skincareManha: [
          { text: "Limpeza", done: true },
          { text: "Protetor solar", done: false }
        ],
        skincareNoite: [
          { text: "Sabonete", done: false },
          { text: "Serum", done: false }
        ],
        cronograma: [
          { text: "Domingo - Hidratacao", done: false },
          { text: "Quarta - Nutricao", done: false }
        ],
        produtos: [
          { text: "Mascara facial", link: "https://" }
        ],
        tutoriais: [
          { text: "Massagem facial", link: "https://" }
        ]
      },
      consultas: {
        especialidades: ["Dermatologia", "Odontologia", "Cardiologia", "Ginecologia"],
        consultas: [
          { especialidade: "Dermatologia", data: "2025-06-12", horario: "14:00", endereco: "Clinica Central" }
        ],
        exames: [
          { nome: "Hemograma", data: "2025-06-20", horario: "09:00", endereco: "Laboratorio Alpha" }
        ],
        vitaminas: [
          { nome: "Vitamina D", horario: "08:00", tag: "Manha" },
          { nome: "Omega 3", horario: "21:00", tag: "Noite" }
        ]
      },
      estudos: {
        conteudo: [
          { topico: "Economia", leitura: true, resumo: false, exercicio: false, revisao: false }
        ],
        provas: [
          { titulo: "Trabalho de Sociologia", data: "2025-05-30" }
        ],
        tarefasSemana: {
          "Segunda": [ { text: "Ler capitulo 2", done: false } ],
          "Terca": [ { text: "Resumo aula", done: true } ],
          "Quarta": [],
          "Quinta": [],
          "Sexta": [],
          "Sabado": [],
          "Domingo": []
        },
        grade: [
          { disciplina: "Direito", dia: "Segunda", horario: "19:00", sala: "B2" }
        ]
      },
      financas: {
        meses: [
          { mes: "Janeiro", receitas: 5400, fixos: 2300, variaveis: 900, dividas: 200 },
          { mes: "Fevereiro", receitas: 5200, fixos: 2300, variaveis: 1100, dividas: 0 },
          { mes: "Marco", receitas: 5600, fixos: 2300, variaveis: 1200, dividas: 150 }
        ],
        receitasLancamentos: [
          { descricao: "Salario", valor: 5400, data: "2025-01-05" }
        ],
        despesasLancamentos: [
          { descricao: "Aluguel", valor: 1800, data: "2025-01-10" }
        ],
        investimentosLancamentos: [
          { descricao: "Tesouro Selic", valor: 400, data: "2025-01-12" }
        ],
        links: [
          { text: "Banco digital", url: "https://" },
          { text: "Planilha de investimentos", url: "https://" }
        ]
      }
    }
  };

  function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return JSON.parse(JSON.stringify(seed));
    }
    const data = JSON.parse(raw);
    data.filters = data.filters || { monthYear: "" };
    if (data.filters.monthYear === undefined) data.filters.monthYear = "";
    if (!data.lastUpdatedGlobal) data.lastUpdatedGlobal = "";
    if (data.modules && data.modules.financas) {
      data.modules.financas.receitasLancamentos = data.modules.financas.receitasLancamentos || [];
      data.modules.financas.despesasLancamentos = data.modules.financas.despesasLancamentos || [];
      data.modules.financas.investimentosLancamentos = data.modules.financas.investimentosLancamentos || [];
      data.modules.financas.links = data.modules.financas.links || [];
    }
    return data;
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (!suppressRemotePush && window.FirebaseAPI && window.FirebaseAPI.init()) {
      if (window.FirebaseAPI.isAuthenticated && window.FirebaseAPI.isAuthenticated()) {
        window.FirebaseAPI.push(getWorkspace(), data);
      }
    }
  }

  function saveFromRemote(data) {
    suppressRemotePush = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    suppressRemotePush = false;
  }

  function update(moduleName, updater) {
    const data = load();
    const moduleData = data.modules[moduleName];
    updater(moduleData, data);
    const now = new Date().toISOString();
    data.lastUpdatedGlobal = now;
    moduleData._meta = moduleData._meta || {};
    moduleData._meta.lastUpdated = now;
    save(data);
  }

  window.StorageAPI = {
    load,
    save,
    saveFromRemote,
    update,
    getWorkspace,
    key: STORAGE_KEY,
    workspace: WORKSPACE
  };
})();
