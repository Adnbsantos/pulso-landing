// Espelha exatamente as CHECK CONSTRAINTS do banco (mesmas listas usadas
// em pulso-df/src/lib/options.ts). Se uma mudar, a outra precisa mudar junto.

export const FAIXA_LIDERANCA_OPTIONS = [
  "Até 10 Pessoas",
  "Entre 11 e 30 pessoas",
  "Entre 31 e 100 pessoas",
  "Acima de 100 pessoas",
] as const;

export const ATIVIDADE_COMUNITARIA_OPTIONS = [
  "Organizando pessoas",
  "Participando de ações sociais",
  "Compartilhando informações",
  "Ensinando e orientando",
  "Apoiando projetos",
  "Empreendendo e gerando oportunidades",
  "Não participo atualmente",
  "Outros",
] as const;

export const TEMAS_PRIORITARIOS_OPTIONS = [
  "Família",
  "Educação",
  "Saúde",
  "Segurança",
  "Regularização Imobiliária",
  "Mobilidade Urbana",
  "Juventude",
  "Esporte",
  "Geração de Emprego",
  "Empreendedorismo",
  "Assistência Social",
  "Proteção Animal",
  "Cultura",
  "Meio Ambiente",
  "Liberdade Religiosa",
  "Outros",
] as const;

export const SITUACAO_PROFISSIONAL_OPTIONS = [
  "Empresário",
  "Empregado",
  "Servidor Público",
  "Autônomo",
  "Profissional Liberal",
  "Estudante",
  "Aposentado",
  "Outros",
] as const;

export const AREA_ATUACAO_OPTIONS = [
  "Saúde",
  "Educação",
  "Construção",
  "Tecnologia",
  "Transporte",
  "Comércio",
  "Segurança",
  "Outros",
] as const;
