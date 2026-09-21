// ==========================================================================
// data.js — Fonte de dados dos projetos (simula o que viria de uma API/back-end)
//
// Mantida separada dos templates de propósito: hoje os dados estão
// hard-coded aqui, mas essa separação permite trocar essa fonte por uma
// chamada de API no futuro sem tocar em nenhuma linha do sistema de
// templates (data.js muda, templates.js continua igual).
// ==========================================================================

export const projetosData = [
  {
    id: 'reforco-escolar',
    badge: 'Educação',
    badgeClass: 'badge--primary',
    titulo: 'Reforço Escolar',
    descricao: 'Projeto voltado para crianças e adolescentes, oferecendo apoio educacional e acompanhamento escolar.',
    modal: {
      id: 'modal-reforco',
      texto: 'Atendimento gratuito para crianças e adolescentes em situação de vulnerabilidade, com aulas de reforço em português e matemática, acompanhamento pedagógico e apoio psicossocial.',
      badge: 'Vagas abertas',
      badgeClass: 'badge--primary',
    },
  },
  {
    id: 'campanha-doacoes',
    badge: 'Doação',
    badgeClass: 'badge--secondary',
    titulo: 'Campanha de Doações',
    descricao: 'Arrecadação de alimentos, roupas e materiais de higiene para distribuição às famílias cadastradas na instituição.',
    modal: {
      id: 'modal-doacoes',
      texto: 'Pontos de coleta espalhados pela cidade recebem alimentos não perecíveis, roupas em bom estado e itens de higiene, distribuídos mensalmente às famílias cadastradas na ONG.',
      badge: 'Campanha ativa',
      badgeClass: 'badge--secondary',
    },
  },
  {
    id: 'programa-voluntariado',
    badge: 'Voluntariado',
    badgeClass: 'badge--neutral',
    titulo: 'Programa de Voluntariado',
    descricao: 'Os voluntários podem atuar em eventos, campanhas solidárias e atividades de apoio à comunidade.',
    lista: [
      'Organização de eventos',
      'Distribuição de doações',
      'Apoio em atividades educacionais',
    ],
  },
];