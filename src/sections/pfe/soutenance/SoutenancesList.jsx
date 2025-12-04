import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { evaluationService } from '../services/evaluationService';

const SoutenancesList = ({ onSelectSoutenance, selectedSoutenance }) => {
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSoutenancesAujourdhui();
  }, []);

  const fetchSoutenancesAujourdhui = async () => {
    try {
      setLoading(true);
      const response = await evaluationService.getSoutenancesAujourdhui();
      setSoutenances(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des soutenances');
      console.error('Error fetching soutenances:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'PLANIFIEE': return 'primary';
      case 'EN_COURS': return 'warning';
      case 'TERMINEE': return 'success';
      case 'ANNULEE': return 'error';
      default: return 'default';
    }
  };

  const getEvaluationStats = (soutenance) => {
    if (!soutenance.evaluations) return { completed: 0, total: 4 };
    
    return {
      completed: soutenance.evaluations.length,
      total: 4
    };
  };

  const formatHeure = (heure) => {
    if (!heure) return '';
    return typeof heure === 'string' ? heure : heure.slice(0, 5);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des soutenances...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (soutenances.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          Aucune soutenance prévue aujourd'hui
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom align="center">
        Soutenances du Jour
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }} align="center">
        Sélectionnez un étudiant pour commencer l'évaluation
      </Typography>

      <Grid container spacing={3}>
        {soutenances.map((soutenance) => {
          const stats = getEvaluationStats(soutenance);
          const isSelected = selectedSoutenance?.idSoutenance === soutenance.idSoutenance;
          
          return (
            <Grid item xs={12} md={6} key={soutenance.idSoutenance}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'primary.light' : 'background.paper',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => onSelectSoutenance(soutenance)}
              >
                <CardContent>
                  {/* En-tête avec nom étudiant et statut */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {soutenance.prenomEtudiant} {soutenance.nomEtudiant}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {soutenance.libelle}
                      </Typography>
                    </Box>
                    <Chip 
                      label={soutenance.statut || 'PLANIFIEE'} 
                      size="small" 
                      color={getStatutColor(soutenance.statut)}
                    />
                  </Box>

                  {/* Informations de la soutenance */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Date:</strong> {new Date(soutenance.dateSoutenance).toLocaleDateString('fr-FR')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Horaire:</strong> {formatHeure(soutenance.heureDebut)} - {formatHeure(soutenance.heureFin)}
                    </Typography>
                    {soutenance.salle && (
                      <Typography variant="body2" color="textSecondary">
                        <strong>Salle:</strong> {soutenance.salle}
                      </Typography>
                    )}
                  </Box>

                  {/* Progression des évaluations */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip 
                      label={`${stats.completed}/${stats.total} évaluations`}
                      size="small"
                      color={stats.completed === stats.total ? "success" : "primary"}
                      variant={stats.completed === stats.total ? "filled" : "outlined"}
                    />
                    
                    <Button 
                      size="small" 
                      variant={isSelected ? "contained" : "outlined"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSoutenance(soutenance);
                      }}
                    >
                      {isSelected ? 'Sélectionné' : 'Sélectionner'}
                    </Button>
                  </Box>

                  {/* Liste des évaluations existantes */}
                  {soutenance.evaluations && soutenance.evaluations.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="textSecondary">
                        Évaluations complétées:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {soutenance.evaluations.map((evalItem, index) => (
                          <Chip
                            key={index}
                            label={evalItem.typeGrille}
                            size="small"
                            variant="outlined"
                            color="success"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Instructions */}
      {selectedSoutenance && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>{selectedSoutenance.prenomEtudiant} {selectedSoutenance.nomEtudiant}</strong> sélectionné. 
          Cliquez sur "Continuer" pour choisir le type d'évaluation.
        </Alert>
      )}
    </Box>
  );
};

export default SoutenancesList; // ← AJOUTEZ CETTE LIGNE
