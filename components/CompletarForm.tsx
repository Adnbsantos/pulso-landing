async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const res = await fetch(`/api/maisvoce/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSucesso(true);
        return;
      }

      // Tenta ler o corpo como JSON, mas não quebra se o servidor responder
      // com algo que não é JSON (ex: erro 500/504 "cru" do próprio Vercel).
      let mensagem = `Erro ao enviar (código ${res.status}). Tente novamente.`;
      try {
        const data = await res.json();
        if (data?.error) mensagem = data.error;
      } catch {
        // corpo não era JSON — mantém a mensagem genérica acima
      }
      setErro(mensagem);
    } catch (err) {
      // Falha de rede, timeout, etc.
      console.error("Erro ao enviar cadastro (Fase 2):", err);
      setErro("Não foi possível conectar. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }