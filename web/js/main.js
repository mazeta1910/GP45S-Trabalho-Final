import { MotorInterface } from "./motorInterface.js";
import { NavegadorSimples } from "./navegadorSimples.js";

const textoEl = document.getElementById("texto-cena");
const areaEscolhasEl = document.getElementById("area-escolhas");
const mensagemErroEl = document.getElementById("mensagem-erro");

function mostrarErro(mensagem) {
  console.error(mensagem);
  mensagemErroEl.hidden = false;
  mensagemErroEl.textContent = mensagem;
}

async function carregarCenas() {
  const resposta = await fetch("data/cenas-teste.json");
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar JSON (${resposta.status}).`);
  }
  return resposta.json();
}

async function iniciar() {
  try {
    const colecao = await carregarCenas();

    if (!colecao?.cenaInicial || !Array.isArray(colecao.cenas)) {
      throw new Error("JSON inválido: espere { cenaInicial, cenas[] }.");
    }

    const motor = new MotorInterface({ textoEl, areaEscolhasEl });
    new NavegadorSimples(motor, colecao, mostrarErro);
  } catch (erro) {
    mostrarErro(erro.message ?? String(erro));
    textoEl.textContent = "Não foi possível iniciar o protótipo.";
  }
}

iniciar();
