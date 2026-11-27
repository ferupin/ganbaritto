# Plano de implementação das próximas fases

Complementa o `ROADMAP.md` (que diz *o quê* e *por quê*) com o *como*: o que muda no código, o que precisa existir antes, como saber que ficou pronto e onde está o risco. Tamanhos: **P** (poucas horas), **M** (um dia de trabalho), **G** (vários dias ou com decisão de projeto).

## Regras para qualquer item
- **Pronto quando:** testes unitários do que for lógica, uma checagem E2E, axe sem violações nos dois temas, texto no dicionário `pt.ts`, entrada em `entries.ts` + `docs/CHANGELOG.md`, doc atualizada.
- **Compatibilidade do JSON:** `schemaVersion` continua 1 enquanto só se acrescentarem campos **opcionais**. Quebra de formato = versão 2 + `core/migrate.ts` (função pura, com teste de cada passo) + ADR.
- **Sem servidor, sem conta, sem enviar dado do aluno.** O que exigir isso não entra sem ADR.
- **Cada decisão de arquitetura vira ADR** (próximo número: 0006).
- **Pré-requisito geral (Fase 1):** os scripts E2E hoje vivem fora do repositório. Antes de crescer, mover para `e2e/` e criar `npm run e2e` (servidor estático + Playwright + axe).

## Ordem e dependências
```
Fase 1 (0.5)  E2E no repo → CI ─┬→ Backup ──────────────┐
                                ├→ Pré-visualização ────┼→ Fase 2 (0.6) → Fase 3 (0.7) → Fase 4 (0.8)
                                └→ Impressão ───────────┘
Fase 2: Refazer erradas → Modo estudo → topic + relatório → Editor de questão
Fase 3: Editor (Fase 2) → Imagens → Gráficos declarativos → Selo de revisão do catálogo
Fase 4: PWA → Compartilhar por link; Identidade pode andar em paralelo desde já
```

---

## Fase 1, versão 0.5.0: confiança e segurança dos dados (**entregue**)

> Desvios do plano: (1) na mescla, banco com o mesmo id e conteúdo diferente **fica como está** (bancos não têm data de edição) e a pessoa é avisada; (2) a pré-visualização é opcional (recolhida), sem travar o botão Salvar, para não atrapalhar quem importa seguido; (3) E2E foi feito direto em `@playwright/test` (TypeScript); (4) falta só a checklist com NVDA (item 1.5), que depende de você.

### 1.1 E2E no repositório e CI (P + P)
- Mover os scripts para `e2e/*.py` ou, melhor, reescrever em `@playwright/test` (TypeScript), para rodar com `npm run e2e` e sem depender de Python.
- `.github/workflows/ci.yml`: Node 22, `npm ci`, `npx tsc --noEmit`, `npx vitest run`, `npm run build`; job separado com Playwright e `npx serve out`.
- Adicionar `engines: { node: ">=20" }` e `.nvmrc`.
- **Pronto quando:** um push com erro de tipo ou teste quebrado falha no GitHub.
- **Risco:** E2E lento no CI; rodar só em PR e na `master`.

### 1.2 Backup e restauração (M)
- **Dado:** `src/storage/backup.ts` junta as chaves com prefixo `examgen.v1.` (biblioteca, tentativas por banco, criador). Tema fica de fora.
- **Arquivo:** `{ app: "examgen", backupVersion: 1, appVersion, exportedAt, data: { biblioteca, tentativas: {id: tentativa}, criador } }`, validado com Zod por seção (reaproveita os schemas de `library.ts` e `attempts.ts`).
- **Restaurar:** modo *mesclar* (padrão: banco com mesmo id é mantido se o do backup não for mais novo; tentativas por id e data) e modo *substituir* (com confirmação em modal). Itens inválidos são pulados e listados, nunca derrubam o resto.
- **Tela:** nova página `/dados` (link no rodapé): Baixar backup, Restaurar, uso do armazenamento (`navigator.storage.estimate()`), pedir armazenamento persistente (`navigator.storage.persist()`).
- **Aviso suave:** depois de N tentativas sem backup, um toast discreto lembrando de baixar.
- **Testes:** ida e volta idêntica; arquivo corrompido; versão futura; mesclar com conflito; cota estourada.
- **Risco:** `localStorage` tem ~5 MB. Medir e avisar antes de estourar. Imagens (Fase 3) mudam isso: ver 3.1.

### 1.3 Pré-visualização no Importar (M)
- Depois de validar, mostrar antes de salvar: resumo (questões por tipo, por parte, distribuição de A/B/C/D, avisos de equilíbrio) e a lista das questões **com o gabarito marcado e a explicação**.
- Reaproveitar `McCard` e `OpenCard` com a prop `mode="preview"` (resposta correta destacada, sem interação, sem gravar nada).
- Botão "Salvar na biblioteca" só depois de a pessoa abrir a pré-visualização ou marcar "conferi o gabarito".
- **Pronto quando:** dá para achar e conferir uma questão com gabarito errado antes de salvar.
- **Risco:** peso visual em bancos de 40+ questões; partes recolhíveis.

### 1.4 Impressão (M)
- Três saídas, escolhidas num menu "Imprimir": **caderno** (sem gabarito; discursivas com linhas para escrever, altura proporcional a `maxPoints`), **gabarito** (tabela questão → letra, explicações e rubrica das discursivas) e **prova corrigida** (o que há hoje).
- Implementação: `data-print="caderno|gabarito|corrigida"` na raiz da prova + CSS `@media print` por modo; `@page { size: A4; margin: 16mm }`; `break-inside: avoid` nas questões; fórmulas em preto.
- **Verificação:** gerar PDF com `page.pdf()` do Playwright em cada modo, conferir nº de páginas, que nenhuma questão é cortada e que as fontes (incluindo KaTeX) foram incorporadas. Isso troca o "nunca testado" por evidência. Ainda falta uma impressão em papel pela pessoa.
- **Risco:** navegadores diferem em `@page`; documentar o que foi testado (Chrome).

### 1.5 Acessibilidade com leitor de tela (P, executado por você)
- Roteiro em `docs/a11y-checklist.md`: Biblioteca → Criar → Importar → resolver → corrigir → revisar → fórmulas. NVDA é gratuito no Windows e funciona com Chrome e Firefox.
- Registrar o que falhou como issues. Ajustar `speakTex` conforme o que for lido de verdade.

---

## Fase 2, versão 0.6.0: o ciclo de aprender

### 2.1 Refazer só as que errei (P)
- A tentativa ganha o campo opcional `only?: string[]` (ids). `Runner` filtra as questões; `computeResult` recebe a lista filtrada; o histórico marca "revisão".
- Entrada: botão no resultado e no `ReviewNav`, usando `reviewTargets`.
- **Testes:** resultado só sobre o subconjunto; retomada com `only`; histórico.

### 2.2 Modo estudo (M)
- Escolha no início: **Prova** (hoje) ou **Estudo**. No estudo, ao marcar uma objetiva ela trava e mostra a explicação na hora; a tentativa guarda `mode`.
- Cuidado: o que o aluno viu antes de responder as próximas não pode ser confundido com prova; o histórico mostra o modo.

### 2.3 `topic` por questão e relatório de evolução (M)
- Campo opcional `topic` (até 60 caracteres) em cada questão; o pedido à IA passa a pedir um tópico curto por questão, dentre os assuntos informados.
- `core/report.ts` (puro): acerto por tópico e por parte ao longo das tentativas guardadas (hoje 30). Tópico ausente = "Sem tópico".
- UI: seção "Evolução" no `HistoryPanel`, depois página `/evolucao` com todos os bancos. Texto e tabela primeiro; gráfico simples só depois.
- **Risco:** poucas tentativas dão números instáveis; mostrar `n` sempre e esconder percentual com n < 3.

### 2.4 Cronômetro e embaralhar (P)
- Cronômetro opcional, por tentativa, sem bloquear a prova.
- Embaralhar com semente guardada na tentativa (a retomada mantém a ordem). Os ids `a–d` não mudam; só a letra exibida.
- **Risco:** explicações que citam "alternativa B" ficam erradas. O pedido à IA já deve proibir isso, e `validateExam` passa a avisar quando achar "alternativa [A-D]" em explicações.

### 2.5 Editor de questão (G)
- Só para bancos da biblioteca; exemplos viram "Duplicar para editar".
- Formulário por questão (enunciado, alternativas, gabarito, explicação), validado pelo mesmo Zod; contador `revision` no banco.
- **Decisão (ADR):** o que fazer com tentativas antigas quando o gabarito muda. Proposta: manter a nota guardada e marcar "banco editado depois".
- Este item é pré-requisito do 3.1 (anexar imagem a uma questão existente).

---

## Fase 3, versão 0.7.0: conteúdo além do texto

### 3.1 Imagens nas questões (G)
- **Armazenamento:** IndexedDB (`storage/images.ts`, chave = id da imagem, valor = Blob). `localStorage` não comporta.
- **Formato:** campo opcional `figure: { id, alt, caption? }`; `alt` obrigatório. No JSON da IA aparece como `figure: { needsImage: true, alt: "o que a figura deve mostrar" }`; o app mostra "faltam N imagens" e deixa a pessoa anexar a foto recortada do livro.
- **Processamento:** reduzir no navegador (canvas → WebP, lado maior 1280 px, qualidade 0,8).
- **Backup e exportação:** o arquivo `.json` leva as imagens em `images: { id: dataUri }`; avisar o tamanho. O backup da 1.2 precisa conhecer isso, então fazer 1.2 já com seção reservada.
- **Segurança:** só `image/png|jpeg|webp`; nunca SVG enviado pelo usuário.
- **Direitos:** foto de página de livro é material com direito autoral. O app guarda só no navegador da pessoa e nunca publica; deixar isso dito na tela.

### 3.2 Gráficos declarativos (G)
- Em vez de aceitar SVG de IA (risco de segurança e de erro), aceitar uma **especificação**: `chart: { type: "bar" | "line" | "pie" | "numberline", data: [...], axes, title }`, renderizada por componente nosso em SVG, com `<title>` e tabela equivalente para leitores de tela.
- Validação com Zod (limites de pontos, valores finitos). Começar por barras e reta numérica (mais pedidos em Matemática e Geografia).
- **Risco:** escopo infinito. Fechar a lista de tipos em ADR.

### 3.3 Catálogo: mais anos e selo de revisão (M, contínuo)
- Campo opcional `review: { status: "ia" | "revisado", by?, date? }` e selo "Conteúdo não revisado" nos exemplos.
- Contribuição de professores por PR com checklist (gabarito conferido, sem trecho copiado, nível do ano).
- Testes de catálogo existentes continuam valendo (zero avisos de equilíbrio).
- Ensino Médio entra por matéria, só com revisão humana.

---

## Fase 4, versão 0.8.0: distribuição

### 4.1 PWA offline (M)
- `app/manifest.ts` + ícones. Service worker próprio: `@serwist/next` depende de webpack e o projeto usa Turbopack, então gerar `public/sw.js` por script pós-build (`scripts/build-sw.mjs`) listando os arquivos de `out/`.
- Cache com nome ligado à versão do app; ao detectar versão nova, toast "Nova versão disponível. Atualizar".
- **Verificação:** Playwright com `context.setOffline(true)` abrindo biblioteca, prova e criador.
- **Risco:** cache preso em versão velha. Testar a atualização, não só a instalação.

### 4.2 Compartilhar por link ou QR (M)
- Banco → `CompressionStream("deflate")` → base64url no fragmento `#d=…` (o fragmento nunca vai ao servidor). Abre `/importar#d=…` já com a pré-visualização da 1.3.
- Limite prático: mensageiros cortam links longos (~2 a 8 mil caracteres). Mostrar o tamanho e, acima do limite, oferecer só o arquivo. QR só abaixo de ~2 KB.
- Segurança: o conteúdo vem de terceiros; passa por `validateExam`, React escapa o texto e o KaTeX roda sem `trust`.

### 4.3 Identidade e nome (decisão, em paralelo)
- Checklist: busca no INPI e na WIPO (classes de software e educação), domínio `.com.br` e `.app`, nome livre no GitHub e na Vercel. Só então logotipo e renomeação (`brand` em `config.ts`, ícones, `storagePrefix` não muda para não perder dados).
- Registrar em ADR. Bloqueia qualquer divulgação, mas não o desenvolvimento.

### 4.4 Segundo idioma (G, adiado)
- Exige tirar texto de `core/` (ADR 0005) e um dicionário `en.ts` que satisfaça `Messages`. Só quando houver demanda real.

---

## Itens que dependem de você
- Rodar a checklist com NVDA (1.5).
- Imprimir em papel e dizer se o caderno e o gabarito ficaram bons (1.4).
- Revisar o conteúdo do catálogo, pelo menos o gabarito (3.3).
- Decidir o nome e consultar INPI e domínio (4.3).
