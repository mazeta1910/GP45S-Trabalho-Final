import { MotorInterface } from "./motorInterface.js";
import { NavegadorSimples } from "./navegadorSimples.js";
import { carregarIndice, carregarCapitulo } from "./carregadorCapitulos.js";
import { GravadorArquivos } from "./gravadorArquivos.js";

const textoEl = document.getElementById("texto-cena");
const areaEscolhasEl = document.getElementById("area-escolhas");
const mensagemErroEl = document.getElementById("mensagem-erro");
const rotuloCapituloEl = document.getElementById("rotulo-capitulo");
const botaoRecomecarEl = document.getElementById("botao-recomecar");
const botaoReiniciarCapituloEl = document.getElementById("botao-reiniciar-capitulo");

// Elementos do Menu Inicial (Task 10)
const telaInicialEl = document.getElementById("tela-inicial");
const btnContinuarEl = document.getElementById("btn-continuar");
const btnNovoJogoEl = document.getElementById("btn-novo-jogo");

function mostrarErro(mensagem) {
  console.error(mensagem);
  mensagemErroEl.hidden = false;
  mensagemErroEl.textContent = mensagem;
}

function atualizarRotuloCapitulo(capitulo) {
  if (!rotuloCapituloEl) return;
  const titulo = capitulo.titulo ?? capitulo.id ?? "";
  rotuloCapituloEl.textContent = titulo ? `Capítulo: ${titulo}` : "";
}

async function iniciar() {
  try {
    const indice = await carregarIndice();
    const gravador = new GravadorArquivos({ onErro: mostrarErro });

    // Botão "Recomeçar": apaga o save e reinicia o jogo do começo.
    botaoRecomecarEl?.addEventListener("click", () => {
      if (!confirm("Recomeçar do início? O progresso salvo será apagado.")) return;
      gravador.apagar();
      location.reload();
    });

    // Se já existir save, mostra o botão "Continuar" no menu inicial
    if (gravador.existe()) {
      btnContinuarEl.hidden = false;
    }

    async function entrarNoJogo(continuarSave) {
      let capituloInicial;
      let cenaInicial;

      if (continuarSave) {
        const salvo = gravador.ler();
        if (salvo?.capitulo) {
          try {
            const capSalvo = await carregarCapitulo(indice, salvo.capitulo);
            if (capSalvo.cenas.some((c) => c.id === salvo.cenaAtual)) {
              capituloInicial = capSalvo;
              cenaInicial = salvo.cenaAtual;
            }
          } catch {
            // Save antigo ou inválido: começa do início.
          }
        }
      } else {
        gravador.apagar();
      }

      capituloInicial ??= await carregarCapitulo(indice, indice.capituloInicial);

      const motor = new MotorInterface({ textoEl, areaEscolhasEl });
      const navegador = new NavegadorSimples(motor, capituloInicial, {
        onErro: mostrarErro,
        onCapitulo: atualizarRotuloCapitulo,
        carregarCapituloPorId: (id) => carregarCapitulo(indice, id),
        gravador,
        cenaInicial,
      });

      // Botão "Reiniciar capítulo": volta à primeira cena do capítulo atual.
      botaoReiniciarCapituloEl?.addEventListener("click", () => {
        botaoReiniciarCapituloEl.blur();
        if (!confirm("Reiniciar este capítulo? Você volta para a primeira cena dele.")) return;
        navegador.reiniciarCapitulo();
      });

      // Esconde o menu inicial e revela o jogo
      telaInicialEl.hidden = true;
    }

    btnContinuarEl.addEventListener("click", () => void entrarNoJogo(true));
    btnNovoJogoEl.addEventListener("click", () => void entrarNoJogo(false));
  } catch (erro) {
    mostrarErro(erro.message ?? String(erro));
    textoEl.textContent = "Não foi possível iniciar o protótipo.";
  }
}

iniciar();