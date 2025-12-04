import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Box,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const GrilleExpert = ({ selectedEtudiant, etudiantInfo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState({});
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [openAlert, setOpenAlert] = useState(true);
  const [calculatedScore, setCalculatedScore] = useState(null);
  const [etudiantData, setEtudiantData] = useState({
    nom: '',
    departement: '',
    option: '',
    entreprise: '',
    projet: '',
    idAffectationStage: null
  });

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  // 🆕 Mise à jour automatique quand l'étudiant change depuis le workflow
  useEffect(() => {
    if (selectedEtudiant && etudiantInfo) {
      console.log('Étudiant reçu depuis le workflow:', selectedEtudiant, etudiantInfo);
      fetchEtudiantData();
    } else {
      resetEtudiantData();
    }
  }, [selectedEtudiant, etudiantInfo]);

  // 🆕 Fonction pour récupérer les données complètes de l'étudiant
  const fetchEtudiantData = async () => {
    if (!selectedEtudiant) {
      resetEtudiantData();
      return;
    }

    try {
      setLoading(true);
      
      // Utiliser les informations déjà fournies par le workflow
      const newEtudiantData = {
        nom: etudiantInfo.nomComplet || `${etudiantInfo.prenom || ''} ${etudiantInfo.nom || ''}`.trim(),
        departement: etudiantInfo.departement || 'Informatique',
        option: etudiantInfo.option || 'DS',
        entreprise: etudiantInfo.entreprise || 'ESPRIT - TECH',
        projet: etudiantInfo.projet || 'Modèle IA pour la prévision de production électrique PV basée sur la météo',
        idAffectationStage: etudiantInfo.affectation?.id || null
      };

      setEtudiantData(newEtudiantData);
      
      // Charger les notes existantes seulement si on a une affectation
      if (newEtudiantData.idAffectationStage) {
        await fetchExistingNotes(newEtudiantData.idAffectationStage);
        // Calculer la note existante
        await calculateExpertScore(newEtudiantData.idAffectationStage);
      } else {
        setScores({});
        setCalculatedScore(null);
      }

    } catch (err) {
      console.error('Erreur fetch données étudiant:', err);
      showSnackbar('Erreur lors du chargement des données étudiant', 'error');
      resetEtudiantData();
    } finally {
      setLoading(false);
    }
  };

  const resetEtudiantData = () => {
    setEtudiantData({
      nom: '',
      departement: '',
      option: '',
      entreprise: '',
      projet: '',
      idAffectationStage: null
    });
    setScores({});
    setCalculatedScore(null);
  };

  const fetchExistingNotes = async (affectationId) => {
    try {
      const response = await fetch(`http://localhost:8096/api/notes-grille/affectation/${affectationId}`);
      if (response.ok) {
        const notesData = await response.json();
        
        const nouvellesNotes = {};
        notesData.forEach(note => {
          const critere = criteres.find(c => c.idGrille === note.idGrille);
          if (critere) {
            nouvellesNotes[critere.id] = note.note;
          }
        });
        setScores(nouvellesNotes);
      }
    } catch (error) {
      console.warn('Impossible de charger les notes existantes:', error);
    }
  };

  // Calculer la note à partir du backend
  const calculateExpertScore = async (affectationId) => {
    try {
      const response = await fetch(`http://localhost:8096/api/calcul-notes/expert/${affectationId}/P-03-06`);
      if (response.ok) {
        const data = await response.json();
        setCalculatedScore(data);
      }
    } catch (error) {
      console.warn('Impossible de calculer la note expert:', error);
    }
  };

  // Calculer la note à partir des scores actuels
  const calculateScoreFromCurrent = () => {
    const notesValues = Object.values(scores);
    if (notesValues.length === 0) {
      setCalculatedScore(null);
      return;
    }

    const sommeNotes = notesValues.reduce((sum, score) => sum + score, 0);
    const nombreCriteres = notesValues.length;
    const noteMoyenne = sommeNotes / nombreCriteres;
    const noteFinale = noteMoyenne * 4; // Conversion vers 20 points

    setCalculatedScore({
      noteMoyenneExpert: noteMoyenne,
      noteFinaleExpert: noteFinale,
      nombreCriteresEvalues: nombreCriteres,
      totalPoints: sommeNotes,
      noteMaxPossible: 20
    });
  };

  // Recalculer la note quand les scores changent
  useEffect(() => {
    if (etudiantData.idAffectationStage && Object.keys(scores).length > 0) {
      calculateScoreFromCurrent();
    }
  }, [scores, etudiantData.idAffectationStage]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Configuration des critères pour la grille expert
  const criteres = [
    {
      id: 'critere1',
      nom: 'Mettre en place une solution pour résoudre un problème complexe',
      descriptions: {
        A: 'La solution proposée permet de résoudre le problème dans tous ses aspects en tenant compte de sa complexité. L\'étudiant optimise ses choix et va au-delà de ce qu\'il est demandé de faire.',
        B: 'La solution proposée permet de résoudre les différents aspects du problème. L\'optimisation est faite.',
        C: 'La solution proposée permet de résoudre la plus grande partie du problème. Certains aspects ne sont pas traités avec la même pertinence.',
        D: 'La solution proposée permet de résoudre une partie du problème. L\'étudiant a négligé certains aspects importants'
      },
      maxPoints: 5,
      coefficient: 0.25,
      idGrille: 18
    },
    {
      id: 'critere2',
      nom: 'Combiner les compétences acquises dans la résolution des problèmes',
      descriptions: {
        A: 'Les compétences de l\'étudiant sont mises en pratique d\'une manière cohérente et rigoureuse. L\'étudiant fait preuve d\'un grand savoir-faire dans la résolution des problèmes. Il se documente et explore de nouvelles pistes pour approfondir ses compétences',
        B: 'Les compétences de l\'étudiant sont mises en pratique d\'une manière globalement cohérente. Le travail démontre une bonne maîtrise scientifique ou technique.',
        C: 'Les compétences de l\'étudiant sont mises en pratique, le résultat manque de cohérence. Le travail démontre une moyenne maîtrise scientifique ou technique.',
        D: 'L\'étudiant a du mal à combiner les différentes compétences acquises. Le travail ne démontre pas une maîtrise scientifique ou technique.'
      },
      maxPoints: 5,
      coefficient: 0.25,
      idGrille: 19
    },
    {
      id: 'critere3',
      nom: 'Appliquer les normes en vigueur ou exigences requises dans les solutions adoptées',
      descriptions: {
        A: 'Les solutions proposées répondent parfaitement aux normes en vigueur ou exigences requises dans le domaine du ou des projets étudiés. L\'étudiant se renseigne et fait preuve de rigueur dans l\'application de ces normes ou exigences.',
        B: 'Les solutions proposées répondent majoritairement aux normes ou exigences requises dans le domaine du ou des projets étudiés.',
        C: 'Les solutions proposées répondent partiellement aux normes en vigueur ou exigences requises dans le domaine du ou des projets étudiés.',
        D: 'Les solutions proposées ne prennent pas en compte les normes en vigueur ou exigences requises dans le domaine du ou des projets étudiés.'
      },
      maxPoints: 5,
      coefficient: 0.25,
      idGrille: 20
    },
    {
      id: 'critere4',
      nom: 'Adapter les choix aux contraintes rencontrées',
      descriptions: {
        A: 'L\'étudiant a anticipé, prévu et réagi aux éventuelles contraintes de son projet. Les choix sont parfaitement adaptés et permettent de gérer toutes les contraintes du projet.',
        B: 'L\'étudiant a réagi aux contraintes de son projet au fur et à mesure. Ses choix sont majoritairement adaptés aux contraintes de son projet.',
        C: 'L\'étudiant a réagi à certaines contraintes de son projet. Ses choix sont partiellement adaptés aux contraintes de son projet.',
        D: 'L\'étudiant a omis de prendre en considération une grande partie de contraintes rencontrées dans son projet'
      },
      maxPoints: 5,
      coefficient: 0.25,
      idGrille: 14
    }
  ];

  // Échelle de notes CORRIGÉE
  const notes = {
    A: 5,
    B: 4,
    C: 3,
    D: 1
  };

  const handleScoreChange = (critereId, note) => {
    if (!selectedEtudiant) return;
    
    const newScores = {
      ...scores,
      [critereId]: notes[note]
    };
    
    setScores(newScores);
  };

  const getNoteForScore = (score) => {
    return Object.entries(notes).find(([_, value]) => value === score)?.[0] || '';
  };

  const getScoreColor = (score) => {
    if (score >= 4) return 'success.main';
    if (score >= 2.5) return 'warning.main';
    return 'error.main';
  };

  // Calcul du total basé sur les scores actuels
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const scoreMaxPossible = criteres.length * 5;

  const handleSaveNotes = async () => {
    if (!selectedEtudiant) {
      showSnackbar('Veuillez sélectionner un étudiant', 'error');
      return;
    }

    if (!etudiantData.idAffectationStage) {
      showSnackbar('Cet étudiant n\'a pas d\'affectation de stage valide', 'error');
      return;
    }

    try {
      setSaving(true);

      // Calculer la note finale
      const notesValues = Object.values(scores);
      let noteFinale = 0;
      
      if (notesValues.length > 0) {
        const sommeNotes = notesValues.reduce((sum, score) => sum + score, 0);
        const noteMoyenne = sommeNotes / notesValues.length;
        noteFinale = noteMoyenne * 4; // Conversion vers 20 points
      }

      const notesToSave = [];

      // 1. Sauvegarder les notes individuelles des critères
      criteres.forEach(critere => {
        const noteValue = scores[critere.id];
        if (noteValue && noteValue > 0) {
          const dto = {
            idAffectationStage: etudiantData.idAffectationStage,
            idGrille: critere.idGrille,
            idEvaluateur: "P-03-06",
            note: parseFloat(noteValue),
            titreEvaluateur: "Expert",
            commentaire: `Évaluation expert - ${etudiantData.nom} - ${critere.nom}`,
            dateEvaluation: new Date().toISOString()
          };
          notesToSave.push(dto);
        }
      });

      // 2. Ajouter la note finale (utilisez un ID spécifique pour la note finale, par exemple 17)
      if (noteFinale > 0) {
        const noteFinaleDto = {
          idAffectationStage: etudiantData.idAffectationStage,
          idGrille: 17, // ID pour la note finale expert
          idEvaluateur: "P-03-06",
          note: parseFloat(noteFinale.toFixed(2)),
          titreEvaluateur: "Expert",
          commentaire: `Note finale expert - ${etudiantData.nom}`,
          dateEvaluation: new Date().toISOString()
        };
        notesToSave.push(noteFinaleDto);
      }

      if (notesToSave.length === 0) {
        showSnackbar('Aucune note à sauvegarder', 'warning');
        setSaveDialogOpen(false);
        return;
      }

      // Sauvegarder toutes les notes
      const saveResults = [];
      for (const noteData of notesToSave) {
        try {
          const response = await fetch('http://localhost:8096/api/notes-grille', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
          });

          if (response.ok) {
            saveResults.push({ success: true });
          } else {
            saveResults.push({ success: false });
          }
        } catch (error) {
          saveResults.push({ success: false });
        }
      }

      const successfulSaves = saveResults.filter(result => result.success);
      
      if (successfulSaves.length === notesToSave.length) {
        showSnackbar(`Évaluation expert sauvegardée avec succès! (${successfulSaves.length} notes incluant la note finale)`, 'success');
        setSaveDialogOpen(false);
        // Recalculer la note après sauvegarde
        await calculateExpertScore(etudiantData.idAffectationStage);
      } else {
        showSnackbar(`${successfulSaves.length} note(s) sauvegardée(s), ${notesToSave.length - successfulSaves.length} échec(s)`, 'warning');
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setScores({});
    setCalculatedScore(null);
  };

  const etudiantFields = [
    { label: "Nom de l'Étudiant", value: etudiantData.nom, key: 'nom' },
    { label: "Département", value: etudiantData.departement, key: 'departement' },
    { label: "Option", value: etudiantData.option, key: 'option' },
    { label: "Entreprise d'Accueil", value: etudiantData.entreprise, key: 'entreprise' },
    { label: "Nom du ou des Projets", value: etudiantData.projet, key: 'projet' }
  ];

  return (
    <Box sx={{ 
      backgroundColor: '#f8f9ff',
      minHeight: '100vh',
      py: 3,
      px: 2
    }}>
      <Paper 
        elevation={3} 
        sx={{ 
          maxWidth: 1200,
          margin: '0 auto',
          p: 4
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AssessmentIcon sx={{ fontSize: 40, color: 'rgb(102, 0, 0)', mb: 1 }} />
          <Typography variant="h4" component="h1" color="rgb(102, 0, 0)" gutterBottom>
            Grille expert
          </Typography>

          {/* 🆕 Indicateur de l'étudiant sélectionné automatiquement */}
          {selectedEtudiant && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(102, 0, 0, 0.05)', borderRadius: 2 }}>
              <Typography variant="body1" color="rgb(102, 0, 0)" fontWeight="bold">
                Étudiant sélectionné automatiquement depuis le workflow
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {etudiantData.nom} - {etudiantData.departement} {etudiantData.option}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Informations étudiant */}
        {selectedEtudiant ? (
          <>
            {/* Pop-up d'alerte si pas d'affectation */}
            {!etudiantData.idAffectationStage && openAlert && (
              <Dialog
                open={openAlert}
                onClose={handleCloseAlert}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle sx={{ bgcolor: 'rgb(102, 0, 0)', color: 'white', textAlign: 'center' }}>
                  <WarningIcon sx={{ mr: 1 }} />
                  Action Impossible
                </DialogTitle>
                <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="rgb(102, 0, 0)" gutterBottom>
                    Affectation Manquante
                  </Typography>
                  <Typography>
                    L'étudiant <strong>{etudiantData.nom}</strong> n'a pas d'affectation de stage.
                  </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button 
                    variant="contained" 
                    sx={{ backgroundColor: 'rgb(102, 0, 0)' }}
                    onClick={handleCloseAlert}
                  >
                    Compris
                  </Button>
                </DialogActions>
              </Dialog>
            )}

            <Grid container spacing={2} sx={{ maxWidth: 800, margin: '0 auto', mb: 4 }}>
              {etudiantFields.map((field) => (
                <Grid item xs={12} key={field.key}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: 200, color: '#000' }}>
                      {field.label} :
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#000', ml: 1 }}>
                      {field.value || 'Non renseigné'}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </Grid>
              ))}
            </Grid>

            {/* Criteria Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell width="25%" sx={{ fontWeight: 'bold', backgroundColor: 'grey.200' }}>
                      Critères
                    </TableCell>
                    <TableCell width="15%" sx={{ fontWeight: 'bold' }}>A (5 points)</TableCell>
                    <TableCell width="15%" sx={{ fontWeight: 'bold' }}>B (4 points)</TableCell>
                    <TableCell width="15%" sx={{ fontWeight: 'bold' }}>C (3 points)</TableCell>
                    <TableCell width="15%" sx={{ fontWeight: 'bold' }}>D (1 point)</TableCell>
                    <TableCell width="15%" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                      Note
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {criteres.map((critere) => (
                    <TableRow key={critere.id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>
                        {critere.nom}
                      </TableCell>
                      
                      {/* Notes A, B, C, D */}
                      {['A', 'B', 'C', 'D'].map((note) => (
                        <TableCell key={note}>
                          <Typography variant="body2" sx={{ mb: 1, minHeight: 100 }}>
                            {critere.descriptions[note]}
                          </Typography>
                          <Button
                            variant={getNoteForScore(scores[critere.id]) === note ? "contained" : "outlined"}
                            color={
                              note === 'A' ? "success" :
                              note === 'B' ? "info" :
                              note === 'C' ? "warning" : "error"
                            }
                            size="small"
                            onClick={() => handleScoreChange(critere.id, note)}
                            disabled={!selectedEtudiant || !etudiantData.idAffectationStage}
                            fullWidth
                          >
                            {note}
                          </Button>
                        </TableCell>
                      ))}
                      
                      {/* Note Display */}
                      <TableCell sx={{ textAlign: 'center' }}>
                        {scores[critere.id] > 0 && (
                          <Box>
                            <Typography 
                              variant="h6" 
                              color={getScoreColor(scores[critere.id])}
                              fontWeight="bold"
                            >
                              {getNoteForScore(scores[critere.id])}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ({scores[critere.id]} points)
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer avec calcul des notes */}
            <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="rgb(102, 0, 0)" gutterBottom>
                    Note totale: <strong>
                      {calculatedScore ? 
                        `${calculatedScore.noteFinaleExpert.toFixed(2)}/20` : 
                        `${totalScore}/${scoreMaxPossible}`
                      }
                    </strong>
                  </Typography>
                  
                  {calculatedScore && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Moyenne: {calculatedScore.noteMoyenneExpert?.toFixed(2)}/5 • 
                        Critères évalués: {calculatedScore.nombreCriteresEvalues}/4
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Date et Signature
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleReset}>
                      Réinitialiser
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => setSaveDialogOpen(true)}
                      disabled={!selectedEtudiant || saving || !etudiantData.idAffectationStage}
                      sx={{ backgroundColor: 'rgb(102, 0, 0)' }}
                    >
                      {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          /* Message si aucun étudiant sélectionné */
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AssessmentIcon sx={{ fontSize: 60, color: 'rgb(102, 0, 0)', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun étudiant sélectionné. Veuillez choisir un étudiant dans le workflow d'évaluation.
            </Typography>
          </Box>
        )}

        {/* Dialog de confirmation de sauvegarde */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            Confirmer la sauvegarde
          </DialogTitle>
          <DialogContent>
            <Typography>Êtes-vous sûr de vouloir sauvegarder cette évaluation expert pour {etudiantData.nom} ?</Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Note totale: <strong>
                  {calculatedScore ? 
                    `${calculatedScore.noteFinaleExpert.toFixed(2)}/20` : 
                    `${totalScore}/${scoreMaxPossible}`
                  }
                </strong>
              </Typography>
              {calculatedScore && (
                <Typography variant="body2" color="text.secondary">
                  Moyenne: {calculatedScore.noteMoyenneExpert?.toFixed(2)}/5
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSaveDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveNotes}
              variant="contained" 
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
              sx={{ backgroundColor: 'rgb(102, 0, 0)' }}
            >
              {saving ? 'Sauvegarde...' : 'Confirmer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar pour les notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
        >
          <Alert severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default GrilleExpert;