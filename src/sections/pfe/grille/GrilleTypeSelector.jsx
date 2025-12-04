import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert
} from '@mui/material';
import {
  School as AcademicIcon,
  Business as EnterpriseIcon,
  Gavel as ExpertIcon,
  RecordVoiceOver as SoutenanceIcon
} from '@mui/icons-material';

const GrilleTypeSelector = ({ selectedType, onSelectType, soutenance, onNext, onBack }) => {
  const [typesGrille, setTypesGrille] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTypesGrille();
  }, []);

  const fetchTypesGrille = async () => {
    try {
      const response = await evaluationService.getTypesGrille();
      setTypesGrille(response.data);
    } catch (error) {
      console.error('Erreur chargement types grille:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrilleIcon = (type) => {
    switch (type) {
      case 'ACADEMIQUE': return <AcademicIcon fontSize="large" />;
      case 'ENTREPRISE': return <EnterpriseIcon fontSize="large" />;
      case 'EXPERT': return <ExpertIcon fontSize="large" />;
      case 'SOUTENANCE': return <SoutenanceIcon fontSize="large" />;
      default: return <AcademicIcon fontSize="large" />;
    }
  };

  const getGrilleDescription = (type) => {
    switch (type) {
      case 'ACADEMIQUE':
        return 'Évaluation par l\'encadrant académique - Focus sur la méthodologie et les livrables';
      case 'ENTREPRISE':
        return 'Évaluation par l\'encadrant entreprise - Focus sur les compétences professionnelles';
      case 'EXPERT':
        return 'Évaluation par l\'expert - Focus sur l\'expertise technique';
      case 'SOUTENANCE':
        return 'Évaluation de la soutenance - Focus sur la présentation et la défense';
      default:
        return '';
    }
  };

  const getGrilleColor = (type) => {
    switch (type) {
      case 'ACADEMIQUE': return 'primary';
      case 'ENTREPRISE': return 'secondary';
      case 'EXPERT': return 'warning';
      case 'SOUTENANCE': return 'success';
      default: return 'default';
    }
  };

  const handleTypeSelection = (type) => {
    onSelectType(type);
  };

  // Vérifier si une évaluation existe déjà pour cette combinaison
  const isEvaluationExist = (type) => {
    if (!soutenance?.evaluations) return false;
    return soutenance.evaluations.some(evaluation => evaluation.typeGrille === type);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Choisir le Type de Grille d'Évaluation
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }} align="center">
        Sélectionnez le type d'évaluation que vous souhaitez remplir pour {soutenance?.prenomEtudiant} {soutenance?.nomEtudiant}
      </Typography>

      <Grid container spacing={3}>
        {typesGrille.map((type) => (
          <Grid item xs={12} md={6} key={type}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedType === type ? 2 : 1,
                borderColor: selectedType === type ? `${getGrilleColor(type)}.main` : 'divider',
                bgcolor: selectedType === type ? `${getGrilleColor(type)}.light` : 'background.paper',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              onClick={() => handleTypeSelection(type)}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: `${getGrilleColor(type)}.main`, mb: 2 }}>
                  {getGrilleIcon(type)}
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {type}
                </Typography>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {getGrilleDescription(type)}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                  {isEvaluationExist(type) && (
                    <Chip 
                      label="Déjà évalué" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  )}
                  <Chip 
                    label={selectedType === type ? "Sélectionné" : "Cliquer pour sélectionner"} 
                    size="small" 
                    color={selectedType === type ? "primary" : "default"}
                    variant={selectedType === type ? "filled" : "outlined"}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Alertes pour les évaluations existantes */}
      {soutenance?.evaluations && soutenance.evaluations.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Certains types d'évaluation ont déjà été remplis pour cet étudiant.
          Vous pouvez les modifier ou ajouter de nouvelles évaluations.
        </Alert>
      )}

      {/* Boutons de navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button onClick={onBack}>
          Retour à la sélection
        </Button>
        
        <Button 
          variant="contained" 
          onClick={onNext}
          disabled={!selectedType}
        >
          Continuer vers l'évaluation
        </Button>
      </Box>
    </Box>
  );
};

export default GrilleTypeSelector;