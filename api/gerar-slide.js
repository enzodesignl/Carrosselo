export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { titulo, descricao, direcaoVisual, contextoGeral, numeroSlide, marca } = req.body;

    const identidade = marca ? `
Identidade da marca do usuário:
- Nome: ${marca.nome || "não informado"}
- Nicho: ${marca.nicho || "não informado"}
- Cor principal: ${marca.corPrincipal || "não informado"}
- Cor secundária: ${marca.corSecundaria || "não informado"}
- Tipografia: ${marca.tipografia || "não informado"}
- Estilo visual: ${marca.estilo || "não informado"}
- Tom de voz: ${marca.tomVoz || "não informado"}
- Referências: ${marca.referencias || "não informado"}
- Observações: ${marca.observacoes || "não informado"}
A logo foi enviada no app apenas como referência visual local, então represente a identidade da marca sem tentar recriar a logo com precisão.
` : "";

    const promptImagem = `
Crie UMA imagem quadrada pronta para postar no Instagram.

Esta imagem é o SLIDE ${numeroSlide || ""} de um carrossel.

Contexto geral do carrossel:
${contextoGeral || ""}

${identidade}

Título do slide:
${titulo || ""}

Texto principal do slide:
${descricao || ""}

Direção visual:
${direcaoVisual || ""}

Regras:
- Respeite exatamente o pedido visual do usuário
- Use a identidade visual da marca como referência
- Respeite cores, estilo, tipografia e tom da marca
- Se o usuário pediu cor de fundo, use essa cor
- Se o usuário pediu estilo específico, siga esse estilo
- Não force preto, laranja ou branco se a marca/pedido indicar outras cores
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
