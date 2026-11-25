import { interpretarDestino } from "./carregadorCapitulos.js";

/**
 * Navegação entre cenas (GDP-13) com suporte a troca de capítulo (GDP-17)
 * e gravação de progresso (GDP-11 / GDP-14).
 * Destino "capitulo:id" carrega outro capítulo via callback assíncrono.
 */
export class NavegadorSimples {
  /**
   * @param {import("./motorInterface.js").MotorInterface} motor
   * @param {{ id?: string, titulo?: string, cenaInicial: string, cenas: Array<{ id: string, texto: string, escolhas?: any[] }> }} capitulo
   * @param {{
   *   onErro?: (mensagem: string) => void,
   *   onCapitulo?: (capitulo: any) => void,
   *   carregarCapituloPorId?: (id: string) => Promise<any>,
   *   gravador?: import("./gravadorArquivos.js").GravadorArquivos,
   *   cenaInicial?: string
   * }} [opcoes]
   */
  constructor(motor, capitulo, opcoes = {}) {
    this.motor = motor;
    this.onErro = opcoes.onErro ?? console.error;
    this.onCapitulo = opcoes.onCapitulo ?? (() => {});
    this.carregarCapituloPorId = opcoes.carregarCapituloPorId ?? null;
    this.gravador = opcoes.gravador ?? null;
    this._trocando = false;

    this.motor.aoEscolher((idEscolha) => {
      void this._aoEscolher(idEscolha);
    });

    this._definirCapitulo(capitulo, opcoes.cenaInicial);
  }

  /**
   * @param {{ id?: string, titulo?: string, cenaInicial: string, cenas: any[] }} capitulo
   * @param {string} [cenaInicial]
   */
  _definirCapitulo(capitulo, cenaInicial = capitulo.cenaInicial) {
    this.capitulo = capitulo;
    this.cenas = new Map(capitulo.cenas.map((cena) => [cena.id, cena]));
    this.onCapitulo(capitulo);
    this.irPara(cenaInicial);
  }

  /**
   * @param {string} idCena
   */
  irPara(idCena) {
    const cena = this.cenas.get(idCena);
    if (!cena) {
      this.onErro(`Cena "${idCena}" não encontrada no capítulo "${this.capitulo?.id ?? "?"}".`);
      return;
    }

    this.cenaAtual = cena;
    this.gravador?.gravar({ capitulo: this.capitulo?.id, cenaAtual: idCena });
    this.motor.mostrarCena(cena);
  }

  reiniciarCapitulo() {
    if (this._trocando || !this.capitulo) return false;
    this._definirCapitulo(this.capitulo);
    return true;
  }

  async _aoEscolher(idEscolha) {
    if (this._trocando) return;

    if (!this.cenaAtual?.escolhas) {
      this.onErro(`Escolha "${idEscolha}" inválida na cena atual.`);
      return;
    }

    const escolha = this.cenaAtual.escolhas.find((item) => item.id === idEscolha);
    if (!escolha) {
      this.onErro(`Escolha "${idEscolha}" não existe na cena "${this.cenaAtual.id}".`);
      return;
    }

    let destino;
    try {
      destino = interpretarDestino(escolha.proxima);
    } catch (erro) {
      this.onErro(erro.message ?? String(erro));
      return;
    }

    if (destino.tipo === "cena") {
      this.irPara(destino.id);
      return;
    }

    if (!this.carregarCapituloPorId) {
      this.onErro(`Troca de capítulo pedida ("${destino.id}"), mas o carregador não foi configurado.`);
      return;
    }

    this._trocando = true;
    try {
      const proximo = await this.carregarCapituloPorId(destino.id);
      this._definirCapitulo(proximo);
    } catch (erro) {
      this.onErro(erro.message ?? String(erro));
    } finally {
      this._trocando = false;
    }
  }
}