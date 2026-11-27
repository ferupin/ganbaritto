// Carregado só quando alguma questão tem fórmula (import dinâmico em RichText).
// As fontes do KaTeX vêm junto no pacote: nada de CDN.
import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";
import katex from "katex";

export default katex;
