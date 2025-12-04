import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';

const GrilleEvaluation = ({ grilleData, grilleType, soutenance, loading, onSubmit, onBack }) => {
  const [notes, setNotes] = useState({});
  const [commentaire, setCommentaire] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialiser les notes quand la grille change
  useEffect(() => {
    if (grilleData) {
      const initialNotes = {};
      initializeNotes(grilleData, initialNotes);
      setNotes(initialNotes);
    }
  }, [grilleData]);

  const initializeNotes = (items, notesObj) => {
    items.forEach(item => {
      if (item.niveau === 3) { // Niveau des critères évaluables
        notesObj[item.idGrille] = 0;
      }
      if (item.sousCriteres && item.sousCriteres.length > 0) {
        initializeNotes(item.sousCriteres, notesObj);
      }
    });
  };

  const handleNoteChange = (critereId, value) => {
    setNotes(prev => ({
      ...prev,
      [critereId]: parseFloat(value) || 0
    }));
  };

  const calculateTotal = () => {
    return Object.values(notes).reduce((sum, note) => sum + (note || 0), 0);
  };

  const calculateNoteSur20 = () => {
    const totalMax = 40; // À adapter selon votre grille
    const total = calculateTotal();
    return ((total / totalMax) * 20).toFixed(2);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      
      const evaluationData = {
        notesCriteres: notes,
        noteFinale: parseFloat(calculateNoteSur20()),
        commentaire: commentaire,
        statut: 'SOUMIS'
      };

      await onSubmit(evaluationData);
      
    } catch (error) {
      console.error('Erreur soumission évaluation:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderHierarchie = (items, niveau = 0) => {
    return items.map((item) => {
      const hasChildren = item.sousCriteres && item.sousCriteres.length > 0;
      
      return (
        <Box key={item.idGrille} sx={{ ml: niveau * 2, mb: 2 }}>
          {/* En-tête de l'item */}
          <Paper sx={{ 
            p: 2, 
            bgcolor: niveau === 0 ? 'primary.main' : 
                     niveau === 1 ? 'primary.light' : 
                     niveau === 2 ? 'grey.100' : 'white',
            color: niveau <= 1 ? 'white' : 'text.primary'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant={niveau === 0 ? 'h6' : niveau === 1 ? 'subtitle1' : 'body2'}>
                {item.critere}
                {item.coefficient > 0 && (
                  <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                    ({item.coefficient} points)
                  </Typography>
                )}
              </Typography>
              
              {item.niveau === 3 && (
                <Box sx={{ minWidth: 200 }}>
                  <Slider
                    value={notes[item.idGrille] || 0}
                    onChange={(_, value) => handleNoteChange(item.idGrille, value)}
                    min={0}
                    max={item.coefficient}
                    step={0.5}
                    valueLabelDisplay="auto"
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="caption" align="center" display="block">
                    {notes[item.idGrille] || 0} / {item.coefficient}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>

          {/* Enfants */}
          {hasChildren && renderHierarchie(item.sousCriteres, niveau + 1)}
        </Box>
      );
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement de la grille...</Typography>
      </Box>
    );
  }

  if (!grilleData) {
    return (
      <Alert severity="error">
        Erreur lors du chargement de la grille d'évaluation
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Évaluation - {grilleType}
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }} align="center">
        Remplissez la grille d'évaluation pour {soutenance?.prenomEtudiant} {soutenance?.nomEtudiant}
      </Typography>

      {/* Résumé en temps réel */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'success.light', color: 'white' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">Total points:</Typography>
            <Typography variant="h6">{calculateTotal().toFixed(2)} / 40</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">Note sur 20:</Typography>
            <Typography variant="h6">{calculateNoteSur20()} / 20</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2">Statut:</Typography>
            <Typography variant="h6">En cours</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Grille d'évaluation */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {renderHierarchie(grilleData)}
      </Paper>

      {/* Commentaire */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Commentaire global
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Ajoutez vos commentaires, observations et recommandations..."
          variant="outlined"
        />
      </Paper>

      {/* Boutons d'action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} disabled={saving}>
          Retour
        </Button>
        
        <Box>
          <Button sx={{ mr: 1 }} variant="outlined" disabled={saving}>
            Sauvegarder brouillon
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Soumettre l\'évaluation'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default GrilleEvaluation;