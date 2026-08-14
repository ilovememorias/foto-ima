// ==========================================
// Configurações do Pedido
// ==========================================

const MAX_FOTOS = 6;

let arquivoSelecionado = null;

// ==========================================
// Recuperar pedido salvo
// ==========================================

let pedidoAtual = null;

try {

    const pedidoSalvo = localStorage.getItem("fotoImaPedido");

    if (pedidoSalvo) {

        const pedido = JSON.parse(pedidoSalvo);

        // Só recupera pedidos válidos.
        // Isso evita reutilizar pedidos antigos/corrompidos
        // que tenham sido salvos sem nome.
        if (
            pedido &&
            pedido.id &&
            pedido.nome &&
            pedido.nome.trim() &&
            Number.isInteger(pedido.fotos) &&
            pedido.fotos >= 0 &&
            pedido.fotos < MAX_FOTOS
        ) {

            pedidoAtual = pedido;

        } else {

            localStorage.removeItem("fotoImaPedido");

        }
    }

} catch (erro) {

    console.error("Erro ao recuperar pedido:", erro);

    localStorage.removeItem("fotoImaPedido");

    pedidoAtual = null;
}


// ==========================================
// Criar novo pedido
// ==========================================

function criarPedido(nome) {

    nome = nome.trim();

    if (!nome) {
        throw new Error("Não é possível criar pedido sem nome.");
    }

    const agora = new Date();

    const pedido = {

        id:
            "PED-" +
            agora.getFullYear() +
            String(agora.getMonth() + 1).padStart(2, "0") +
            String(agora.getDate()).padStart(2, "0") +
            "-" +
            String(agora.getHours()).padStart(2, "0") +
            String(agora.getMinutes()).padStart(2, "0") +
            String(agora.getSeconds()).padStart(2, "0") +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 6)
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

function salvarPedido() {

    if (!pedidoAtual) {
        return;
    }

    localStorage.setItem(
        "fotoImaPedido",
        JSON.stringify(pedidoAtual)
    );
}


// ==========================================
// Incrementar quantidade de fotos
// ==========================================

function incrementarFoto() {

    if (!pedidoAtual) {
        return;
    }

    pedidoAtual.fotos++;

    salvarPedido();
}


// ==========================================
// Finalizar Pedido
// ==========================================

function finalizarPedido() {

    pedidoAtual = null;

    localStorage.removeItem("fotoImaPedido");
}


// ==========================================
// API
// ==========================================

const API_URL =
    "https://foto-ima-api.ilovememorias.workers.dev/";


// ==========================================
// Elementos da página
// ==========================================

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
const btnFinalizarPedido =
    document.getElementById("btnFinalizarPedido");

const formularioPedido =
    document.getElementById("formularioPedido");

const pedidoFinalizado =
    document.getElementById("pedidoFinalizado");

const quantidadeFinal =
    document.getElementById("quantidadeFinal");

const btnNovoPedido =
    document.getElementById("btnNovoPedido");


// ==========================================
// Eventos
// ==========================================

camera.addEventListener("change", function () {
    selecionarArquivo(this);
});

galeria.addEventListener("change", function () {
    selecionarArquivo(this);
});

btnTrocar.addEventListener("click", trocarFoto);
btnEnviar.addEventListener("click", enviar);
btnOutraFoto.addEventListener("click", enviarOutraFoto);
btnFinalizarPedido.addEventListener("click", concluirPedido);
btnNovoPedido.addEventListener("click", iniciarNovoPedido);


// ==========================================
// Selecionar arquivo
// ==========================================

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


// ==========================================
// Trocar foto
// ==========================================

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


// ==========================================
// Enviar foto
// ==========================================

function enviar() {

    const nomeDigitado = document
        .getElementById("nome")
        .value
        .trim();


    // ======================================
    // 1. Validar nome ANTES de criar pedido
    // ======================================

    if (!nomeDigitado) {

        mostrarMensagem(
            "Digite seu nome.",
            "erro"
        );

        return;
    }


    // ======================================
    // 2. Validar foto
    // ======================================

    if (!arquivoSelecionado) {

        mostrarMensagem(
            "Escolha uma foto.",
            "erro"
        );

        return;
    }


    // ======================================
    // 3. Criar pedido somente após validações
    // ======================================

    if (!pedidoAtual) {

        criarPedido(nomeDigitado);

    }


    // ======================================
    // 4. Proteção contra pedido inválido
    // ======================================

    if (
        !pedidoAtual.nome ||
        !pedidoAtual.nome.trim()
    ) {

        finalizarPedido();

        criarPedido(nomeDigitado);

    }


    // ======================================
    // 5. Limite de fotos
    // ======================================

    if (pedidoAtual.fotos >= MAX_FOTOS) {

        mostrarMensagem(
            `Este pedido já atingiu o limite de ${MAX_FOTOS} fotos.`,
            "erro"
        );

        return;
    }


    btnEnviar.disabled = true;

    btnEnviar.textContent =
        "⏳ Enviando...";


    mostrarMensagem(
        "Aguarde enquanto enviamos sua foto.",
        ""
    );


    const reader = new FileReader();


    reader.onload = async function (e) {

        try {

            // Foto que será enviada.
            // Importante: calculada antes da requisição.
            const fotoNumero =
                pedidoAtual.fotos + 1;


            const resposta =
                await fetch(API_URL, {

                    method: "POST",

                    body: JSON.stringify({

                        pedidoId:
                            pedidoAtual.id,

                        nome:
                            pedidoAtual.nome,

                        fotoNumero:
                            fotoNumero,

                        imagem:
                            e.target.result

                    })

                });


            // ==================================
            // Ler resposta primeiro como texto
            // ==================================

            const textoResposta =
                await resposta.text();


            let resultado;

            try {

                resultado =
                    JSON.parse(textoResposta);

            } catch (erroJson) {

                console.error(
                    "Resposta inválida da API:",
                    textoResposta
                );

                throw new Error(
                    "O servidor retornou uma resposta inválida."
                );

            }


            // ==================================
            // Verificar HTTP
            // ==================================

            if (!resposta.ok) {

                throw new Error(
                    resultado.erro ||
                    `Erro HTTP ${resposta.status}`
                );

            }


            // ==================================
            // Verificar resultado
            // ==================================

            if (!resultado.sucesso) {

                throw new Error(
                    resultado.erro ||
                    "Não foi possível enviar a foto."
                );

            }


            // ==================================
            // Foto nova
            // ==================================

            if (!resultado.duplicado) {

                incrementarFoto();

            } else {

                // Se o servidor informar que essa foto
                // já existe, sincronizamos o contador
                // local sem criar outra foto.

                pedidoAtual.fotos =
                    Math.max(
                        pedidoAtual.fotos,
                        fotoNumero
                    );

                salvarPedido();

            }


            mostrarResumoPedido();


            mostrarMensagem(
                `✅ Foto enviada com sucesso!
${pedidoAtual.fotos} de ${MAX_FOTOS} fotos enviadas.`,
                "sucesso"
            );


            document
                .getElementById("nome")
                .value = "";


            trocarFoto();


        } catch (erro) {

            console.error(
                "ERRO UPLOAD:",
                erro
            );


            const detalhesErro =
                erro?.message ||
                String(erro);


            mostrarMensagem(
                `❌ Erro ao enviar a foto.
${detalhesErro}`,
                "erro"
            );


        } finally {

            btnEnviar.disabled = false;

            btnEnviar.textContent =
                "Enviar foto";

        }

    };


    reader.readAsDataURL(
        arquivoSelecionado
    );
}


// ==========================================
// Mostrar mensagem
// ==========================================

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

    if (!pedidoAtual) {
        return;
    }

    formularioPedido.hidden = true;
    resumoPedido.hidden = false;


    const restantes =
        MAX_FOTOS - pedidoAtual.fotos;


    contadorFotos.textContent =
        `${pedidoAtual.fotos} de ${MAX_FOTOS}`;


    if (restantes > 0) {

        textoRestantes.textContent =
            `Você ainda pode enviar mais ${restantes} foto${restantes > 1 ? "s" : ""} neste pedido.`;

        btnOutraFoto.hidden = false;

    } else {

        textoRestantes.textContent =
            `Você atingiu o limite de ${MAX_FOTOS} fotos deste pedido.`;

        btnOutraFoto.hidden = true;

    }
}


// ==========================================
// Enviar outra foto
// ==========================================

function enviarOutraFoto() {

    if (!pedidoAtual) {
        return;
    }

    if (pedidoAtual.fotos >= MAX_FOTOS) {
        return;
    }


    resumoPedido.hidden = true;

    formularioPedido.hidden = false;


    trocarFoto();


    document
        .getElementById("nome")
        .value =
        pedidoAtual.nome;
}


// ==========================================
// Concluir pedido
// ==========================================

function concluirPedido() {

    if (!pedidoAtual) {
        return;
    }


    const totalFotos =
        pedidoAtual.fotos;


    quantidadeFinal.textContent =
        `Recebemos ${totalFotos === 1 ? "sua" : "suas"} ${totalFotos} foto${totalFotos > 1 ? "s" : ""}.`;


    finalizarPedido();


    resumoPedido.hidden = true;

    formularioPedido.hidden = true;

    pedidoFinalizado.hidden = false;
}


// ==========================================
// Iniciar novo pedido
// ==========================================

function iniciarNovoPedido() {

    finalizarPedido();

    arquivoSelecionado = null;


    pedidoFinalizado.hidden = true;

    resumoPedido.hidden = true;

    formularioPedido.hidden = false;


    document
        .getElementById("nome")
        .value = "";


    camera.value = "";

    galeria.value = "";


    imagemPreview.src = "";

    imagemPreview.style.display =
        "none";


    placeholder.style.display =
        "block";


    nomeFoto.textContent =
        "Nenhuma foto selecionada";


    btnTrocar.hidden = true;


    mostrarMensagem("");
}