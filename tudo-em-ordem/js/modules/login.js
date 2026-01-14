(function () {
  function render(view) {
    view.innerHTML = "";
    const container = UI.el("div", "grid");

    const card = UI.el("div", "card");
    card.appendChild(UI.el("div", "card-header header-blue", "LOGIN"));
    const body = UI.el("div", "card-body");
    const loginForm = document.createElement("form");
    loginForm.className = "list";

    const email = document.createElement("input");
    email.type = "email";
    email.placeholder = "Email";
    const password = document.createElement("input");
    password.type = "password";
    password.placeholder = "Senha";
    const msg = UI.el("p", "card-muted", "");
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Entrar";

    loginForm.appendChild(email);
    loginForm.appendChild(password);
    loginForm.appendChild(submit);
    loginForm.appendChild(msg);

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      msg.textContent = "Entrando...";
      FirebaseAPI.signIn(email.value.trim(), password.value)
        .then(() => {
          msg.textContent = "Login realizado.";
          window.location.hash = "#/dashboard";
        })
        .catch((err) => {
          msg.textContent = "Erro: " + (err && err.message ? err.message : "falha no login");
        });
    });

    body.appendChild(loginForm);
    card.appendChild(body);
    container.appendChild(card);

    const registerCard = UI.el("div", "card");
    registerCard.appendChild(UI.el("div", "card-header header-green", "CADASTRO"));
    const registerBody = UI.el("div", "card-body");
    const registerForm = document.createElement("form");
    registerForm.className = "list";

    const regEmail = document.createElement("input");
    regEmail.type = "email";
    regEmail.placeholder = "Email";
    const regPassword = document.createElement("input");
    regPassword.type = "password";
    regPassword.placeholder = "Senha";
    const regConfirm = document.createElement("input");
    regConfirm.type = "password";
    regConfirm.placeholder = "Confirmar senha";
    const regMsg = UI.el("p", "card-muted", "");
    const regSubmit = document.createElement("button");
    regSubmit.type = "submit";
    regSubmit.textContent = "Cadastrar";

    registerForm.appendChild(regEmail);
    registerForm.appendChild(regPassword);
    registerForm.appendChild(regConfirm);
    registerForm.appendChild(regSubmit);
    registerForm.appendChild(regMsg);

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (regPassword.value !== regConfirm.value) {
        regMsg.textContent = "As senhas nao conferem.";
        return;
      }
      regMsg.textContent = "Criando conta...";
      FirebaseAPI.signUp(regEmail.value.trim(), regPassword.value)
        .then(() => {
          regMsg.textContent = "Conta criada. Voce ja pode entrar.";
        })
        .catch((err) => {
          regMsg.textContent = "Erro: " + (err && err.message ? err.message : "falha no cadastro");
        });
    });

    registerBody.appendChild(registerForm);
    registerCard.appendChild(registerBody);
    container.appendChild(registerCard);

    view.appendChild(container);
  }

  window.LoginModule = { render };
})();
