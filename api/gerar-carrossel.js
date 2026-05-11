export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido"
    });
  }

  try {
    const { mensagem, prompt } = req.body;

    const pedidoUsuario = mensagem || prompt || "";

    const roteiroResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
Você é um estrategista de conteúdo e diretor criativo especialista em carrosséis virais para Instagram.

Seu objetivo é criar conteúdos:
- extremamente envolventes
- com alto potencial de retenção
- com estrutura de storytelling
- usando copywriting moderno
- com linguagem clara e impactante
- títulos fortes
- frases curtas
- conteúdo inteligente
- informações úteis
- conteúdo que gere compartilhamento e salvamento

IMPORTANTE:
- Gere exatamente 5 slides
- O Slide 1 precisa ter um gancho extremamente forte
- O Slide 2 deve aumentar a curiosidade
- O Slide 3 e 4 devem entregar valor real
- O Slide 5 deve gerar ação, reflexão ou CTA
- Não escreva textos genéricos
- Evite frases vazias
- Crie conteúdos dignos de páginas grandes do Instagram
- Todos os slides devem parecer parte do mesmo carrossel
- Mantenha continuidade narrativa e visual
- Respeite totalmente o pedido do usuário
- Se o usuário pedir cores específicas, use essas cores
- Não force preto/laranja
- Só use o estilo Carrosselo se o usuário NÃO especificar estilo

Retorne apenas JSON válido, sem markdown:

{
  "slides": [
    {
      "titulo": "",
      "descricao": "",
      "direcaoVisual": ""
    }
  ]
}
              `
            },
            {
              role: "user",
              content: pedidoUsuario
            }
          ],
          temperature: 0.9
        })
      }
    );

    const roteiroData = await roteiroResponse.json();

    if (!roteiroResponse.ok) {
      return res.status(500).json({
        erro: roteiroData.error?.message || "Erro ao criar roteiro"
      });
    }

    const texto = roteiroData.choices?.[0]?.message?.content || "{}";
    const roteiro = JSON.parse(texto);

    const imagens = [];

    for (const slide of roteiro.slides) {
      const imagemResponse = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-image-1",
            size: "1024x1024",
            quality: "high",
            prompt: `
Crie um slide premium para Instagram.

Título do slide:
${slide.titulo}

Texto principal:
${slide.descricao}

Direção visual:
${slide.direcaoVisual}

Regras visuais:
- Design extremamente profissional
- Layout moderno
- Tipografia forte e legível
- Aparência de agência premium
- Mesmo estilo visual dos outros slides
- Continuidade visual de carrossel
- Não adicionar marcas d’água
- Não cortar textos
- Estética sofisticada
- Formato quadrado 1:1
- Pronto para postar no Instagram
- Respeite exatamente as cores e estilos pedidos pelo usuário
            `
          })
        }
      );

      const imagemData = await imagemResponse.json();

      if (!imagemResponse.ok) {
        return res.status(500).json({
          erro: imagemData.error?.message || "Erro ao gerar imagem"
        });
      }

      imagens.push({
        titulo: slide.titulo,
        descricao: slide.descricao,
        direcaoVisual: slide.direcaoVisual,
        imagem: imagemData.data?.[0]?.b64_json
      });
    }

    return res.status(200).json({
      imagens
    });

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}
