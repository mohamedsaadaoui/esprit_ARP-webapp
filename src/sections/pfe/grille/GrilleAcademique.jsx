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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import PermissionBasedGuard from 'src/auth/guard/permession-based-guard';
import { useAuthContext } from 'src/auth/hooks';
import { 
  Save as SaveIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Check as CheckIcon,
  School as SchoolIcon,
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon
} from '@mui/icons-material';

const GrilleAcademique = ({ selectedEtudiant: propSelectedEtudiant, etudiantInfo: propEtudiantInfo }) => {
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { userPermissions } = useAuthContext();
  const { user } = useAuthContext();
  const [grilleData, setGrilleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState({});
  const [noteAppreciation, setNoteAppreciation] = useState(0);
  
  const [etudiantInfo, setEtudiantInfo] = useState({
    nom: '',
    departement: '',
    option: '',
    entreprise: '',
    projet: '',
    idAffectationStage: null
  });
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);

  // NOUVEAUX ÉTATS POUR LES NOTES DES AUTRES ÉVALUATEURS
  const [noteExpert, setNoteExpert] = useState(0);
  const [noteEncadrantEntreprise, setNoteEncadrantEntreprise] = useState(0);
  const [noteFinaleEncadrement, setNoteFinaleEncadrement] = useState(0);

  // AJOUT: États pour les notes calculées
  const [noteRDV, setNoteRDV] = useState(0);
  const [noteFinale, setNoteFinale] = useState(0);

  const backgroundColor = 'rgba(217, 5, 5, 0.05)';
  const [openAlert, setOpenAlert] = useState(true);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  // Récupération de la grille académique
  useEffect(() => {
    const fetchGrilleData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8096/api/grilles/academique');
        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setGrilleData(data);
      } catch (err) {
        setError(err.message);
        console.error('Erreur fetch grille:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrilleData();
  }, []);

  // NOUVELLE FONCTION : Calcul hiérarchique amélioré
  const calculerNotesAvecHierarchie = () => {
    if (!grilleData?.length || !propSelectedEtudiant) {
      return { noteRDV: 0, noteFinale: 0 };
    }

    const grillePrincipale = grilleData[0];
    let noteRDVTotal = 0;

    // 1. Calculer Note RDV pédagogiques (niveau 1 - id_grille: 2)
    const noteRDVSection = grillePrincipale?.sousCriteres?.find(item => 
      item.idGrille === 2
    );
    
    if (noteRDVSection) {
      const sousSections = noteRDVSection.sousCriteres || [];
      
      sousSections.forEach(section => {
        let totalSection = 0;
        const elements = section.sousCriteres || [];
        
        elements.forEach(element => {
          const noteElement = notes[element.idGrille]?.points || 0;
          totalSection += noteElement;
        });
        
        // Limiter le total au coefficient maximum de la section
        const coefficientSection = section.coefficient || 0;
        totalSection = Math.min(totalSection, coefficientSection);
        
        noteRDVTotal += totalSection;
      });
    }

    // 2. Note d'appréciation globale (id_grille: 3)
    const noteAppreciationValide = Math.min(Math.max(parseFloat(noteAppreciation) || 0, 0), 20);
    
    // 3. Calcul note finale
    const noteFinaleCalc = (noteRDVTotal * 0.8) + (noteAppreciationValide * 0.2);
    
    return {
      noteRDV: parseFloat(noteRDVTotal.toFixed(2)),
      noteFinale: parseFloat(noteFinaleCalc.toFixed(2))
    };
  };

  // USEEFFECT POUR RECALCULER LES NOTES QUAND LES DONNÉES CHANGENT
  useEffect(() => {
    const { noteRDV: newNoteRDV, noteFinale: newNoteFinale } = calculerNotesAvecHierarchie();
    setNoteRDV(newNoteRDV);
    setNoteFinale(newNoteFinale);
  }, [notes, noteAppreciation, grilleData, propSelectedEtudiant]);

  // Récupération des données étudiant et notes existantes
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
            departement: propEtudiantInfo.departement || 'Informatique',
            option: propEtudiantInfo.option || 'DS',
            entreprise: propEtudiantInfo.entreprise || 'ESPRIT - TECH',
            projet: propEtudiantInfo.projet || 'Modèle IA pour la prévision de production électrique PV basée sur la météo',
            idAffectationStage: propEtudiantInfo.affectation?.id || null
          };

          setEtudiantInfo(newEtudiantInfo);
          
          // Charger les notes existantes seulement si on a une affectation
          if (propEtudiantInfo.affectation?.id) {
            await fetchExistingNotes(propEtudiantInfo.affectation.id);
            await fetchNotesCalculees(propEtudiantInfo.affectation.id);
            await fetchNotesAutresEvaluateurs(propEtudiantInfo.affectation.id);
          } else {
            setNotes({});
            setNoteAppreciation(0);
            setNoteExpert(0);
            setNoteEncadrantEntreprise(0);
            setNoteFinaleEncadrement(0);
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
            departement: etudiantDetail.departement || 'Informatique',
            option: etudiantDetail.option || 'DS',
            entreprise: etudiantDetail.entreprise || 'ESPRIT - TECH',
            projet: etudiantDetail.projet || 'Modèle IA pour la prévision de production électrique PV basée sur la météo',
            idAffectationStage: idAffectationStage
          };

          setEtudiantInfo(newEtudiantInfo);
          
          // Charger les notes existantes seulement si on a une affectation
          if (idAffectationStage) {
            await fetchExistingNotes(idAffectationStage);
            await fetchNotesCalculees(idAffectationStage);
            await fetchNotesAutresEvaluateurs(idAffectationStage);
          } else {
            setNotes({});
            setNoteAppreciation(0);
            setNoteExpert(0);
            setNoteEncadrantEntreprise(0);
            setNoteFinaleEncadrement(0);
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
      departement: '',
      option: '',
      entreprise: '',
      projet: '',
      idAffectationStage: null
    });
    setNotes({});
    setNoteAppreciation(0);
    setNoteExpert(0);
    setNoteEncadrantEntreprise(0);
    setNoteFinaleEncadrement(0);
    setNoteRDV(0);
    setNoteFinale(0);
  };

  const fetchExistingNotes = async (affectationId) => {
    try {
      const response = await fetch(`http://localhost:8096/api/notes-grille/affectation/${affectationId}`);
      if (response.ok) {
        const notesData = await response.json();
        
        const nouvellesNotes = {};
        notesData.forEach(note => {
          const grilleId = note.idGrille.id || note.idGrille;
          nouvellesNotes[grilleId] = {
            points: note.note,
            maxPoints: 5,
            typeGrille: 'ACADEMIQUE'
          };
        });
        setNotes(nouvellesNotes);
        
        const appreciationNote = notesData.find(n => n.idGrille === 3 || (n.idGrille && n.idGrille.id === 3));
        if (appreciationNote) {
          setNoteAppreciation(appreciationNote.note);
        }
      }
    } catch (error) {
      console.warn('Impossible de charger les notes existantes:', error);
    }
  };

  // FONCTION POUR RÉCUPÉRER LES NOTES DES AUTRES ÉVALUATEURS
  const fetchNotesAutresEvaluateurs = async (affectationId) => {
    try {
      const response = await fetch(`http://localhost:8096/api/notes-grille/affectation/${affectationId}`);
      if (response.ok) {
        const notesData = await response.json();
        
        // Récupérer la note expert (grille expert - IDs 18, 19, 20, 14)
        const notesExpert = notesData.filter(note => {
          const grilleId = note.idGrille.id || note.idGrille;
          return [18, 19, 20, 14].includes(grilleId);
        });
        
        if (notesExpert.length > 0) {
          // Calculer la moyenne des notes expert
          const totalExpert = notesExpert.reduce((sum, note) => sum + note.note, 0);
          const moyenneExpert = totalExpert / notesExpert.length;
          // Convertir en note sur 20 (5 points × 4 critères = 20 points)
          const noteExpertSur20 = moyenneExpert * 4;
          setNoteExpert(parseFloat(noteExpertSur20.toFixed(2)));
        } else {
          setNoteExpert(0);
        }
        
        // Récupérer la note encadrant entreprise (grille entreprise - ID 30)
        const noteEntreprise = notesData.find(note => {
          const grilleId = note.idGrille.id || note.idGrille;
          return grilleId === 30; // ID de la grille entreprise
        });
        
        if (noteEntreprise) {
          setNoteEncadrantEntreprise(parseFloat(noteEntreprise.note.toFixed(2)));
        } else {
          setNoteEncadrantEntreprise(0);
        }
        
        console.log('Notes autres évaluateurs:', {
          expert: noteExpert,
          entreprise: noteEncadrantEntreprise,
          notesExpertTrouvees: notesExpert.length
        });
      }
    } catch (error) {
      console.warn('Erreur récupération notes autres évaluateurs:', error);
      setNoteExpert(0);
      setNoteEncadrantEntreprise(0);
    }
  };

  // FONCTION POUR CALCULER LA NOTE FINALE D'ENCADREMENT
  const calculerNoteFinaleEncadrement = (noteAcademique, noteExp, noteEntreprise) => {
    const nfe = (noteAcademique * 0.4) + (noteExp * 0.4) + (noteEntreprise * 0.2);
    const nfeArrondie = parseFloat(nfe.toFixed(2));
    setNoteFinaleEncadrement(nfeArrondie);
    return nfeArrondie;
  };

  // NOUVEAU USEEFFECT POUR RECALCULER LA NFE QUAND LES NOTES CHANGENT
  useEffect(() => {
    if (noteFinale > 0) {
      calculerNoteFinaleEncadrement(noteFinale, noteExpert, noteEncadrantEntreprise);
    }
  }, [noteFinale, noteExpert, noteEncadrantEntreprise]);

  // NOUVELLE FONCTION : Récupérer les notes calculées du backend
  const fetchNotesCalculees = async (affectationId) => {
    try {
      const response = await fetch(
        `http://localhost:8096/api/notes-grille/calcul/academique/${affectationId}/P-03-06`
      );
      if (response.ok) {
        const data = await response.json();
        console.log('Notes calculées:', data);
      }
    } catch (error) {
      console.error('Erreur calcul notes:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fonction pour extraire les sections de niveau 2
  const getSectionsNiveau2 = () => {
    if (!grilleData?.length) return [];

    try {
      const noteRDVSection = grilleData[0]?.sousCriteres?.find(item => 
        item.critere?.includes("Note RDV pédagogiques")
      );
      return noteRDVSection?.sousCriteres || [];
    } catch (error) {
      console.error('Erreur extraction sections:', error);
      return [];
    }
  };

  // Gestion des changements de notes
  const handleNoteChange = (elementId, points, maxPoints) => {
    const pointsNum = parseFloat(points) || 0;
    const noteValide = Math.max(0, Math.min(pointsNum, maxPoints));
    
    setNotes(prev => ({
      ...prev,
      [elementId]: { 
        points: noteValide,
        maxPoints: maxPoints,
        typeGrille: 'ACADEMIQUE'
      }
    }));
  };

  // Fonction pour déterminer le type de saisie
  const getInputType = (sectionName) => {
    const selectSections = ["Livrables", "Fiches d'évaluation", "RDV pédagogiques"];
    return selectSections.includes(sectionName) ? "select" : "number";
  };

  // Options pour les sélecteurs
  const getSelectOptions = (sectionName, element) => {
    const options = {
      "Livrables": [
        { value: element.coefficient, label: `À temps (${element.coefficient} pts)` },
        { value: element.critere.includes("Planning") ? 2 : 0.5, label: `En retard (${element.critere.includes("Planning") ? 2 : 0.5} pts)` },
        { value: 0, label: `Non rendu (0 pt)` }
      ],
      "Fiches d'évaluation": [
        { value: element.coefficient, label: `Satisfait (${element.coefficient} pts)` },
        { value: element.coefficient / 2, label: `Moyen (${element.coefficient / 2} pt)` }
      ],
      "RDV pédagogiques": [
        { value: 4.5, label: `Assurée (4.5 pts)` },
        { value: 0, label: `Non assurée (0 pt)` }
      ]
    };
    return options[sectionName] || [];
  };

  // Calcul du total pour une section (maintenant utilisé seulement pour l'affichage)
  const calculerTotalSection = (section) => {
    if (!section?.sousCriteres) return 0;
    
    const total = section.sousCriteres.reduce((sum, element) => {
      return sum + (notes[element.idGrille]?.points || 0);
    }, 0);
    
    return parseFloat(total.toFixed(2));
  };

  // Vérifier si la somme des enfants dépasse le parent
  const getValidationStatus = (section) => {
    const totalSection = calculerTotalSection(section);
    const sectionMax = section.coefficient || 0;
    const isValid = totalSection <= sectionMax;
    
    return {
      total: totalSection,
      isValid: isValid,
      message: isValid ? '' : `⚠️ La somme dépasse ${sectionMax} points`
    };
  };

  // Fonction pour déterminer les valeurs des colonnes
  const getColumnValues = (sectionName, element) => {
    const values = {
      "Livrables": {
        colonne1: `${element.coefficient} pts`,
        colonne2: element.critere.includes("Planning") ? "2 pts" : "0.5 pt",
        colonne3: "0 pt"
      },
      "Fiches d'évaluation": {
        colonne1: `${element.coefficient} pts`,
        colonne2: `${element.coefficient / 2} pt`,
        colonne3: ""
      },
      "RDV pédagogiques": {
        colonne1: "4.5 pts",
        colonne2: "0 pt",
        colonne3: ""
      }
    };
    return values[sectionName] || { colonne1: "", colonne2: "", colonne3: "" };
  };

  // Fonction pour déterminer les en-têtes de colonnes responsive
  const getColumnHeaders = (sectionName) => {
    const headers = {
      "Livrables": isMobile ? 
        ["À temps", "En retard", "Non rendu"] : 
        ["Dûment rempli et rendu à temps", "Dûment rempli et rendu en retard", "Non rendu"],
      "Fiches d'évaluation": isMobile ? 
        ["Satisfait", "Moyen", ""] : 
        ["Encadrant satisfait", "Encadrant moyennement satisfait", ""],
      "RDV pédagogiques": ["Assurée", "Non assurée", ""]
    };
    return headers[sectionName] || ["Colonne 1", "Colonne 2", "Colonne 3"];
  };

  // FONCTION DE SAUVEGARDE CORRIGÉE AVEC NFE
  const handleSaveNotes = async () => {
    if (!propSelectedEtudiant) {
      showSnackbar('Veuillez sélectionner un étudiant', 'error');
      return;
    }

    if (!etudiantInfo.idAffectationStage) {
      showSnackbar('Cet étudiant n\'a pas d\'affectation de stage valide', 'error');
      return;
    }

    try {
      setSaving(true);

      const notesToSave = [];

      // Sauvegarder les notes individuelles de la grille
      Object.keys(notes).forEach(grilleId => {
        const noteData = notes[grilleId];
        if (noteData.points != null && noteData.points !== '') {
          const dto = {
            idAffectationStage: etudiantInfo.idAffectationStage,
            idGrille: parseInt(grilleId),
            idEvaluateur: "P-03-06",
            note: parseFloat(noteData.points),
            titreEvaluateur: "Encadrant Académique",
            commentaire: `Évaluation académique - ${etudiantInfo.nom} - Grille ${grilleId}`,
            dateEvaluation: new Date().toISOString()
          };
          notesToSave.push(dto);
        }
      });

      // Sauvegarder la note d'appréciation globale (id_grille = 3)
      if (noteAppreciation > 0) {
        const appreciationDTO = {
          idAffectationStage: etudiantInfo.idAffectationStage,
          idGrille: 3,
          idEvaluateur: "P-03-06",
          note: parseFloat(noteAppreciation),
          titreEvaluateur: "Encadrant Académique",
          commentaire: "Note d'appréciation globale",
          dateEvaluation: new Date().toISOString()
        };
        notesToSave.push(appreciationDTO);
      }

      // SAUVEGARDER LA NOTE FINALE D'ENCADREMENT (NFE) - ID 67
      if (noteFinaleEncadrement > 0) {
        const nfeDTO = {
          idAffectationStage: etudiantInfo.idAffectationStage,
          idGrille: 67, // ID pour la Note Finale d'Encadrement
          idEvaluateur: "P-03-06",
          note: parseFloat(noteFinaleEncadrement),
          titreEvaluateur: "Note Finale encadrement NFE",
          commentaire: `Note Finale Encadrement - ${etudiantInfo.nom} - Calcul: (${noteFinale}×0.4 + ${noteExpert}×0.4 + ${noteEncadrantEntreprise}×0.2)`,
          dateEvaluation: new Date().toISOString()
        };
        notesToSave.push(nfeDTO);
      }

      // Utiliser le nouvel endpoint avec note finale
      const sauvegardeCompleteDTO = {
        notes: notesToSave,
        noteFinale: noteFinale,
        idEvaluateur: "P-03-06",
        typeGrille: "ACADEMIQUE"
      };

      const response = await fetch('http://localhost:8096/api/notes-grille/sauvegarder-avec-note-finale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sauvegardeCompleteDTO)
      });

      if (response.ok) {
        showSnackbar(`Évaluation sauvegardée avec succès! (${notesToSave.length} notes incluant la NFE)`);
        setSaveDialogOpen(false);
      } else {
        throw new Error('Erreur lors de la sauvegarde');
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
    setNoteAppreciation(0);
    setNoteExpert(0);
    setNoteEncadrantEntreprise(0);
    setNoteFinaleEncadrement(0);
    setNoteRDV(0);
    setNoteFinale(0);
  };

  // Rendu conditionnel
  if (loading && !propSelectedEtudiant) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" sx={{ backgroundColor }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement de la grille académique...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor, p: 2 }}>
        <Alert severity="error" action={
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        }>
          Erreur de connexion: {error}
        </Alert>
      </Box>
    );
  }

  if (!grilleData?.length) {
    return (
      <Box sx={{ backgroundColor, p: 2 }}>
        <Alert severity="warning">Aucune donnée de grille académique disponible</Alert>
      </Box>
    );
  }

  const sectionsNiveau2 = getSectionsNiveau2();
  const etudiantFields = [
    { label: "Nom de l'Étudiant", value: etudiantInfo.nom, key: 'nom' },
    { label: "Département", value: etudiantInfo.departement, key: 'departement' },
    { label: "Option", value: etudiantInfo.option, key: 'option' },
    { label: "Entreprise d'Accueil", value: etudiantInfo.entreprise, key: 'entreprise' },
    { label: "Nom du ou des Projets", value: etudiantInfo.projet, key: 'projet' }
  ];

  // NOUVELLE FONCTION : Obtenir la couleur en fonction de la note
  const getNoteColor = (note) => {
    if (note >= 16) return '#4caf50'; // Excellent
    if (note >= 14) return '#8bc34a'; // Très bien
    if (note >= 12) return '#ffc107'; // Bien
    if (note >= 10) return '#ff9800'; // Passable
    return '#f44336'; // Insuffisant
  };

  return (
                    <PermissionBasedGuard permissions={['VIEW_GRILLE']} hasContent>

    <Box sx={{ backgroundColor, minHeight: '100vh', py: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ maxWidth: 1200, margin: '0 auto', p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        
        {/* En-tête principal */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 3 }}>
            Grille encadrant académique
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
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      backdropFilter: 'blur(2px)'
                    }
                  }}
                  PaperProps={{
                    sx: {
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(211, 47, 47, 0.3)',
                      border: '1px solid',
                      borderColor: 'error.light'
                    }
                  }}
                >
                  <DialogTitle 
                    sx={{ 
                      bgcolor: 'error.main', 
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
                        bgcolor: 'error.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}
                    >
                      <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    
                    <Typography variant="h5" color="error.main" gutterBottom fontWeight="bold">
                      Affectation Manquante
                    </Typography>
                    
                    <Typography variant="body1" color="text.secondary" paragraph>
                      L'étudiant <strong>{etudiantInfo.nom}</strong> n'a pas d'affectation de stage.
                    </Typography>
                    
                    <Typography variant="body2" color="error.main" fontWeight="medium">
                      La création de soutenance ne sera pas possible sans affectation.
                    </Typography>
                  </DialogContent>
                  
                  <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
                    <Button 
                      variant="contained" 
                      color="error"
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

              <Grid container spacing={isSmallScreen ? 1 : 2} sx={{ maxWidth: 800, margin: '0 auto', mb: 4 }}>
                {etudiantFields.map((field, index) => (
                  <Grid item xs={12} key={field.key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', minWidth: isSmallScreen ? 160 : 200, color: '#000', fontSize: '14px' }}>
                        {field.label} :
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#000', ml: 1, fontSize: '14px', flex: 1 }}>
                        {field.value || 'Non renseigné'}
                      </Typography>
                    </Box>
                    {index < 4 && <Divider sx={{ my: 1 }} />}
                  </Grid>
                ))}
              </Grid>

              <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold', color: '#d32f2f', textAlign: 'left', mb: 3 }}>
                • Note RDV pédagogiques
              </Typography>
            </>
          )}
        </Box>

        {/* Affichage des tableaux seulement si un étudiant est sélectionné */}
        {propSelectedEtudiant ? (
          <>
            {sectionsNiveau2.map((section) => {
              const validation = getValidationStatus(section);
              const columnHeaders = getColumnHeaders(section.critere);
              
              return (
                
                <Box key={section.idGrille} sx={{ mb: 4, overflow: 'auto' }}>
                  <TableContainer component={Paper} sx={{ border: '2px solid #d32f2f', boxShadow: 'none', minWidth: isSmallScreen ? 600 : 'auto' }}>
                    <Table size={isSmallScreen ? "small" : "medium"}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#0b5cf4ff' }}>
                          <TableCell colSpan={5}>
                            <Typography variant={isSmallScreen ? "body2" : "subtitle1"} sx={{ fontWeight: 'bold', color: 'red' }}>
                              {section.critere} ({section.coefficient} points)
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#0b167eff' }}>
                          <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', minWidth: 120 }}>
                            {section.critere === "Livrables" ? "Livrable" : 
                             section.critere === "Fiches d'évaluation" ? "Fiche" : "RDV"}
                          </TableCell>
                          {columnHeaders.map((header, index) => (
                            <TableCell key={index} align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', minWidth: isSmallScreen ? 80 : 100 }}>
                              {header}
                            </TableCell>
                          ))}
                          <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', minWidth: 80 }}>
                            Note
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {section.sousCriteres?.map((element, index) => {
                          const columnValues = getColumnValues(section.critere, element);
                          const inputType = getInputType(section.critere);
                          const selectOptions = getSelectOptions(section.critere, element);
                          
                          return (
                            <TableRow key={element.idGrille} sx={{ backgroundColor: index % 2 === 0 ? '#fafafaff' : 'white' }}>
                              <TableCell sx={{ border: '1px solid #000', fontWeight: 'medium', color: '#000' }}>
                                <Typography variant={isSmallScreen ? "caption" : "body2"}>{element.critere}</Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ border: '1px solid #000', color: '#000', fontWeight: 'medium' }}>
                                <Typography variant={isSmallScreen ? "caption" : "body2"}>{columnValues.colonne1}</Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ border: '1px solid #000', color: '#000', fontWeight: 'medium' }}>
                                <Typography variant={isSmallScreen ? "caption" : "body2"}>{columnValues.colonne2}</Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ border: '1px solid #000', color: '#000', fontWeight: 'medium' }}>
                                <Typography variant={isSmallScreen ? "caption" : "body2"}>{columnValues.colonne3}</Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ border: '1px solid #000' }}>
                                {inputType === 'select' ? (
                                  <FormControl size="small" sx={{ minWidth: isSmallScreen ? 90 : 120 }}>
                                    <Select
                                      value={notes[element.idGrille]?.points || ''}
                                      onChange={(e) => handleNoteChange(element.idGrille, e.target.value, element.coefficient)}
                                      displayEmpty
                                    >
                                      <MenuItem value=""><em>Choisir</em></MenuItem>
                                      {selectOptions.map((option, idx) => (
                                        <MenuItem key={idx} value={option.value}>
                                          <Typography variant={isSmallScreen ? "caption" : "body2"}>{option.label}</Typography>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                ) : (
                                  <TextField 
                                    size="small" 
                                    type="number"
                                    inputProps={{ min: 0, max: element.coefficient, step: 0.5 }}
                                    value={notes[element.idGrille]?.points || ''}
                                    onChange={(e) => handleNoteChange(element.idGrille, e.target.value, element.coefficient)}
                                    sx={{ width: isSmallScreen ? 60 : 80, bgcolor: 'white' }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        
                        {/* Ligne de total */}
                        <TableRow sx={{ backgroundColor: '#e8eaf6' }}>
                          <TableCell sx={{ border: '1px solid #000', fontWeight: 'bold', color: '#000' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"}>Total {section.critere}</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ border: '1px solid #000', fontWeight: 'bold', color: '#000' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"}>{section.coefficient} pts max</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ border: '1px solid #000' }}></TableCell>
                          <TableCell align="center" sx={{ border: '1px solid #000' }}></TableCell>
                          <TableCell align="center" sx={{ border: '1px solid #000', fontWeight: 'bold', color: validation.isValid ? '#2e7d32' : '#d32f2f' }}>
                            <Typography variant={isSmallScreen ? "caption" : "body2"}>
                              {validation.total} / {section.coefficient}
                            </Typography>
                            {!validation.isValid && (
                              <Typography variant="caption" display="block" sx={{ color: '#d32f2f' }}>
                                {validation.message}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}

            {/* Note RDV pédagogiques */}
            <Box sx={{ textAlign: 'right', mb: 4 }}>
              <Typography variant={isMobile ? "body2" : "body1"} sx={{ fontWeight: 'bold', color: '#000' }}>
                Note : <Typography component="span" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                  {noteRDV}/20
                </Typography>
              </Typography>
            </Box>

            <Divider sx={{ my: 3, borderColor: '#000', borderWidth: 1 }} />

            {/* Calcul de la note finale */}
            
            <Box sx={{ mb: 4 }}>
              <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 3, fontSize: isSmallScreen ? '0.9rem' : '1rem' }}>
                Note finale = (Note RDV pédagogiques * 80% + Note d'appréciation globale * 20%)
              </Typography>
              
              <Grid container spacing={2} sx={{ maxWidth: 600, margin: '0 auto' }}>
                <Grid item xs={8} sm={7}>
                  <Typography variant={isSmallScreen ? "body2" : "body1"} sx={{ fontWeight: 'bold', color: '#000' }}>
                    Note RDV pédagogiques
                  </Typography>
                </Grid>
                <Grid item xs={4} sm={5}>
                  <Typography variant={isSmallScreen ? "body2" : "body1"} sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    {noteRDV}/20
                  </Typography>
                </Grid>
                
                <Grid item xs={8} sm={7}>
                  <Typography variant={isSmallScreen ? "body2" : "body1"} sx={{ fontWeight: 'bold', color: '#000' }}>
                    Note d'appréciation globale
                  </Typography>
                </Grid>
                <Grid item xs={4} sm={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField 
                      size="small" 
                      type="number"
                      inputProps={{ min: 0, max: 20, step: 0.5 }}
                      value={noteAppreciation}
                      onChange={(e) => setNoteAppreciation(e.target.value)}
                      sx={{ width: isSmallScreen ? 70 : 100, bgcolor: 'white' }}
                    />
                    <Typography variant={isSmallScreen ? "body2" : "body1"} sx={{ ml: 1 }}>/20</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={8} sm={7}>
                  <Typography variant={isSmallScreen ? "body2" : "body1"} sx={{ fontWeight: 'bold', color: '#000' }}>
                    Note finale encadrant académique
                  </Typography>
                </Grid>
                <Grid item xs={4} sm={5}>
                  <Typography variant={isSmallScreen ? "body2" : "body1"} sx={{ 
                    fontWeight: 'bold', 
                    textDecoration: 'underline',
                    color: getNoteColor(noteFinale)
                  }}>
                    {noteFinale}/20
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Boutons d'action */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4, flexDirection: isSmallScreen ? 'column' : 'row' }}>
              <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: 2 }} fullWidth={isSmallScreen}>
                Réinitialiser les notes
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={() => setSaveDialogOpen(true)}
                disabled={!propSelectedEtudiant || saving || !etudiantInfo.idAffectationStage}
                sx={{ borderRadius: 2 }}
                fullWidth={isSmallScreen}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder l\'évaluation'}
              </Button>
            </Box>

            {/* NOUVELLE SECTION SYNTHÈSE AMÉLIORÉE */}
            <Box sx={{ mt: 6, p: { xs: 2, sm: 3 }, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 3, boxShadow: 3 }}>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center', mb: 3 }}>
                📊 Synthèse de la Note Finale d'Encadrement (NFE)
              </Typography>
              
              <Typography variant={isSmallScreen ? "caption" : "body1"} sx={{ fontStyle: 'italic', textAlign: 'center', mb: 4, color: 'rgba(255,255,255,0.9)' }}>
                NFE = (Note académique × 40%) + (Note expert × 40%) + (Note entreprise × 20%)
              </Typography>
              
              <Grid container spacing={3} sx={{ maxWidth: 800, margin: '0 auto' }}>
                {/* Note Académique */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 2, boxShadow: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <SchoolIcon sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 1 }}>
                        Académique
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        40% du total
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: getNoteColor(noteFinale),
                        background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {noteFinale}/20
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        {noteFinale.toFixed(2)} × 0.4 = {(noteFinale * 0.4).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Note Expert */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 2, boxShadow: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <GavelIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                        Expert
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        40% du total
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: getNoteColor(noteExpert),
                        background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {noteExpert}/20
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        {noteExpert.toFixed(2)} × 0.4 = {(noteExpert * 0.4).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Note Entreprise */}
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'rgba(255,255,255,0.95)', borderRadius: 2, boxShadow: 2, height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', p: 2 }}>
                      <BusinessIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                        Entreprise
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        20% du total
                      </Typography>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 'bold', 
                        color: getNoteColor(noteEncadrantEntreprise),
                        background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        {noteEncadrantEntreprise}/20
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                        {noteEncadrantEntreprise.toFixed(2)} × 0.2 = {(noteEncadrantEntreprise * 0.2).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Note Finale d'Encadrement */}
                <Grid item xs={12}>
                  <Card sx={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)', borderRadius: 2, boxShadow: 4, mt: 2 }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <CalculateIcon sx={{ fontSize: 35, color: 'white', mr: 1 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Note Finale d'Encadrement (NFE)
                        </Typography>
                      </Box>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                      }}>
                        {noteFinaleEncadrement}/20
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
                        = ({noteFinale} × 0.4) + ({noteExpert} × 0.4) + ({noteEncadrantEntreprise} × 0.2)
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1, fontStyle: 'italic' }}>
                        {noteFinaleEncadrement >= 16 ? '🎉 Excellent' : 
                         noteFinaleEncadrement >= 14 ? '👍 Très bien' : 
                         noteFinaleEncadrement >= 12 ? '✅ Bien' : 
                         noteFinaleEncadrement >= 10 ? '⚠️ Passable' : '❌ Insuffisant'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>Date et Signature</Typography>
                <Box sx={{ borderBottom: '2px solid rgba(255,255,255,0.5)', width: 200, mx: 'auto' }}></Box>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <AssessmentIcon sx={{ fontSize: 60, color: '#d32f2f', mb: 2, opacity: 0.5 }} />
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
            <Typography>Êtes-vous sûr de vouloir sauvegarder cette évaluation pour {etudiantInfo.nom} ?</Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Note finale académique: <strong>{noteFinale}/20</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Note finale encadrement: <strong>{noteFinaleEncadrement}/20</strong>
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
    </PermissionBasedGuard>
  );
};

export default GrilleAcademique;