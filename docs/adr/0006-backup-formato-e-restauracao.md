# ADR 0006: Backup em arquivo, restauração com mescla e desfazer

**Status:** aceita (0.5.0)

## Contexto
Tudo fica no `localStorage` do navegador. Limpar dados do site, trocar de computador ou o navegador reclamar espaço apaga biblioteca e histórico, e não há servidor para recuperar. O princípio "dados só no navegador" continua; falta uma saída que seja da pessoa.

## Decisão
1. **Um arquivo `.json`** com `app: "examgen"`, `backupVersion`, `appVersion`, `exportedAt`, biblioteca, tentativas, histórico e o formulário do criador. Tema e metadados de lembrete ficam de fora.
2. **Ler é tolerante, gravar é rigoroso.** Cada item é validado com os mesmos schemas das telas; item inválido é pulado e listado, o resto é aproveitado. Backup de versão mais nova do formato é recusado com mensagem clara.
3. **Dois modos de restaurar:**
   - *Mesclar* (padrão): nada do que já existe é perdido. Banco novo entra; mesmo id com conteúdo diferente: fica o atual e a pessoa é avisada; tentativa: vale a de `updatedAt` mais recente; histórico: união por `attemptId`, últimas 30.
   - *Substituir tudo*: apaga o que há e grava o backup, só depois de confirmação em modal.
4. **Gravação com desfazer.** Antes de escrever, o valor anterior de cada chave é guardado. Se qualquer `setItem` falhar (cota cheia), tudo é revertido e a pessoa é avisada de que nada mudou.
5. **Lembrete discreto**, só com algo a perder: sem backup nunca feito ou há mais de 30 dias; "Depois" adia 7 dias. É um aviso na Biblioteca, não um modal.
6. **Armazenamento:** mostrar o uso estimado e permitir `navigator.storage.persist()`. Isso reduz o risco de o navegador limpar os dados, mas não o elimina; o backup continua sendo a garantia.

## Consequências
- O formato do backup é um contrato: mudar exige `backupVersion` novo e migração.
- Mesclar não resolve conflito de edição do mesmo banco; ficou para o editor de questão (fase 2) decidir como versionar.
- Quando houver imagens (fase 3), elas vão para IndexedDB e o backup precisará incluí-las (campo reservado `images`), o que aumentará o tamanho do arquivo.
