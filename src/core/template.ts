import { schemaVersion } from "@/config";

/** Esqueleto mínimo e VÁLIDO: serve de exemplo para a LLM e para download. */
export const templateExam = {
  schemaVersion: schemaVersion,
  id: "historia-5ano-exemplo-v1",
  title: "Simulado de História — Exemplo",
  subject: "História",
  grade: "5º Ano do Ensino Fundamental I",
  institution: "Nome da escola (opcional)",
  description: "Descrição curta do que o simulado cobre (opcional).",
  sources: {
    providedMaterial: ["Capítulo X do livro didático, páginas Y–Z"],
    onlyProvidedMaterial: true,
    external: [],
    notes: "Declare aqui se usou só o material fornecido. Não invente fontes.",
  },
  parts: [
    {
      id: "parte-1",
      title: "Título da parte temática",
      questions: [
        {
          type: "multiple_choice",
          id: "q01",
          title: "Título curto da questão",
          context:
            "Situação do cotidiano ou definição em uma ou duas frases (opcional).",
          prompt: "Pergunta clara e direta?",
          options: [
            { id: "a", text: "Alternativa plausível, mas incorreta." },
            { id: "b", text: "Alternativa correta." },
            { id: "c", text: "Alternativa plausível, mas incorreta." },
            { id: "d", text: "Alternativa plausível, mas incorreta." },
          ],
          answer: "b",
          explanation: "Por que a alternativa B está correta, em linguagem simples.",
          points: 1,
        },
        {
          type: "multiple_choice",
          id: "q02",
          title: "Análise de afirmativas",
          prompt: "Analise as afirmativas:",
          statements: [
            "Primeira afirmativa.",
            "Segunda afirmativa.",
            "Terceira afirmativa.",
            "Quarta afirmativa.",
          ],
          options: [
            { id: "a", text: "Apenas I e II estão corretas." },
            { id: "b", text: "Apenas II e III estão corretas." },
            { id: "c", text: "Apenas I, II e IV estão corretas." },
            { id: "d", text: "Todas estão corretas." },
          ],
          answer: "c",
          explanation: "Explique qual afirmativa está errada e por quê.",
          points: 1,
        },
        {
          type: "open",
          id: "q03",
          title: "Questão discursiva",
          prompt: "Explique com suas palavras...",
          expectedAnswer: "Modelo de resposta completa para o responsável comparar.",
          keyConcepts: ["conceito essencial 1", "conceito essencial 2"],
          criteria: [
            "Apresenta informações corretas.",
            "Explica a importância ou o motivo.",
            "Usa as próprias palavras, em frases completas.",
          ],
          maxPoints: 3,
        },
      ],
    },
  ],
};

export const templateJson = JSON.stringify(templateExam, null, 2);
