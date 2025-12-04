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
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import { Save as SaveIcon, Print as PrintIcon } from '@mui/icons-material';

const FicheEvaluationMiParcours = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [etudiants, setEtudiants] = useState([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // État pour les informations générales
  const [informationsGenerales, setInformationsGenerales] = useState({
    nomEncadrantEntreprise: '',
    nomEncadrantAcademique: '',
    organisme: '',
    telephone: '',
    email: '',
    nomStagiaire: ''
  });

  // État pour les réponses aux questions
  const [reponses, setReponses] = useState({
    // Ponctualité au travail
    ponctualite: {
      informeHoraires: { oui: false, non: false },
      ponctuel: { oui: false, non: false },
      commentaires: ''
    },
    // Intégration dans l'entreprise
    integration: {
      nouerConnaissances: { oui: false, non: false },
      communiquerAutres: { oui: false, non: false },
      bienIntegre: { oui: false, non: false },
      commentaires: ''
    },
    // Travail
    travail: {
      interesseTravail: { oui: false, non: false },
      preoccupationMethodes: { oui: false, non: false },
      quantiteTravailSatisfaisante: { oui: false, non: false },
      respectDelais: { oui: false, non: false },
      commentaires: ''
    },
    // Compétences techniques
    competences: {
      competencesNecessaires: { oui: false, non: false },
      besoinApprendreNouveau: { oui: false, non: false },
      capaciteApprendre: { oui: false, non: false },
      ameliorerCompetences: { oui: false, non: false },
      autonome: { oui: false, non: false },
      aiderAutres: { oui: false, non: false },
      commentaires: ''
    },
    // Évaluation globale
    evaluationGlobale: {
      satisfaitDebutStage: { oui: false, non: false },
      pointsFortsFaibles: ''
    }
  });

  // Récupération des données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Récupérer la liste des étudiants
        const etudiantsResponse = await fetch('http://localhost:8021/api/etudiants');
        if (etudiantsResponse.ok) {
          const etudiantsData = await etudiantsResponse.json();
          setEtudiants(etudiantsData);
        }

      } catch (err) {
        setError(err.message);
        console.error('Erreur fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Gestion des changements dans les informations générales
  const handleInfoGeneraleChange = (field, value) => {
    setInformationsGenerales(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🆕 Gestion des cases à cocher Oui/Non
  const handleCheckboxChange = (section, question, value) => {
    setReponses(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [question]: {
          oui: value === 'oui',
          non: value === 'non'
        }
      }
    }));
  };

  // 🆕 Gestion des commentaires
  const handleCommentaireChange = (section, value) => {
    setReponses(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        commentaires: value
      }
    }));
  };

  // 🆕 Gestion des points forts/faibles
  const handlePointsFortsFaiblesChange = (value) => {
    setReponses(prev => ({
      ...prev,
      evaluationGlobale: {
        ...prev.evaluationGlobale,
        pointsFortsFaibles: value
      }
    }));
  };

  // 🆕 Vérifier si une section est complètement remplie
  const isSectionComplete = (section) => {
    const sectionData = reponses[section];
    for (const [key, value] of Object.entries(sectionData)) {
      if (key !== 'commentaires' && key !== 'pointsFortsFaibles') {
        if (!value.oui && !value.non) {
          return false;
        }
      }
    }
    return true;
  };

  // 🆕 Vérifier si le formulaire est complet
  const isFormComplete = () => {
    // Vérifier les informations générales
    for (const value of Object.values(informationsGenerales)) {
      if (!value.trim()) return false;
    }

    // Vérifier toutes les sections
    const sections = ['ponctualite', 'integration', 'travail', 'competences', 'evaluationGlobale'];
    for (const section of sections) {
      if (!isSectionComplete(section)) return false;
    }

    return true;
  };

  // 🆕 Fonction pour sauvegarder l'évaluation
  const handleSaveEvaluation = async () => {
    if (!isFormComplete()) {
      setSnackbar({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }

    try {
      // Préparer les données pour l'enregistrement
      const evaluationData = {
        informationsGenerales,
        reponses,
        dateEvaluation: new Date().toISOString(),
        etudiantId: selectedEtudiant
      };

      console.log('Données à sauvegarder:', evaluationData);

      // Ici, vous enverriez les données au backend
      // const response = await fetch('http://localhost:8096/api/evaluations/mi-parcours', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(evaluationData)
      // });

      setSnackbar({
        open: true,
        message: 'Fiche d\'évaluation sauvegardée avec succès!',
        severity: 'success'
      });
      
      setSaveDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la sauvegarde: ' + error.message,
        severity: 'error'
      });
    }
  };

  // 🆕 Fonction pour imprimer la fiche
  const handlePrint = () => {
    window.print();
  };

  // 🆕 Réinitialiser le formulaire
  const handleReset = () => {
    setInformationsGenerales({
      nomEncadrantEntreprise: '',
      nomEncadrantAcademique: '',
      organisme: '',
      telephone: '',
      email: '',
      nomStagiaire: ''
    });
    setReponses({
      ponctualite: {
        informeHoraires: { oui: false, non: false },
        ponctuel: { oui: false, non: false },
        commentaires: ''
      },
      integration: {
        nouerConnaissances: { oui: false, non: false },
        communiquerAutres: { oui: false, non: false },
        bienIntegre: { oui: false, non: false },
        commentaires: ''
      },
      travail: {
        interesseTravail: { oui: false, non: false },
        preoccupationMethodes: { oui: false, non: false },
        quantiteTravailSatisfaisante: { oui: false, non: false },
        respectDelais: { oui: false, non: false },
        commentaires: ''
      },
      competences: {
        competencesNecessaires: { oui: false, non: false },
        besoinApprendreNouveau: { oui: false, non: false },
        capaciteApprendre: { oui: false, non: false },
        ameliorerCompetences: { oui: false, non: false },
        autonome: { oui: false, non: false },
        aiderAutres: { oui: false, non: false },
        commentaires: ''
      },
      evaluationGlobale: {
        satisfaitDebutStage: { oui: false, non: false },
        pointsFortsFaibles: ''
      }
    });
    setSelectedEtudiant('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Erreur de connexion: {error}
        <Button sx={{ ml: 2 }} onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </Alert>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, maxWidth: 1200, margin: 'auto', bgcolor: 'white' }}>
      {/* En-tête principal */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: '#000',
            fontSize: '28px',
            mb: 3
          }}
        >
          Fiche d'évaluation mi-parcours
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#000',
            fontSize: '16px',
            mb: 3
          }}
        >
          La présente fiche doit être remplie le jour de la visite de l'encadrant académique à l'entreprise.
        </Typography>

        {/* Sélection de l'étudiant */}
        <Box sx={{ mb: 3, maxWidth: 400, margin: '0 auto' }}>
          <FormControl fullWidth>
            <InputLabel>Sélectionner un étudiant</InputLabel>
            <Select
              value={selectedEtudiant}
              label="Sélectionner un étudiant"
              onChange={(e) => setSelectedEtudiant(e.target.value)}
            >
              {etudiants.map((etudiant) => (
                <MenuItem key={etudiant.etudiantId} value={etudiant.etudiantId}>
                  {etudiant.nom} {etudiant.prenom} - {etudiant.etudiantId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Informations générales */}
        <Grid container spacing={2} sx={{ maxWidth: 800, margin: '0 auto', mb: 4 }}>
          {[
            { label: "Nom de l'encadrant entreprise", field: "nomEncadrantEntreprise", width: 6 },
            { label: "Nom de l'encadrant académique", field: "nomEncadrantAcademique", width: 6 },
            { label: "Organisme", field: "organisme", width: 6 },
            { label: "Numéro de téléphone", field: "telephone", width: 6 },
            { label: "Adresse mail", field: "email", width: 6 },
            { label: "Nom du stagiaire", field: "nomStagiaire", width: 6 }
          ].map((info, index) => (
            <Grid item xs={info.width} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 180,
                    color: '#000',
                    fontSize: '14px'
                  }}
                >
                  {info.label}
                </Typography>
                <TextField
                  size="small"
                  value={informationsGenerales[info.field]}
                  onChange={(e) => handleInfoGeneraleChange(info.field, e.target.value)}
                  sx={{ 
                    flex: 1, 
                    ml: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1
                    }
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        <Typography 
          variant="body1" 
          sx={{ 
            color: '#000',
            fontSize: '14px',
            mb: 3
          }}
        >
          Veuillez répondre aux questions suivantes en cochant la bonne réponse. N'hésitez pas à ajouter des commentaires si besoin.
        </Typography>
      </Box>

      {/* Section PONCTUALITE AU TRAVAIL */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#000',
            fontSize: '18px',
            mb: 2
          }}
        >
          PONCTUALITE AU TRAVAIL :
        </Typography>

        <TableContainer component={Paper} sx={{ border: '1px solid #000' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '60%' }}>
                  Situation
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Oui
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Non
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Le stagiaire s'est-il informé de lui-même des horaires à respecter?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.ponctualite.informeHoraires.oui}
                    onChange={() => handleCheckboxChange('ponctualite', 'informeHoraires', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.ponctualite.informeHoraires.non}
                    onChange={() => handleCheckboxChange('ponctualite', 'informeHoraires', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Est-il ponctuel ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.ponctualite.ponctuel.oui}
                    onChange={() => handleCheckboxChange('ponctualite', 'ponctuel', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.ponctualite.ponctuel.non}
                    onChange={() => handleCheckboxChange('ponctualite', 'ponctuel', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000', mb: 1 }}>
            Commentaires :
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={reponses.ponctualite.commentaires}
            onChange={(e) => handleCommentaireChange('ponctualite', e.target.value)}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
        </Box>
      </Box>

      {/* Section INTEGRATION DANS L'ENTREPRISE */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#000',
            fontSize: '18px',
            mb: 2
          }}
        >
          INTEGRATION DANS L'ENTREPRISE :
        </Typography>

        <TableContainer component={Paper} sx={{ border: '1px solid #000' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '60%' }}>
                  Situation
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Oui
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Non
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Le stagiaire a-t-il cherché dès le début à nouer des connaissances ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.integration.nouerConnaissances.oui}
                    onChange={() => handleCheckboxChange('integration', 'nouerConnaissances', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.integration.nouerConnaissances.non}
                    onChange={() => handleCheckboxChange('integration', 'nouerConnaissances', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Cherche-t-il à communiquer avec les autres ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.integration.communiquerAutres.oui}
                    onChange={() => handleCheckboxChange('integration', 'communiquerAutres', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.integration.communiquerAutres.non}
                    onChange={() => handleCheckboxChange('integration', 'communiquerAutres', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  D'après vous, est-il déjà bien intégré parmi les membres de votre service ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.integration.bienIntegre.oui}
                    onChange={() => handleCheckboxChange('integration', 'bienIntegre', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.integration.bienIntegre.non}
                    onChange={() => handleCheckboxChange('integration', 'bienIntegre', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000', mb: 1 }}>
            Commentaires :
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={reponses.integration.commentaires}
            onChange={(e) => handleCommentaireChange('integration', e.target.value)}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
        </Box>
      </Box>

      {/* Section TRAVAIL */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#000',
            fontSize: '18px',
            mb: 2
          }}
        >
          TRAVAIL :
        </Typography>

        <TableContainer component={Paper} sx={{ border: '1px solid #000' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '60%' }}>
                  Situation
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Oui
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Non
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Est-il intéressé par son travail ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.travail.interesseTravail.oui}
                    onChange={() => handleCheckboxChange('travail', 'interesseTravail', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.travail.interesseTravail.non}
                    onChange={() => handleCheckboxChange('travail', 'interesseTravail', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  S'est-il préoccupé des méthodes de travail de l'entreprise ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.travail.preoccupationMethodes.oui}
                    onChange={() => handleCheckboxChange('travail', 'preoccupationMethodes', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.travail.preoccupationMethodes.non}
                    onChange={() => handleCheckboxChange('travail', 'preoccupationMethodes', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  La quantité de travail fournie est elle satisfaisante ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.travail.quantiteTravailSatisfaisante.oui}
                    onChange={() => handleCheckboxChange('travail', 'quantiteTravailSatisfaisante', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.travail.quantiteTravailSatisfaisante.non}
                    onChange={() => handleCheckboxChange('travail', 'quantiteTravailSatisfaisante', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Respecte-t-il les délais ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.travail.respectDelais.oui}
                    onChange={() => handleCheckboxChange('travail', 'respectDelais', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.travail.respectDelais.non}
                    onChange={() => handleCheckboxChange('travail', 'respectDelais', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000', mb: 1 }}>
            Commentaires :
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={reponses.travail.commentaires}
            onChange={(e) => handleCommentaireChange('travail', e.target.value)}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
        </Box>
      </Box>

      {/* Section COMPETENCES TECHNIQUES */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#000',
            fontSize: '18px',
            mb: 2
          }}
        >
          COMPETENCES TECHNIQUES :
        </Typography>

        <TableContainer component={Paper} sx={{ border: '1px solid #000' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '60%' }}>
                  Situation
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Oui
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Non
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Possède-t-il les compétences techniques nécessaires pour son travail ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.competencesNecessaires.oui}
                    onChange={() => handleCheckboxChange('competences', 'competencesNecessaires', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.competencesNecessaires.non}
                    onChange={() => handleCheckboxChange('competences', 'competencesNecessaires', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  A-t-il eu besoin d'apprendre une nouvelle technique ou un nouveau logiciel
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.besoinApprendreNouveau.oui}
                    onChange={() => handleCheckboxChange('competences', 'besoinApprendreNouveau', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.besoinApprendreNouveau.non}
                    onChange={() => handleCheckboxChange('competences', 'besoinApprendreNouveau', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Si oui, a-t-il montré sa capacité à apprendre ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.capaciteApprendre.oui}
                    onChange={() => handleCheckboxChange('competences', 'capaciteApprendre', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.capaciteApprendre.non}
                    onChange={() => handleCheckboxChange('competences', 'capaciteApprendre', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Cherche-t-il à améliorer ses compétences dans certains domaines ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.ameliorerCompetences.oui}
                    onChange={() => handleCheckboxChange('competences', 'ameliorerCompetences', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.ameliorerCompetences.non}
                    onChange={() => handleCheckboxChange('competences', 'ameliorerCompetences', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Est-il autonome ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.autonome.oui}
                    onChange={() => handleCheckboxChange('competences', 'autonome', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.autonome.non}
                    onChange={() => handleCheckboxChange('competences', 'autonome', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Cherche-t-il à aider les autres ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.aiderAutres.oui}
                    onChange={() => handleCheckboxChange('competences', 'aiderAutres', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.competences.aiderAutres.non}
                    onChange={() => handleCheckboxChange('competences', 'aiderAutres', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000', mb: 1 }}>
            Commentaires :
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={reponses.competences.commentaires}
            onChange={(e) => handleCommentaireChange('competences', e.target.value)}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
        </Box>
      </Box>

      {/* Section EVALUATION GLOBALE */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#000',
            fontSize: '18px',
            mb: 2
          }}
        >
          EVALUATION GLOBALE :
        </Typography>

        <TableContainer component={Paper} sx={{ border: '1px solid #000', mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '60%' }}>
                  Situation
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Oui
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#000', border: '1px solid #000', width: '20%' }}>
                  Non
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000' }}>
                  Etes-vous globalement satisfait du début de ce stage ?
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.evaluationGlobale.satisfaitDebutStage.oui}
                    onChange={() => handleCheckboxChange('evaluationGlobale', 'satisfaitDebutStage', 'oui')}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="center" sx={{ border: '1px solid #000' }}>
                  <Checkbox
                    checked={reponses.evaluationGlobale.satisfaitDebutStage.non}
                    onChange={() => handleCheckboxChange('evaluationGlobale', 'satisfaitDebutStage', 'non')}
                    color="primary"
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000', mb: 1 }}>
            Quels sont d'après vous les points forts et les points faibles de ce stagiaire ?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={reponses.evaluationGlobale.pointsFortsFaibles}
            onChange={(e) => handlePointsFortsFaiblesChange(e.target.value)}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
        </Box>
      </Box>

      {/* Boutons d'action */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        <Button 
          variant="outlined" 
          onClick={handleReset}
          sx={{ borderRadius: 2 }}
        >
          Réinitialiser
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ borderRadius: 2 }}
        >
          Imprimer
        </Button>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
          disabled={!selectedEtudiant}
          sx={{ borderRadius: 2 }}
        >
          Sauvegarder l'évaluation
        </Button>
      </Box>

      {/* Dialog de confirmation de sauvegarde */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>
          Confirmer la sauvegarde
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir sauvegarder cette fiche d'évaluation mi-parcours pour l'étudiant sélectionné ?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Cette action enregistrera définitivement l'évaluation.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleSaveEvaluation} variant="contained" startIcon={<SaveIcon />}>
            Confirmer la sauvegarde
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
  );
};

export default FicheEvaluationMiParcours;