# GP45S — Trabalho Final (GDP)

Trabalho final da disciplina de Gestão de Projetos de Software (GP45S).

Protótipo web de jogo narrativo com escolhas morais.  
Stack: **HTML + CSS + JavaScript + JSON** (sem Unity).

## Como rodar

```bash
cd web
npx serve -l 5173
```

Abra: [http://localhost:5173](http://localhost:5173)

> Não abra o `index.html` direto pelo Explorer (`file://`). O navegador bloqueia o `fetch` do JSON e os módulos ES.

Alternativa com Python:

```bash
cd web
python -m http.server 5173
```

## Estrutura

```
web/
├── index.html
├── css/interface.css
├── js/
│   ├── motorInterface.js      # GDP-8 — Motor de interface
│   ├── navegadorSimples.js    # GDP-13 + troca de capítulo
│   ├── carregadorCapitulos.js # GDP-17 — índice + um capítulo por vez
│   └── main.js
├── data/
│   ├── cenas-teste.json       # legado (Sprint 1)
│   └── capitulos/             # GDP-17
│       ├── indice.json
│       ├── capitulo_1.json
│       └── capitulo_2.json
├── GDP-8-MOTOR-INTERFACE.md
└── GDP-17-CAPITULOS.md
```

## Sprint 1 — responsabilidades (resumo)

| Issue | Item | Observação |
|-------|------|------------|
| GDP-9 | Tela base no navegador | Área do jogo + fundo estático |
| GDP-5 / GDP-7 | Narrativa + carregador JSON | Formato e leitura das cenas |
| GDP-10 / GDP-8 | Interface de escolhas + motor | Protótipo em `web/` |
| GDP-13 | Navegação entre cenas | Hoje: `navegadorSimples.js` |

## Contrato da interface (GDP-8)

- `mostrarCena(cena)` — exibe texto e escolhas  
- `aoEscolher(id)` — notifica a escolha do jogador  

Formato da cena: ver `web/data/cenas-teste.json`.

## Gestão do projeto

- Jira: projeto GDP  
- Épico ativo: MVP - Escopo Reduzido  
- Épico adiado: Fora do escopo do semestre  
- Documentação de interface: Confluence (página da GDP-10)
