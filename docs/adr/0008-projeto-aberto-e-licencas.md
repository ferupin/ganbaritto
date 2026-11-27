# ADR 0008: projeto aberto e licenças

Status: aceita; o nome do projeto ainda é provisório (veja "Nome" abaixo)

## Contexto
O projeto vai ser publicado como código aberto. Há dois tipos de material: código e bancos de questões. Havia revisões reais de uma escola (transcritas de livro didático) no repositório; elas poderiam violar direitos de terceiros.

## Decisão
- Código: **MIT**. Simples, permissiva, conhecida.
- Bancos do catálogo: **CC BY 4.0** (`LICENSE-CONTENT.md`), porque licença de software não é adequada a conteúdo.
- O repositório contém **só exemplos genéricos** (`src/exams/catalog`). As revisões da escola foram removidas (0.5.2). Quem quiser usar material de escola importa o JSON no próprio navegador; nada disso entra no código.
- Titular dos direitos: "Contribuidores do Ganbaritto", nome de trabalho adotado no ADR 0009. Pode ser trocado por um nome próprio.
- Segurança por relato privado do GitHub. Conduta: e-mail profissional de quem mantém.
- `private: true` no `package.json` permanece: impede publicar no npm por engano; o projeto é um site, não uma biblioteca.

## Nome
O nome de trabalho agora é **Ganbaritto** (ADR 0009), ainda provisório. O repositório é `github.com/ferupin/ganbaritto`. O identificador interno `examgen` continua só no prefixo do `localStorage` e no formato do backup (`app: "examgen"`), para não perder dados nem invalidar backups.
Os textos de licença **não dependem do nome**: a licença vale para o código mesmo se o nome mudar. Só a linha de direitos autorais ("Contribuidores do examgen") e os links precisam ser atualizados.
Trocar o campo `app` do backup exige aceitar o nome antigo na leitura, para não invalidar arquivos já exportados. Por isso a troca de nome deve esperar a identidade visual e ter versão própria.

## Alternativas
- Apache-2.0: cláusula de patentes, mais longa; desnecessária aqui.
- AGPL/GPL: exigiria abertura de derivados; contraria o objetivo de uso livre por escolas.
- Mesma licença para código e conteúdo: mistura conceitos e confunde quem reutiliza.

## Consequências
- Quem contribui concorda com as licenças acima (`CONTRIBUTING.md`).
- Antes do primeiro push público: confirmar o titular e ativar o relato privado de vulnerabilidades.
- Se o histórico do Git já contém as revisões da escola, elas continuam visíveis em commits antigos mesmo depois da remoção (veja o aviso na resposta).
