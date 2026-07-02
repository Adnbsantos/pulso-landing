'use client';
import { useParams } from 'next/navigation';

export default function LandingPage() {
  const params = useParams();
  
  // Transformamos o slug (ex: pr-daniel-de-castro-1234) em um nome legível
  // Removemos os últimos 5 caracteres (hífen + 4 dígitos do ID) e trocamos hífens por espaços
  const slugRaw = params.slug as string;
  const nomeConvidante = slugRaw
    ? slugRaw.substring(0, slugRaw.length - 5).replace(/-/g, ' ')
    : "Pr. Daniel de Castro"; // Nome padrão caso não encontre

  return (
    <main style={{ textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Imagem do Daniel */}
      <img src="/assets/Daniel - Caricatura.png" alt="Caricatura" style={{ width: '150px' }} />
      
      <h1>Geração de Daniel</h1>
      <p>Juntos por fé, família e propósito.</p>

      {/* Caixa do Convidante */}
      <div style={{ backgroundColor: '#001f3f', color: '#fff', padding: '15px', borderRadius: '8px' }}>
        <p>Você foi convidado pelo</p>
        <h2>{nomeConvidante.toUpperCase()}</h2>
      </div>

      {/* Formulário (seu código anterior permanece aqui) */}
      {/* ... */}
    </main>
  );
}