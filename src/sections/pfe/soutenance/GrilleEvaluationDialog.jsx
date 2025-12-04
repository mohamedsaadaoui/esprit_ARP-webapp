import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  List,
  ListItem,
  ListItemText,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Info as InfoIcon,
  Warning as WarningIcon,
  Help as HelpIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { evaluationService } from './evaluationService';
import { useSnackbar } from 'src/components/snackbar';

// 🆕 Configuration des contraintes de saisie basée sur votre base de données
const VALIDATION_RULES = {
  livrables: {
    planning: { min: 0, max: 3, step: 0.5, label: "Planning de stage" },
    bilanDebut: { min: 0, max: 1, step: 0.5, label: "Bilan début de stage" },
    bilanMilieu: { min: 0, max: 1, step: 0.5, label: "Bilan milieu de stage" },
    bilanFin: { min: 0, max: 1, step: 0.5, label: "Bilan fin de stage" },
    journal: { min: 0, max: 1, step: 0.5, label: "Journal de bord" }
  },
  fichesEvaluation: {
    miParcours: { min: 0, max: 2, step: 1, label: "Fiche mi-parcours" },
    finale: { min: 0, max: 2, step: 1, label: "Fiche finale" }
  },
  rdv: {
    premiereRestitution: { min: 0, max: 4.5, step: 0.5, label: "1ère restitution" },
    deuxiemeRestitution: { min: 0, max: 4.5, step: 0.5, label: "2ème restitution" }
  },
  notesGlobales: {
    noteAppreciationGlobale: { min: 0, max: 20, step: 0.5, label: "Note d'appréciation globale" },
    noteExpert: { min: 0, max: 20, step: 0.5, label: "Note expert" },
    noteEncadrantEntreprise: { min: 0, max: 20, step: 0.5, label: "Note encadrant entreprise" }
  }
};

// 🆕 Messages d'aide contextuels
const HELP_MESSAGES = {
  livrables: {
    planning: "3 pts si rendu à temps, 2 pts si en retard, 0 pt si non rendu",
    bilanDebut: "1 pt si rendu à temps, 0.5 pt si en retard, 0 pt si non rendu",
    bilanMilieu: "1 pt si rendu à temps, 0.5 pt si en retard, 0 pt si non rendu",
    bilanFin: "1 pt si rendu à temps, 0.5 pt si en retard, 0 pt si non rendu",
    journal: "1 pt si tenu régulièrement, 0.5 pt si incomplet, 0 pt si non tenu"
  },
  fichesEvaluation: {
    miParcours: "2 pts si satisfait, 1 pt si moyennement satisfait",
    finale: "2 pts si satisfait, 1 pt si moyennement satisfait"
  },
  rdv: {
    premiereRestitution: "4.5 pts si assurée, 0 pt si non assurée",
    deuxiemeRestitution: "4.5 pts si assurée, 0 pt si non assurée"
  }
};

const GrilleEvaluationDialog = ({ open, onClose, soutenance, grilleType, etudiant, statutSoutenance }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [helpDialog, setHelpDialog] = useState({ open: false, title: '', content: '' });
  
  // États pour les notes
  const [livrables, setLivrables] = useState({
    planning: 0,
    bilanDebut: 0,
    bilanMilieu: 0,
    bilanFin: 0,
    journal: 0
  });

  const [fichesEvaluation, setFichesEvaluation] = useState({
    miParcours: 0,
    finale: 0
  });

  const [rdv, setRdv] = useState({
    premiereRestitution: 0,
    deuxiemeRestitution: 0
  });

  const [noteAppreciationGlobale, setNoteAppreciationGlobale] = useState(0);
  const [noteExpert, setNoteExpert] = useState(0);
  const [noteEncadrantEntreprise, setNoteEncadrantEntreprise] = useState(0);
  const [commentaire, setCommentaire] = useState('');

  // 🆕 Fonction de validation améliorée
  const validateField = (category, field, value) => {
    const rules = VALIDATION_RULES[category]?.[field];
    if (!rules) return true;

    const { min, max } = rules;
    const numValue = parseFloat(value) || 0;

    if (numValue < min || numValue > max) {
      return `Doit être entre ${min} et ${max}`;
    }

    // Validation du step
    const step = rules.step;
    if (step && (numValue % step !== 0)) {
      return `Doit être un multiple de ${step}`;
    }

    return null;
  };

  // 🆕 Gestionnaire de changement avec validation en temps réel
  const handleNumberChange = (setter, category, field, value) => {
    const numValue = parseFloat(value) || 0;
    const error = validateField(category, field, numValue);

    setValidationErrors(prev => ({
      ...prev,
      [`${category}.${field}`]: error
    }));

    setter(prev => ({ ...prev, [field]: numValue }));
  };

  // 🆕 Fonction pour ouvrir l'aide contextuelle
  const openHelp = (category, field) => {
    const message = HELP_MESSAGES[category]?.[field];
    const rules = VALIDATION_RULES[category]?.[field];
    
    if (message && rules) {
      setHelpDialog({
        open: true,
        title: rules.label,
        content: message
      });
    }
  };

  // 🆕 Validation globale avant soumission
  const validateAllFields = () => {
    const errors = {};

    // Validation des livrables
    Object.keys(livrables).forEach(field => {
      const error = validateField('livrables', field, livrables[field]);
      if (error) errors[`livrables.${field}`] = error;
    });

    // Validation des fiches d'évaluation
    Object.keys(fichesEvaluation).forEach(field => {
      const error = validateField('fichesEvaluation', field, fichesEvaluation[field]);
      if (error) errors[`fichesEvaluation.${field}`] = error;
    });

    // Validation des RDV
    Object.keys(rdv).forEach(field => {
      const error = validateField('rdv', field, rdv[field]);
      if (error) errors[`rdv.${field}`] = error;
    });

    // Validation des notes globales
    Object.keys(VALIDATION_RULES.notesGlobales).forEach(field => {
      const value = field === 'noteAppreciationGlobale' ? noteAppreciationGlobale :
                   field === 'noteExpert' ? noteExpert : noteEncadrantEntreprise;
      const error = validateField('notesGlobales', field, value);
      if (error) errors[`notesGlobales.${field}`] = error;
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🆕 Composant de champ avec validation et aide
  const ValidatedNumberField = ({ 
    value, 
    onChange, 
    category, 
    field, 
    rules, 
    helpMessage,
    ...props 
  }) => {
    const errorKey = `${category}.${field}`;
    const hasError = !!validationErrors[errorKey];
    const errorMessage = validationErrors[errorKey];

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          type="number"
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={hasError}
          helperText={hasError ? errorMessage : ''}
          inputProps={{ 
            min: rules.min, 
            max: rules.max, 
            step: rules.step,
            style: { textAlign: 'center' }
          }}
          sx={{ 
            width: 100,
            '& .MuiFormHelperText-root': {
              textAlign: 'center',
              margin: 0,
              fontSize: '0.7rem'
            }
          }}
          {...props}
        />
        <Tooltip title="Aide">
          <IconButton 
            size="small" 
            onClick={() => openHelp(category, field)}
            color="info"
          >
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {!hasError && value > 0 && (
          <CheckCircleIcon color="success" fontSize="small" />
        )}
      </Box>
    );
  };

  // Calcul des notes intermédiaires
  const calculateNoteLivrables = () => {
    return Object.values(livrables).reduce((sum, note) => sum + note, 0);
  };

  const calculateNoteFiches = () => {
    return Object.values(fichesEvaluation).reduce((sum, note) => sum + note, 0);
  };

  const calculateNoteRdv = () => {
    return Object.values(rdv).reduce((sum, note) => sum + note, 0);
  };

  const calculateNoteRdvPedagogiques = () => {
    return calculateNoteLivrables() + calculateNoteFiches() + calculateNoteRdv();
  };

  const calculateNoteFinaleEncadrantAcademique = () => {
    const noteRdv = calculateNoteRdvPedagogiques();
    return (noteRdv * 0.8) + (noteAppreciationGlobale * 0.2);
  };

  const calculateNoteFinaleEncadrement = () => {
    const noteAcademique = calculateNoteFinaleEncadrantAcademique();
    return (noteAcademique * 0.4) + (noteExpert * 0.4) + (noteEncadrantEntreprise * 0.2);
  };

  const handleSubmit = async () => {
    // 🆕 Validation avant soumission
    if (!validateAllFields()) {
      enqueueSnackbar('Veuillez corriger les erreurs de saisie avant de soumettre', { 
        variant: 'error',
        autoHideDuration: 5000 
      });
      return;
    }

    try {
      setSaving(true);
      
      const evaluationData = {
        soutenanceId: soutenance.id,
        typeGrille: grilleType,
        evaluateurId: "P-03-06",
        notes: {
          livrables,
          fichesEvaluation,
          rdv,
          noteAppreciationGlobale,
          noteExpert,
          noteEncadrantEntreprise
        },
        noteFinale: calculateNoteFinaleEncadrement(),
        noteEncadrantAcademique: calculateNoteFinaleEncadrantAcademique(),
        noteRdvPedagogiques: calculateNoteRdvPedagogiques(),
        commentaire: commentaire,
        statut: 'SOUMIS'
      };

      await evaluationService.createEvaluation(evaluationData);
      
      enqueueSnackbar('Évaluation sauvegardée avec succès!', { variant: 'success' });
      onClose();
      
    } catch (error) {
      console.error('Erreur sauvegarde évaluation:', error);
      enqueueSnackbar('Erreur lors de la sauvegarde', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // 🆕 Rendu des indicateurs de validation
  const renderValidationSummary = () => {
    const totalFields = Object.keys(VALIDATION_RULES.livrables).length + 
                       Object.keys(VALIDATION_RULES.fichesEvaluation).length + 
                       Object.keys(VALIDATION_RULES.rdv).length + 
                       Object.keys(VALIDATION_RULES.notesGlobales).length;
    
    const errorCount = Object.keys(validationErrors).length;
    const isValid = errorCount === 0;

    return (
      <Alert 
        severity={isValid ? "success" : "warning"}
        sx={{ mb: 2 }}
        icon={isValid ? <CheckCircleIcon /> : <WarningIcon />}
      >
        {isValid 
          ? "Tous les champs sont correctement remplis ✓"
          : `${errorCount} erreur(s) à corriger avant soumission`
        }
      </Alert>
    );
  };

  // Rendu de la grille académique améliorée
  const renderGrilleAcademique = () => (
    <Box>
      {renderValidationSummary()}

      {/* En-tête avec informations étudiant */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Grille encadrant académique
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography><strong>Nom de l'étudiant:</strong> {etudiant?.nom || 'Non spécifié'}</Typography>
              <Typography><strong>Département:</strong> {etudiant?.departement || 'Non spécifié'}</Typography>
              <Typography><strong>Option:</strong> {etudiant?.option || 'Non spécifié'}</Typography>
              <Typography><strong>Email:</strong> {etudiant?.email || 'Non spécifié'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Date de dépôt:</strong> {new Date().toLocaleDateString()}</Typography>
              <Typography><strong>Entreprise d'accueil:</strong> {getEntrepriseInfo()}</Typography>
              <Typography><strong>Nom du projet:</strong> {getProjetInfo()}</Typography>
              <Typography><strong>Statut soutenance:</strong> 
                <Chip 
                  label={statutSoutenance} 
                  size="small" 
                  color={statutSoutenance === 'TERMINEE' ? 'success' : 'default'}
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Section Note RDV pédagogiques */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Note RDV pédagogiques
          </Typography>

          {/* Tableau Livrables */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Livrables (7 points)
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Livrable</strong></TableCell>
                  <TableCell align="center"><strong>Dûment rempli et rendu à temps</strong></TableCell>
                  <TableCell align="center"><strong>Dûment rempli et rendu en retard</strong></TableCell>
                  <TableCell align="center"><strong>Non rendu</strong></TableCell>
                  <TableCell align="center"><strong>Note</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(VALIDATION_RULES.livrables).map((field) => (
                  <TableRow key={field}>
                    <TableCell>
                      {VALIDATION_RULES.livrables[field].label}
                    </TableCell>
                    <TableCell align="center">
                      {field === 'planning' ? '3 pts' : '1 pt'}
                    </TableCell>
                    <TableCell align="center">
                      {field === 'planning' ? '2 pts' : '0.5 pt'}
                    </TableCell>
                    <TableCell align="center">0 pt</TableCell>
                    <TableCell align="center">
                      <ValidatedNumberField
                        value={livrables[field]}
                        onChange={(value) => handleNumberChange(setLivrables, 'livrables', field, value)}
                        category="livrables"
                        field={field}
                        rules={VALIDATION_RULES.livrables[field]}
                        helpMessage={HELP_MESSAGES.livrables[field]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Tableau Fiches d'évaluation */}
          <Typography variant="h6" gutterBottom>
            Fiches d'évaluation (4 pts)
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Fiche d'évaluation</strong></TableCell>
                  <TableCell align="center"><strong>Encadrant satisfait</strong></TableCell>
                  <TableCell align="center"><strong>Encadrant moyennement satisfait</strong></TableCell>
                  <TableCell align="center"><strong>Note</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(VALIDATION_RULES.fichesEvaluation).map((field) => (
                  <TableRow key={field}>
                    <TableCell>
                      {VALIDATION_RULES.fichesEvaluation[field].label}
                    </TableCell>
                    <TableCell align="center">2 pts</TableCell>
                    <TableCell align="center">1 pt</TableCell>
                    <TableCell align="center">
                      <ValidatedNumberField
                        value={fichesEvaluation[field]}
                        onChange={(value) => handleNumberChange(setFichesEvaluation, 'fichesEvaluation', field, value)}
                        category="fichesEvaluation"
                        field={field}
                        rules={VALIDATION_RULES.fichesEvaluation[field]}
                        helpMessage={HELP_MESSAGES.fichesEvaluation[field]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Tableau RDV pédagogiques */}
          <Typography variant="h6" gutterBottom>
            RDV pédagogiques* (9 points)
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>RDV</strong></TableCell>
                  <TableCell align="center"><strong>Assurée</strong></TableCell>
                  <TableCell align="center"><strong>Non assurée</strong></TableCell>
                  <TableCell align="center"><strong>Note</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(VALIDATION_RULES.rdv).map((field) => (
                  <TableRow key={field}>
                    <TableCell>
                      {VALIDATION_RULES.rdv[field].label}
                    </TableCell>
                    <TableCell align="center">4.5 pts</TableCell>
                    <TableCell align="center">0 pt</TableCell>
                    <TableCell align="center">
                      <ValidatedNumberField
                        value={rdv[field]}
                        onChange={(value) => handleNumberChange(setRdv, 'rdv', field, value)}
                        category="rdv"
                        field={field}
                        rules={VALIDATION_RULES.rdv[field]}
                        helpMessage={HELP_MESSAGES.rdv[field]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" align="right">
            Note RDV pédagogiques: <strong>{calculateNoteRdvPedagogiques().toFixed(2)}/20</strong>
          </Typography>
        </CardContent>
      </Card>

      {/* Note finale encadrant académique */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Note finale encadrant académique = (Note RDV pédagogiques * 80% + Note d'appréciation globale * 20%)
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Note RDV pédagogiques</Typography>
              <TextField
                fullWidth
                type="number"
                value={calculateNoteRdvPedagogiques().toFixed(2)}
                InputProps={{ readOnly: true }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom>Note d'appréciation globale</Typography>
              <ValidatedNumberField
                fullWidth
                value={noteAppreciationGlobale}
                onChange={(value) => {
                  const numValue = parseFloat(value) || 0;
                  const error = validateField('notesGlobales', 'noteAppreciationGlobale', numValue);
                  setValidationErrors(prev => ({
                    ...prev,
                    'notesGlobales.noteAppreciationGlobale': error
                  }));
                  setNoteAppreciationGlobale(numValue);
                }}
                category="notesGlobales"
                field="noteAppreciationGlobale"
                rules={VALIDATION_RULES.notesGlobales.noteAppreciationGlobale}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">
                Note finale encadrant académique: <strong>{calculateNoteFinaleEncadrantAcademique().toFixed(2)}/20</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }}>
        <Chip label="esprt So former autrement" />
      </Divider>

      {/* Synthèse de la note d'encadrement */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Synthèse de la note d'encadrement :
          </Typography>
          <Typography variant="h6" gutterBottom>
            Note finale encadrement = (Note encadrant académique * 40% + Note expert * 40% + Note encadrant professionnel * 20%)
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Note encadrant académique</Typography>
              <TextField
                fullWidth
                type="number"
                value={calculateNoteFinaleEncadrantAcademique().toFixed(2)}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Note expert</Typography>
              <ValidatedNumberField
                fullWidth
                value={noteExpert}
                onChange={(value) => {
                  const numValue = parseFloat(value) || 0;
                  const error = validateField('notesGlobales', 'noteExpert', numValue);
                  setValidationErrors(prev => ({
                    ...prev,
                    'notesGlobales.noteExpert': error
                  }));
                  setNoteExpert(numValue);
                }}
                category="notesGlobales"
                field="noteExpert"
                rules={VALIDATION_RULES.notesGlobales.noteExpert}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Note encadrant entreprise</Typography>
              <ValidatedNumberField
                fullWidth
                value={noteEncadrantEntreprise}
                onChange={(value) => {
                  const numValue = parseFloat(value) || 0;
                  const error = validateField('notesGlobales', 'noteEncadrantEntreprise', numValue);
                  setValidationErrors(prev => ({
                    ...prev,
                    'notesGlobales.noteEncadrantEntreprise': error
                  }));
                  setNoteEncadrantEntreprise(numValue);
                }}
                category="notesGlobales"
                field="noteEncadrantEntreprise"
                rules={VALIDATION_RULES.notesGlobales.noteEncadrantEntreprise}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" align="center">
                Note finale d'encadrement: <strong>{calculateNoteFinaleEncadrement().toFixed(2)}/20</strong>
              </Typography>
            </Grid>
          </Grid>

          {/* Signature */}
          <Box sx={{ mt: 4, textAlign: 'right' }}>
            <Typography variant="body2">
              Date et Signature
            </Typography>
            <Divider sx={{ my: 1, width: 200, display: 'inline-block' }} />
          </Box>
        </CardContent>
      </Card>

      {/* Commentaire global */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
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
        </CardContent>
      </Card>
    </Box>
  );

  // 🆕 Fonctions utilitaires (à garder de votre code précédent)
  const getProjetInfo = () => {
    if (soutenance?.idAffectationStage?.stage?.titreStage) {
      return soutenance.idAffectationStage.stage.titreStage;
    }
    if (soutenance?.projet) {
      return soutenance.projet;
    }
    return 'Non spécifié';
  };

  const getEntrepriseInfo = () => {
    if (etudiant?.entreprise) {
      return etudiant.entreprise;
    }
    if (soutenance?.idAffectationStage?.entreprise?.nomEntreprise) {
      return soutenance.idAffectationStage.entreprise.nomEntreprise;
    }
    return 'Non spécifié';
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">
              Évaluation - {grilleType === 'ACADEMIQUE' ? 'Grille Académique' : 
                           grilleType === 'ENTREPRISE' ? 'Grille Entreprise' :
                           grilleType === 'EXPERT' ? 'Grille Expert' : 'Grille Soutenance'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip 
                label={`Statut: ${statutSoutenance}`} 
                color={statutSoutenance === 'TERMINEE' ? 'success' : 'warning'} 
              />
              <Chip 
                label={`Note finale: ${calculateNoteFinaleEncadrement().toFixed(2)}/20`} 
                color="primary" 
                variant="filled"
              />
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Chargement de la grille...</Typography>
            </Box>
          ) : (
            renderGrilleAcademique()
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={saving || statutSoutenance !== 'TERMINEE'}
            startIcon={saving ? <CircularProgress size={20} /> : null}
            title={statutSoutenance !== 'TERMINEE' ? "L'évaluation n'est disponible que pour les soutenances terminées" : ""}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder l\'évaluation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🆕 Dialogue d'aide contextuelle */}
      <MuiDialog
        open={helpDialog.open}
        onClose={() => setHelpDialog({ open: false, title: '', content: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <InfoIcon color="info" />
            <Typography variant="h6">Aide - {helpDialog.title}</Typography>
          </Box>
        </DialogTitle>
        <MuiDialogContent>
          <Typography>{helpDialog.content}</Typography>
        </MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={() => setHelpDialog({ open: false, title: '', content: '' })}>
            Fermer
          </Button>
        </MuiDialogActions>
      </MuiDialog>
    </>
  );
};

export default GrilleEvaluationDialog;