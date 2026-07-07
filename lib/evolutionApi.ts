// Integração com a Evolution API (self-hosted, conecta via QR Code).
// Docs: https://doc.evolution-api.com
//
// Variáveis necessárias no .env.local:
//   EVOLUTION_API_URL=https://sua-instancia-evolution.com
//   EVOLUTION_API_KEY=sua-chave-de-api
//   EVOLUTION_INSTANCE=nome-da-instancia   (o "nome" que você deu ao
//     conectar o WhatsApp via QR Code no painel da Evolution API)

export async function enviarWhatsApp(telefone: string, mensagem: string): Promise<boolean> {
  const url = process.env.EVOLUTION_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY
  const instancia = process.env.EVOLUTION_INSTANCE

  if (!url || !apiKey || !instancia) {
    console.error(
      'Evolution API não configurada. Faltam EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE no .env.local.'
    )
    return false
  }

  // A Evolution API espera o telefone no formato DDI+DDD+número, sem
  // símbolos (ex: 5561999998888). Assumimos Brasil (55) se não vier.
  const numero = telefone.replace(/\D/g, '')
  const numeroComDDI = numero.startsWith('55') ? numero : `55${numero}`

  try {
    const resposta = await fetch(`${url}/message/sendText/${instancia}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: numeroComDDI,
        text: mensagem,
      }),
    })

    if (!resposta.ok) {
      const detalhe = await resposta.text()
      console.error('Erro ao enviar WhatsApp:', resposta.status, detalhe)
      return false
    }

    return true
  } catch (err) {
    console.error('Erro de rede ao enviar WhatsApp:', err)
    return false
  }
}
