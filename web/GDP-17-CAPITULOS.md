# GDP-17 — Segmentar capítulos

## Critérios de aceite

- [x] Existe um índice de capítulos (`capitulo_1`, `capitulo_2`)
- [x] Cada capítulo tem seu próprio JSON de cenas
- [x] O jogo carrega um capítulo por vez a partir do índice
- [x] Há pelo menos 2 capítulos de exemplo no repositório
- [ ] Formato documentado no Confluence *(colar esta página / seção)*

## Arquivos

```
web/data/capitulos/
├── indice.json
├── capitulo_1.json   # A estrada
└── capitulo_2.json   # A guarda

web/js/carregadorCapitulos.js
```

## Formato

### Índice (`indice.json`)

```json
{
  "capituloInicial": "capitulo_1",
  "capitulos": [
    { "id": "capitulo_1", "titulo": "A estrada", "arquivo": "capitulo_1.json" },
    { "id": "capitulo_2", "titulo": "A guarda", "arquivo": "capitulo_2.json" }
  ]
}
```

### Capítulo (`capitulo_X.json`)

```json
{
  "id": "capitulo_1",
  "titulo": "A estrada",
  "cenaInicial": "cena_01",
  "cenas": [ /* mesmo formato da GDP-5 */ ]
}
```

### Troca de capítulo

No campo `proxima` de uma escolha:

- `cena_02` → cena no capítulo atual
- `capitulo:capitulo_2` → carrega o capítulo `capitulo_2` (usa a `cenaInicial` dele)

## Como testar

```bash
cd web
npx serve -l 5173
```

1. Abrir http://localhost:5173  
2. Ver o rótulo **Capítulo: A estrada**  
3. Seguir escolhas até ir para o capítulo 2 (**A guarda**)  
4. Confirmar no DevTools → Network que só o JSON do capítulo pedido é carregado na troca  
