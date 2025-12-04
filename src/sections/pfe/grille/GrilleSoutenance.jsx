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
  Card,
  CardContent,FormControl ,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Save as SaveIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';

const GrilleSoutenance = ({ selectedEtudiant: propSelectedEtudiant, etudiantInfo: propEtudiantInfo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  
  // SUPPRESSION: Plus besoin de gérer les étudiants localement
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
  const [noteFinaleEncadrement, setNoteFinaleEncadrement] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [loadingNFE, setLoadingNFE] = useState(false);

  const backgroundColor = 'rgba(169, 21, 34, 0.05)';

  // MODIFICATION: Utiliser les props pour charger les données étudiant
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
            await fetchNoteFinaleEncadrement(propEtudiantInfo.affectation.id);
          } else {
            setNotes({});
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
            await fetchNoteFinaleEncadrement(idAffectationStage);
          } else {
            setNotes({});
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
  }, [propSelectedEtudiant, propEtudiantInfo]); // MODIFICATION: Dépendre des props

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
    setNoteFinaleEncadrement(0);
    setCommentaire('');
  };

  const fetchExistingNotes = async (affectationId) => {
    try {
      const response = await fetch(`http://localhost:8096/api/notes-grille/affectation/${affectationId}`);
      if (response.ok) {
        const notesData = await response.json();
        
        const nouvellesNotes = {};
        notesData.forEach(note => {
          const grilleId = note.idGrille.id || note.idGrille;
          // Ne prendre que les notes de soutenance (IDs 22-29)
          if (grilleId >= 22 && grilleId <= 29) {
            nouvellesNotes[grilleId] = {
              points: note.note,
              maxPoints: 5,
              typeGrille: 'SOUTENANCE'
            };
          }
        });
        setNotes(nouvellesNotes);
      }
    } catch (error) {
      console.warn('Impossible de charger les notes existantes:', error);
    }
  };

  // NOUVELLE VERSION CORRIGÉE POUR RÉCUPÉRER LA NFE
  const fetchNoteFinaleEncadrement = async (affectationId) => {
    setLoadingNFE(true);
    try {
      console.log('=== DÉBUT RÉCUPÉRATION NFE ===');
      console.log('ID Affectation:', affectationId);

      // 1. Essayer de récupérer via l'API de calcul
      try {
        const response = await fetch(`http://localhost:8096/api/calcul-notes/finale-encadrement/${affectationId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('NFE via API calcul:', data);
          
          if (data.noteFinaleEncadrement !== undefined) {
            setNoteFinaleEncadrement(parseFloat(data.noteFinaleEncadrement));
            console.log('NFE trouvée via API calcul:', data.noteFinaleEncadrement);
            return;
          }
        }
      } catch (error) {
        console.warn('Erreur API calcul NFE:', error);
      }

      // 2. Essayer de récupérer la note NFE sauvegardée (ID 67)
      try {
        const notesResponse = await fetch(`http://localhost:8096/api/notes-grille/affectation/${affectationId}`);
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          console.log('Toutes les notes:', notesData);
          
          // Chercher la note NFE (ID 67)
          const noteNFE = notesData.find(note => {
            const grilleId = note.idGrille.id || note.idGrille;
            return grilleId === 67;
          });
          
          if (noteNFE) {
            console.log('NFE trouvée dans notes (ID 67):', noteNFE.note);
            setNoteFinaleEncadrement(parseFloat(noteNFE.note));
            return;
          }
        }
      } catch (error) {
        console.warn('Erreur récupération notes NFE:', error);
      }

      // 3. Calculer manuellement la NFE si non trouvée
      await calculerNFEManuellement(affectationId);

    } catch (error) {
      console.error('Erreur récupération NFE:', error);
      setNoteFinaleEncadrement(0);
    } finally {
      setLoadingNFE(false);
    }
  };

  // FONCTION POUR CALCULER MANUELLEMENT LA NFE
  const calculerNFEManuellement = async (affectationId) => {
    try {
      const response = await fetch(`http://localhost:8096/api/notes-grille/affectation/${affectationId}`);
      if (response.ok) {
        const notesData = await response.json();
        
        // Récupérer les notes des différents évaluateurs
        let noteAcademique = 0;
        let noteExpert = 0;
        let noteEntreprise = 0;

        // Note académique (ID 1-21)
        const notesAcademiques = notesData.filter(note => {
          const grilleId = note.idGrille.id || note.idGrille;
          return grilleId >= 1 && grilleId <= 21;
        });
        if (notesAcademiques.length > 0) {
          // Prendre la note finale académique si disponible (ID 1)
          const noteFinaleAcademique = notesData.find(note => {
            const grilleId = note.idGrille.id || note.idGrille;
            return grilleId === 1;
          });
          noteAcademique = noteFinaleAcademique ? noteFinaleAcademique.note : 0;
        }

        // Note expert (IDs 18, 19, 20, 14)
        const notesExpert = notesData.filter(note => {
          const grilleId = note.idGrille.id || note.idGrille;
          return [18, 19, 20, 14].includes(grilleId);
        });
        if (notesExpert.length > 0) {
          const totalExpert = notesExpert.reduce((sum, note) => sum + note.note, 0);
          const moyenneExpert = totalExpert / notesExpert.length;
          noteExpert = moyenneExpert * 4; // Conversion vers 20 points
        }

        // Note entreprise (ID 30)
        const noteEntrepriseData = notesData.find(note => {
          const grilleId = note.idGrille.id || note.idGrille;
          return grilleId === 30; // ID de la grille entreprise
        });
        noteEntreprise = noteEntrepriseData ? noteEntrepriseData.note : 0;

        console.log('Calcul manuel NFE:', {
          noteAcademique,
          noteExpert,
          noteEntreprise
        });

        // Calculer la NFE selon la formule
        const nfe = (noteAcademique * 0.4) + (noteExpert * 0.4) + (noteEntreprise * 0.2);
        setNoteFinaleEncadrement(parseFloat(nfe.toFixed(2)));
        console.log('NFE calculée manuellement:', nfe);
      }
    } catch (error) {
      console.warn('Erreur calcul manuel NFE:', error);
      setNoteFinaleEncadrement(0);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Structure de la grille de soutenance
  const competencesSoutenance = [
    {
      id: 22,
      nom: "Comprendre et intégrer les enjeux et la stratégie de l'entreprise",
      niveaux: [
        { points: 5, description: "Tous les enjeux présentés, mission clairement située, développement durable intégré" },
        { points: 4, description: "Grands enjeux présentés, mission située, plusieurs aspects développement durable" },
        { points: 3.25, description: "Objectifs et contraintes donnés mais sans positionnement stratégique" },
        { points: 2, description: "Objectifs partiellement pris en compte, cadre pas toujours respecté" },
        { points: 1, description: "Objectifs rarement pris en compte, cadre non respecté" }
      ]
    },
    {
      id: 23,
      nom: "Analyser et/ou chercher les solutions à un problème de conception, de réalisation, d'amélioration de produit, de systèmes ou de services au sein d'une organisation",
      niveaux: [
        { points: 5, description: "Démarche d'analyse complète, plusieurs solutions évaluées avec critères mesurables" },
        { points: 4, description: "Démarche adaptée, solutions proposées et évaluées" },
        { points: 3.25, description: "Démarche globalement adaptée, raisonnement incomplet, manque de pistes" },
        { points: 2, description: "Démarche mal menée, solutions non pertinentes" },
        { points: 1, description: "Démarche incohérente, solutions ne concordent pas avec objectifs" }
      ]
    },
    {
      id: 24,
      nom: "Conduire un projet de création, de conception, de réalisation, d'amélioration de produit, de système ou de service",
      niveaux: [
        { points: 5, description: "Plan management complet et analysé, démarche projet pertinente, stratégie communication élaborée" },
        { points: 4, description: "Plan management complet, démarche projet complète" },
        { points: 3.25, description: "Plan management présent mais peu analysé, étapes essentielles présentées" },
        { points: 2, description: "Étapes manquantes, pas de stratégie communication" },
        { points: 1, description: "Aucun plan management, pas de stratégie communication claire" }
      ]
    },
    {
      id: 25,
      nom: "Mettre en œuvre sa maîtrise scientifique ou technique au sein de l'organisation",
      niveaux: [
        { points: 5, description: "Réponses apportent une réelle valeur ajoutée, bonne maîtrise scientifique" },
        { points: 4, description: "Réponses montrent une bonne maîtrise scientifique" },
        { points: 3.25, description: "Réponses adaptées aux besoins sans plus" },
        { points: 2, description: "Pas de maîtrise particulière, outils utilisés sans appropriation" },
        { points: 1, description: "Ne propose pas de solutions adaptées" }
      ]
    },
    {
      id: 26,
      nom: "Organiser sa mission et manager les ressources",
      niveaux: [
        { points: 5, description: "Travail organisé avec valeur ajoutée, qualité gérée avec indicateurs, anticipation des écarts, changement accompagné" },
        { points: 4, description: "Mission organisée respectant les exigences, écarts analysés, changement globalement accompagné" },
        { points: 3.25, description: "Gestion avec aléas, écarts mineurs mal justifiés, peu d'accompagnement changement" },
        { points: 2, description: "Réaction aux aléas, pas de pilotage réel, indicateur important non utilisé" },
        { points: 1, description: "Pas d'organisation ni management" }
      ]
    },
    {
      id: 27,
      nom: "Qualité et présentation du document",
      niveaux: [
        { points: 5, description: "Document très bien structuré, accessible, qualité excellente, orthographe parfaite" },
        { points: 4, description: "Document bien structuré, qualité satisfaisante, orthographe correcte" },
        { points: 3.25, description: "Écrit clair malgré maladresses, quelques fautes, règles globalement respectées" },
        { points: 2, description: "Travail incomplet, explications non accessibles, forme non homogène" },
        { points: 1, description: "Explications incompréhensibles" }
      ]
    },
    {
      id: 28,
      nom: "Qualité de la présentation orale",
      niveaux: [
        { points: 5, description: "Présentation claire et structurée, supports de qualité, créativité, aisance, bonne gestion temps" },
        { points: 4, description: "Présentation claire, supports de qualité, aisance, bonne gestion temps" },
        { points: 3.25, description: "Travail présenté malgré manque d'aisance, quelques fautes d'orthographe" },
        { points: 2, description: "Travail incomplet, propos non accessible, supports chargés, mauvaise gestion temps" },
        { points: 1, description: "Propos incompréhensible, orthographe très mauvaise, supports absents, plagiat" }
      ]
    },
    {
      id: 29,
      nom: "Qualité de l'argumentation",
      niveaux: [
        { points: 5, description: "Excellente capacité d'argumentation, écoute active, réponses pertinentes, force de proposition" },
        { points: 4, description: "Bonne capacité d'argumentation, écoute, réponses pertinentes, maîtrise du sujet" },
        { points: 3.25, description: "Argumentation majoritaire, parfois mal à l'aise, réponses manquent de synthèse" },
        { points: 2, description: "Pas toujours à l'écoute, réponses peu claires, maîtrise superficielle" },
        { points: 1, description: "Ne répond pas aux questions, aucune maîtrise du sujet" }
      ]
    }
  ];

  // Gestion des changements de notes
  const handleNoteChange = (competenceId, points) => {
    setNotes(prev => ({
      ...prev,
      [competenceId]: { 
        points: parseFloat(points),
        maxPoints: 5,
        typeGrille: 'SOUTENANCE'
      }
    }));
  };

  // Calcul du total des points
  const calculerTotalPoints = () => {
    return Object.values(notes).reduce((total, note) => total + (note.points || 0), 0);
  };

  // Calcul de la note du module selon votre grille
  const calculerNoteModule = () => {
    const total = calculerTotalPoints();
    if (total > 32) return 'A';
    if (total >= 26 && total <= 31) return 'B';
    if (total >= 12 && total <= 25) return 'C';
    return 'D';
  };

  // Calcul de la note de soutenance sur 20
  const calculerNoteSoutenance = () => {
    const total = calculerTotalPoints();
    // Conversion des 40 points vers 20 points
    return (total / 40) * 20;
  };

  // Calcul de la note finale selon la formule: 3/5 NS + 2/5 NFE
  const calculerNoteFinale = () => {
    const noteSoutenance = calculerNoteSoutenance();
    const nfe = noteFinaleEncadrement || 0;
    return (3/5 * noteSoutenance) + (2/5 * nfe);
  };

  // Sauvegarde des notes
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

      const notesToSave = [];

      // Sauvegarder les notes de compétences
      Object.keys(notes).forEach(grilleId => {
        const noteData = notes[grilleId];
        if (noteData.points > 0) {
          const dto = {
            idAffectationStage: etudiantInfo.idAffectationStage,
            idGrille: parseInt(grilleId),
            idEvaluateur: "P-03-06",
            note: noteData.points,
            titreEvaluateur: "Jury de Soutenance",
            commentaire: `Évaluation soutenance - ${etudiantInfo.nom} - Compétence ${grilleId}`,
            dateEvaluation: new Date().toISOString()
          };
          notesToSave.push(dto);
        }
      });

      // Sauvegarder la note finale de soutenance (ID 30 pour la note finale)
      const noteSoutenance = calculerNoteSoutenance();
      if (noteSoutenance > 0) {
        const noteFinaleDto = {
          idAffectationStage: etudiantInfo.idAffectationStage,
          idGrille: 30, // ID pour la note finale de soutenance
          idEvaluateur: "P-03-06",
          note: parseFloat(noteSoutenance.toFixed(2)),
          titreEvaluateur: "Jury de Soutenance",
          commentaire: `Note finale soutenance - ${etudiantInfo.nom} - ${commentaire || 'Aucun commentaire'}`,
          dateEvaluation: new Date().toISOString()
        };
        notesToSave.push(noteFinaleDto);
      }

      if (notesToSave.length === 0) {
        showSnackbar('Aucune note à sauvegarder', 'warning');
        setSaveDialogOpen(false);
        return;
      }

      const savePromises = notesToSave.map(noteData => 
        fetch('http://localhost:8096/api/notes-grille', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData)
        })
      );

      const results = await Promise.all(savePromises);
      const errors = results.filter(response => !response.ok);

      if (errors.length === 0) {
        showSnackbar(`Évaluation de soutenance sauvegardée avec succès! (${notesToSave.length} notes)`);
        setSaveDialogOpen(false);
      } else {
        throw new Error(`${errors.length} note(s) n'ont pas pu être sauvegardées`);
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
    setCommentaire('');
  };

  const etudiantFields = [
    { label: "Nom de l'Étudiant", value: etudiantInfo.nom, key: 'nom' },
    { label: "Département", value: etudiantInfo.departement, key: 'departement' },
    { label: "Option", value: etudiantInfo.option, key: 'option' },
    { label: "Entreprise d'Accueil", value: etudiantInfo.entreprise, key: 'entreprise' },
    { label: "Nom du ou des Projets", value: etudiantInfo.projet, key: 'projet' }
  ];

  const totalPoints = calculerTotalPoints();
  const noteModule = calculerNoteModule();
  const noteSoutenance = calculerNoteSoutenance();
  const noteFinale = calculerNoteFinale();

  return (
    <Box sx={{ backgroundColor, minHeight: '100vh', py: { xs: 1, sm: 2, md: 3 }, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ maxWidth: 1400, margin: '0 auto', p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
        
        {/* En-tête principal */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
            Grille d'évaluation de soutenance
          </Typography>

          {/* SUPPRESSION: Plus de sélection d'étudiant ici */}

          {/* Informations étudiant */}
          {propSelectedEtudiant && (
            <>
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
            </>
          )}
        </Box>

        {/* Affichage des compétences seulement si un étudiant est sélectionné */}
        {propSelectedEtudiant ? (
          <>
            {/* Tableau des compétences */}
            <TableContainer component={Paper} sx={{ mb: 4, overflow: 'auto' }}>
              <Table size={isSmallScreen ? "small" : "medium"}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#ee5056ff'}}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white', minWidth: 200 }}>
                      Compétences visées
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white', minWidth: 120 }}>
                      A++ (5 points)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white', minWidth: 120 }}>
                      A (4 points)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white', minWidth: 120 }}>
                      B (3.25 points)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white', minWidth: 120 }}>
                      C (2 points)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white', minWidth: 120 }}>
                      D (1 point)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'white', minWidth: 100 }}>
                      Note
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {competencesSoutenance.map((competence, index) => (
                    <TableRow key={competence.id} sx={{ backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white' }}>
                      <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'medium' }}>
                        <Typography variant={isSmallScreen ? "caption" : "body2"}>
                          {competence.nom}
                        </Typography>
                      </TableCell>
                      
                      {/* Colonnes pour chaque niveau */}
                      {competence.niveaux.map((niveau, niveauIndex) => (
                        <TableCell key={niveauIndex} align="center" sx={{ border: '1px solid #ddd' }}>
                          <Typography variant={isSmallScreen ? "caption" : "body2"}>
                            {niveau.description}
                          </Typography>
                        </TableCell>
                      ))}
                      
                      {/* Sélection de la note */}
                      <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                        <FormControl size="small">
                          <Select
                            value={notes[competence.id]?.points || ''}
                            onChange={(e) => handleNoteChange(competence.id, e.target.value)}
                            displayEmpty
                            sx={{ minWidth: isSmallScreen ? 80 : 100 }}
                          >
                            <MenuItem value=""><em>Choisir</em></MenuItem>
                            {competence.niveaux.map((niveau, idx) => (
                              <MenuItem key={idx} value={niveau.points}>
                                {niveau.points} pts
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Ligne de total */}
                  <TableRow sx={{ backgroundColor: '#e3fde8ff', fontWeight: 'bold' }}>
                    <TableCell colSpan={6} align="right" sx={{ border: '1px solid #ddd' }}>
                      Total des points:
                    </TableCell>
                    <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold', color: '#1976d2' }}>
                      {totalPoints.toFixed(2)}/40
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Calcul des notes finales */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Note de soutenance */}
              <Grid item xs={12} md={4}>
                <Card sx={{ border: '2px solid #1976d2', height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <CalculateIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Note de Soutenance
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 1 }}>
                      {noteSoutenance.toFixed(2)}/20
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      NS = (Total points / 40) × 20
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Note Finale Encadrement */}
              <Grid item xs={12} md={4}>
                <Card sx={{ border: '2px solid #4caf50', height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssessmentIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Note Finale Encadrement
                    </Typography>
                    {loadingNFE ? (
                      <CircularProgress size={40} sx={{ mb: 1 }} />
                    ) : (
                      <>
                        <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 1 }}>
                          {noteFinaleEncadrement.toFixed(2)}/20
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          NFE = (Académique × 40% + Expert × 40% + Entreprise × 20%)
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Note Finale */}
              <Grid item xs={12} md={4}>
                <Card sx={{ border: '2px solid #ff9800', height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <SchoolIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Note Finale
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold', mb: 1 }}>
                      {noteFinale.toFixed(2)}/20
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Finale = 3/5 NS + 2/5 NFE
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Résultat de l'évaluation */}
            <Box sx={{ mb: 4, p: 3, border: '2px solid #1976d2', borderRadius: 2, backgroundColor: '#e3f2fd' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2, textAlign: 'center' }}>
                Résultat de l'évaluation du module
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Total des points:
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      {totalPoints.toFixed(2)}/40
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Note du module:
                    </Typography>
                    <Typography variant="h4" sx={{ 
                      color: noteModule === 'A' ? '#2e7d32' : 
                             noteModule === 'B' ? '#1976d2' : 
                             noteModule === 'C' ? '#ed6c02' : '#d32f2f',
                      fontWeight: 'bold' 
                    }}>
                      {noteModule}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {noteModule === 'A' && 'Total > 32 points'}
                      {noteModule === 'B' && 'Total entre 26 et 31 points'}
                      {noteModule === 'C' && 'Total entre 12 et 25 points'}
                      {noteModule === 'D' && 'Total ≤ 11 points'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Commentaires supplémentaires */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 2 }}>
                Commentaires du jury
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Ajouter des commentaires sur la soutenance, points forts, axes d'amélioration..."
                variant="outlined"
              />
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
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SchoolIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2, opacity: 0.5 }} />
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
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir sauvegarder cette évaluation de soutenance pour {etudiantInfo.nom} ?
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total des points: <strong>{totalPoints.toFixed(2)}/40</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Note de soutenance: <strong>{noteSoutenance.toFixed(2)}/20</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Note finale encadrement: <strong>{noteFinaleEncadrement.toFixed(2)}/20</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Note finale: <strong>{noteFinale.toFixed(2)}/20</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Note du module: <strong>{noteModule}</strong>
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

export default GrilleSoutenance;