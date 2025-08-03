/**
 * Esta é uma Serverless Function da Vercel que atua como um proxy seguro.
 * O seu site (front-end) chama esta função.
 * Esta função adiciona a sua chave de API secreta e reencaminha o pedido para a API da Google.
 * Assim, a sua chave de API nunca fica exposta no navegador.
 */
export default async function handler(req, res) {
  // 1. Assegura que o pedido é do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 2. Obtém a chave de API secreta das Variáveis de Ambiente da Vercel
  const apiKey = process.env.GEMINI_API_KEY; // Certifique-se que o nome corresponde ao que configurou na Vercel

  if (!apiKey) {
    console.error('Chave de API do Gemini não configurada nas variáveis de ambiente.');
    return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
  }

  // 3. Define o URL real da API da Google
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  try {
    // 4. Reencaminha o corpo do pedido (payload) do seu site para a API da Google
    const googleResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // O req.body contém o payload enviado pelo seu front-end
      body: JSON.stringify(req.body),
    });

    // 5. Obtém a resposta da API da Google
    const data = await googleResponse.json();

    // 6. Se a resposta da Google não for bem-sucedida, regista o erro e devolve uma mensagem genérica
    if (!googleResponse.ok) {
        console.error('Erro da API da Google:', data);
        return res.status(googleResponse.status).json({ error: 'Ocorreu um erro ao comunicar com o assistente.' });
    }
    
    // 7. Envia a resposta bem-sucedida de volta para o seu site
    res.status(200).json(data);

  } catch (error) {
    console.error('Erro no proxy da Vercel:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}
