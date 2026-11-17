# GDP-8 — Motor de interface

## Arquivo principal
`web/js/motorInterface.js`

## Contrato
| Método | Função |
|--------|--------|
| `mostrarCena(cena)` | Exibe o texto e cria até 4 botões de escolha |
| `aoEscolher(callback)` | Registra quem recebe o `id` da escolha |
| `limpar()` | Limpa texto e botões |
| `destruir()` | Remove o listener de teclado |

## Critérios de aceite
- [x] Recebe cena no formato JSON (`id`, `texto`, `escolhas[]`)
- [x] Gera botões dinamicamente (2 a 4)
- [x] Clique dispara a escolha
- [x] Teclas 1–4 (e numpad) disparam a escolha
- [x] Funciona com dados de teste, independente da GDP-9/GDP-13 finais

## Como testar
```bash
cd web
npx serve -l 5173
```
Abrir http://localhost:5173 — navegar pelas cenas com mouse e teclado.

## Integração
Quem consome o motor (hoje: `navegadorSimples.js`):
1. Instancia `MotorInterface` com os elementos do DOM
2. Registra `aoEscolher`
3. Chama `mostrarCena` sempre que houver uma nova cena
