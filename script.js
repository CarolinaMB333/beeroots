// Elementos do DOM
const form = document.querySelector(".form-meta");
const listaMetas = document.querySelector(".lista-metas");
const historicoMetas = document.querySelector(".lista-historico");
const imagemArvore = document.querySelector(".imagem-arvore");
const divJardim = document.querySelector("#jardim");
const divMedalhas = document.querySelector(".conquistas-medalhas");

const toggleHistoricoBtn = document.getElementById("toggleHistorico");
const containerHistorico = document.getElementById("containerHistorico");

const filtroHistorico = document.getElementById("filtroHistorico"); // Filtro de histórico

toggleHistoricoBtn.addEventListener("click", () => {
  const estaVisivel = !containerHistorico.classList.contains("hidden");
  if (estaVisivel) {
    containerHistorico.classList.add("hidden");
    toggleHistoricoBtn.textContent = "Mostrar Histórico ⬇";
  } else {
    containerHistorico.classList.remove("hidden");
    toggleHistoricoBtn.textContent = "Esconder Histórico ⬆";
  }
});

const toggleJardimBtn = document.getElementById("toggleJardim");
const containerJardim = document.getElementById("containerJardim");

toggleJardimBtn.addEventListener("click", () => {
  const estaVisivel = !containerJardim.classList.contains("hidden");
  if (estaVisivel) {
    containerJardim.classList.add("hidden");
    toggleJardimBtn.textContent = "Mostrar Jardim ⬇";
  } else {
    containerJardim.classList.remove("hidden");
    toggleJardimBtn.textContent = "Esconder Jardim ⬆";
  }
});

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
  const temFalha = historico.some(meta => meta.status === "falhou" && !meta.consertada);

  if (temFalha) {
    imagemArvore.src = "assets/imagens/arvore_morta1.png"; // Árvore morta
  } else {
    imagemArvore.src = `assets/imagens/arvore${(arvoreNivel % 5) || 5}.png`; // Ciclo de 1 a 5
  }
}

// Atualiza o jardim com árvores especiais (conquistas)
function atualizarJardim() {
  divJardim.innerHTML = "";
  jardim.forEach(arvore => {
    const container = document.createElement("div");
    container.className = "text-center";
    container.innerHTML = `
      <img src="assets/imagens/${arvore.imagem}" class="w-20 mx-auto" />
      <p class="text-sm text-gray-500 mt-1">🌿 ${arvore.data}</p>
    `;
    if (divJardim.firstChild) {
      divJardim.insertBefore(container, divJardim.firstChild);
    } else {
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

  const filtro = document.getElementById("filtro").value;
  const ordenacao = document.getElementById("ordenacao").value;

  // Aplica filtro
  let metasFiltradas = metas.filter(meta => {
    if (filtro === "prioridade") return meta.prioridade;
    if (["curto", "medio", "longo"].includes(filtro)) return meta.tipo === filtro;
    return true; // "todas"
  });

  // Aplica ordenação
  metasFiltradas.sort((a, b) => {
    if (ordenacao === "prazo") {
      return new Date(a.prazo) - new Date(b.prazo);
    }
    if (ordenacao === "tipo") {
      const ordem = { curto: 1, medio: 2, longo: 3 };
      return ordem[a.tipo] - ordem[b.tipo];
    }
    return 0;
  });

  // Exibe metas filtradas e ordenadas
  metasFiltradas.forEach((meta, indexOriginal) => {
    const index = metas.indexOf(meta); // índice real para concluirMeta()
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
  const filtro = filtroHistorico.value;

  // Filtra histórico de acordo com o filtro
  const metasFiltradas = historico.filter(meta => {
    if (filtro === "concluidas") return meta.status === "concluida";
    if (filtro === "nao-concluidas") return meta.status === "falhou";
    return true; // Exibe todas por padrão
  });

  metasFiltradas.forEach(meta => {
    const li = document.createElement("li");
    li.className = `p-4 ${meta.status === "falhou" ? "bg-red-100 border-red-400" : "bg-green-100 border-green-400"}`;
    li.innerHTML = `
      <strong>${meta.titulo}</strong><br>
      <small>${meta.descricao}</small><br>
      <small>Status: ${meta.status === "falhou" ? "❌ Não Concluída" : "✅ Concluída"}</small>
    `;
    historicoMetas.insertBefore(li, historicoMetas.firstChild);
  });
}

// Verifica se alguma meta está atrasada
function verificarMetasConcluidas() {
  const hoje = new Date();
  const novasMetas = [];

  metas.forEach(meta => {
    const prazo = new Date(meta.prazo);
    if (!meta.concluida && hoje > prazo) {
      meta.status = "falhou";
      historico.push(meta); // Envia para o histórico como falhou
    } else {
      novasMetas.push(meta); // Ainda válida
    }
  });

  metas = novasMetas;
  salvarDados();
  atualizarArvore();
  renderizarMetas();
  renderizarHistorico(); // Atualiza histórico visualmente
}

// Concluir uma meta
function concluirMeta(index) {
  const meta = metas[index];
  meta.concluida = true;
  meta.status = "concluida";
  historico.push(meta);
  metas.splice(index, 1);

  const tinhaFalha = historico.some(meta => meta.status === "falhou" && !meta.consertada);

  if (tinhaFalha) {
    // Marca como "corrigido"
    historico.forEach(meta => {
      if (meta.status === "falhou") meta.consertada = true;
    });
    arvoreNivel = 1; // Reinicia a árvore
  } else {
    arvoreNivel = (arvoreNivel % 5) + 1; // Continua loopando de 1 a 5
  }

  // Se completou ciclo, adiciona conquista especial
  if (arvoreNivel === 1) {
    jardim.push({
      imagem: "penai.png", // Árvore especial (conquista)
      data: new Date().toLocaleDateString()
    });
  }

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

filtroHistorico.addEventListener("change", renderizarHistorico);

document.getElementById("filtro").addEventListener("change", renderizarMetas);
document.getElementById("ordenacao").addEventListener("change", renderizarMetas);

