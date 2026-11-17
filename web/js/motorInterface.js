export const MAX_ESCOLHAS = 4;

/**
- Motor de interface (GDP-8).
 *
- Contrato público:
- - mostrarCena(cena)  → exibe texto e botões (2 a 4 escolhas)
- - aoEscolher(fn)     → registra callback chamado com o id da escolha
- - limpar()           → limpa texto e botões
- - destruir()         → remove listeners
 *
- Entrada de teclado: teclas 1–4 (e numpad) selecionam a escolha correspondente.
 */
export class MotorInterface {
  /**
- @param {{ textoEl: HTMLElement, areaEscolhasEl: HTMLElement, cenarioEl?: HTMLElement | null }} refs
   */
  constructor({ textoEl, areaEscolhasEl, cenarioEl = document.querySelector(".cenario") }) {
    if (!textoEl || !areaEscolhasEl) {
      throw new Error("MotorInterface: informe textoEl e areaEscolhasEl.");
    }

    this.textoEl = textoEl;
    this.areaEscolhasEl = areaEscolhasEl;
    this.cenarioEl = cenarioEl;
    this.cenarioAtual = null;
    this.cenaAtual = null;
    this._aoEscolher = null;
    this._bloqueado = false;
    this._onKeyDown = this._onKeyDown.bind(this);

    window.addEventListener("keydown", this._onKeyDown);
  }

  /**
- @param {(idEscolha: string) => void} callback
   */
  aoEscolher(callback) {
    if (typeof callback !== "function") {
      throw new Error("MotorInterface.aoEscolher: callback inválido.");
    }
    this._aoEscolher = callback;
  }

  /**
- @param {{ id?: string, texto?: string, cenario?: string, escolhas?: Array<{ id: string, texto: string, proxima?: string }> }} cena
   */
  mostrarCena(cena) {
    if (!cena || typeof cena !== "object") {
      throw new Error("MotorInterface.mostrarCena: cena inválida.");
    }

    this._atualizarCenario(cena.cenario ?? "padrao");

    this._bloqueado = false;
    this.cenaAtual = cena;
    this.textoEl.textContent = cena.texto ?? "";
    this.areaEscolhasEl.replaceChildren();

    const escolhas = Array.isArray(cena.escolhas)
      ? cena.escolhas.slice(0, MAX_ESCOLHAS)
      : [];

    escolhas.forEach((escolha, indice) => {
      if (!escolha?.id || typeof escolha.texto !== "string") {
        return;
      }

      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "botao-escolha";
      botao.dataset.escolhaId = escolha.id;
      botao.setAttribute("aria-label", `Escolha ${indice + 1}: ${escolha.texto}`);
      botao.textContent = `[${indice + 1}] ${escolha.texto}`;
      botao.addEventListener("click", () => this._escolher(escolha.id));
      this.areaEscolhasEl.appendChild(botao);
    });
  }

  _atualizarCenario(novoCenario) {
    if (!this.cenarioEl || this.cenarioAtual === novoCenario) return;

    this.cenarioAtual = novoCenario;
    this.cenarioEl.dataset.cenario = novoCenario;

    // Reinicia a animação de fade sempre que o cenário muda
    this.cenarioEl.classList.remove("fade-ativo");
    void this.cenarioEl.offsetWidth;
    this.cenarioEl.classList.add("fade-ativo");
  }

  limpar() {
    this.cenaAtual = null;
    this._bloqueado = false;
    this.textoEl.textContent = "";
    this.areaEscolhasEl.replaceChildren();
  }

  destruir() {
    window.removeEventListener("keydown", this._onKeyDown);
    this.limpar();
    this._aoEscolher = null;
  }

  _escolher(idEscolha) {
    if (this._bloqueado || !this.cenaAtual) return;
    if (!this._aoEscolher) {
      console.warn("MotorInterface: nenhuma callback registrada em aoEscolher().");
      return;
    }

    // Evita clique + tecla no mesmo instante.
    this._bloqueado = true;
    this.cenaAtual = null;
    this._desabilitarBotoes();
    this._aoEscolher(idEscolha);
  }

  _desabilitarBotoes() {
    this.areaEscolhasEl
      .querySelectorAll("button.botao-escolha")
      .forEach((botao) => {
        botao.disabled = true;
      });
  }

  _onKeyDown(evento) {
    if (this._bloqueado || !this.cenaAtual?.escolhas?.length) return;

    // Ignora se o foco está em um campo de texto.
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    const mapa = {
      Digit1: 0,
      Digit2: 1,
      Digit3: 2,
      Digit4: 3,
      Numpad1: 0,
      Numpad2: 1,
      Numpad3: 2,
      Numpad4: 3,
    };

    const indice = mapa[evento.code];
    if (indice === undefined) return;

    const escolha = this.cenaAtual.escolhas[indice];
    if (!escolha?.id) return;

    evento.preventDefault();
    this._escolher(escolha.id);
  }
}