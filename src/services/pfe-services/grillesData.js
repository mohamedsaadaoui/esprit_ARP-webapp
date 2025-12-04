export const grillesData = {
  ACADEMIQUE: {
    type: "ACADEMIQUE",
    titre: "Grille Encadrant Académique",
    description: "Évaluation des livrables et rendez-vous pédagogiques",
    structure: [
      {
        id: "rdv_pedagogiques",
        section: "Note RDV pédagogiques (80%)",
        points: 20,
        ponderation: 0.8,
        sousSections: [
          {
            id: "livrables",
            name: "Livrables",
            points: 7,
            elements: [
              { id: "planning", name: "Planning de stage", points: 3 },
              { id: "bilan_debut", name: "Bilan périodique début", points: 1 },
              { id: "bilan_milieu", name: "Bilan périodique milieu", points: 1 },
              { id: "bilan_fin", name: "Bilan périodique fin", points: 1 },
              { id: "journal", name: "Journal de bord", points: 1 }
            ]
          },
          {
            id: "fiches",
            name: "Fiches d'évaluation", 
            points: 4,
            elements: [
              { id: "fiche_mi_parcours", name: "Fiche mi-parcours", points: 2 },
              { id: "fiche_finale", name: "Fiche finale", points: 2 }
            ]
          },
          {
            id: "rdv",
            name: "RDV pédagogiques",
            points: 9, 
            elements: [
              { id: "restitution_1", name: "1ère restitution", points: 4.5 },
              { id: "restitution_2", name: "2ème restitution", points: 4.5 }
            ]
          }
        ]
      },
      {
        id: "appreciation",
        section: "Note d'appréciation globale (20%)",
        points: 20,
        ponderation: 0.2
      }
    ]
  },

  EXPERT: {
    type: "EXPERT",
    titre: "Grille Expert",
    description: "Évaluation des compétences techniques et méthodologiques",
    totalPoints: 20,
    echelle: [
      { note: "A", points: 5, description: "Excellente maîtrise", couleur: "#10b981" },
      { note: "B", points: 4, description: "Bonne maîtrise", couleur: "#3b82f6" },
      { note: "C", points: 2, description: "Maîtrise moyenne", couleur: "#f59e0b" },
      { note: "D", points: 1, description: "Maîtrise insuffisante", couleur: "#ef4444" }
    ],
    criteres: [
      {
        id: "expert_1",
        name: "Mettre en place une solution pour résoudre un problème complexe",
        points: 5,
        description: "La solution proposée permet de résoudre le problème dans tous ses aspects..."
      },
      {
        id: "expert_2", 
        name: "Combiner les compétences acquises dans la résolution des problèmes",
        points: 5,
        description: "Les compétences de l'étudiant sont mises en pratique d'une manière cohérente..."
      },
      {
        id: "expert_3",
        name: "Appliquer les normes en vigueur ou exigences requises",
        points: 5,
        description: "Les solutions proposées répondent parfaitement aux normes en vigueur..."
      },
      {
        id: "expert_4",
        name: "Adapter les choix aux contraintes rencontrées", 
        points: 5,
        description: "L'étudiant a anticipé, prévu et réagi aux éventuelles contraintes..."
      }
    ]
  },

  SOUTENANCE: {
    type: "SOUTENANCE",
    titre: "Grille d'Évaluation de Soutenance",
    description: "Évaluation de la présentation et de la défense du projet",
    totalPoints: 40,
    echelle: [
      { note: "A++", points: 5, description: "Excellente", couleur: "#059669" },
      { note: "A", points: 4, description: "Très bonne", couleur: "#10b981" },
      { note: "B", points: 3.25, description: "Bonne", couleur: "#3b82f6" },
      { note: "C", points: 2, description: "Moyenne", couleur: "#f59e0b" },
      { note: "D", points: 1, description: "Insuffisante", couleur: "#ef4444" }
    ],
    seuils: [
      { note: "A", min: 32, description: "> 32 points" },
      { note: "B", min: 26, max: 31, description: "26-31 points" },
      { note: "C", min: 12, max: 25, description: "12-25 points" }, 
      { note: "D", max: 11, description: "≤ 11 points" }
    ],
    competences: [
      {
        id: "soutenance_1",
        name: "Comprendre et intégrer les enjeux et la stratégie de l'entreprise",
        points: 5
      },
      {
        id: "soutenance_2",
        name: "Analyser et/ou chercher les solutions à un problème de conception...",
        points: 5
      },
      {
        id: "soutenance_3", 
        name: "Conduire un projet de création, de conception, de réalisation...",
        points: 5
      },
      {
        id: "soutenance_4",
        name: "Mettre en œuvre sa maîtrise scientifique ou technique",
        points: 5
      },
      {
        id: "soutenance_5",
        name: "Organiser sa mission et manager les ressources",
        points: 5
      },
      {
        id: "soutenance_6",
        name: "Qualité et présentation du document", 
        points: 5
      },
      {
        id: "soutenance_7",
        name: "Qualité de la présentation orale",
        points: 5
      },
      {
        id: "soutenance_8",
        name: "Qualité de l'argumentation",
        points: 5
      }
    ]
  },

  ENTREPRISE: {
    type: "ENTREPRISE",
    titre: "Grille Encadrant Entreprise", 
    description: "Évaluation globale des compétences professionnelles",
    totalPoints: 60,
    conversion: "total / 60 × 20",
    echelle: [
      { note: "A", points: 5, description: "Exceptionnel", couleur: "#10b981" },
      { note: "B", points: 4, description: "Très bon", couleur: "#3b82f6" },
      { note: "C", points: 3, description: "Satisfaisant", couleur: "#f59e0b" },
      { note: "D", points: 2, description: "Faible", couleur: "#f97316" }, 
      { note: "E", points: 1, description: "Insatisfaisant", couleur: "#ef4444" }
    ],
    competences: [
      {
        id: "entreprise_1",
        name: "Intérêt pour le travail", 
        points: 5
      },
      {
        id: "entreprise_2",
        name: "Initiative",
        points: 5
      },
      {
        id: "entreprise_3", 
        name: "Créativité",
        points: 5
      },
      {
        id: "entreprise_4",
        name: "Connaissances techniques nécessaires",
        points: 5
      },
      {
        id: "entreprise_5",
        name: "Jugement",
        points: 5
      },
      {
        id: "entreprise_6",
        name: "Qualité de travail",
        points: 5
      },
      {
        id: "entreprise_7",
        name: "Quantité de travail",
        points: 5
      },
      {
        id: "entreprise_8",
        name: "Communications écrites",
        points: 5
      },
      {
        id: "entreprise_9",
        name: "Communications orales", 
        points: 5
      },
      {
        id: "entreprise_10",
        name: "Aptitudes pour la gestion du travail",
        points: 5
      },
      {
        id: "entreprise_11",
        name: "Aptitudes liées au travail d'équipe",
        points: 5
      },
      {
        id: "entreprise_12", 
        name: "Qualités relationnelles",
        points: 5
      }
    ]
  },

  MI_PARCOURS_ACADEMIQUE: {
    type: "MI_PARCOURS_ACADEMIQUE",
    titre: "Fiche d'Évaluation Mi-Parcours",
    description: "Évaluation intermédiaire par l'encadrant académique",
    totalPoints: 16, 
    typeReponse: "Oui/Non (1 point pour Oui, 0 pour Non)",
    sections: [
      {
        id: "ponctualite",
        name: "PONCTUALITE AU TRAVAIL",
        points: 2,
        questions: [
          {
            id: "ponctualite_1",
            text: "Le stagiaire s'est-il informé de lui-même des horaires à respecter?",
            points: 1
          },
          {
            id: "ponctualite_2", 
            text: "Est-il ponctuel ?",
            points: 1
          }
        ]
      },
      {
        id: "integration",
        name: "INTEGRATION DANS L'ENTREPRISE",
        points: 3,
        questions: [
          {
            id: "integration_1",
            text: "Le stagiaire a-t-il cherché dès le début à nouer des connaissances ?",
            points: 1
          },
          {
            id: "integration_2",
            text: "Cherche-t-il à communiquer avec les autres ?", 
            points: 1
          },
          {
            id: "integration_3",
            text: "D'après vous, est-il déjà bien intégré parmi les membres de votre service ?",
            points: 1
          }
        ]
      },
      {
        id: "travail",
        name: "TRAVAIL",
        points: 4,
        questions: [
          {
            id: "travail_1",
            text: "Est-il intéressé par son travail ?",
            points: 1
          },
          {
            id: "travail_2",
            text: "S'est-il préoccupé des méthodes de travail de l'entreprise ?",
            points: 1
          },
          {
            id: "travail_3", 
            text: "La quantité de travail fournie est elle satisfaisante ?",
            points: 1
          },
          {
            id: "travail_4",
            text: "Respecte-t-il les délais ?",
            points: 1
          }
        ]
      },
      {
        id: "competences", 
        name: "COMPETENCES TECHNIQUES",
        points: 6,
        questions: [
          {
            id: "competences_1",
            text: "Possède-t-il les compétences techniques nécessaires pour son travail ?",
            points: 1
          },
          {
            id: "competences_2",
            text: "A-t-il eu besoin d'apprendre une nouvelle technique ou un nouveau logiciel ?",
            points: 1
          },
          {
            id: "competences_3",
            text: "Si oui, a-t-il montré sa capacité à apprendre ?",
            points: 1
          },
          {
            id: "competences_4",
            text: "Cherche-t-il à améliorer ses compétences dans certains domaines ?", 
            points: 1
          },
          {
            id: "competences_5",
            text: "Est-il autonome ?",
            points: 1
          },
          {
            id: "competences_6",
            text: "Cherche-t-il à aider les autres ?",
            points: 1
          }
        ]
      },
      {
        id: "evaluation_globale",
        name: "EVALUATION GLOBALE",
        points: 1, 
        questions: [
          {
            id: "evaluation_1",
            text: "Etes-vous globalement satisfait du début de ce stage ?",
            points: 1
          }
        ]
      }
    ]
  }
};