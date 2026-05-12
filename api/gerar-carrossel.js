export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { mensagem, prompt, marca } = req.body;
    const pedidoUsuario = mensagem || prompt || "";

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
` : "";

    const roteiroResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
Você é o Carrosselo, um estrategista de conteúdo e diretor criativo especialista em carrosséis virais para Instagram.

Crie um roteiro extremamente atrativo e estratégico.

Use a identidade da marca do usuário como referência quando ela for informada.

Regras:
- Gere exatamente 5 slides
- Slide 1: gancho forte
- Slide 2: curiosidade/problema
- Slide 3: valor real
- Slide 4: transformação/benefício
- Slide 5: CTA/reflexão
- Não escreva textos genéricos
- Use copywriting moderno
- Mantenha continuidade narrativa
- Respeite cores, tipografia, estilo, tom de voz e observações da marca
- Se o usuário pedir algo diferente da identidade salva, priorize o pedido atual do usuário
- Não force preto/laranja se o usuário ou marca indicarem outras cores

Retorne apenas JSON válido, sem markdown:

{
  "slides": [
    {
      "titulo": "",
      "descricao": "",
      "direcaoVisual": ""
    }
  ],
  "legenda": "",
  "cta": ""
}
            `
          },
          {
            role: "user",
            content: `${identidade}

Pedido do usuário:
${pedidoUsuario}`
          }
        ],
        temperature: 0.85
      })
    });

    const roteiroData = await roteiroResponse.json();

    if (!roteiroResponse.ok) {
      return res.status(500).json({
        erro: roteiroData.error?.message || "Erro ao criar roteiro"
      });
    }

    return res.status(200).json({
      resultado: roteiroData.choices?.[0]?.message?.content || "{}"
    });

  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}
