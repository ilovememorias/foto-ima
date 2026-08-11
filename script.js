let arquivoSelecionado = null;

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

camera.addEventListener("change", function () {
  selecionarArquivo(this);
});

galeria.addEventListener("change", function () {
  selecionarArquivo(this);
});

btnTrocar.addEventListener("click", trocarFoto);
btnEnviar.addEventListener("click", enviar);

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
          nome: nome,
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

      mostrarMensagem(
        "✅ Foto enviada com sucesso!",
        "sucesso"
      );

      document.getElementById("nome").value = "";

      trocarFoto();

      mostrarMensagem(
        "✅ Foto enviada com sucesso!",
        "sucesso"
      );

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