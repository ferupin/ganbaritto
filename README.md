<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/ganbaritto-assinatura-escuro.svg">
  <img src="public/brand/ganbaritto-assinatura.svg" alt="Ganbaritto" width="340">
</picture>

[![CI](https://github.com/ferupin/ganbaritto/actions/workflows/ci.yml/badge.svg)](https://github.com/ferupin/ganbaritto/actions/workflows/ci.yml)
[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-263b50.svg)](LICENSE)
![Versão](https://img.shields.io/badge/vers%C3%A3o-0.5.6-ef8c69.svg)

**Seu material de estudo, a partir da sua realidade.** O Ganbaritto ajuda pais e alunos a montar simulados de apoio com qualquer IA e a praticar com eles, sem criar conta e sem servidor. Você pede para a IA criar um banco de questões em um arquivo `.json`, importa aqui, resolve, corrige e acompanha a evolução. Tudo fica no seu navegador.

> **Ganbaritto** é um nome de trabalho: *ganbatte* (頑張って, "dê o seu melhor") + *gabarito*. Ainda não foi validado juridicamente e pode mudar.

## Para quem é
- Pais e responsáveis que querem preparar atividades de revisão com o que o filho está estudando.
- Alunos que querem treinar para provas com questões no estilo da própria escola.
- Quem tem pouco contato com IA: a tela *Criar com IA* monta o pedido certo, passo a passo, para você só copiar e colar.

O app não substitui o professor nem a escola. Questões geradas por IA podem ter erros: **confira sempre o gabarito**.

## O que ele faz
1. **Criar com IA:** um formulário (aluno, escola, disciplina, assuntos, quantidades, nível) monta o pedido para a IA enquanto você digita. Ele já diz à IA que você enviará fotos ou texto e que ela deve devolver um único `.json`.
2. **Importar:** cole ou envie o arquivo. O app valida, explica os problemas em português e mostra uma **pré-visualização com o gabarito** antes de salvar. Se houver erro, há um pedido de correção pronto para colar na mesma conversa da IA.
3. **Resolver:** prova em uma página, com progresso, salvamento automático e retomada. Fórmulas de matemática e química (KaTeX). Tema claro e escuro.
4. **Corrigir:** objetivas automáticas; discursivas com correção assistida (rubrica de 0 a 3 do projeto, **não** é escala oficial). Não há nota final enquanto houver discursiva pendente. Depois de corrigida, um botão leva de uma questão errada à próxima.
5. **Acompanhar:** histórico das últimas 30 tentativas.
6. **Guardar e imprimir:** backup e restauração em `/dados`, e impressão em três saídas (caderno, gabarito e prova corrigida).

## Como usar
- **Sem instalar nada:** quando o site estiver publicado, basta abrir o endereço no navegador.
- **No seu computador:** veja "Rodar localmente" abaixo.

## Rodar localmente
Requisito: [Node.js](https://nodejs.org) 22 (o arquivo `.nvmrc` indica; funciona a partir do 20).

```bash
git clone https://github.com/ferupin/ganbaritto.git
cd ganbaritto
npm install
npm run dev        # http://localhost:3000
```

Outros comandos:

```bash
npm run check      # tipos + testes unitários
npm run build      # gera o site estático em out/
npm run e2e        # testes no navegador (precisa do build; 1ª vez: npx playwright install chromium)
npm run licenses   # tabela de licenças das dependências
```

## Publicar
O site é 100% estático (`output: "export"`): a pasta `out/` serve em qualquer hospedagem de arquivos. Na Vercel, o padrão funciona sem configuração. Também serve em Cloudflare Pages ou GitHub Pages.

## Privacidade
O app **não envia** suas respostas nem seus bancos para servidor algum. Os dados ficam no armazenamento do seu navegador; use `/dados` para fazer backup. Limpar os dados do navegador apaga tudo, por isso o app lembra de fazer backup. A hospedagem (por exemplo, a Vercel) pode registrar acessos, como qualquer site.

## Estado do projeto
Versão atual: **0.5.6** (histórico em `docs/CHANGELOG.md` e na página `/versoes` do app).

- [x] 0.1 a 0.3: importar, resolver, corrigir, histórico, criar com IA, catálogo de exemplos do 1º ao 9º ano
- [x] 0.4: fórmulas (KaTeX), revisão das questões erradas, botão de topo
- [x] 0.5: backup, pré-visualização, impressão, testes de ponta a ponta e CI
- [x] 0.5.3 a 0.5.6: identidade visual Ganbaritto, folha e cartões cremes no tema escuro, etiquetas por cor, textura de fundo
- [ ] Próximas fases: ciclo de aprender (refazer só as que errei), conteúdo além do texto, uso offline instalável. Veja `docs/ROADMAP.md`.

Não verificado ainda: impressão em papel real, uso offline, leitura com leitor de tela (há um roteiro em `docs/a11y-checklist.md`) e se o nome está livre (INPI, WIPO, domínios).

## Identidade visual
Paleta Arroz, Nori, Coral, Gergelim e Matcha, com títulos em Plus Jakarta Sans e texto em Atkinson Hyperlegible (feita para leitura difícil). Nome, logotipo, cores e fontes ficam isolados para poderem ser trocados a qualquer momento. Detalhes em `docs/design-system.md` e `docs/adr/0009-identidade-visual.md`. Arquivos do logotipo em `public/brand/`.

## Documentação
| Para | Arquivo |
|---|---|
| Entender pastas e regras de código | `docs/development.md` |
| Formato do JSON dos bancos | `docs/file-format.md` |
| Cores, fontes e componentes | `docs/design-system.md` |
| Testes e CI, para quem está começando | `docs/guia-testes-e2e-e-ci.md` |
| Acessibilidade (roteiro manual) | `docs/a11y-checklist.md` |
| Para onde o projeto vai | `docs/ROADMAP.md` |
| Decisões de arquitetura | `docs/adr/` |

## Como contribuir
Você pode ajudar sem programar: teste com um simulado real e relate o que travou, confira gabaritos e respostas-modelo dos bancos de exemplo, ou sugira questões. Veja `CONTRIBUTING.md`. Conduta da comunidade: `CODE_OF_CONDUCT.md`. Falhas de segurança: `SECURITY.md`.

## Licenças
- **Código:** MIT (`LICENSE`).
- **Bancos de questões de exemplo** (`src/exams/catalog`): CC BY 4.0 (`LICENSE-CONTENT.md`). Não envie material de escola, livro ou prova real para o repositório.
- **Dependências e fontes:** `THIRD_PARTY_NOTICES.md`.
