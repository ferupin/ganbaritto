# Formato do arquivo de banco de questões

Versão do formato: **1** (`"schemaVersion": 1`). Validado por Zod em `src/core/schema.ts`.

## Promessa

Um arquivo válido na versão 1 continua válido. Mudanças futuras são **aditivas** (campos opcionais novos) ou ganham uma nova versão (`schemaVersion: 2`), com migração das versões antigas. Os bancos de `src/exams/catalog` servem de fixtures: o teste `src/exams/exams.test.ts` e `src/core/schema.test.ts` os carregam a cada execução.

## Estrutura

- `schemaVersion`: 1
- `id`: texto em minúsculas, números e hífens (`[a-z0-9]+(-[a-z0-9]+)*`). Estável: é a chave do histórico.
- `title`, `subject`; opcionais: `grade`, `institution`, `description`
- `sources`: `providedMaterial[]`, `onlyProvidedMaterial?`, `external[]`, `notes?`. Nunca inventar fonte.
- `parts[]`: `id`, `title`, `questions[]`

### Questão `multiple_choice`
`id`, `prompt`, `options[]` (2 a 6, `{id, text}`), `answer` (id de uma opção), `explanation`, `points` (padrão 1). Opcionais: `title`, `context`, `statements[]`, `table`.

### Questão `open`
`id`, `prompt`, `expectedAnswer`, `keyConcepts[]`, `criteria[]`, `maxPoints` (padrão 3). Opcionais: `title`, `context`, `table`.

IDs de questão são únicos no arquivo. O padrão do projeto é 4 alternativas (a a d), uma correta.

## Fórmulas e símbolos
Todo texto de questão (contexto, enunciado, alternativas, afirmativas, explicação, resposta esperada, tabelas) aceita LaTeX entre cifrões:
- em linha: `$x^2 + 3x = 10$`; em bloco: `$$\\frac{a}{b}$$`; química: `$\\ce{H2O}$`;
- **no JSON a barra invertida é dobrada** (`"$\\frac{1}{2}$"`). Com uma barra só, `\f`, `\t`, `\b` e `\r` viram caracteres de controle e a importação é recusada com explicação;
- preço em reais é texto normal (`R$ 5,00`, com espaço depois de `R$`); `\$` escreve um cifrão literal;
- não há desenho de gráficos: descreva em `context` ou use `table`.

O KaTeX só é carregado quando a questão tem fórmula. Cada fórmula recebe um `aria-label` em português (`speakTex`) para leitores de tela; a leitura cobre o básico (potência, fração, raiz, operações).

## Dados no navegador

Chaves do `localStorage` (prefixo em `src/config.ts`, hoje `examgen.v1`): `.library`, `.attempt.<id>`, `.history.<id>`, `.creator`, `.theme`. Tudo que é lido passa por Zod. Mudar o nome do produto **não** muda o prefixo.


## Arquivo de backup
Não é um banco de questões: é o conteúdo do navegador. Estrutura (`backupVersion: 1`):

```json
{
  "app": "examgen",
  "backupVersion": 1,
  "appVersion": "0.5.0",
  "exportedAt": "2026-11-25T21:00:00.000Z",
  "library": [ /* bancos no formato acima */ ],
  "attempts": { "<id do banco>": { /* tentativa */ } },
  "history": { "<id do banco>": [ /* últimos 30 registros */ ] },
  "creator": { /* formulário de Criar com IA */ }
}
```
Itens inválidos são pulados na restauração e listados. Regras de mescla e desfazer: ADR 0006.
