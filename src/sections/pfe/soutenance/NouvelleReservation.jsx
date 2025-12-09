/* eslint-disable no-nested-ternary */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Close as CloseIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  MeetingRoom as RoomIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from "@mui/icons-material";
import {
  Box,
  Card,
  Grid,
  Chip,
  Step,
  Alert,
  Paper,
  Button,
  Dialog,
  Avatar,
  Divider,
  Stepper,
  MenuItem,
  Checkbox,
  Snackbar,
  TextField,
  StepLabel,
  Typography,
  DialogTitle,
  CardContent,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormControlLabel,
  CircularProgress,

} from "@mui/material";

import soutenanceService from "src/services/pfe-services/soutenanceService";



// 🆕 Composant d'item de détail pour le résumé
const DetailItem = ({ icon, label, value }) => (
  <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
    <Box sx={{ color: 'primary.main', mt: 0.5 }}>{icon}</Box>
    <Box flex={1}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}:
      </Typography>
      <Typography variant="body1" fontWeight="medium">
        {value}
      </Typography>
    </Box>
  </Box>
);

const NouvelleReservation = ({ defaultDate, defaultHeureDebut, defaultHeureFin }) => {
  const [salles, setSalles] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [dialogJuryOpen, setDialogJuryOpen] = useState(false);

  // Initialiser avec des tableaux vides et valider les IDs
  const [selectedPresident, setSelectedPresident] = useState("");
  const [selectedMembres, setSelectedMembres] = useState([]);

  // 🔔 Notifications modernes
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Steps pour le processus - Étape 0 (Sélection de salle) automatique, on commence à étape 1
  const [activeStep, setActiveStep] = useState(1);
  const steps = ['Choix de l\'étudiant', 'Configuration du jury', 'Confirmation'];

  // Filtres pour les salles
  // CORRECTION : Initialisation des filtres avec date du jour par défaut
  const [filters, setFilters] = useState({
    date: location.state?.date || defaultDate || new Date().toISOString().split('T')[0],
    heureDebut: location.state?.heureDebut || defaultHeureDebut || "08:00",
    heureFin: location.state?.heureFin || defaultHeureFin || "18:00"
  });

  const [form, setForm] = useState({
    soutenanceId: null,
    salleId: location.state?.salleId || "",
    etudiant: "",
    affectationStageId: null,
    president: "",
    membresJury: [],
    sujet: "",
    date: location.state?.date || defaultDate || new Date().toISOString().split('T')[0],
    heureDebut: location.state?.heureDebut || defaultHeureDebut || "08:00",
    heureFin: location.state?.heureFin || defaultHeureFin || "18:00"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };


  // 🆕 Auto-sélectionner la salle et l'étudiant si passés via le state
  useEffect(() => {
    if (location.state?.autoSelectSalle && location.state?.salleId && salles.length > 0) {
      // Trouver la salle dans la liste
      const salle = salles.find(s => s.id === location.state.salleId);

      if (salle) {
        // Formater la date si nécessaire
        let dateStr = salle.dateRecherche || location.state.selectedDate;
        if (dateStr instanceof Date) {
          dateStr = dateStr.toISOString().split('T')[0];
        }

        // Normaliser les heures (enlever les secondes si présentes)
        const heureDebut = salle.creneauDebut?.substring(0, 5) || "08:00";
        const heureFin = salle.creneauFin?.substring(0, 5) || "18:00";

        setForm(prev => ({
          ...prev,
          salleId: location.state.salleId,
          date: dateStr,
          heureDebut,
          heureFin,
          etudiant: location.state.etudiantId || "223AMT4058" // 🆕 Pré-remplir avec l'ID étudiant
        }));
      }
    }
  }, [salles, location.state]);

  // 🆕 Initialiser l'étudiant statique au démarrage
  useEffect(() => {
    const etudiantStatique = {
      etudiantId: "223AMT4058",
      nom: "Ghodbane",
      prenom: "Jawhar",
      email: "jawhar.ghodbane@esprit.tn",
      phone: "+216 25 555 555",
      classe: "4ALINFO9",
      specialite: "Informatique"
    };

    // Ajouter l'étudiant statique à la liste si ce n'est pas déjà fait
    setEtudiants(prev => {
      const exists = prev.some(e => e.etudiantId === "223AMT4058");
      return exists ? prev : [etudiantStatique, ...prev];
    });

    // Auto-selectionner l'etudiant pour les tests
    setForm(prev => ({
      ...prev,
      etudiant: "223AMT4058",
      date: prev.date || new Date().toISOString().split('T')[0]
    }));
  }, []);

  // 🔹 Charger enseignants disponibles
  const fetchEnseignants = async () => {
    if (!form.date || !form.heureDebut || !form.heureFin) return;

    try {
      const listEnseignant = await soutenanceService.getAllEnseignants();
      setEmployes(listEnseignant.data.data);
    } catch (error) {
      console.error("Erreur chargement enseignants:", error);
      showSnackbar("Erreur lors du chargement des enseignants", "error");
    }
  };

  // Charger enseignants quand la date ou les horaires changent
  useEffect(() => {
    fetchEnseignants();
  }, [form.date, form.heureDebut, form.heureFin]);



  // Validation des horaires
  const validateTimeSlot = () => {
    const errors = [];

    if (!form.date) errors.push("La date est requise");
    if (!form.heureDebut) errors.push("L'heure de début est requise");
    if (!form.heureFin) errors.push("L'heure de fin est requise");

    if (form.heureDebut && form.heureFin) {
      if (form.heureDebut >= form.heureFin) {
        errors.push("L'heure de début doit être avant l'heure de fin");
      }
    }

    return errors;
  };

  // CORRECTION : Toggle membre avec validation
  const toggleMembre = (id) => {
    if (!id || id.trim() === "") {
      console.warn("⚠️ ID de membre invalide:", id);
      return;
    }

    setSelectedMembres(prev => {
      if (prev.includes(id)) {
        return prev.filter(m => m !== id);
      } else {
        return [...prev, id];
      }
    });
  };


  const preparePayload = () => {
    // VALIDER ET FILTRER LES IDs
    const presidentIdValide = selectedPresident && selectedPresident.trim() !== ""
      ? selectedPresident
      : null;

    const membresValides = selectedMembres
      .filter(id => id && id.trim() !== "")
      .filter(id => id !== presidentIdValide); // Éviter les doublons

    return {
      salleId: form.salleId,
      etudiantId: form.etudiant,
      affectationStageId: 20861,
      date: form.date,
      heureDebut: form.heureDebut,
      heureFin: form.heureFin,
      presidentId: "V-861-13",
      membresJuryIds: membresValides
    };
  };

  // Submit formulaire planification
  const handleSubmit = async () => {
    // Validation
    const errors = validateTimeSlot();
    if (errors.length > 0) {
      showSnackbar(errors[0], "error");
      return;
    }

    if (!form.etudiant || !form.salleId) {
      showSnackbar("Veuillez sélectionner l'étudiant et la salle !", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = preparePayload();

      const response = await soutenanceService.planifierSoutenance(payload);
      console.log("✅ Réponse de la planification:", response.data);
      // Pour l'instant, afficher un message de succès simulé
      setForm(prev => ({ ...prev, soutenanceId: Math.random() }));
      showSnackbar("Soutenance créée avec succès !", "success");
      setActiveStep(3);
    } catch (error) {
      console.error("❌ Erreur détaillée:", error);
      showSnackbar(error.message || "Erreur lors de la planification", "error");
    } finally {
      setLoading(false);
    }
  };

  const openJuryDialog = () => {
    if (!form.date || !form.heureDebut || !form.heureFin) {
      showSnackbar("Sélectionnez d'abord la date et les horaires !", "error");
      return;
    }

    if (employes.length === 0) {
      showSnackbar("Aucun enseignant disponible pour ce créneau", "warning");
      return;
    }

    setDialogJuryOpen(true);
  };

  const getNomComplet = (personne) => {
    if (!personne) return "Nom inconnu";
    return `${personne.prenom || ""} ${personne.nom || ""}`.trim() || "Nom inconnu";
  };

  // 🆕 Fonction pour obtenir la salle sélectionnée - VERSION CORRIGÉE
  const getSelectedSalle = () => salles.find(s => {
    const salleData = s.salle || s;
    return salleData.id === form.salleId;
  }); const getSelectedEtudiant = () => etudiants.find(e => e.etudiantId === form.etudiant);

  // 🆕 Navigation entre les étapes
  const handleNextStep = () => {
    if (activeStep === 1 && !form.etudiant) {
      showSnackbar("Veuillez sélectionner un étudiant", "error");
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      navigate(-1); // Retour si on est à l'étape 1
    }
  };


  // 🆕 Réinitialiser la sélection du jury
  const handleJuryDialogClose = () => {
    setDialogJuryOpen(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 3000, margin: '0 auto' }}>
      {/* En-tête */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #b53f3f 0%, #d41010 100%)' }}>
        <CardContent sx={{ color: 'white', textAlign: 'center', py: 4 }}>
          {/* <AssignmentIcon sx={{ fontSize: 48, mb: 2 }} /> */}
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Nouvelle Réservation de Soutenance
          </Typography>
          <Typography variant="h6">
            Planifiez une soutenance
          </Typography>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label} completed={index < activeStep || (index === 0 && form.salleId)}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Formulaire principal */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {/* Étape 1: Choix de l'étudiant */}
              {activeStep === 1 && (
                <Box sx={{ mb: 4 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <SchoolIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Choix de l&apos;Étudiant
                    </Typography>
                  </Box>

                  {/* Affichage visuel de l'etudiant selectionne */}
                  {getSelectedEtudiant() ? (
                    <Card sx={{ mb: 3, border: '2px solid', borderColor: 'success.main', bgcolor: 'rgba(46, 125, 50, 0.08)' }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.2rem' }}>
                            {getSelectedEtudiant().prenom?.[0]}{getSelectedEtudiant().nom?.[0]}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold">
                              {getSelectedEtudiant().prenom} {getSelectedEtudiant().nom}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {getSelectedEtudiant().etudiantId}
                            </Typography>
                            <Box display="flex" gap={1} mt={1}>
                              {getSelectedEtudiant().classe && (
                                <Chip label={getSelectedEtudiant().classe} size="small" color="primary" variant="outlined" />
                              )}
                              {getSelectedEtudiant().specialite && (
                                <Chip label={getSelectedEtudiant().specialite} size="small" color="secondary" variant="outlined" />
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Email: {getSelectedEtudiant().email}
                            </Typography>
                          </Box>
                          <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  ) : (
                    <Box display="flex" gap={2} alignItems="flex-start" mb={3}>
                      <TextField
                        label="Etudiant selectionne"
                        fullWidth
                        value=""
                        disabled
                        placeholder="Aucun etudiant selectionne"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />

                    </Box>
                  )}

                  {/* Date et Horaires dans l'étape 1 */}
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 3 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <ScheduleIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Sélectionnez les horaires
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Heure début"
                          type="time"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={form.heureDebut || ""}
                          onChange={e => setForm({ ...form, heureDebut: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Heure fin"
                          type="time"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={form.heureFin || ""}
                          onChange={e => setForm({ ...form, heureFin: e.target.value })}
                        />
                      </Grid>
                    </Grid>

                    {/* Affichage des erreurs de validation */}
                    {validateTimeSlot().length > 0 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        {validateTimeSlot()[0]}
                      </Alert>
                    )}
                  </Box>
                </Box>
              )}



              {/* Étape 3: Configuration du jury */}
              {activeStep === 2 && (
                <Box sx={{ mb: 4 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <GroupsIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Configuration du Jury
                    </Typography>
                  </Box>

                  <Box display="flex" gap={2} alignItems="flex-start">
                    <TextField
                      label="Président sélectionné"
                      fullWidth
                      value={selectedPresident ? getNomComplet(employes.find(e => e.idEmploye === selectedPresident)) : "Aucun président sélectionné"}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GroupsIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={openJuryDialog}
                      startIcon={<GroupsIcon />}
                      sx={{ minWidth: 180 }}
                    >
                      {selectedPresident ? "Modifier Jury" : "Affecter Jury"}
                    </Button>
                  </Box>

                  {selectedMembres.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Membres du jury sélectionnés ({selectedMembres.length}):
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {selectedMembres.map(membreId => {
                          const membre = employes.find(e => e.idEmploye === membreId);
                          return (
                            <Chip
                              key={membreId}
                              label={getNomComplet(membre)}
                              size="small"
                              color="primary"
                              variant="outlined"
                              onDelete={() => toggleMembre(membreId)}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                  {/* 🆕 AVERTISSEMENT SI PAS DE PRÉSIDENT */}
                  {!selectedPresident && (
                    <Alert severity="warning" sx={{ mt: 2 }} icon={<WarningIcon />}>
                      Le président du jury n&apos;est pas obligatoire mais recommandé.
                    </Alert>
                  )}
                </Box>
              )}

              {/* Étape 4: Confirmation */}
              {activeStep === 3 && (
                <Box sx={{ mb: 4 }}>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      ✅ Soutenance planifiée avec succès !
                    </Typography>
                    <Typography>
                      La soutenance a été créée avec l&apos;D: <strong>{form.soutenanceId}</strong>
                    </Typography>
                  </Alert>

                  <Typography variant="body1" color="text.secondary">
                    Vous pouvez maintenant consulter la liste des soutenances ou planifier une nouvelle soutenance.
                  </Typography>
                </Box>
              )}

              {/* Boutons d'action */}
              <Box display="flex" gap={2} justifyContent="space-between" mt={4}>
                <Button
                  variant="outlined"
                  onClick={activeStep === 1 ? () => navigate(-1) : handlePrevStep}
                  startIcon={<CloseIcon />}
                  disabled={loading}
                >
                  {activeStep === 1 ? "Annuler" : "Retour"}
                </Button>

                {activeStep < 3 ? (
                  <Button
                    variant="contained"
                    onClick={activeStep === 2 ? handleSubmit : handleNextStep}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? "Traitement..." :
                      activeStep === 2 ? "Planifier la Soutenance" : "Continuer"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => navigate("pfe/soutenances")}
                    startIcon={<CheckCircleIcon />}
                    sx={{ minWidth: 200 }}
                  >
                    Voir les Soutenances
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de résumé */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* <AssignmentIcon color="primary" /> */}
                Récapitulatif
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Indicateur de progression */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Éléments complétés:
                </Typography>
                {[
                  { key: 'salle', label: 'Salle sélectionnée', completed: !!form.salleId },
                  { key: 'etudiant', label: 'Étudiant choisi', completed: !!form.etudiant },
                  { key: 'horaires', label: 'Horaires définis', completed: !!form.date && !!form.heureDebut && !!form.heureFin },
                  { key: 'jury', label: 'Président désigné', completed: !!selectedPresident }
                ].map(({ key, label, completed }) => (
                  <Box key={key} display="flex" alignItems="center" gap={1} mb={1}>
                    {completed ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <CircularProgress size={16} />
                    )}
                    <Typography variant="body2" color={completed ? "text.primary" : "text.secondary"}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Détails de la réservation */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Détails de la réservation:
                </Typography>

                {getSelectedSalle() && (
                  <DetailItem
                    icon={<RoomIcon />}
                    label="Salle"
                    value={getSelectedSalle().salle.nom}
                  />
                )}

                {getSelectedEtudiant() && (
                  <DetailItem
                    icon={<SchoolIcon />}
                    label="Étudiant"
                    value={`${getSelectedEtudiant().nom} ${getSelectedEtudiant().prenom}`}
                  />
                )}

                {form.date && (
                  <DetailItem
                    icon={<ScheduleIcon />}
                    label="Date et heure"
                    value={`${form.date} • ${form.heureDebut} - ${form.heureFin}`}
                  />
                )}

                {selectedPresident && (
                  <DetailItem
                    icon={<GroupsIcon />}
                    label="Président"
                    value={getNomComplet(employes.find(e => e.idEmploye === selectedPresident))}
                  />
                )}

                {selectedMembres.length > 0 && (
                  <DetailItem
                    icon={<PersonIcon />}
                    label="Membres du jury"
                    value={`${selectedMembres.length} membre(s)`}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



      {/* Dialog Jury - VERSION CORRIGÉE */}
      <Dialog open={dialogJuryOpen} onClose={handleJuryDialogClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupsIcon color="primary" />
          Composition du Jury
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Sélectionnez le président et les membres du jury. Le président n&apos;est pas obligatoire.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Président du Jury</Typography>
              <TextField
                select
                label="Sélectionner le président"
                fullWidth
                value={selectedPresident || ""}
                onChange={e => setSelectedPresident(e.target.value)}
                helperText="Optionnel mais recommandé"
              >
                <MenuItem value="">
                  <em>Aucun président</em>
                </MenuItem>
                {employes.map((emp) => (
                  <MenuItem key={emp?.idEmploye} value={emp?.idEmploye}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {emp?.prenom?.[0]}{emp?.nom?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{getNomComplet(emp)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {emp?.specialite || "Enseignant"}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Membres du Jury ({selectedMembres.length} sélectionnés)
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                {employes.map(emp => (
                  <FormControlLabel
                    key={emp.idEmploye}
                    control={
                      <Checkbox
                        checked={selectedMembres.includes(emp.idEmploye)}
                        onChange={() => toggleMembre(emp.idEmploye)}
                        color="primary"
                        disabled={emp.idEmploye === selectedPresident} // Empêcher de sélectionner le président comme membre
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                          {emp.prenom?.[0]}{emp.nom?.[0]}
                        </Avatar>
                        <Typography variant="body2">
                          {getNomComplet(emp)}
                          {emp.idEmploye === selectedPresident && " (Président)"}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%', mb: 1 }}
                  />
                ))}

                {employes.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    Aucun enseignant disponible
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleJuryDialogClose}>Annuler</Button>
          <Button
            onClick={handleJuryDialogClose}
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            Valider la Composition
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
    </Box>
  );
};

export default NouvelleReservation;