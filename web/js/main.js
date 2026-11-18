import { MotorInterface } from "./motorInterface.js";
import { NavegadorSimples } from "./navegadorSimples.js";
import { carregarIndice, carregarCapitulo } from "./carregadorCapitulos.js";
import { GravadorArquivos } from "./gravadorArquivos.js";

const textoEl = document.getElementById("texto-cena");
const areaEscolhasEl = document.getElementById("area-escolhas");
const mensagemErroEl = document.getElementById("mensagem-erro");
const rotuloCapituloEl = document.getElementById("rotulo-capitulo");

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

    // Tenta retomar o progresso salvo (capítulo + cena).
    let capituloInicial;
    let cenaInicial;

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

    // Sem save válido, começa do capítulo inicial do índice.
    capituloInicial ??= await carregarCapitulo(indice, indice.capituloInicial);

    const motor = new MotorInterface({ textoEl, areaEscolhasEl });
    new NavegadorSimples(motor, capituloInicial, {
      onErro: mostrarErro,
      onCapitulo: atualizarRotuloCapitulo,
      carregarCapituloPorId: (id) => carregarCapitulo(indice, id),
      gravador,
      cenaInicial,
    });
  } catch (erro) {
    mostrarErro(erro.message ?? String(erro));
    textoEl.textContent = "Não foi possível iniciar o protótipo.";
  }
}

iniciar();