// ⚠️ DEPRECATED: Ce fichier est maintenant déprécié
// Veuillez utiliser soutenanceService depuis src/services/pfe-services/soutenanceService
// 
// Les fonctions d'évaluation ont été migrées vers soutenanceService:
// - getSoutenancesAujourdhui() → soutenanceService.getSoutenancesAujourdhui()
// - createEvaluation() → soutenanceService.saveEvaluation()
// - getTypesGrille() → à implémenter dans soutenanceService si nécessaire

import soutenanceService from 'src/services/pfe-services/soutenanceService';

// Wrapper pour maintenir la compatibilité avec l'ancien code
export const evaluationService = {
  // Soutenances du jour
  getSoutenancesAujourdhui: async () => {
    return soutenanceService.getSoutenancesAujourdhui();
  },
  
  // Créer/sauvegarder une évaluation
  createEvaluation: async (evaluationData) => {
    console.log('📤 Creating evaluation:', evaluationData);
    return soutenanceService.saveEvaluation(evaluationData);
  },
        
  // Grilles d'évaluation (à implémenter dans soutenanceService)
  getTypesGrille: async () => {
    console.warn('⚠️ getTypesGrille() n\'est pas encore implémentée dans soutenanceService');
    return [];
  },
};

export default evaluationService;