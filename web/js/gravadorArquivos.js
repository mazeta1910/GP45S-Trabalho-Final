export const CHAVE_PADRAO = "gdp:salvamento";
export const VERSAO_SAVE = 1;

/**
 * Módulo de leitura e gravação de progresso (GDP-11 / Task 3).
 *
 * Contrato público:
 * - gravar(estado)        → grava o estado (objeto serializável em JSON)
 * - ler()                 → devolve o estado salvo, ou null se não houver / estiver inválido
 * - existe()              → true se há um save válido
 * - apagar()              → remove o save
 * - exportarArquivo(nome) → baixa o save como arquivo .json
 * - importarArquivo(file) → lê um .json escolhido pelo jogador e grava como save
 *
 * O módulo não conhece cenas nem capítulos: o formato do "estado" é livre.
 * Exemplo: { cenaAtual: "cena_02", capitulo: 1, variaveis: { ajudouEstranho: true } }
 */
export class GravadorArquivos {
  /**
   * @param {{ chave?: string, armazenamento?: Storage, onErro?: (mensagem: string) => void }} [opcoes]
   */
  constructor({
    chave = CHAVE_PADRAO,
    armazenamento = globalThis.localStorage,
    onErro = console.error,
  } = {}) {
    this.chave = chave;
    this.armazenamento = armazenamento;
    this.onErro = onErro;
  }

  /**
   * @param {object} estado
   * @returns {boolean} true se gravou com sucesso
   */
  gravar(estado) {
    if (!estado || typeof estado !== "object") {
      this.onErro("GravadorArquivos.gravar: estado inválido.");
      return false;
    }

    const registro = {
      versao: VERSAO_SAVE,
      salvoEm: new Date().toISOString(),
      dados: estado,
    };

    try {
      this.armazenamento.setItem(this.chave, JSON.stringify(registro));
      return true;
    } catch (erro) {
      // Cota cheia, modo privado, armazenamento bloqueado...
      this.onErro(`Falha ao gravar o progresso: ${erro.message ?? erro}`);
      return false;
    }
  }

  /**
   * @returns {object | null}
   */
  ler() {
    try {
      const texto = this.armazenamento.getItem(this.chave);
      if (texto === null) return null;

      const registro = JSON.parse(texto);
      if (registro?.versao !== VERSAO_SAVE || typeof registro.dados !== "object") {
        this.onErro("Save com formato desconhecido; ignorado.");
        return null;
      }
      return registro.dados;
    } catch (erro) {
      this.onErro(`Falha ao ler o progresso: ${erro.message ?? erro}`);
      return null;
    }
  }

  existe() {
    return this.ler() !== null;
  }

  apagar() {
    try {
      this.armazenamento.removeItem(this.chave);
    } catch (erro) {
      this.onErro(`Falha ao apagar o progresso: ${erro.message ?? erro}`);
    }
  }

  /**
   * Baixa o save atual como arquivo .json.
   * @param {string} [nomeArquivo]
   * @returns {boolean}
   */
  exportarArquivo(nomeArquivo = "progresso-gdp.json") {
    const texto = this.armazenamento.getItem(this.chave);
    if (texto === null) {
      this.onErro("Não há progresso salvo para exportar.");
      return false;
    }

    const blob = new Blob([texto], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  }

  /**
   * Lê um arquivo .json escolhido pelo jogador (ex.: <input type="file">) e o grava como save.
   * @param {File} arquivo
   * @returns {Promise<boolean>}
   */
  async importarArquivo(arquivo) {
    try {
      const registro = JSON.parse(await arquivo.text());
      if (registro?.versao !== VERSAO_SAVE || typeof registro.dados !== "object") {
        this.onErro("Arquivo de progresso inválido.");
        return false;
      }
      return this.gravar(registro.dados);
    } catch (erro) {
      this.onErro(`Falha ao importar o arquivo: ${erro.message ?? erro}`);
      return false;
    }
  }
}