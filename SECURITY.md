# Política de segurança

## Como reportar uma vulnerabilidade

**Não abra uma issue pública** para falhas de segurança.

Use o relato privado do GitHub: aba **Security → Report a vulnerability** deste repositório
(<https://github.com/ferupin/ganbaritto/security/advisories/new>).

Inclua: o que acontece, passos para reproduzir, navegador e versão do app (rodapé ou `/versoes`).
Quem mantém é voluntário(a) e responde conforme a disponibilidade; não há prazo garantido.

## O que está no escopo

O app não tem servidor nem conta. Os pontos de atenção reais são:

- **Importação de JSON de origem desconhecida** (bancos e backups): validação, textos que viram HTML,
  tamanhos absurdos, caracteres de controle.
- **Fórmulas (KaTeX)**: entradas que quebrem a renderização ou injetem conteúdo. O app não confia no texto do JSON.
- **Armazenamento local**: dados do navegador (`localStorage`) ficam acessíveis a qualquer script
  da mesma origem; por isso o projeto evita scripts de terceiros.
- **Cadeia de dependências** e fluxo de CI.

## Fora do escopo

- Perda de dados por limpar o navegador (por isso existe o backup em `/dados`).
- Problemas em navegadores sem suporte, ou em extensões do usuário.
- Resultados errados de uma IA ao gerar bancos: avalie como erro de conteúdo (use o modelo de issue "Erro em questão").

## Versões suportadas

Apenas a versão mais recente publicada.

## Privacidade

O app não envia suas respostas nem seus bancos para nenhum servidor do projeto. A hospedagem
(por exemplo, a Vercel) pode registrar requisições de acesso, como qualquer site.
