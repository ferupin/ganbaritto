# 0004. Formato do arquivo e histórico de versões

**Status:** Aceito, versão 0.2.0.

## Decisão
- **O formato do JSON é uma promessa estável** (`docs/file-format.md`). Mudança é aditiva ou vira `schemaVersion` novo, com migração.
- **Versões do app em SemVer.** Cada versão tem entrada tipada em `src/changelog/entries.ts` (mostrada em `/versoes`), seção em `docs/CHANGELOG.md`, versão no `package.json` e tag `vX.Y.Z`.
- **Testes** garantem: a versão do topo é a do `package.json`, a ordem é decrescente, nenhuma entrada vazia e o CHANGELOG cobre todas as versões.
- Correções de logotipo, link, alinhamento ou imagem de prévia não entram no histórico, salvo se o dono pedir.

## Consequências
Lançar uma versão exige tocar quatro lugares, e o teste avisa quando um é esquecido.
