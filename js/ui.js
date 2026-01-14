(function () {
  function el(tag, className, html) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function createCheckbox(checked) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "checkbox";
    input.checked = !!checked;
    return input;
  }

  function formatMoney(value) {
    const num = Number(value) || 0;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function parseNumber(value) {
    const num = Number(String(value).replace(",", "."));
    return Number.isFinite(num) ? num : 0;
  }

  function createFilterBar(placeholder, value, onChange) {
    const bar = el("div", "filter-bar");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder || "Filtrar";
    input.value = value || "";
    input.addEventListener("input", () => onChange(input.value));
    bar.appendChild(input);
    return bar;
  }

  window.UI = {
    el,
    createCheckbox,
    formatMoney,
    parseNumber,
    createFilterBar
  };
})();
