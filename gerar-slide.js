export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { titulo, descricao, direcaoVisual, contextoGeral, numeroSlide } = req.body;

    const promptImagem = `
Crie UMA imagem quadrada pronta para postar no Instagram.

Esta imagem é o SLIDE ${numeroSlide || ""} de um carrossel.

Contexto geral do carrossel:
${contextoGeral || ""}

Título do slide:
${titulo || ""}

Texto principal do slide:
${descricao || ""}

Direção visual:
${direcaoVisual || ""}

Regras:
- Respeite exatamente o pedido visual do usuário
- Se o usuário pediu cor de fundo, use essa cor
- Se o usuário pediu estilo específico, siga esse estilo
- Não force preto, laranja ou branco se o usuário pediu outras cores
- Só use preto/laranja/branco como padrão se o usuário não especificar cores
- Design profissional
- Layout moderno
- Tipografia forte e legível
- Aparência de agência premium
- Continuidade visual de carrossel
- Não adicionar marcas d'água
- Não cortar textos
- Formato quadrado 1:1
- Pronto para postar no Instagram
`;

    const imagemResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        size: "1024x1024",
        quality: "high",
        prompt: promptImagem
      })
    });

    const imagemData = await imagemResponse.json();

    if (!imagemResponse.ok) {
      return res.status(500).json({
        erro: imagemData.error?.message || "Erro ao gerar imagem"
      });
    }

    return res.status(200).json({
      imagem: imagemData.data?.[0]?.b64_json
    });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}
