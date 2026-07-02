import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const appId = process.env.APPSHEET_APP_ID;
  const accessKey = process.env.APPSHEET_ACCESS_KEY;

  try {
    const response = await fetch(`https://api.appsheet.com/api/v2/apps/${appId}/tables/UsuariosBackoffice/Action`, {
      method: 'POST',
      headers: {
        'ApplicationAccessKey': accessKey!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "Action": "Find",
        "Properties": { "Selector": `[Slug] = '${slug}'` }
      })
    });

    const data = await response.json();
    
    // Busca o primeiro usuário encontrado e extrai o campo "Nome"
    const usuario = Array.isArray(data) ? data[0] : null;
    
    return NextResponse.json({ 
      nome: usuario ? usuario["Nome"] : "Convidante não encontrado" 
    });
  } catch (error) {
    return NextResponse.json({ nome: "Erro ao buscar" }, { status: 500 });
  }
}