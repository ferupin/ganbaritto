# Como contribuir

Obrigado por querer ajudar. Este projeto segue o [Código de Conduta](CODE_OF_CONDUCT.md).
Falhas de segurança: veja [SECURITY.md](SECURITY.md) (não abra issue pública).

## Sem escrever código
- Abra uma issue com o que travou, o que confundiu ou uma ideia (há modelos prontos).
- Revise os bancos de exemplo (`src/exams/catalog`): gabarito, enunciado, respostas-modelo das discursivas.
- Traga questões em JSON (formato em `docs/file-format.md`).

## Contribuindo com questões
- Escreva você mesmo(a) ou use material com licença compatível. **Não copie** de livros, apostilas ou provas de escola.
- O campo `sources` deve dizer a verdade sobre a origem; nunca invente fonte.
- Quatro alternativas (a–d), uma correta, distratores plausíveis. Discursivas com resposta esperada, conceitos-chave e critérios.
- Ao enviar, você concorda em publicar o banco sob CC BY 4.0 (veja `LICENSE-CONTENT.md`).

## Preparar o ambiente
Requisito: Node 22 (`.nvmrc`; funciona a partir do 20).

```bash
npm install
npm run dev          # http://localhost:3000
```

Antes de abrir o Pull Request:

```bash
npm run check        # tipos + testes unitários
npm run build        # gera out/
npm run e2e          # testes no navegador (rode se mexeu em tela ou fluxo)
```

Na primeira vez dos testes E2E: `npx playwright install chromium`. Explicação completa em
`docs/guia-testes-e2e-e-ci.md`.

## Fluxo de contribuição
1. Faça um fork e crie um branch: `git checkout -b feat/minha-ideia`.
2. Mudança pequena e focada, com teste quando houver lógica nova.
3. Abra o Pull Request preenchendo o modelo. O CI roda sozinho; precisa ficar verde.
4. Quem mantém revisa. Ajustes são normais e fazem parte do processo.

## Convenções
- Regras de pastas e camadas: `docs/development.md`.
- Texto visível só em `src/i18n/pt.ts`; cor só por token; um componente por arquivo; teste ao lado do código.
- Não mexa no que já funciona sem necessidade, e diga quando mexer.
- Decisão relevante vira um registro curto em `docs/adr/` antes do código.

## Commits (Conventional Commits, no imperativo)
```
feat(creator): adicionar validação dos campos
fix(runner): manter respostas ao recarregar
docs: atualizar guia de contribuição
chore(release): 0.6.0
```
Tipos: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`.

## Licença das contribuições
Código enviado fica sob a licença MIT do projeto (`LICENSE`). Conteúdo de bancos, sob CC BY 4.0.

## Lançar versão
Veja "Uma versão" em `docs/development.md`.
