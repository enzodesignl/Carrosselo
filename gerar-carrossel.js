export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  try {
    const { mensagem, tema, nicho, objetivo } = req.body;

    const pedido = mensagem || `
Tema: ${tema || ""}
Nicho: ${nicho || ""}
Objetivo: ${objetivo || ""}
`;

    const prompt = `
Você é o Carrosselo, uma IA especialista em carrosséis para Instagram.

Crie um carrossel visual e estratégico com base no pedido do usuário:

${pedido}

Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON.

Formato obrigatório:
{
  "slides": [
    {
      "titulo": "Título curto do slide",
      "texto": "Texto curto e claro do slide",
      "direcaoVisual": "Direção visual objetiva para este slide"
    }
  ],
  "legenda": "Legenda curta para o post",
  "cta": "Chamada para ação"
}

Regras:
- Gere exatamente 5 slides.
- Use linguagem profissional, clara e direta.
- Cada título deve ser forte e curto.
- Cada texto deve ter no máximo 2 frases.
- A direção visual deve orientar o design do slide.
- Pense em um carrossel pronto para Instagram.
`;

    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      return res.status(500).json({
        erro: data.error?.message || "Erro ao gerar carrossel"
      });
    }

    return res.status(200).json({
      resultado: data.choices[0].message.content
    });

  } catch (erro) {
    return res.status(500).json({
      erro: erro.message
    });
  }
}