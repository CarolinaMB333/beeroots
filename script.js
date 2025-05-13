// Elementos do DOM
const form = document.querySelector(".form-meta");
const listaMetas = document.querySelector(".lista-metas");
const historicoMetas = document.querySelector(".lista-historico");
const imagemArvore = document.querySelector(".imagem-arvore");
const divJardim = document.querySelector("#jardim");
const divMedalhas = document.querySelector(".conquistas-medalhas");

// Estado
let metas = JSON.parse(localStorage.getItem("metas")) || [];
let historico = JSON.parse(localStorage.getItem("historico")) || [];
let arvoreNivel = parseInt(localStorage.getItem("arvoreNivel")) || 1;
let jardim = JSON.parse(localStorage.getItem("jardim")) || [];

// Salva dados no localStorage
function salvarDados() {
  localStorage.setItem("metas", JSON.stringify(metas));
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("arvoreNivel", arvoreNivel);
  localStorage.setItem("jardim", JSON.stringify(jardim));
}

// Atualiza imagem da árvore principal
function atualizarArvore() {
  const metasFalhadas = metas.filter(meta => meta.status === "falhou");
  imagemArvore.src = metasFalhadas.length > 0
    ? "assets/imagens/arvore_morta1.png"
    : `assets/imagens/arvore${Math.min(arvoreNivel, 5)}.png`;
}

// Atualiza o jardim
function atualizarJardim() {
  divJardim.innerHTML = "";
  jardim.forEach(arvore => {
    const container = document.createElement("div");
    container.className = "text-center";
    if (arvoreNivel === 5) {
      container.innerHTML = `
      <img src="assets/imagens/penai.png" class="w-20 mx-auto" />
      <p class="text-sm text-gray-500 mt-1">🌿 ${arvore.data}</p>
    `;
      divJardim.appendChild(container);
    }
  });
}

// Atualiza medalhas
function atualizarMedalhas() {
  const total = jardim.length;
  const medalhas = [];
  if (total >= 3) medalhas.push("🥉");
  if (total >= 5) medalhas.push("🥈");
  if (total >= 10) medalhas.push("🥇");
  if (total >= 20) medalhas.push("🏆");
  divMedalhas.innerHTML = medalhas.map(m => `<span>${m}</span>`).join("");
}

// Define a cor de fundo de acordo com o tipo
function getTipoCor(tipo) {
  switch (tipo) {
    case "curto": return "bg-green-100 border-green-400";
    case "medio": return "bg-yellow-100 border-yellow-400";
    case "longo": return "bg-red-100 border-red-400";
    default: return "bg-gray-100";
  }
}

// Exibe metas pendentes
function renderizarMetas() {
  listaMetas.innerHTML = "";
  metas.forEach((meta, index) => {
    const li = document.createElement("li");
    li.className = `${meta.tipo} border-l-4 p-4 ${getTipoCor(meta.tipo)}`;
    li.innerHTML = `
      <strong>${meta.titulo}</strong> <span class="text-sm">${meta.prioridade ? "🐝" : ""}</span><br>
      <small>${meta.descricao}</small><br>
      <small>Prazo: ${meta.prazo}</small><br>
      <button onclick="concluirMeta(${index})" class="mt-2 bg-blue-500 text-white px-3 py-1 rounded">Concluir</button>
    `;
    listaMetas.appendChild(li);
  });
}

// Exibe histórico de metas concluídas
function renderizarHistorico() {
  historicoMetas.innerHTML = "";
  historico.forEach(meta => {
    const li = document.createElement("li");
    li.className = "bg-gray-100 border-l-4 border-gray-400 p-4";
    li.innerHTML = `
      <strong>${meta.titulo}</strong><br>
      <small>${meta.descricao}</small><br>
      <small>Status: ✅ Concluída</small>
    `;
    historicoMetas.insertBefore(li, historicoMetas.firstChild);
  });
}

// Verifica se alguma meta está atrasada
function verificarMetasConcluidas() {
  const hoje = new Date();
  metas = metas.map(meta => {
    const prazo = new Date(meta.prazo);
    if (!meta.concluida && hoje > prazo) {
      meta.status = "falhou";
    }
    return meta;
  });
  salvarDados();
  atualizarArvore();
  renderizarMetas();
}

// Concluir uma meta
function concluirMeta(index) {
  const meta = metas[index];
  meta.concluida = true;
  meta.status = "concluida";
  historico.push(meta);
  metas.splice(index, 1);

  arvoreNivel = Math.min(arvoreNivel + 1, 5);
  jardim.push({
    imagem: `arvore${arvoreNivel}.png`,
    data: new Date().toLocaleDateString()
  });

  salvarDados();
  atualizarArvore();
  atualizarJardim();
  atualizarMedalhas();
  renderizarMetas();
  renderizarHistorico();
}

// Evento de envio do formulário
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const descricao = document.getElementById("descricao").value;
  const prazo = document.getElementById("prazo").value;
  const tipo = document.getElementById("tipo").value;
  const prioridade = document.getElementById("prioridade").checked;

  metas.push({
    titulo,
    descricao,
    prazo,
    tipo,
    prioridade,
    concluida: false,
    status: "pendente"
  });

  salvarDados();
  renderizarMetas();
  form.reset();
});

// Inicialização
verificarMetasConcluidas();
renderizarMetas();
renderizarHistorico();
atualizarArvore();
atualizarJardim();
atualizarMedalhas();
