/**
 * Navegação provisória entre cenas (GDP-13, versão simples da Sprint 1).
 * Depois pode ser trocada por uma máquina de estados completa.
 */
export class NavegadorSimples {
  /**
   * @param {import("./motorInterface.js").MotorInterface} motor
   * @param {{ cenaInicial: string, cenas: Array<{ id: string, texto: string, escolhas?: any[] }> }} colecao
   * @param {(mensagem: string) => void} [onErro]
   */
  constructor(motor, colecao, onErro = console.error) {
    this.motor = motor;
    this.onErro = onErro;
    this.cenas = new Map(colecao.cenas.map((cena) => [cena.id, cena]));
    this.cenaAtual = null;

    this.motor.aoEscolher((idEscolha) => this._aoEscolher(idEscolha));
    this.irPara(colecao.cenaInicial);
  }

  /**
   * @param {string} idCena
   */
  irPara(idCena) {
    const cena = this.cenas.get(idCena);
    if (!cena) {
      this.onErro(`Cena "${idCena}" não encontrada.`);
      return;
    }

    this.cenaAtual = cena;
    this.motor.mostrarCena(cena);
  }

  _aoEscolher(idEscolha) {
    if (!this.cenaAtual?.escolhas) {
      this.onErro(`Escolha "${idEscolha}" inválida na cena atual.`);
      return;
    }

    const escolha = this.cenaAtual.escolhas.find((item) => item.id === idEscolha);
    if (!escolha) {
      this.onErro(`Escolha "${idEscolha}" não existe na cena "${this.cenaAtual.id}".`);
      return;
    }

    this.irPara(escolha.proxima);
  }
}
