'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import React from 'react';

export default function LandingPage() {
  const params = useParams();
  const [enviado, setEnviado] = useState(false);
  
  // Estado para o nome vindo do AppSheet
  const [nomeConvidante, setNomeConvidante] = useState("Carregando...");

  // Busca o nome real na API quando o slug mudar
  useEffect(() => {
    const slug = params?.slug as string;
    if (slug) {
      fetch(`/api/convidado/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          setNomeConvidante(data.nome || "Pr. Daniel de Castro");
        })
        .catch(() => {
          setNomeConvidante("Pr. Daniel de Castro");
        });
    }
  }, [params?.slug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      {/* Imagem do Daniel */}
      <img src="/assets/Daniel - Caricatura.png" alt="Caricatura" style={{ width: '150px', borderRadius: '50%' }} />
      
      <h1>Geração de Daniel</h1>
      <p>Juntos por fé, família e propósito.</p>

      {/* Caixa do Convidante dinâmica */}
      <div style={{ backgroundColor: '#001f3f', color: '#fff', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
        <p style={{ margin: '0 0 5px 0' }}>Você foi convidado pelo</p>
        <h2 style={{ margin: '0' }}>{nomeConvidante.toUpperCase()}</h2>
      </div>

      {!enviado ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <label>Meu Nome Completo</label>
          <input type="text" placeholder="Digite seu nome completo" required style={{ padding: '10px' }} />
          
          <label>Meu WhatsApp</label>
          <input type="tel" placeholder="(61) 99999-9999" required style={{ padding: '10px' }} />
          
          <label>Meu Instagram</label>
          <input type="text" placeholder="@seuinstagram" style={{ padding: '10px' }} />
          
          <button type="submit" style={{ padding: '15px', backgroundColor: '#FFD700', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            Quero participar
          </button>
        </form>
      ) : (
        <div style={{ marginTop: '30px' }}>
          <h2>Obrigado pelo seu cadastro!</h2>
          <p>Se precisar de suporte, nossa Assessoria de Comunicação está pronta para ajudar.</p>
          <p>WhatsApp: <strong>(61) 3199-1716</strong></p>
          
          <a href="https://wa.me/556131991716" target="_blank" rel="noopener noreferrer" style={{ display: 'block', margin: '15px 0', color: '#25D366', fontWeight: 'bold' }}>
            Falar no WhatsApp da Assessoria
          </a>
          
          <a href="LINK_DO_SEU_APP" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#333', color: '#fff', textDecoration: 'none', borderRadius: '5px' }}>
            Acessar Meu App
          </a>
        </div>
      )}
    </main>
  );
}