// Permite que a Vercel trate este arquivo como um endpoint de streaming
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 1. Pega os dados enviados pelo frontend
  const { systemInstruction, contents } = await req.json();

  // 2. Pega a chave de API das Environment Variables da Vercel
  const apiKey = process.env.GEMINI_API_KEY; // Certifique-se que o nome da variável na Vercel é GEMINI_API_KEY

  if (!apiKey) {
    return new Response('API Key não configurada no servidor.', { status: 500 });
  }

  // 3. Monta a URL e o payload para a API do Google
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${apiKey}`;
  const payload = {
    systemInstruction,
    contents,
    // Adicione aqui safetySettings ou generationConfig se precisar
  };

  try {
    // 4. Faz a chamada para a API do Gemini
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // 5. Se a resposta da API não for OK, retorna um erro
    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        return new Response(`Erro da API do Gemini: ${errorText}`, { status: geminiResponse.status });
    }

    // 6. Retorna o stream diretamente para o frontend
    // O navegador receberá a resposta em pedaços (chunks)
    return new Response(geminiResponse.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    return new Response(`Erro interno no servidor: ${error.message}`, { status: 500 });
  }
}