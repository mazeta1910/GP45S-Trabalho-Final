/**
 * GDP-17 — Carrega um capítulo por vez a partir do índice.
 *
 * Convenção de navegação entre capítulos:
 * proxima: "capitulo:capitulo_2" → carrega o capítulo indicado (cenaInicial dele)
 * proxima: "cena_02"             → cena dentro do capítulo atual
 */

const BASE = "data/capitulos";

/**
 * @typedef {{ id: string, titulo: string, arquivo: string }} MetaCapitulo
 * @typedef {{ capituloInicial: string, capitulos: MetaCapitulo[] }} IndiceCapitulos
 * @typedef {{ id: string, titulo: string, cenaInicial: string, cenas: any[] }} Capitulo
 */

/**
 * @returns {Promise<IndiceCapitulos>}
 */
export async function carregarIndice() {
  const resposta = await fetch(`${BASE}/indice.json`);
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar índice de capítulos (${resposta.status}).`);
  }

  const indice = await resposta.json();
  if (!indice?.capituloInicial || !Array.isArray(indice.capitulos)) {
    throw new Error('Índice inválido: espere { capituloInicial, capitulos[] }.');
  }

  return indice;
}

/**
 * @param {IndiceCapitulos} indice
 * @param {string} idCapitulo
 * @returns {Promise<Capitulo>}
 */
export async function carregarCapitulo(indice, idCapitulo) {
  const meta = indice.capitulos.find((item) => item.id === idCapitulo);
  if (!meta) {
    throw new Error(`Capítulo "${idCapitulo}" não existe no índice.`);
  }

  const resposta = await fetch(`${BASE}/${meta.arquivo}`);
  if (!resposta.ok) {
    throw new Error(`Falha ao carregar ${meta.arquivo} (${resposta.status}).`);
  }

  const capitulo = await resposta.json();
  if (!capitulo?.cenaInicial || !Array.isArray(capitulo.cenas)) {
    throw new Error(`Capítulo "${idCapitulo}" inválido: espere { cenaInicial, cenas[] }.`);
  }

  return {
    id: capitulo.id ?? meta.id,
    titulo: capitulo.titulo ?? meta.titulo,
    cenaInicial: capitulo.cenaInicial,
    cenas: capitulo.cenas,
  };
}

/**
 * @param {string} destino
 * @returns {{ tipo: 'cena', id: string } | { tipo: 'capitulo', id: string }}
 */
export function interpretarDestino(destino) {
  if (typeof destino !== "string" || !destino) {
    throw new Error("Destino de navegação inválido.");
  }

  if (destino.startsWith("capitulo:")) {
    return { tipo: "capitulo", id: destino.slice("capitulo:".length) };
  }

  return { tipo: "cena", id: destino };
}
