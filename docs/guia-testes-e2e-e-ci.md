# Guia: o processo da versão 0.5 (testes de ponta a ponta, CI e o resto)

Escrito para quem tem base de desenvolvimento web (nível júnior), mas nunca trabalhou com testes automatizados de navegador nem com integração contínua. A ideia é você entender **o que** foi feito, **por que**, **como usar no dia a dia** e **onde isso cabe numa arquitetura de sistema**, incluindo quando *não* usar.

> Convenção do guia: "exemplo real" marca algo que aconteceu neste projeto, não um caso inventado.

---

## 1. Em uma página: o que a 0.5 trouxe

A versão 0.5 tem duas metades que se misturam, e é bom separá-las na cabeça.

| Metade | O que é | Para quem |
|---|---|---|
| **Funcionalidades** | Backup e restauração, pré-visualização do gabarito ao importar, impressão em três saídas | Quem usa o app |
| **Engenharia** | Testes automáticos que abrem o site de verdade (E2E), CI no GitHub, documentação de decisões (ADR), roteiro de acessibilidade | Quem desenvolve o app |

O seu log (`npm run e2e` com 25 testes) pertence à segunda metade. A função dele é uma só: **avisar você, antes de um usuário, quando uma mudança quebrar algo que já funcionava.**

---

## 2. O que foi instalado e por quê

| O quê | Onde fica | Para que serve | Vai para o site publicado? |
|---|---|---|---|
| `@playwright/test` | `devDependencies` | Comanda um navegador por código: clica, digita, lê a tela, gera PDF | Não |
| Navegador do Playwright (Chromium) | Fora do projeto (`C:\Users\<você>\AppData\Local\ms-playwright`), baixado por `npx playwright install` | O Chrome que os testes usam. É separado do seu Chrome do dia a dia | Não |
| `axe-core` | `devDependencies` | Verifica regras de acessibilidade (nome em botões, contraste, rótulos) numa página aberta | Não |
| `serve` (via `npx`, sem instalar) | Baixado na hora | Serve a pasta `out/` (o site estático) na porta 3111 para os testes abrirem | Não |
| `.github/workflows/ci.yml` | No repositório | Receita que o GitHub executa sozinho a cada push | Não |
| `.nvmrc` e `engines` | Raiz e `package.json` | Dizem qual versão do Node o projeto espera (22), para todo mundo rodar a mesma | Não |
| `e2e/tsconfig.json` | `e2e/` | Checagem de tipos só dos testes, separada do build do site | Não |

**Regra de ouro:** `dependencies` vai para o produto, `devDependencies` só existe para quem desenvolve. Nada do que está acima aumenta o tamanho do site que o aluno baixa. (As bibliotecas do app, como KaTeX e Zod, estão em `dependencies`, e essas sim vão para o navegador.)

**Exemplo real do seu terminal:** o `npm run build` falhou com `Cannot find module '@playwright/test'` porque o zip novo trazia uma dependência nova e faltou rodar `npm install`. Sempre que o `package.json` mudar (zip novo, `git pull`, troca de branch), rode `npm install`. Na 0.5.1 isso foi corrigido para o build do site não depender mais das ferramentas de teste, mas o hábito continua valendo.

---

## 3. A pirâmide de testes (o mapa mental)

Existem vários tipos de teste. Cada um responde a uma pergunta diferente, e custa um preço diferente.

```
          /\            E2E (ponta a ponta)      poucos, lentos, realistas
         /  \           "O usuário consegue fazer X de verdade?"
        /----\
       /      \         Integração               alguns
      /        \        "As peças funcionam juntas?"
     /----------\
    /            \      Unitários                muitos, rápidos, precisos
   /______________\     "Esta função faz o cálculo certo?"
```

| Tipo | Neste projeto | O que prova | Velocidade | Quando quebra à toa |
|---|---|---|---|---|
| **Unitário** (`vitest`, `src/**/*.test.ts`) | Cálculo de nota, mescla de backup, leitura de fórmula, validação do JSON | A *lógica* está certa | Milissegundos | Raramente |
| **Integração** | Pouco usado aqui (ex.: escrever e ler no armazenamento falso do backup) | Duas peças conversam bem | Rápido | Às vezes |
| **E2E** (`e2e/`, Playwright) | Importar um banco, resolver, corrigir, baixar backup, restaurar, imprimir | O *fluxo inteiro*, com navegador, CSS, JS e armazenamento reais | Segundos cada | Quando a tela muda ou o tempo falha |

**Por que a forma de pirâmide?** Um teste E2E é caro: lento, mais frágil, difícil de diagnosticar. Então a lógica fica em testes unitários (baratos e precisos) e os E2E ficam só com o que importa para o usuário e que só dá para provar com tudo junto.

**Exemplo real:** a mescla de backup (qual tentativa vale, como o histórico é unido) tem 12 testes unitários, que rodam em menos de um segundo e cobrem casos de borda, como a cota de armazenamento estourar no meio. Já o E2E do backup tem 4 testes e prova outra coisa: que o botão baixa um arquivo, que o arquivo restaura, e que a tela mostra o resumo. Se você tentasse cobrir todas as regras de mescla via navegador, seriam dezenas de testes lentos. E se só tivesse unitário, ninguém testaria se o botão está ligado à função.

---

## 4. Como um teste E2E funciona aqui

```
npm run build  ──►  pasta out/ (site estático pronto)
                         │
npm run e2e  ──►  sobe um servidor (serve) na porta 3111
                         │
                  abre o Chromium ──► executa cada arquivo de e2e/
                         │             clicar, digitar, esperar, conferir
                         ▼
                  relatório: ✓ passou / ✘ falhou (com o motivo)
```

Dois pontos importantes:

1. **O E2E testa o build, não o `npm run dev`.** Por isso você precisa rodar `npm run build` antes. Se mudou o código e esqueceu o build, o teste olha a versão velha do site. (Armadilha clássica: "mudei e o teste não viu".)
2. **Cada teste começa limpo.** O Playwright abre um navegador novo por teste, sem `localStorage` de testes anteriores. Quem precisa de dados (um banco salvo, por exemplo) cria no próprio teste.

### Anatomia de um teste real (do `e2e/dados.spec.ts`, comentado)

```ts
test("arquivo que não é backup é recusado sem mexer em nada", async ({ page }) => {
  await seed(page);                     // 1. prepara: salva um banco e corrige uma prova
  await page.goto("/dados");            // 2. vai até a tela
  await page.locator('input[type=file]').setInputFiles({   // 3. "escolhe" um arquivo errado
    name: "x.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"olá":1}'),
  });
  await expect(page.locator(".callout[role=alert]"))       // 4. confere o que o usuário VÊ
    .toContainText("não parece um backup");
  await expect(page.getByTestId("backup-counts"))          // 5. confere que nada foi perdido
    .toContainText("1 bancos");
});
```

Padrão universal de teste, que você vai reencontrar em qualquer linguagem: **preparar (arrange) → agir (act) → conferir (assert)**.

### O `await expect(...)` espera sozinho

`expect(locator).toContainText(...)` do Playwright **tenta de novo** por até 8 segundos (configurado em `playwright.config.ts`) antes de falhar. É assim que o teste lida com telas que demoram um instante para atualizar. Por isso o código quase nunca precisa de pausas fixas.

---

## 5. Onde isso cabe numa arquitetura de sistemas

### 5.1 No pipeline de entrega

```
 Seu computador                         GitHub                         Vercel
┌───────────────────┐   git push   ┌──────────────────────┐        ┌───────────┐
│ escreve código    │ ───────────► │ CI (ci.yml):         │        │ build +   │
│ npm run check     │              │  1. tipos            │        │ publica   │
│ npm run build     │              │  2. testes unitários │        │ o site    │
│ npm run e2e       │              │  3. build            │        └───────────┘
└───────────────────┘              │  4. E2E no navegador │
                                   └──────────────────────┘
```

- **CI (Integração Contínua):** toda mudança enviada ao repositório passa por uma esteira automática. Se algo quebrar, você descobre em minutos, no commit que causou, e não semanas depois.
- **"Shift left":** descobrir erro o mais cedo possível. Custa mais barato corrigir na sua máquina do que em produção.
- **Quality gate (portão de qualidade):** regra que impede avançar se a esteira falhar. **Atenção:** hoje o CI *avisa*, mas não *bloqueia*. Para bloquear, é preciso ativar "branch protection" no GitHub (Settings → Branches), exigindo que o CI passe antes do merge. Isso é decisão sua; veja a seção 10.
- **A Vercel é independente do CI.** Ela publica o que for para o branch, passando ou não nos testes. Combinar os dois (só publicar se o CI passar) é configuração à parte.

### 5.2 Na arquitetura do próprio código

O projeto é organizado em camadas (`core/` puro, depois `storage/` e `exams/`, depois `features/`, depois `app/`). Isso não é só organização, é o que torna os testes baratos:

- `core/` não tem React, não toca em armazenamento, não tem texto de tela. Por isso dá para testá-lo com `vitest` puro, rápido e sem navegador.
- `storage/backup.ts` separa funções puras (montar, ler, mesclar) das que tocam o `localStorage`. As puras testam-se sozinhas; as outras com um armazenamento falso.
- O E2E só entra para o que atravessa todas as camadas.

Moral: **arquitetura boa é a que deixa a maior parte do comportamento testável sem precisar abrir um navegador.** Se um dia você sentir que "só dá para testar abrindo o navegador", isso costuma ser sinal de lógica misturada com interface.

### 5.3 Em outros tipos de sistema

| Sistema | Como o mesmo raciocínio se aplica |
|---|---|
| API / backend | Pirâmide igual, mas o "E2E" é chamar a API real com um banco de teste (testes de contrato/integração) |
| App com login e dados de usuários | E2E cobre o caminho crítico (cadastro, login, compra), com dados de teste isolados |
| Microsserviços | Testes de contrato entre serviços, mais poucos E2E de jornada completa |
| App móvel | Mesma ideia, com Appium/Detox/Maestro no lugar do Playwright |

---

## 6. A rotina de desenvolvimento (passo a passo)

**Todo dia, ao mexer no código:**

```powershell
npm run dev            # desenvolvimento, com atualização ao vivo
```

**Quando terminar uma mudança:**

```powershell
npm run check          # tipos + testes unitários (rápido, rode sempre)
npm run build          # gera o site estático em out/
npm run e2e            # testes no navegador (rode antes de enviar)
```

**Enviando:**

```powershell
git checkout -b feat/refazer-erradas      # um branch por mudança
git add . ; git commit -m "feat(runner): refazer só as erradas"
git push -u origin feat/refazer-erradas   # o CI começa sozinho
# abra o Pull Request no GitHub e espere o CI ficar verde
```

### Fluxo recomendado para uma funcionalidade nova

1. **Escreva a lógica no `core/` (ou em função pura) com teste unitário primeiro.** Ex.: antes de ligar "refazer só as erradas" na tela, teste a função que escolhe as questões.
2. **Ligue na interface.**
3. **Adicione 1 teste E2E do caminho principal.** Só um, o caminho feliz mais um caso de erro importante. Não tente cobrir tudo.
4. **Rode `npm run check`, `build` e `e2e`.**
5. **Atualize o changelog e a documentação** (já faz parte do "pronto" deste projeto).

### Se um teste falhar: como investigar

| O que você quer | Comando |
|---|---|
| Rodar um arquivo só | `npx playwright test e2e/dados.spec.ts` |
| Rodar um teste pelo nome | `npx playwright test -g "mesclar"` |
| Ver o navegador trabalhando | `npx playwright test --headed` |
| Interface visual com linha do tempo | `npx playwright test --ui` |
| Pausar e ir passo a passo | `npx playwright test --debug` |
| Ver o que sobrou da última rodada | pasta `test-results/` |

**Como ler o erro.** Exemplo do seu log:

```
Expected: <= 3
Received:    4
> 35 |       expect(pages).toBeLessThanOrEqual(3);
```
Leitura: "esperava no máximo 3 páginas no PDF; vieram 4; falhou na linha 35 do arquivo". Sempre pergunte primeiro: **o teste está errado ou o produto está errado?**

### Exemplo real: os 2 testes de impressão que falharam no seu computador

- **Fato:** no seu Windows, caderno e gabarito vieram com 4 páginas; aqui, com 2.
- **O que investiguei:** consegui produzir 4 páginas aqui também, num navegador "sem janela" (headless). Abrindo o PDF, vi que era a **tela interativa** impressa, não a folha de papel. Ou seja, o PDF saiu da tela errada.
- **Hipótese:** nesses navegadores, `window.print()` pode disparar o evento `afterprint` na hora; o app, ao receber esse evento, volta à tela normal; se o teste gera o PDF depois disso, ele imprime a tela comum. No uso real, o diálogo de impressão bloqueia até você fechá-lo, então esse atalho não acontece.
- **O que não está provado:** com a versão antiga do teste, o mesmo navegador aqui passou; então a disputa de tempo depende da máquina. Não posso garantir que essa é a causa no seu caso.
- **Correção aplicada no teste:** `window.print` é neutralizado no teste (o PDF é gerado pelo próprio teste), há uma conferência de que a folha de papel continua na tela logo antes do PDF, e o PDF é salvo em `test-results/impressao-*.pdf` para você abrir e olhar.
- **O que fazer agora:** rodar `npm run e2e` de novo. Se ainda falhar, abra `test-results/impressao-caderno.pdf` e me diga o que aparece. Essa é a maneira certa de resolver: evidência primeiro, hipótese depois.

Esse caso ilustra uma lição importante: **um teste que passa numa máquina e falha em outra é um achado, não um incômodo.** Ele mostra uma suposição escondida (aqui: "o tempo entre clicar e imprimir é sempre o mesmo").

---

## 7. Como escrever um teste novo (receita)

1. **Escolha uma jornada do usuário**, em uma frase: "importa um banco com fórmula e vê o gabarito". Se não consegue dizer em uma frase, o teste está grande demais.
2. **Procure elementos como o usuário procura:** por papel e texto, não por classe CSS.
   - Bom: `page.getByRole("button", { name: "Baixar backup" })`
   - Frágil: `page.locator(".btn.btn-primary:nth-child(2)")`
3. **Use `data-testid` só quando não houver forma natural** (ex.: `backup-counts`). É um "contrato" entre a tela e o teste.
4. **Não use pausas fixas** (`waitForTimeout`). Espere uma condição: `await expect(...).toBeVisible()`. As pausas que existem no projeto (ex.: depois de uma animação de cor, antes do axe) são exceções comentadas.
5. **Confira o que o usuário percebe**, não detalhes internos. Se o teste só passa lendo uma variável interna, ele não protege ninguém.
6. **Deixe o teste independente.** Ele não pode depender de outro ter rodado antes (rodam em paralelo, em qualquer ordem).

### Por que testes ficam instáveis ("flaky") e como evitar

| Causa | Exemplo neste projeto | Remédio |
|---|---|---|
| Esperar tempo fixo | Rolagem suave do botão de topo demorou mais com vários testes juntos | Esperar a condição, com limite de tempo adequado |
| Animação | A cor ainda estava em transição quando o axe mediu o contraste | Esperar a transição terminar |
| Depender de outro teste | — | Cada teste prepara o que precisa |
| Diferença entre máquinas | O caso do PDF acima | Tirar a suposição de tempo, guardar evidência |
| Dado compartilhado | — | Contexto de navegador novo por teste (já é o padrão) |

Um teste que falha às vezes é **pior que nenhum**, porque ensina o time a ignorar a cor vermelha. Quando um teste for instável, conserte a causa em vez de apenas rodar de novo.

---

## 8. Acessibilidade: o que o axe cobre e o que não cobre

- **O que o axe acha:** botão sem nome, campo sem rótulo, contraste insuficiente, atributos ARIA inválidos.
- **O que ele não acha:** se a experiência *faz sentido* ouvida num leitor de tela. Se a fórmula é lida de forma compreensível, se a ordem de foco é lógica, se o aviso foi anunciado.
- **Por isso existe o roteiro manual** `docs/a11y-checklist.md` (NVDA, gratuito no Windows). Ferramenta automática e teste humano se completam; nenhum substitui o outro.

---

## 9. Quando aplicar, e quando não

### Vale a pena E2E quando

- Há **jornadas críticas** que, se quebrarem, o produto perde o sentido (aqui: importar → resolver → corrigir → não perder dados).
- Há **dinheiro, dados ou reputação** em jogo.
- A interface tem **muita integração** (armazenamento, arquivos, impressão) que testes unitários não alcançam.
- Mais de uma pessoa mexe no código, ou você mexe em partes que já "esqueceu".

### Não vale (ou vale pouco) quando

- É um **protótipo descartável** ou uma ideia que vai mudar por completo na semana seguinte: o custo de manter supera o benefício.
- A interface **muda todo dia**: o teste vira trabalho dobrado. Espere o desenho assentar.
- A coisa que você quer provar é **lógica pura**: faça unitário.
- Você quer testar **aparência pixel a pixel**: E2E de comportamento não é isso (existe outra categoria, regressão visual, com custo próprio).
- Você pretende cobrir **tudo** por E2E: vira uma suíte lenta e instável que ninguém roda.

### O custo escondido

Cada teste E2E é código que precisa de manutenção. Você paga: tempo de execução, falhas falsas, ajuste a cada mudança de interface e conhecimento da ferramenta. Pergunta de decisão: **"se esta jornada quebrar sem eu perceber, quanto custa?"** Se a resposta for "pouco", talvez não precise de E2E.

### Por que Playwright (e as alternativas)

| Opção | Em resumo | Por que não/sim aqui |
|---|---|---|
| **Playwright** | Roda Chromium, Firefox e WebKit; espera automática; gera PDF; TypeScript; executor próprio | Escolhido: simples para um site estático, tudo num pacote |
| Cypress | Muito usado, boa experiência de depuração | Roda dentro do navegador, algumas coisas (várias abas, arquivos, PDF) são mais trabalhosas |
| Selenium | O mais antigo e universal | Mais configuração; mais comum em empresas com legado |
| Testing Library (+ vitest) | Testa componentes React sem navegador completo | Ótimo complemento (camada de integração); ainda não usado aqui |

**Limite honesto do que foi feito:** os testes rodaram no Chromium. Firefox e Safari (WebKit) ainda não foram verificados. O Playwright suporta os três, e adicioná-los é um item possível do roadmap.

---

## 10. Próximos passos que são decisões suas

- [ ] **Ativar branch protection** no GitHub exigindo o CI verde antes do merge. Sem isso o CI só avisa.
- [ ] **Decidir** se a Vercel só publica quando o CI passar.
- [ ] **Fazer o primeiro push** e ver o CI rodar. O arquivo `ci.yml` nunca rodou no GitHub de verdade; pode pedir um ajuste na primeira execução.
- [ ] **Rodar o roteiro com NVDA** (30 minutos).
- [ ] Opcional: adicionar Firefox e WebKit à suíte E2E.

---

## 11. Glossário

| Termo | Significado simples |
|---|---|
| **E2E / ponta a ponta** | Teste que usa o sistema como o usuário usaria, atravessando todas as camadas |
| **Unitário** | Teste de uma peça pequena e isolada (uma função) |
| **CI (Integração Contínua)** | Esteira automática que roda verificações a cada envio de código |
| **CD (Entrega/Deploy Contínuo)** | Publicar automaticamente depois que a esteira passa |
| **Pull Request (PR)** | Pedido para juntar um branch ao principal, onde o CI roda e outra pessoa revisa |
| **Branch protection** | Regra do GitHub que bloqueia o merge se o CI falhar |
| **Headless** | Navegador rodando sem janela visível |
| **Flaky** | Teste que às vezes passa e às vezes falha sem mudança no código |
| **Locator / seletor** | Forma de apontar um elemento da tela no teste |
| **Asserção (assert / expect)** | A conferência: "isto deve ser verdade" |
| **devDependency** | Pacote usado só no desenvolvimento, que não vai para o produto |
| **ADR** | Registro curto de uma decisão de arquitetura e do motivo (`docs/adr/`) |
| **Shift left** | Achar problemas o quanto antes no ciclo de desenvolvimento |
| **Quality gate** | Regra automática que impede avançar se a qualidade não passar |

---

## 12. Cola rápida

```powershell
npm install                       # depois de zip novo, git pull ou troca de branch
npm run dev                       # trabalhar
npm run check                     # tipos + unitários (sempre)
npm run build                     # gera out/
npm run e2e                       # navegador (antes de enviar)
npx playwright test --ui          # investigar uma falha com calma
npx playwright test -g "backup"   # só testes cujo nome tem "backup"
```

Em dúvida sobre o que testar: **teste a lógica no `core/` com unitário; use E2E só para as jornadas que o usuário não pode perder.**
