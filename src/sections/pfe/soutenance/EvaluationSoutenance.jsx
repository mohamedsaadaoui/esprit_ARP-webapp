// pages/EvaluationSoutenance.jsx
import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import soutenanceService from 'src/services/pfe-services/soutenanceService';


const steps = ['Sélection Étudiant', 'Choix Grille', 'Remplissage'];

const EvaluationSoutenance = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
  const [selectedGrille, setSelectedGrille] = useState(null);
  const [notes, setNotes] = useState({});
  const [openConfirm, setOpenConfirm] = useState(false);

  // Gestion de la sélection étudiant
  const handleEtudiantSelect = (etudiant) => {
    setSelectedEtudiant(etudiant);
    setActiveStep(1);
  };

  // Gestion de la sélection grille
  const handleGrilleSelect = (grille) => {
    setSelectedGrille(grille);
    setActiveStep(2);
    
    // Charger les données existantes si la grille a déjà été remplie
    const grilleExistante = selectedEtudiant.grillesRemplies.find(
      g => g.typeGrille === grille.type
    );
    
    if (grilleExistante) {
      // Utiliser le service pour récupérer les notes existantes
      soutenanceService.getEvaluationById(grilleExistante.idEvaluation)
        .then(data => setNotes(data.notes))
        .catch(error => console.error('Erreur chargement évaluation:', error));
    }
  };

  // Sauvegarde de l'évaluation
  const handleSaveEvaluation = async (statut = 'BROUILLON') => {
    const evaluationData = {
      idEtudiant: selectedEtudiant.etudiant.idEtudiant,
      typeGrille: selectedGrille.type,
      notes: notes,
      statut: statut,
      dateEvaluation: new Date().toISOString()
    };

    try {
      await soutenanceService.saveEvaluation(evaluationData);

      alert(statut === 'VALIDEE' ? 'Grille validée avec succès!' : 'Brouillon sauvegardé!');
      setActiveStep(1); // Retour au choix des grilles
      setSelectedGrille(null);
      setNotes({});
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  // Rendu de la grille sélectionnée
  const renderGrille = () => {
    const commonProps = {
      etudiant: selectedEtudiant.etudiant,
      notes: notes,
      onNotesChange: setNotes,
      onSave: handleSaveEvaluation
    };

    switch (selectedGrille.type) {
      case 'ACADEMIQUE':
        return <GrilleAcademique {...commonProps} />;
      case 'EXPERT':
        return <GrilleExpert {...commonProps} />;
      case 'SOUTENANCE':
        return <GrilleSoutenance {...commonProps} />;
      case 'ENTREPRISE':
        return <GrilleEntreprise {...commonProps} />;
      default:
        return <Typography>Type de grille non supporté</Typography>;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <SelectionEtudiant onEtudiantSelect={handleEtudiantSelect} />
      )}

      {activeStep === 1 && selectedEtudiant && (
        <SelectionGrille
          etudiant={selectedEtudiant.etudiant}
          grillesDisponibles={selectedEtudiant.grillesDisponibles}
          grillesRemplies={selectedEtudiant.grillesRemplies}
          onGrilleSelect={handleGrilleSelect}
        />
      )}

      {activeStep === 2 && selectedGrille && (
        <Box>
          {renderGrille()}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button onClick={() => setActiveStep(1)}>
              Retour aux grilles
            </Button>
            
            <Box>
              <Button 
                variant="outlined" 
                onClick={() => handleSaveEvaluation('BROUILLON')}
                sx={{ mr: 1 }}
              >
                Sauvegarder Brouillon
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setOpenConfirm(true)}
              >
                Valider l'Évaluation
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Dialogue de confirmation */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmer la validation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir valider cette évaluation ? 
            Une fois validée, elle ne pourra plus être modifiée.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              handleSaveEvaluation('VALIDEE');
              setOpenConfirm(false);
            }}
          >
            Confirmer la Validation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvaluationSoutenance;