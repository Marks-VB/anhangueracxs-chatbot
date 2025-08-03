/**
 * api/chat-stream.js
 * 
 * Esta é uma Serverless Function da Vercel que implementa STREAMING.
 * Ela usa o "Edge Runtime" da Vercel, que é otimizado para isso.
 * A função recebe o pedido, chama o endpoint de streaming do Gemini e repassa
 * o fluxo de dados diretamente para o frontend.
 */

// MUDANÇA 1: Usar o runtime "edge" da Vercel, que é otimizado para streaming.
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Assegura que o pedido é do tipo POST
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  try {
    const { systemInstruction, contents } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response('API Key não configurada no servidor.', { status: 500 });
    }

    // MUDANÇA 2: Corrigir o nome do modelo e usar o endpoint "streamGenerateContent".
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:streamGenerateContent?key=${apiKey}`;

    const payload = {
      systemInstruction,
      contents,
      safetySettings: [
        { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
        { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
        { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
        { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
      ]
    };

    // Faz a chamada para a API do Gemini
    const geminiResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Se a resposta inicial da API não for OK, retorna um erro
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return new Response(`Erro da API do Gemini: ${errorText}`, { status: geminiResponse.status });
    }

    // MUDANÇA 3: Não usar 'await response.json()'. Em vez disso, repassamos o 'response.body' diretamente.
    // Isso é o que cria o efeito de streaming.
    return new Response(geminiResponse.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    return new Response(`Erro interno do servidor: ${error.message}`, { status: 500 });
  }
}