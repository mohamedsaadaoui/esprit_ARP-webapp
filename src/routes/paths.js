// ----------------------------------------------------------------------




 
export const ROOTS = {  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  ONLINE: '/online',
  PFE: '/pfe',
  HOME:'/home'
};
 
// ----------------------------------------------------------------------
 
export const paths = {
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
      root: `${ROOTS.DASHBOARD}`,
    one: `${ROOTS.DASHBOARD}/one`,
    two: `${ROOTS.DASHBOARD}/emploi`,
    three: `${ROOTS.DASHBOARD}/three`,
    four: `${ROOTS.DASHBOARD}/four`,
    five: `${ROOTS.DASHBOARD}/five`,
    six: `${ROOTS.DASHBOARD}/six`,
    seven: `${ROOTS.DASHBOARD}/seven`,
    eight: `${ROOTS.DASHBOARD}/eight`,
    rattrapage: `${ROOTS.DASHBOARD}/rattrapage`,
    salle: `${ROOTS.DASHBOARD}/EmploiSalle`,
    users: `${ROOTS.DASHBOARD}/users`,
    userscreate: `${ROOTS.DASHBOARD}/userscreate`,
    resetPwd: `${ROOTS.DASHBOARD}/resetPwd`,
    changepwd: `${ROOTS.DASHBOARD}/changepwd`,
    createPwd: `${ROOTS.DASHBOARD}/createPwd`,
    listEnsByCours: `${ROOTS.DASHBOARD}/listEnsByCours`,


   // disp: `${ROOTS.DASHBOARD}/disp`,
    disp: (idEmp) => `${ROOTS.DASHBOARD}/disp/${idEmp}`,

    group: {
      root: `${ROOTS.DASHBOARD}/group`,
     
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },

    online: {
    profile: ROOTS.ONLINE,
    absence: `${ROOTS.ONLINE}/absence`,
    resultat: `${ROOTS.ONLINE}/resultat`,
    evaluation: `${ROOTS.ONLINE}/evaluation`,
    edt: `${ROOTS.ONLINE}/edt`,
    reclamation:`${ROOTS.ONLINE}/reclamation`,
   
  },
    PFE: {
    profile: ROOTS.PFE,

    encadrementExpertise: `${ROOTS.PFE}/encadrement-expertise`,
    demandeChangementEnseignant: `${ROOTS.PFE}/demande-changement`,
    listDemandesChangement: `${ROOTS.PFE}/liste-demandes-changement`,
    demandeConvention: `${ROOTS.PFE}/demandeConvention`,
    traiterConvention: `${ROOTS.PFE}/traiterConvention`,
    planTravail: `${ROOTS.PFE}/planTravail`,
    traiterPlanTravail: `${ROOTS.PFE}/traiterPlanTravail`,
    progression: `${ROOTS.PFE}/progression`,
    soutenance: `${ROOTS.PFE}/soutenance`,
    planificationSoutenances: `${ROOTS.PFE}/soutenance/planification`,
    Reservationsallesoutenance: `${ROOTS.PFE}/soutenance/planification/sallesdisp`,
    GrilleAcademique: `${ROOTS.PFE}/grille/GrilleAcademique`,
    evalualtion: `${ROOTS.PFE}/grille/EvaluationWorkflow`,
    GrilleExpert: `${ROOTS.PFE}/grille/GrilleExpert`,
    GrilleEntreprise: `${ROOTS.PFE}/grille/GrilleEntreprise`,
    GrilleSoutenance: `${ROOTS.PFE}/grille/GrilleSoutenance`,
    NouvelleReservation: `${ROOTS.PFE}/soutenance/planification/nouvelle`,
    SalleDetails: (id) => `${ROOTS.PFE}/soutenance/planification/${id}`,

    },
    home: {
    home: `${ROOTS.ONLINE}`, 
      }
   


};