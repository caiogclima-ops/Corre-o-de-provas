document.addEventListener("DOMContentLoaded", () => {
  const tabelaTurmas = document.getElementById("Turmas");
  const areaAlunos = document.getElementById("areaAlunos");
  const tituloTurma = document.getElementById("tituloTurma");
  const tabelaAlunos = document.getElementById("Alunos");
  const formAluno = document.getElementById("aluno");
  const formNumero = document.getElementById("numeroAluno");
  const resultado = document.getElementById("resultado");
  const deletado = document.getElementById("deletado");
  const botaoVoltar = document.getElementById("voltar");
  const inputImportarAlunos = document.getElementById("importarArquivoAlunos");

  const tabelaProvas = document.getElementById("Provas");
  const formProva = document.getElementById("prova");
  const formDelProva = document.getElementById("numeroProva");
  const resultadoProvas = document.getElementById("resultadoProvas");
  const deletadoProvas = document.getElementById("deletadoProvas");
  const inputImportarProvas = document.getElementById("importarArquivoProvas");

  const btnFoto = document.getElementById('btnCapturar');
  const video = document.getElementById('videoCamera');
  const canvasFoto = document.getElementById('canvasFoto');
  const resultadoTexto = document.getElementById('resultadoTexto');

  const btnEnviarIA = document.getElementById("btnEnviarIA");
  const btnSalvarNota = document.getElementById("btnSalvarNota");
  const resultadoDiv = document.getElementById("resultadoIA");

  let turmaSelecionada = "";
  let listasPorTurma = JSON.parse(localStorage.getItem("listasPorTurma")) || [];
  let listaProvas = JSON.parse(localStorage.getItem("listaProvas")) || [];

  let alunoSelecionado = null;
  let gabaritoSelecionado = null;
  let numQuestoesSelecionadas = 0;

  tabelaTurmas?.addEventListener("click", (ev) => {
    const td = ev.target.closest("td");
    if (!td) return;
    turmaSelecionada = td.textContent.trim();
    mostrarAreaAlunos();
  });

  function mostrarAreaAlunos() {
    tituloTurma.textContent = `Lista de Alunos - ${turmaSelecionada}`;
    if (tabelaTurmas) tabelaTurmas.style.display = "none";
    if (areaAlunos) areaAlunos.style.display = "block";
    atualizarTabelaAlunos();
    if (resultado) resultado.textContent = "";
  }

  function atualizarTabelaAlunos() {
    if (!tabelaAlunos) return;
    tabelaAlunos.innerHTML = "<tr><th>Número</th><th>Aluno</th><th>Nota</th></tr>";
    const alunos = (listasPorTurma[turmaSelecionada] || []);

    const registros = JSON.parse(localStorage.getItem("alunosProvas")) || {};

    alunos.forEach((aluno) => {
      const linha = tabelaAlunos.insertRow();
      linha.insertCell(0).textContent = aluno.numero;
      const nomeCell = linha.insertCell(1);
      nomeCell.textContent = aluno.nome;

      nomeCell.style.cursor = "pointer";
      nomeCell.style.color = "blue";

      nomeCell.addEventListener("click", () => abrirModalProva(aluno));

      const id = `${turmaSelecionada}_${aluno.numero}`;
      const notaAluno = registros[id]?.nota ?? "-";
      const cellNota = linha.insertCell(2);
      cellNota.textContent = notaAluno;

      if (notaAluno !== "-") {
        const notaNum = parseFloat(notaAluno);
        if (!isNaN(notaNum)) {
          if (notaNum >= 7) {
            cellNota.style.color = "#2ecc71";
            cellNota.style.fontWeight = "bold";
          } else if (notaNum >= 5) {
            cellNota.style.color = "#f1c40f";
            cellNota.style.fontWeight = "bold";
          } else {
            cellNota.style.color = "#e74c3c";
            cellNota.style.fontWeight = "bold";
          }
        } else {
          cellNota.style.color = "gray";
        }
      } else {
        cellNota.style.color = "gray";
      }
    });
  }

  formAluno?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nomeInput = document.getElementById("nomeAluno");
    const nome = nomeInput?.value.trim();
    if (!nome || !turmaSelecionada) return;

    listasPorTurma[turmaSelecionada] ||= [];

    const existe = listasPorTurma[turmaSelecionada].some(
      (a) => a.nome.toLowerCase() === nome.toLowerCase()
    );
    if (existe) {
      resultado.style.color = "orange";
      resultado.textContent = `O aluno "${nome}" já está na lista!`;
      return;
    }

    listasPorTurma[turmaSelecionada].push({ nome });
    ordenarEReorganizarAlunos();
    salvarLocalStorageAlunos();
    atualizarTabelaAlunos();

    resultado.style.color = "green";
    resultado.textContent = `Aluno "${nome}" adicionado!`;
    if (nomeInput) nomeInput.value = "";
  });

  formNumero?.addEventListener("submit", (e) => {
    e.preventDefault();
    const numero = (document.getElementById("numAluno")?.value || "").padStart(2, "0");
    const lista = listasPorTurma[turmaSelecionada];
    if (!lista) return;

    const index = lista.findIndex((a) => a.numero === numero);
    if (index === -1) {
      deletado.style.color = "red";
      deletado.textContent = `Aluno número ${numero} não encontrado.`;
      return;
    }

    const removido = lista.splice(index, 1)[0];
    ordenarEReorganizarAlunos();
    salvarLocalStorageAlunos();
    atualizarTabelaAlunos();

    deletado.style.color = "green";
    deletado.textContent = `Aluno "${removido.nome}" removido.`;
  });

  function ordenarEReorganizarAlunos() {
    const lista = listasPorTurma[turmaSelecionada];
    if (!lista) return;

    lista.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    listasPorTurma[turmaSelecionada] = lista.map((a, i) => ({
      numero: String(i + 1).padStart(2, "0"),
      nome: a.nome,
    }));
  }

  function salvarLocalStorageAlunos() {
    localStorage.setItem("listasPorTurma", JSON.stringify(listasPorTurma));
  }

  window.ExportarListaAlunos = function () {
    const blob = new Blob([JSON.stringify(listasPorTurma, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `alunos_${turmaSelecionada}.json`;
    a.click();
  };
  window.ExportarCSVAlunos = function () {
    if (!turmaSelecionada) return alert("Selecione uma turma!");
    const lista = listasPorTurma[turmaSelecionada] || [];
    let csv = "Número,Nome\n";
    lista.forEach((a) => (csv += `${a.numero},"${a.nome}"\n`));

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `alunos_${turmaSelecionada}.csv`;
    a.click();
  };

  window.ImportarListaAlunos = function () {
    const arquivo = inputImportarAlunos?.files?.[0];
    if (!arquivo || !turmaSelecionada) return alert("Selecione o arquivo e a turma!");

    const reader = new FileReader();
    reader.onload = (e) => {
      const texto = e.target.result;
      let listaA = [];

      try {
        if (arquivo.name.toLowerCase().endsWith(".json")) {
          const parsed = JSON.parse(texto);

          if (Array.isArray(parsed)) {
            listaA = parsed.map(item => {
              if (typeof item === "string") return { nome: item.trim() };
              if (item && typeof item === "object") {
                const nome = item.nome ?? item.Name ?? item.NOME ?? item.name ?? "";
                return { nome: String(nome).trim() };
              }
              return null;
            }).filter(Boolean);
          } else if (parsed && typeof parsed === "object") {
            if (parsed[turmaSelecionada]) {
              const sub = parsed[turmaSelecionada];
              if (Array.isArray(sub)) {
                listaA = sub.map(item => {
                  if (typeof item === "string") return { nome: item.trim() };
                  const nome = item.nome ?? item.Name ?? item.name ?? "";
                  return { nome: String(nome).trim() };
                }).filter(Boolean);
              }
            } else {
              const entries = Object.entries(parsed);
              const probable = entries.every(([k, v]) => typeof v === "string" || typeof v === "object");
              if (probable) {
                listaA = entries.map(([k, v]) => {
                  if (typeof v === "string") return { nome: v.trim() };
                  const nome = v.nome ?? v.name ?? "";
                  return { nome: String(nome).trim() };
                }).filter(Boolean);
              } else {
                throw new Error("Formato JSON não reconhecido para importar alunos.");
              }
            }
          } else {
            throw new Error("JSON inválido.");
          }
        } else if (arquivo.name.toLowerCase().endsWith(".csv")) {
          const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
          if (linhas.length <= 1) {
            listaA = [];
          } else {
            linhas.slice(1).forEach((linha) => {
              const campos = linha.match(/("([^"]*(?:""[^"]*)*)"|[^,]+)(?=\s*,|\s*$)/g);
              if (!campos) return;
              const camposLimpos = campos.map(c => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim());
              if (camposLimpos.length === 1) {
                listaA.push({ nome: camposLimpos[0] });
              } else {
                const nome = camposLimpos[1] ?? camposLimpos[0];
                listaA.push({ nome: String(nome).trim() });
              }
            });
          }
        } else {
          throw new Error("Tipo de arquivo não suportado. Use .json ou .csv");
        }

        if (!Array.isArray(listaA) || listaA.length === 0) {
          listasPorTurma[turmaSelecionada] = [];
          ordenarEReorganizarAlunos();
          salvarLocalStorageAlunos();
          atualizarTabelaAlunos();
          alert(`Importação concluída — arquivo válido, mas sem alunos encontrados para ${turmaSelecionada}.`);
          return;
        }
        listaA = listaA
          .map(item => ({ nome: String(item.nome ?? "").trim() }))
          .filter(item => item.nome.length > 0);

        listasPorTurma[turmaSelecionada] = listaA;
        ordenarEReorganizarAlunos();
        salvarLocalStorageAlunos();
        atualizarTabelaAlunos();
        alert(`Lista importada para ${turmaSelecionada}! Total: ${listaA.length} alunos.`);
      } catch (err) {
        console.error("Erro ao importar lista:", err);
        alert("Erro ao importar: " + (err.message || err));
      }
    };
    reader.readAsText(arquivo);
  };

  botaoVoltar?.addEventListener("click", () => {
    if (areaAlunos) areaAlunos.style.display = "none";
    if (tabelaTurmas) tabelaTurmas.style.display = "table";
    tituloTurma.textContent = "";
    turmaSelecionada = "";
  });

  function atualizarTabelaProvas() {
    if (!tabelaProvas) return;
    tabelaProvas.innerHTML = "<tr><th>Número</th><th>Prova</th><th>Questões</th><th>Gabarito</th></tr>";
    listaProvas.forEach((prova) => {
      const linha = tabelaProvas.insertRow();
      linha.insertCell(0).textContent = prova.numero;
      linha.insertCell(1).textContent = prova.nome;
      linha.insertCell(2).textContent = prova.questoes;
      linha.insertCell(3).textContent = prova.gabarito || "-";
    });
  }

  function salvarLocalStorageProvas() {
    localStorage.setItem("listaProvas", JSON.stringify(listaProvas));
  }

  function ordenarEReorganizarProvas() {
    listaProvas.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    listaProvas = listaProvas.map((p, i) => ({
      numero: String(i + 1).padStart(2, "0"),
      nome: p.nome,
      questoes: p.questoes,
      gabarito: p.gabarito,
    }));
  }

  formProva?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nomeProva")?.value.trim();
    if (!nome) {
      resultadoProvas.style.color = "red";
      resultadoProvas.textContent = "Digite o nome da prova.";
      return;
    }

    const existe = listaProvas.some((p) => p.nome.toLowerCase() === nome.toLowerCase());
    if (existe) {
      resultadoProvas.style.color = "orange";
      resultadoProvas.textContent = `A prova "${nome}" já existe!`;
      return;
    }

    const questoes = prompt("Digite o número de questões da prova:");
    if (!questoes || isNaN(questoes) || questoes <= 0) {
      alert("Número de questões inválido!");
      return;
    }

    const gabarito = prompt(`Digite o gabarito da prova (${questoes} respostas, apenas letras A–E, ex: ABCDE...):`);
    if (!gabarito) {
      alert("Você deve digitar um gabarito!");
      return;
    }

    const resposta = gabarito.trim().toUpperCase();
    if (resposta.length !== Number(questoes)) {
      alert(`O gabarito deve ter exatamente ${questoes} letras.`);
      return;
    }
    if (!/^[A-E]+$/.test(resposta)) {
      alert("O gabarito só pode conter letras de A a E (sem espaços ou números).");
      return;
    }

    listaProvas.push({ nome, questoes, gabarito: resposta });
    ordenarEReorganizarProvas();
    salvarLocalStorageProvas();
    atualizarTabelaProvas();

    resultadoProvas.style.color = "green";
    resultadoProvas.textContent = `Prova "${nome}" adicionada com sucesso!`;
    const nomeProvaEl = document.getElementById("nomeProva");
    if (nomeProvaEl) nomeProvaEl.value = "";
  });

  formDelProva?.addEventListener("submit", (e) => {
    e.preventDefault();
    const num = (document.getElementById("numProva")?.value || "").padStart(2, "0");
    const index = listaProvas.findIndex((p) => p.numero === num);
    if (index === -1) {
      deletadoProvas.style.color = "red";
      deletadoProvas.textContent = `Prova número ${num} não encontrada.`;
      return;
    }
    const removida = listaProvas.splice(index, 1)[0];
    ordenarEReorganizarProvas();
    salvarLocalStorageProvas();
    atualizarTabelaProvas();

    deletadoProvas.style.color = "green";
    deletadoProvas.textContent = `Prova "${removida.nome}" removida.`;
  });

  window.ExportarListaProvas = function () {
    const blob = new Blob([JSON.stringify(listaProvas, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lista_provas.json";
    a.click();
  };
  window.ExportarCSVProvas = function () {
    let csv = "Número,Prova,Questões,Gabarito\n";
    listaProvas.forEach((p) => (csv += `${p.numero},"${p.nome}",${p.questoes},"${p.gabarito}"\n`));
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "lista_provas.csv";
    a.click();
  };

  window.ImportarListaProvas = function () {
    const arquivo = inputImportarProvas?.files?.[0];
    if (!arquivo) return alert("Selecione um arquivo para importar!");
    const reader = new FileReader();
    reader.onload = (e) => {
      const texto = e.target.result;
      let listaP = [];
      if (arquivo.name.endsWith(".json")) {
        listaP = JSON.parse(texto);
      } else if (arquivo.name.endsWith(".csv")) {
        const linhas = texto.split(/\r?\n/).slice(1);
        linhas.forEach((linha) => {
          const [numero, nome, questoes, gabarito] = linha.split(",");
          if (nome) listaP.push({ nome: nome.replace(/"/g, ""), questoes, gabarito: gabarito ? gabarito.replace(/"/g, "") : "" });
        });
      }
      listaProvas = listaP;
      ordenarEReorganizarProvas();
      salvarLocalStorageProvas();
      atualizarTabelaProvas();
      alert("Lista de provas importada com sucesso!");
    };
    reader.readAsText(arquivo);
  };

  atualizarTabelaProvas();

  const modalProva = document.getElementById("modalProva");
  const modalAlunoNome = document.getElementById("modalAlunoNome");
  const selectProvaModal = document.getElementById("selectProvaModal");
  const btnConfirmarProva = document.getElementById("btnConfirmarProva");
  const btnFecharModal = document.getElementById("btnFecharModal");

  function abrirModalProva(aluno) {
    alunoSelecionado = aluno;
    modalAlunoNome.textContent = `Aluno: ${aluno.nome}`;

    selectProvaModal.innerHTML = `<option value="">Selecione uma prova</option>`;
    listaProvas.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.nome;
      opt.textContent = p.nome;
      selectProvaModal.appendChild(opt);
    });

    modalProva.style.display = "flex";
  }

  function fecharModalProva() {
    modalProva.style.display = "none";
    selectProvaModal.value = "";
  }

  btnConfirmarProva?.addEventListener("click", async () => {
    const provaEscolhida = selectProvaModal.value;
    if (!provaEscolhida) return alert("Selecione uma prova!");

    const provaObj = listaProvas.find((p) => p.nome === provaEscolhida);
    if (!provaObj) return alert("Erro: prova não encontrada na lista.");

    gabaritoSelecionado = provaObj.gabarito.split("") || [];
    numQuestoesSelecionadas = Number(provaObj.questoes);

    if (numQuestoesSelecionadas === 0) {
      alert("⚠️ Esta prova não possui questões cadastradas!");
      return;
    }

    salvarAlunoProva(alunoSelecionado, provaEscolhida, gabaritoSelecionado, numQuestoesSelecionadas);
    alert(`Prova "${provaEscolhida}" selecionada para o aluno ${alunoSelecionado.nome}!`);
    await abrirCamera();
    fecharModalProva();
  });

  btnFecharModal?.addEventListener("click", () => {
    gabaritoSelecionado = null;
    numQuestoesSelecionadas = 0;
    alunoSelecionado = null;
    fecharModalProva();
  });

  function salvarAlunoProva(aluno, prova, gabarito, numQuestoes) {
    let registros = JSON.parse(localStorage.getItem("alunosProvas")) || {};
    const id = `${turmaSelecionada}_${aluno.numero}`;
    registros[id] = {
      aluno: aluno.nome,
      prova,
      gabarito,
      numQuestoes
    };
    localStorage.setItem("alunosProvas", JSON.stringify(registros));
  }

  function corrigirGabarito(gabaritoOficial, respostasAluno) {
    if (!gabaritoOficial || !respostasAluno) return 0;
    let acertos = 0;
    for (let i = 0; i < gabaritoOficial.length; i++) {
      const correto = gabaritoOficial[i];
      const marcado = respostasAluno[i];
      if (marcado && marcado !== "-" && marcado === correto) acertos++;
    }
    return acertos;
  }

  function calcularNota(acertos, totalQuestoes) {
    if (!totalQuestoes || totalQuestoes <= 0) return 0;
    const nota = (acertos / totalQuestoes) * 10;
    return Number(nota.toFixed(2));
  }

  function salvarNota(gabaritoSel, respostasDetectadas) {
    if (!turmaSelecionada) return alert("Nenhuma turma selecionada!");
    if (!alunoSelecionado || !alunoSelecionado.numero) return alert("Nenhum aluno selecionado!");
    if (!gabaritoSel || !Array.isArray(gabaritoSel)) return alert("Gabarito não definido!");
    if (!respostasDetectadas || !Array.isArray(respostasDetectadas)) return alert("Respostas não detectadas!");

    const acertos = corrigirGabarito(gabaritoSel, respostasDetectadas);
    const nota = calcularNota(acertos, gabaritoSel.length);
    const alunoID = `${turmaSelecionada}_${alunoSelecionado.numero}`;

    let registros = JSON.parse(localStorage.getItem("alunosProvas")) || {};
    if (!registros[alunoID]) registros[alunoID] = {};
    registros[alunoID].nota = Number(nota);
    localStorage.setItem("alunosProvas", JSON.stringify(registros));

    try { atualizarTabelaAlunos(); } catch (err) { console.warn("Falha ao atualizar tabela:", err); }
    alert(`Nota salva com sucesso!\nAluno: ${alunoSelecionado.nome}\nNota: ${nota}`);
    if (btnSalvarNota) btnSalvarNota.style.display = "none";
  }

  let stream = null;
  let cvReady = false;
  window.onOpenCvReady = function() {
    cvReady = true;
    console.log("OpenCV carregado e pronto.");
  };

  async function abrirCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      video.srcObject = stream;
      video.style.display = "block";
      if (btnFoto) btnFoto.style.display = "inline-block";
    } catch (err) {
      alert("Erro ao acessar a câmera: " + err.message);
      console.error(err);
    }
  }

  btnFoto?.addEventListener("click", () => capturarFoto());

  function capturarFoto() {
    if (!video || !video.srcObject) {
      alert("Câmera não está ativa!");
      return;
    }
    canvasFoto.width = video.videoWidth || 640;
    canvasFoto.height = video.videoHeight || 480;
    const ctx = canvasFoto.getContext("2d");
    ctx.drawImage(video, 0, 0, canvasFoto.width, canvasFoto.height);
    canvasFoto.style.display = "block";
    if (!cvReady) { alert("OpenCV ainda está carregando. Tente novamente."); return; }
  }

  function capturarBase64DoCanvas(canvas) {
    if (!canvas) throw new Error("Canvas não fornecido");
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    return dataUrl.split(",")[1];
  }

  async function enviarGabaritoParaServidor(base64) {
    const resp = await fetch("/analisar-gabarito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64 })
    });
    return resp.json();
  }

  btnEnviarIA?.addEventListener("click", async () => {
    try {
      if (!canvasFoto) throw new Error("Canvas de foto não encontrado");
      if (!gabaritoSelecionado || !Array.isArray(gabaritoSelecionado)) {
        resultadoDiv.textContent = "Selecione uma prova antes de enviar para IA.";
        return;
      }

      resultadoDiv.textContent = "Capturando imagem do canvas...";
      const base64 = capturarBase64DoCanvas(canvasFoto);

      resultadoDiv.textContent = "Enviando imagem para análise da IA...";
      const resposta = await enviarGabaritoParaServidor(base64);

      if (resposta.error) {
        resultadoDiv.textContent = "Erro na análise: " + (resposta.error || JSON.stringify(resposta.raw || resposta));
        console.error("IA raw:", resposta.raw);
        return;
      }

      const questoesDetectadas = resposta.questoes;
      if (!Array.isArray(questoesDetectadas)) {
        resultadoDiv.textContent = "Resposta inesperada da IA. Veja console.";
        console.error("Resposta inesperada:", resposta);
        return;
      }

      const respostasArray = questoesDetectadas
        .slice()
        .sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0))
        .map(q => q.marcada ?? "-");

      while (respostasArray.length < gabaritoSelecionado.length) respostasArray.push("-");

      const acertos = corrigirGabarito(gabaritoSelecionado, respostasArray);
      const nota = calcularNota(acertos, gabaritoSelecionado.length);

      resultadoDiv.textContent = `IA detectou: ${respostasArray.join(" - ")} | Acertos: ${acertos} | Nota: ${nota}`;

      if (btnSalvarNota) {
        btnSalvarNota.style.display = "inline-block";
        window.notaAluno = nota;
        btnSalvarNota.onclick = () => salvarNota(gabaritoSelecionado, respostasArray);
      }
    } catch (err) {
      console.error("Erro no envio para IA:", err);
      if (resultadoDiv) resultadoDiv.textContent = "Erro ao enviar para IA: " + (err.message || err);
    }
  });
});
