import { MotorInterface } from "./motorInterface.js";
import { NavegadorSimples } from "./navegadorSimples.js";
import { carregarIndice, carregarCapitulo } from "./carregadorCapitulos.js";

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
    const capituloInicial = await carregarCapitulo(indice, indice.capituloInicial);

    const motor = new MotorInterface({ textoEl, areaEscolhasEl });
    new NavegadorSimples(motor, capituloInicial, {
      onErro: mostrarErro,
      onCapitulo: atualizarRotuloCapitulo,
      carregarCapituloPorId: (id) => carregarCapitulo(indice, id),
    });
  } catch (erro) {
    mostrarErro(erro.message ?? String(erro));
    textoEl.textContent = "Não foi possível iniciar o protótipo.";
  }
}

iniciar();
