const form = document.getElementById("metaForm");
const listaMetas = document.getElementById("listaMetas");
const historicoMetas = document.getElementById("historicoMetas");
const imagemArvore = document.getElementById("imagemArvore");
const divJardim = document.getElementById("jardim");
const divMedalhas = document.getElementById("medalhas");

let metas = JSON.parse(localStorage.getItem("metas")) || [];
let historico = JSON.parse(localStorage.getItem("historico")) || [];
let arvoreNivel = parseInt(localStorage.getItem("arvoreNivel")) || 1;
let jardim = JSON.parse(localStorage.getItem("jardim")) || [];

function salvarDados() {
  localStorage.setItem("metas", JSON.stringify(metas));
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("arvoreNivel", arvoreNivel);
  localStorage.setItem("jardim", JSON.stringify(jardim));
}

function atualizarArvore() {
  imagemArvore.src = `assets/images/arvore${Math.min(arvoreNivel, 5)}.png`;
}

function atualizarJardim() {
  divJardim.innerHTML = "";
  jardim.forEach(arvore => {
    const container = document.createElement("div");
    container.className = "text-center";
    container.innerHTML = 
      `<img src="assets/images/${arvore.imagem}" class="w-20 mx-auto" />
      <p class="text-sm text-gray-500 mt-1">🌿 ${arvore.data}</p>`;
    divJardim.appendChild(container);
  });
}

function atualizarMedalhas() {
  const total = jardim.length;
  const medalhas = [];
  if (total >= 3) medalhas.push("🥉");
  if (total >= 5) medalhas.push("🥈");
  if (total >= 10) medalhas.push("🥇");
  if (total >= 20) medalhas.push("🏆");
  divMedalhas.innerHTML = medalhas.map(m => `<span>${m}</span>`).join("");
}

function getTipoCor(tipo) {
  switch (tipo) {
    case "curto": return "bg-green-100 border-green-400";
    case "medio": return "bg-yellow-100 border-yellow-400";
    case "longo": return "bg-red-100 border-red-400";
    default: return "bg-gray-100";
  }
}

function renderizarMetas() {
  listaMetas.innerHTML = "";
  const hoje = new Date();
  let metasFiltradas = [...metas];
  const filtro = document.getElementById("filtro").value;
  const ordenacao = document.getElementById("ordenacao").value;

  if (filtro !== "todas") {
    metasFiltradas = metasFiltradas.filter(meta =>
      filtro === "prioridade" ? meta.prioridade : meta.tipo === filtro
    );
  }

  if (ordenacao === "prazo") {
    metasFiltradas.sort((a, b) => new Date(a.prazo) - new Date(b.prazo));
  } else if (ordenacao === "tipo") {
    metasFiltradas.sort((a, b) => a.tipo.localeCompare(b.tipo));
  }

  metasFiltradas.forEach((meta, index) => {
    const prazo = new Date(meta.prazo);
    const diasRestantes = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
    const tipoCor = getTipoCor(meta.tipo);
    const prioridadeIcone = meta.prioridade ? "🐝 " : "";
    const opacidade = diasRestantes < 0 ? "opacity-50" : "";
    const bordaUrgente = diasRestantes <= 2 && diasRestantes >= 0 ? "border-2 border-red-500" : "";

    const li = document.createElement("li");
    li.className = `p-4 rounded-lg shadow-sm ${tipoCor} ${opacidade} ${bordaUrgente}
      flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2`;
    li.innerHTML = 
      `<div>
        <p class="font-semibold text-lg">${prioridadeIcone}${meta.titulo}</p>
        <p class="text-sm text-gray-700">${meta.descricao}</p>
        <p class="text-xs text-gray-500">Prazo: ${meta.prazo}</p>
      </div>
      <button onclick="concluirMeta(${index})"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
        Meta Batida
      </button>`;
    listaMetas.appendChild(li);
  });
}

function renderizarHistorico() {
  historicoMetas.innerHTML = "";
  historico.forEach(meta => {
    const li = document.createElement("li");
    li.className = "p-4 rounded-lg shadow bg-gray-100 flex justify-between items-center";
    li.innerHTML = `
      <div>
        <p class="font-semibold">${meta.titulo}</p>
        <p class="text-sm text-gray-600">${meta.descricao}</p>
        <p class="text-xs text-gray-500">Finalizada em: ${meta.finalizada}</p>
      </div>`;
    historicoMetas.appendChild(li);
  });
}

function concluirMeta(index) {
  const meta = metas[index];
  const hoje = new Date().toLocaleDateString();
  historico.push({ ...meta, finalizada: hoje });
  metas.splice(index, 1);
  arvoreNivel++;

  if (arvoreNivel > 5) {
    const estilos = ["comum", "florida", "frutifera", "exotica"];
    const estilo = estilos[Math.floor(Math.random() * estilos.length)];
    jardim.push({ data: hoje, imagem: `arvore5_${estilo}.png` });
    arvoreNivel = 1;
  }

  salvarDados();
  renderizarMetas();
  renderizarHistorico();
  atualizarArvore();
  atualizarJardim();
  atualizarMedalhas();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const descricao = document.getElementById("descricao").value;
  const prazo = document.getElementById("prazo").value;
  const tipo = document.getElementById("tipo").value;
  const prioridade = document.getElementById("prioridade").checked;
  metas.push({ titulo, descricao, prazo, tipo, prioridade });
  salvarDados();
  renderizarMetas();
  form.reset();
});

document.getElementById("filtro").addEventListener("change", renderizarMetas);
document.getElementById("ordenacao").addEventListener("change", renderizarMetas);

// Inicialização
renderizarMetas();
renderizarHistorico();
atualizarArvore();
atualizarJardim();
atualizarMedalhas();
