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
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  useTheme,
  useMediaQuery,
  Radio,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { 
  Save as SaveIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const GrilleEntreprise = ({ selectedEtudiant: propSelectedEtudiant, etudiantInfo: propEtudiantInfo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  
  const [etudiantInfo, setEtudiantInfo] = useState({
    nom: '',
    formation: '',
    organisme: '',
    encadrant: '',
    fonctionEncadrant: '',
    telephoneEncadrant: '',
    posteOccupe: '',
    dureeStage: '',
    idAffectationStage: null
  });
  
  const [pointsForts, setPointsForts] = useState('');
  const [pointsAmeliorer, setPointsAmeliorer] = useState('');
  const [evaluationDiscutee, setEvaluationDiscutee] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [openAlert, setOpenAlert] = useState(true);

  const backgroundColor = 'rgba(25, 118, 210, 0.05)';

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  // Utiliser les props pour charger les données étudiant
  useEffect(() => {
    const fetchEtudiantData = async () => {
      if (!propSelectedEtudiant) {
        resetEtudiantInfo();
        return;
      }

      try {
        setLoading(true);
        
        // Si les infos étudiant sont déjà fournies via les props, les utiliser
        if (propEtudiantInfo) {
          console.log('Utilisation des infos étudiant depuis les props:', propEtudiantInfo);
          
          const newEtudiantInfo = {
            nom: `${propEtudiantInfo.prenom || ''} ${propEtudiantInfo.nom || ''}`.trim(),
            formation: propEtudiantInfo.formation || 'Informatique',
            organisme: propEtudiantInfo.entreprise || 'Entreprise non spécifiée',
            encadrant: propEtudiantInfo.encadrant || '',
            fonctionEncadrant: propEtudiantInfo.fonctionEncadrant || '',
            telephoneEncadrant: propEtudiantInfo.telephoneEncadrant || '',
            posteOccupe: propEtudiantInfo.poste || 'Stagiaire',
            dureeStage: propEtudiantInfo.dureeStage || '6 mois',
            idAffectationStage: propEtudiantInfo.affectation?.id || propEtudiantInfo.idAffectationStage || null
          };

          setEtudiantInfo(newEtudiantInfo);
          
          // Charger les notes existantes seulement si on a une affectation
          if (newEtudiantInfo.idAffectationStage) {
            await fetchExistingNotes(newEtudiantInfo.idAffectationStage);
          } else {
            setNotes({});
          }
        } else {
          // Fallback: Récupérer les détails de l'étudiant via API
          const etudiantResponse = await fetch(`http://localhost:8021/api/etudiants/${propSelectedEtudiant}`);
          if (!etudiantResponse.ok) {
            throw new Error('Étudiant non trouvé');
          }
          const etudiantDetail = await etudiantResponse.json();

          // Récupérer l'affectation de stage
          const affectationResponse = await fetch(`http://localhost:8021/api/affectation-stage/${propSelectedEtudiant}`);
          let idAffectationStage = null;
          
          if (affectationResponse.ok) {
            const affectationData = await affectationResponse.json();
            idAffectationStage = affectationData.id;
          } else {
            console.warn('Aucune affectation de stage trouvée pour cet étudiant');
          }

          const newEtudiantInfo = {
            nom: `${etudiantDetail.prenom || ''} ${etudiantDetail.nom || ''}`.trim(),
            formation: etudiantDetail.formation || 'Informatique',
            organisme: etudiantDetail.entreprise || 'Entreprise non spécifiée',
            encadrant: etudiantDetail.encadrant || '',
            fonctionEncadrant: etudiantDetail.fonctionEncadrant || '',
            telephoneEncadrant: etudiantDetail.telephoneEncadrant || '',
            posteOccupe: etudiantDetail.poste || 'Stagiaire',
            dureeStage: etudiantDetail.dureeStage || '6 mois',
            idAffectationStage: idAffectationStage
          };

          setEtudiantInfo(newEtudiantInfo);
          
          // Charger les notes existantes seulement si on a une affectation
          if (idAffectationStage) {
            await fetchExistingNotes(idAffectationStage);
          } else {
            setNotes({});
          }
        }

      } catch (err) {
        console.error('Erreur fetch données étudiant:', err);
        showSnackbar('Erreur lors du chargement des données étudiant', 'error');
        resetEtudiantInfo();
      } finally {
        setLoading(false);
      }
    };

    fetchEtudiantData();
  }, [propSelectedEtudiant, propEtudiantInfo]);

  const resetEtudiantInfo = () => {
    setEtudiantInfo({
      nom: '',
      formation: '',
      organisme: '',
      encadrant: '',
      fonctionEncadrant: '',
      telephoneEncadrant: '',
      posteOccupe: '',
      dureeStage: '',
      idAffectationStage: null
    });
    setNotes({});
    setPointsForts('');
    setPointsAmeliorer('');
    setEvaluationDiscutee(false);
  };

  const fetchExistingNotes = async (affectationId) => {
    try {
      const response = await fetch(`http://localhost:8096/api/notes-grille/affectation/${affectationId}`);
      if (response.ok) {
        const notesData = await response.json();
        
        const nouvellesNotes = {};
        notesData.forEach(note => {
          const grilleId = note.idGrille.id || note.idGrille;
          // Ne prendre que les notes de la grille entreprise (IDs 31-42)
          if (grilleId >= 31 && grilleId <= 42) {
            nouvellesNotes[grilleId] = {
              points: note.note,
              maxPoints: 5,
              typeGrille: 'ENTREPRISE'
            };
          }
        });
        setNotes(nouvellesNotes);
        
        // Récupérer les commentaires existants
        try {
          const commentairesResponse = await fetch(`http://localhost:8096/api/commentaires-evaluation/affectation/${affectationId}`);
          if (commentairesResponse.ok) {
            const commentaires = await commentairesResponse.json();
            const commentaireEntreprise = commentaires.find(c => c.typeEvaluateur === 'ENTREPRISE');
            if (commentaireEntreprise) {
              setPointsForts(commentaireEntreprise.pointsForts || '');
              setPointsAmeliorer(commentaireEntreprise.pointsAmeliorer || '');
              setEvaluationDiscutee(commentaireEntreprise.evaluationDiscutee || false);
            }
          }
        } catch (error) {
          console.warn('Impossible de charger les commentaires:', error);
        }
      }
    } catch (error) {
      console.warn('Impossible de charger les notes existantes:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Gestion des changements de notes
  const handleNoteChange = (competenceId, note) => {
    setNotes(prev => ({
      ...prev,
      [competenceId]: { 
        points: parseInt(note),
        maxPoints: 5,
        typeGrille: 'ENTREPRISE'
      }
    }));
  };

  const handleStagiaireChange = (field, value) => {
    setEtudiantInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calcul du total des points
  const calculateTotal = () => {
    return Object.values(notes).reduce((total, note) => {
      return total + (note.points || 0);
    }, 0);
  };

  const calculateTotalSur20 = () => {
    const total = calculateTotal();
    return ((total / 60) * 20).toFixed(2);
  };

  // Données des compétences exactes selon le PDF et la base de données
  const competencesList = [
    { id: 31, libelle: "Intérêt pour le travail", maxNote: 5 },
    { id: 32, libelle: "Initiative", maxNote: 5 },
    { id: 33, libelle: "Créativité", maxNote: 5 },
    { id: 34, libelle: "Connaissances techniques nécessaires pour effectuer son travail", maxNote: 5 },
    { id: 35, libelle: "Jugement", maxNote: 5 },
    { id: 36, libelle: "Qualité de travail", maxNote: 5 },
    { id: 37, libelle: "Quantité de travail", maxNote: 5 },
    { id: 38, libelle: "Communications écrites", maxNote: 5 },
    { id: 39, libelle: "Communications orales", maxNote: 5 },
    { id: 40, libelle: "Aptitudes pour la gestion du travail", maxNote: 5 },
    { id: 41, libelle: "Aptitudes liées au travail d'équipe", maxNote: 5 },
    { id: 42, libelle: "Qualités relationnelles", maxNote: 5 }
  ];

  // Descriptions exactes selon le PDF
  const descriptionsCompetences = {
    31: {
      5: "Très intéressé et enthousiaste au travail",
      4: "Intérêt au travail supérieur à la moyenne",
      3: "Intérêt et motivation pour le travail satisfaisant",
      2: "Intérêt et motivation peu soutenus",
      1: "A peu d'intérêt pour le travail"
    },
    32: {
      5: "Autonome. Demande de nouvelles tâches. Cherche du travail à faire",
      4: "Agit avec une certaine autonomie dans la plupart des travaux",
      3: "Agit avec une certaine autonomie dans les travaux",
      2: "Compte sur les autres. Attend souvent qu'on lui dise quoi faire",
      1: "Attend toujours qu'on lui dise quoi faire"
    },
    33: {
      5: "Cherche continuellement des nouveaux moyens d'effectuer ses tâches ; esprit d'innovation",
      4: "Suggère souvent de nouveaux moyens d'effectuer ses tâches ; est très imaginatif",
      3: "A une imagination dans la moyenne ; a de temps en temps de nouvelles idées",
      2: "A rarement de nouvelles idées",
      1: "N'a jamais proposé de nouvelles idées et démontre peu de créativité"
    },
    34: {
      5: "Exceptionnelles",
      4: "Très bonnes",
      3: "Moyennes",
      2: "Faibles",
      1: "Insatisfaisantes"
    },
    35: {
      5: "Exceptionnellement bon. Décisions basées sur une compréhension parfaite des problèmes",
      4: "Fait appel au bon sens. Prend habituellement de bonnes décisions",
      3: "Jugement habituellement bon dans les situations courantes",
      2: "Jugement souvent peu fiable",
      1: "Piètre jugement. Fait des conclusions sans connaissances suffisantes"
    },
    36: {
      5: "Très consciencieux dans l'exécution des tâches et, le cas échéant, fait très peu d'erreurs",
      4: "Habituellement consciencieux. Bon travail, peu d'erreurs",
      3: "Son travail suscite habituellement de bonnes critiques et comporte un nombre normal d'erreurs",
      2: "Nombre d'erreurs supérieur à la moyenne pour un stagiaire",
      1: "Travail fait d'une façon négligée et comportant souvent des erreurs"
    },
    37: {
      5: "Personne très productive",
      4: "Productivité supérieure aux attentes",
      3: "Productivité correspondante aux attentes",
      2: "Productivité inférieure aux attentes",
      1: "Insatisfaisante"
    },
    38: {
      5: "Toujours claires, bien organisées et facilement compréhensibles",
      4: "Normalement très claires, bien organisées et facilement compréhensibles",
      3: "Habituellement claires et concises",
      2: "Occasionnellement, il rencontre des difficultés à rédiger clairement et de façon concise",
      1: "Manque de clarté"
    },
    39: {
      5: "Toujours claires, bien organisées et facilement compréhensibles",
      4: "Normalement très claires et compréhensibles",
      3: "Habituellement claires et concises",
      2: "A parfois de la difficulté à s'exprimer clairement et de façon concise",
      1: "Manque de clarté"
    },
    40: {
      5: "Exceptionnelles",
      4: "Très bonnes",
      3: "Acceptables",
      2: "Faibles",
      1: "Insatisfaisantes"
    },
    41: {
      5: "Exceptionnelles",
      4: "Très bonnes",
      3: "Acceptables",
      2: "Faibles",
      1: "Insatisfaisantes"
    },
    42: {
      5: "Excellent stagiaire. Contribue aux bonnes relations et à l'efficacité au sein du groupe",
      4: "Agréable et serviable. Fait bonne équipe avec ses collègues",
      3: "Entretient de bonnes relations avec les autres",
      2: "A parfois des difficultés relationnelles ou s'enferme dans le silence",
      1: "Est fréquemment en désaccord avec les autres ou renfermé. Nuit au groupe"
    }
  };

  // Fonction pour supprimer l'ancienne note finale entreprise
  const deleteExistingNoteFinale = async () => {
    try {
      const response = await fetch(`http://localhost:8096/api/notes-grille/affectation/${etudiantInfo.idAffectationStage}`);
      if (response.ok) {
        const notesExistantes = await response.json();
        const noteFinaleExistante = notesExistantes.find(note => 
          note.idGrille.id === 30 || note.idGrille === 30
        );
        
        if (noteFinaleExistante) {
          await fetch(`http://localhost:8096/api/notes-grille/${noteFinaleExistante.id}`, {
            method: 'DELETE'
          });
        }
      }
    } catch (error) {
      console.warn('Impossible de supprimer l\'ancienne note finale:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!propSelectedEtudiant) {
      showSnackbar('Aucun étudiant sélectionné', 'error');
      return;
    }

    if (!etudiantInfo.idAffectationStage) {
      showSnackbar('Cet étudiant n\'a pas d\'affectation de stage valide', 'error');
      return;
    }

    try {
      setSaving(true);
      let hasErrors = false;
      let savedCount = 0;

      // D'abord, supprimer l'ancienne note finale si elle existe
      await deleteExistingNoteFinale();

      // Sauvegarder les notes individuelles des compétences
      for (const grilleId of Object.keys(notes)) {
        const noteData = notes[grilleId];
        if (noteData.points > 0) {
          const dto = {
            idAffectationStage: etudiantInfo.idAffectationStage,
            idGrille: parseInt(grilleId),
            idEvaluateur: "P-03-06",
            note: noteData.points,
            titreEvaluateur: "Encadrant Entreprise",
            commentaire: `Évaluation entreprise - ${etudiantInfo.nom} - ${competencesList.find(c => c.id === parseInt(grilleId))?.libelle}`,
            dateEvaluation: new Date().toISOString()
          };
          
          try {
            const response = await fetch('http://localhost:8096/api/notes-grille', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dto)
            });
            
            if (response.ok) {
              savedCount++;
            } else {
              console.error(`Erreur sauvegarde note ${grilleId}:`, response.status);
              hasErrors = true;
            }
          } catch (error) {
            console.error(`Erreur sauvegarde note ${grilleId}:`, error);
            hasErrors = true;
          }
        }
      }

      // SAUVEGARDER LA NOTE FINALE ENTREPRISE (ID 30)
      const noteFinaleDTO = {
        idAffectationStage: etudiantInfo.idAffectationStage,
        idGrille: 30, // ID de la grille entreprise pour la note finale
        idEvaluateur: "P-03-06",
        note: parseFloat(calculateTotalSur20()),
        titreEvaluateur: "Note Finale Entreprise",
        commentaire: `Note finale entreprise calculée: ${calculateTotal()}/60 = ${calculateTotalSur20()}/20 - ${etudiantInfo.nom}`,
        dateEvaluation: new Date().toISOString()
      };

      try {
        const noteFinaleResponse = await fetch('http://localhost:8096/api/notes-grille', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteFinaleDTO)
        });

        if (noteFinaleResponse.ok) {
          savedCount++;
        } else {
          console.error('Erreur sauvegarde note finale:', noteFinaleResponse.status);
          hasErrors = true;
        }
      } catch (error) {
        console.error('Erreur sauvegarde note finale:', error);
        hasErrors = true;
      }

      // Sauvegarder les commentaires
      const commentaireDTO = {
        idAffectationStage: etudiantInfo.idAffectationStage,
        pointsForts: pointsForts,
        pointsAmeliorer: pointsAmeliorer,
        evaluationDiscutee: evaluationDiscutee,
        typeEvaluateur: 'ENTREPRISE'
      };

      try {
        const commentaireResponse = await fetch('http://localhost:8096/api/commentaires-evaluation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentaireDTO)
        });

        if (commentaireResponse.ok) {
          savedCount++;
        } else {
          console.error('Erreur sauvegarde commentaires:', commentaireResponse.status);
          hasErrors = true;
        }
      } catch (error) {
        console.error('Erreur sauvegarde commentaires:', error);
        hasErrors = true;
      }

      if (hasErrors) {
        showSnackbar('Certains éléments n\'ont pas pu être sauvegardés', 'warning');
      } else {
        showSnackbar(`Évaluation entreprise sauvegardée avec succès! (${savedCount} éléments)`);
        setSaveDialogOpen(false);
      }
      
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setNotes({});
    setPointsForts('');
    setPointsAmeliorer('');
    setEvaluationDiscutee(false);
  };

  // Rendu conditionnel
  if (loading && !propSelectedEtudiant) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" sx={{ backgroundColor }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement de la grille entreprise...</Typography>
      </Box>
    );
  }

  const etudiantFields = [
    { label: "Nom et prénom du stagiaire", value: etudiantInfo.nom, key: 'nom', field: 'nom' },
    { label: "Formation", value: etudiantInfo.formation, key: 'formation', field: 'formation' },
    { label: "Nom de l'organisme d'accueil", value: etudiantInfo.organisme, key: 'organisme', field: 'organisme' },
    { label: "Nom de l'encadrant entreprise", value: etudiantInfo.encadrant, key: 'encadrant', field: 'encadrant' },
    { label: "Fonction de l'encadrant entreprise", value: etudiantInfo.fonctionEncadrant, key: 'fonctionEncadrant', field: 'fonctionEncadrant' },
    { label: "Numéro de l'encadrant entreprise", value: etudiantInfo.telephoneEncadrant, key: 'telephoneEncadrant', field: 'telephoneEncadrant' },
    { label: "Poste occupé durant le stage", value: etudiantInfo.posteOccupe, key: 'posteOccupe', field: 'posteOccupe' },
    { label: "Durée du stage", value: etudiantInfo.dureeStage, key: 'dureeStage', field: 'dureeStage' }
  ];

  return (
    <Box sx={{ backgroundColor, minHeight: '100vh', py: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ maxWidth: 1400, margin: '0 auto', p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        
        {/* En-tête principal */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
            Fiche d'évaluation du stagiaire
          </Typography>
          <Typography variant="subtitle1" gutterBottom sx={{ color: '#1976d2', mb: 3 }}>
            (Par l'encadrant entreprise)
          </Typography>

          {/* Informations étudiant */}
          {propSelectedEtudiant && (
            <>
              {/* Pop-up d'alerte si pas d'affectation */}
              {!etudiantInfo.idAffectationStage && openAlert && (
                <Dialog
                  open={openAlert}
                  onClose={handleCloseAlert}
                  maxWidth="sm"
                  fullWidth
                  BackdropProps={{
                    sx: {
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      backdropFilter: 'blur(2px)'
                    }
                  }}
                  PaperProps={{
                    sx: {
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
                      border: '1px solid',
                      borderColor: 'primary.light'
                    }
                  }}
                >
                  <DialogTitle 
                    sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white',
                      textAlign: 'center',
                      py: 2
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                      <WarningIcon />
                      <Typography variant="h6" fontWeight="bold">
                        Action Impossible
                      </Typography>
                    </Box>
                  </DialogTitle>
                  
                  <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    
                    <Typography variant="h5" color="primary.main" gutterBottom fontWeight="bold">
                      Affectation Manquante
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" paragraph>
                      Le stagiaire <strong>{etudiantInfo.nom}</strong> n'a pas d'affectation de stage.
                    </Typography>
                    
                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                      L'évaluation ne pourra pas être sauvegardée sans affectation.
                    </Typography>
                  </DialogContent>
                  
                  <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      size="large"
                      startIcon={<CheckIcon />}
                      onClick={handleCloseAlert}
                      sx={{
                        minWidth: 120,
                        borderRadius: 2,
                        px: 3
                      }}
                    >
                      Compris
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

              {/* Informations détaillées du stagiaire */}
              <Box
                sx={{
                  backgroundColor: 'background.paper',
                  borderRadius: 3,
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.15)',
                  p: { xs: 2, sm: 3, md: 4 },
                  mb: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 10px 30px rgba(25, 118, 210, 0.25)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  sx={{
                    fontWeight: 'bold',
                    color: 'primary.main',
                    mb: 3,
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    pl: 1.5,
                  }}
                >
                  Informations du stagiaire
                </Typography>

                <Grid
                  container
                  spacing={{ xs: 2, sm: 3 }}
                  columns={{ xs: 12, sm: 12, md: 12 }}
                >
                  {etudiantFields.map((field, index) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={6}
                      key={field.key}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <TextField
                        fullWidth
                        variant="outlined"
                        label={field.label}
                        value={field.value}
                        onChange={(e) => handleStagiaireChange(field.field, e.target.value)}
                        margin="dense"
                        size={isSmallScreen ? "small" : "medium"}
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            backgroundColor: '#f9fafc',
                            '&:hover': {
                              backgroundColor: '#f1f5ff',
                            },
                          },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Titre évaluation */}
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                sx={{
                  fontWeight: 'bold',
                  color: '#1976d2',
                  textAlign: 'left',
                  mt: 3,
                  mb: 3,
                  borderBottom: '2px solid',
                  borderColor: 'primary.light',
                  display: 'inline-block',
                  pb: 0.5,
                }}
              >
                Évaluation globale du stagiaire
              </Typography>
            </>
          )}
        </Box>

        {/* Affichage de la grille seulement si un étudiant est sélectionné */}
        {propSelectedEtudiant ? (
          <>
     {/* Grille d'évaluation */}
<TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, mb: 4 }}>
  <Table stickyHeader size={isSmallScreen ? "small" : "medium"}>
    <TableHead>
      <TableRow>
        <TableCell sx={{ 
          minWidth: isSmallScreen ? 200 : 250, 
          backgroundColor: '#d32f2f', // CHANGÉ EN ROUGE
          fontWeight: 'bold',
          color: 'white',
          border: '2px solid #b71c1c' // BORDURE ROUGE FONCÉ
        }}>
          Compétences
        </TableCell>
        <TableCell align="center" sx={{ 
          minWidth: isSmallScreen ? 120 : 150, 
          backgroundColor: '#d32f2f', // CHANGÉ EN ROUGE
          fontWeight: 'bold',
          color: 'white',
          border: '2px solid #b71c1c' // BORDURE ROUGE FONCÉ
        }}>
          A (5pts)
        </TableCell>
        <TableCell align="center" sx={{ 
          minWidth: isSmallScreen ? 120 : 150, 
          backgroundColor: '#d32f2f', // CHANGÉ EN ROUGE
          fontWeight: 'bold',
          color: 'white',
          border: '2px solid #b71c1c' // BORDURE ROUGE FONCÉ
        }}>
          B (4pts)
        </TableCell>
        <TableCell align="center" sx={{ 
          minWidth: isSmallScreen ? 120 : 150, 
          backgroundColor: '#d32f2f', // CHANGÉ EN ROUGE
          fontWeight: 'bold',
          color: 'white',
          border: '2px solid #b71c1c' // BORDURE ROUGE FONCÉ
        }}>
          C (3pts)
        </TableCell>
        <TableCell align="center" sx={{ 
          minWidth: isSmallScreen ? 120 : 150, 
          backgroundColor: '#d32f2f', // CHANGÉ EN ROUGE
          fontWeight: 'bold',
          color: 'white',
          border: '2px solid #b71c1c' // BORDURE ROUGE FONCÉ
        }}>
          D (2pts)
        </TableCell>
        <TableCell align="center" sx={{ 
          minWidth: isSmallScreen ? 120 : 150, 
          backgroundColor: '#d32f2f', // CHANGÉ EN ROUGE
          fontWeight: 'bold',
          color: 'white',
          border: '2px solid #b71c1c' // BORDURE ROUGE FONCÉ
        }}>
          E (1pt)
        </TableCell>
        <TableCell align="center" sx={{ 
          minWidth: 80, 
          backgroundColor: '#d32f2f', // CHANGÉ EN ROUGE
          fontWeight: 'bold',
          color: 'white',
          border: '2px solid #b71c1c' // BORDURE ROUGE FONCÉ
        }}>
          Résultat
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {competencesList.map((competence) => (
        <TableRow key={competence.id} sx={{ '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}>
          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', verticalAlign: 'top' }}>
            {competence.libelle}
          </TableCell>
          
          {/* Colonnes A à E avec descriptions exactes du PDF */}
          {[5, 4, 3, 2, 1].map((note) => (
            <TableCell key={note} align="center" sx={{ verticalAlign: 'top' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 120 }}>
                <Radio
                  checked={notes[competence.id]?.points === note}
                  onChange={() => handleNoteChange(competence.id, note)}
                  value={note}
                  name={`competence-${competence.id}`}
                  size="small"
                  color="primary"
                />
                <Typography variant="caption" sx={{ 
                  fontSize: '0.65rem', 
                  textAlign: 'center',
                  color: 'text.secondary',
                  lineHeight: 1.2,
                  mt: 0.5
                }}>
                  {descriptionsCompetences[competence.id]?.[note]}
                </Typography>
              </Box>
            </TableCell>
          ))}
          
          <TableCell align="center" sx={{ verticalAlign: 'top' }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {notes[competence.id]?.points || 0}
            </Typography>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

            {/* Total des points */}
            <Box sx={{ 
              mt: 2, 
              p: 3, 
              backgroundColor: 'primary.light', 
              borderRadius: 2, 
              mb: 4,
              color: 'white'
            }}>
              <Typography variant="h6" align="right" fontWeight="bold">
                Note finale: {calculateTotal()}/60 - {calculateTotalSur20()}/20
              </Typography>
              <Typography variant="body2" align="right" sx={{ mt: 1, opacity: 0.9 }}>
                Cette note sera sauvegardée et pourra être utilisée dans la grille d'encadrement
              </Typography>
            </Box>

            {/* Points forts et à améliorer */}
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Points forts : Dans quelle(s) activité(s) le stagiaire a-t-il été le plus à l'aise ?"
                value={pointsForts}
                onChange={(e) => setPointsForts(e.target.value)}
                margin="normal"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Points à améliorer : Dans quelle(s) activité(s) le stagiaire doit-il s'améliorer ?"
                value={pointsAmeliorer}
                onChange={(e) => setPointsAmeliorer(e.target.value)}
                margin="normal"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>

            {/* Checkbox et boutons d'action */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4, 
              flexDirection: isSmallScreen ? 'column' : 'row', 
              gap: 2 
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={evaluationDiscutee}
                    onChange={(e) => setEvaluationDiscutee(e.target.checked)}
                    color="primary"
                  />
                }
                label="Cette évaluation a été discutée avec le stagiaire"
              />

              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexDirection: isSmallScreen ? 'column' : 'row', 
                width: isSmallScreen ? '100%' : 'auto' 
              }}>
                <Button 
                  variant="outlined" 
                  onClick={handleReset} 
                  fullWidth={isSmallScreen}
                  size={isSmallScreen ? "small" : "medium"}
                >
                  Réinitialiser les notes
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={!propSelectedEtudiant || saving || !etudiantInfo.idAffectationStage}
                  fullWidth={isSmallScreen}
                  size={isSmallScreen ? "small" : "medium"}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder l\'évaluation'}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AssessmentIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary">
              Aucun étudiant sélectionné
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Veuillez sélectionner un étudiant dans le workflow principal
            </Typography>
          </Box>
        )}

        {/* Dialog de confirmation de sauvegarde */}
        <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Confirmer la sauvegarde
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography>
              Êtes-vous sûr de vouloir sauvegarder cette évaluation pour <strong>{etudiantInfo.nom}</strong> ?
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Note finale calculée: <strong>{calculateTotalSur20()}/20</strong> ({calculateTotal()}/60 points)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Compétences évaluées: <strong>{Object.keys(notes).filter(id => notes[id].points > 0).length}</strong> sur {competencesList.length}
              </Typography>
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
            >
              {saving ? 'Sauvegarde...' : 'Confirmer la sauvegarde'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar pour les notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default GrilleEntreprise;