// ==========================================
// Configurações do Pedido
// ==========================================

const MAX_FOTOS = 5;

let arquivoSelecionado = null;

let pedidoAtual = JSON.parse(
    localStorage.getItem("fotoImaPedido")
) || null;


// ==========================================
// Criar novo pedido
// ==========================================

function criarPedido(nome){

    const agora = new Date();

    const pedido = {

        id:
            "PED-" +
            agora.getFullYear() +
            String(agora.getMonth()+1).padStart(2,"0") +
            String(agora.getDate()).padStart(2,"0") +
            "-" +
            agora.getHours() +
            agora.getMinutes() +
            agora.getSeconds() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2,6)
                .toUpperCase(),

        nome: nome,

        fotos: 0

    };

    pedidoAtual = pedido;

    salvarPedido();

    return pedido;

}


// ==========================================
// Salvar Pedido
// ==========================================

function salvarPedido(){

    localStorage.setItem(

        "fotoImaPedido",

        JSON.stringify(pedidoAtual)

    );

}


// ==========================================
// Incrementar quantidade de fotos
// ==========================================

function incrementarFoto(){

    pedidoAtual.fotos++;

    salvarPedido();

}


// ==========================================
// Finalizar Pedido
// ==========================================

function finalizarPedido(){

    pedidoAtual = null;

    localStorage.removeItem(

        "fotoImaPedido"

    );

}

// COLE AQUI A URL /exec DO APPS SCRIPT
const API_URL = "https://foto-ima-api.ilovememorias.workers.dev/";

const camera = document.getElementById("camera");
const galeria = document.getElementById("galeria");
const imagemPreview = document.getElementById("imagemPreview");
const placeholder = document.getElementById("placeholder");
const nomeFoto = document.getElementById("nomeFoto");
const btnTrocar = document.getElementById("btnTrocar");
const btnEnviar = document.getElementById("btnEnviar");
const mensagem = document.getElementById("mensagem");
const resumoPedido = document.getElementById("resumoPedido");
const contadorFotos = document.getElementById("contadorFotos");
const textoRestantes = document.getElementById("textoRestantes");
const btnOutraFoto = document.getElementById("btnOutraFoto");
const btnFinalizarPedido = document.getElementById("btnFinalizarPedido");

camera.addEventListener("change", function () {
  selecionarArquivo(this);
});

galeria.addEventListener("change", function () {
  selecionarArquivo(this);
});

btnTrocar.addEventListener("click", trocarFoto);
btnEnviar.addEventListener("click", enviar);
btnOutraFoto.addEventListener("click", enviarOutraFoto);

function selecionarArquivo(input) {

  if (!input.files || input.files.length === 0) {
    return;
  }

  arquivoSelecionado = input.files[0];

  nomeFoto.textContent =
    "✅ " + arquivoSelecionado.name;

  const reader = new FileReader();

  reader.onload = function (e) {

    imagemPreview.src = e.target.result;
    imagemPreview.style.display = "block";
    placeholder.style.display = "none";
    btnTrocar.hidden = false;

  };

  reader.readAsDataURL(arquivoSelecionado);
}

function trocarFoto() {

  arquivoSelecionado = null;

  camera.value = "";
  galeria.value = "";

  imagemPreview.src = "";
  imagemPreview.style.display = "none";

  placeholder.style.display = "block";

  nomeFoto.textContent =
    "Nenhuma foto selecionada";

  btnTrocar.hidden = true;

  mostrarMensagem("");
}

function enviar() {

  const nome = document
    .getElementById("nome")
    .value
    .trim();

// =========================
// Criar pedido automaticamente
// =========================

  if (!pedidoAtual) {

    criarPedido(nome);

  }

  if (!nome) {
    mostrarMensagem(
      "Digite seu nome.",
      "erro"
    );
    return;
  }

  if (!arquivoSelecionado) {
    mostrarMensagem(
      "Escolha uma foto.",
      "erro"
    );
    return;
  }

  btnEnviar.disabled = true;
  btnEnviar.textContent = "⏳ Enviando...";

  mostrarMensagem(
    "Aguarde enquanto enviamos sua foto.",
    ""
  );

  const reader = new FileReader();

  reader.onload = async function (e) {

    try {

      const resposta = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
        pedidoId: pedidoAtual.id,
        nome: pedidoAtual.nome,
        fotoNumero: pedidoAtual.fotos + 1,
        imagem: e.target.result
        })
      });

      const resultado = await resposta.json();

      if (!resultado.sucesso) {
        throw new Error(
          resultado.erro ||
          "Não foi possível enviar a foto."
        );
      }

      incrementarFoto();

      mostrarResumoPedido();

      mostrarMensagem(

       `✅ Foto enviada com sucesso!
        ${pedidoAtual.fotos} de ${MAX_FOTOS} fotos enviadas.`,
        "sucesso"

      );

      document.getElementById("nome").value = "";

      trocarFoto();

    } catch (erro) {

      console.error(erro);

      mostrarMensagem(
        "❌ Erro ao enviar a foto. Tente novamente.",
        "erro"
      );

    } finally {

      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar foto";

    }

  };

  reader.readAsDataURL(arquivoSelecionado);
}

function mostrarMensagem(texto, tipo) {

  mensagem.textContent = texto;

  mensagem.classList.remove(
    "sucesso",
    "erro"
  );

  if (tipo) {
    mensagem.classList.add(tipo);
  }

}

// ==========================================
// Mostrar resumo do pedido
// ==========================================

function mostrarResumoPedido() {

  const restantes = MAX_FOTOS - pedidoAtual.fotos;

  resumoPedido.hidden = false;

  contadorFotos.textContent =
    `${pedidoAtual.fotos} de ${MAX_FOTOS}`;

  if (restantes > 0) {

    textoRestantes.textContent =
      `Você ainda pode enviar mais ${restantes} foto${restantes > 1 ? "s" : ""} neste pedido.`;

    btnOutraFoto.hidden = false;

  } else {

    textoRestantes.textContent =
      "Você atingiu o limite de 5 fotos deste pedido.";

    btnOutraFoto.hidden = true;

  }

function enviarOutraFoto() {

  if (!pedidoAtual) {
    return;
  }

  if (pedidoAtual.fotos >= MAX_FOTOS) {
    return;
  }

  resumoPedido.hidden = true;

  trocarFoto();

  document.getElementById("nome").value =
    pedidoAtual.nome;
}

}