// app/privacidade/page.tsx
// Página de Política de Privacidade — Pulso DF
// Publicada em: geracao.pulsodf.com.br/privacidade

export const metadata = {
  title: "Política de Privacidade | Pulso DF",
  description: "Política de Privacidade do aplicativo Pulso DF",
};

export default function PoliticaPrivacidade() {
  return (
    <main className="min-h-screen bg-[#EAF2FB] py-16 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl font-bold text-[#1B2559] mb-2">
          Política de Privacidade — Pulso DF
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Última atualização: 20 de julho de 2026
        </p>

        <section className="space-y-6 text-gray-800 leading-relaxed">
          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              1. Quem somos
            </h2>
            <p>
              Esta Política de Privacidade se aplica ao aplicativo{" "}
              <strong>Pulso DF</strong>, disponibilizado por:
            </p>
            <p className="mt-2">
              <strong>MAIS SOLUÇÕES INTEGRADAS LTDA</strong>
              <br />
              CNPJ: 38.292.139/0001-29
              <br />
              Endereço: SIA/Setor Tradicional, Quadra 7, Lote 17, Sala 104,
              Brazlândia — Brasília/DF, CEP 72.720-070
              <br />
              E-mail de contato:{" "}
              <a
                href="mailto:contato@pulsodf.com.br"
                className="text-[#1B2559] underline"
              >
                contato@pulsodf.com.br
              </a>
            </p>
            <p className="mt-2">
              A MAIS SOLUÇÕES INTEGRADAS LTDA é a controladora dos dados
              pessoais tratados por meio do aplicativo Pulso DF, nos termos
              da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais
              — LGPD).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              2. Quais dados coletamos
            </h2>
            <p>
              Ao se cadastrar ou utilizar o Pulso DF, podemos coletar os
              seguintes dados pessoais:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Nome completo</li>
              <li>Número de telefone</li>
              <li>Nome de usuário do Instagram</li>
              <li>Cidade / Região Administrativa</li>
              <li>Data de aniversário</li>
            </ul>
            <p className="mt-2">
              Não coletamos dados sensíveis nos termos do art. 5º, II, da
              LGPD (como origem racial, convicção religiosa, dados de saúde
              ou biométricos).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              3. Para que usamos esses dados
            </h2>
            <p>Os dados coletados são utilizados exclusivamente para:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Mobilização</strong>: organizar e viabilizar a
                participação de apoiadores em ações e eventos
              </li>
              <li>
                <strong>Comunicação</strong>: enviar informações, convites e
                atualizações sobre eventos e atividades relacionadas ao
                aplicativo
              </li>
            </ul>
            <p className="mt-2">
              Não utilizamos os dados para finalidades distintas das
              descritas acima, nem os vendemos a terceiros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              4. Base legal para o tratamento
            </h2>
            <p>
              O tratamento dos dados pessoais coletados pelo Pulso DF tem
              como base legal o <strong>consentimento do titular</strong>{" "}
              (art. 7º, I, da LGPD), fornecido no momento do cadastro no
              aplicativo.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              5. Com quem compartilhamos os dados
            </h2>
            <p>Os dados podem ser acessados por:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Equipe interna responsável pela organização de eventos e
                comunicação
              </li>
              <li>
                Provedores de infraestrutura tecnológica que hospedam o
                aplicativo e o banco de dados, sob obrigações contratuais de
                confidencialidade e segurança
              </li>
            </ul>
            <p className="mt-2">
              Não compartilhamos os dados com terceiros para fins de
              publicidade ou revenda.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              6. Por quanto tempo guardamos os dados
            </h2>
            <p>
              Os dados pessoais são mantidos enquanto o titular mantiver seu
              cadastro ativo no aplicativo, ou até que solicite sua
              exclusão, o que ocorrer primeiro. Após a exclusão, os dados
              são removidos de nossas bases dentro de um prazo razoável,
              ressalvadas eventuais obrigações legais de retenção.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              7. Seus direitos como titular dos dados
            </h2>
            <p>
              Nos termos do art. 18 da LGPD, você pode, a qualquer momento,
              solicitar:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Confirmação da existência de tratamento de seus dados
              </li>
              <li>Acesso aos dados que temos sobre você</li>
              <li>
                Correção de dados incompletos, inexatos ou desatualizados
              </li>
              <li>
                Anonimização, bloqueio ou eliminação de dados desnecessários
                ou tratados em desconformidade com a lei
              </li>
              <li>
                Exclusão dos dados pessoais tratados com base no
                consentimento
              </li>
              <li>Revogação do consentimento, a qualquer momento</li>
              <li>
                Informação sobre com quem seus dados são compartilhados
              </li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer um desses direitos, entre em contato
              pelo e-mail:{" "}
              <a
                href="mailto:contato@pulsodf.com.br"
                className="text-[#1B2559] underline"
              >
                contato@pulsodf.com.br
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              8. Segurança dos dados
            </h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger os
              dados pessoais contra acessos não autorizados, perda,
              alteração ou divulgação indevida, incluindo criptografia de
              dados em trânsito.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              9. Alterações nesta política
            </h2>
            <p>
              Esta Política de Privacidade pode ser atualizada
              periodicamente. A data da última atualização está indicada no
              topo deste documento. Recomendamos a revisão periódica deste
              conteúdo.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1B2559] mb-2">
              10. Contato
            </h2>
            <p>
              Em caso de dúvidas sobre esta Política de Privacidade ou sobre
              o tratamento de seus dados pessoais, entre em contato:{" "}
              <a
                href="mailto:contato@pulsodf.com.br"
                className="text-[#1B2559] underline"
              >
                contato@pulsodf.com.br
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
