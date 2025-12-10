/* eslint-disable no-nested-ternary */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  Badge,
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
  alpha,
  useTheme
} from "@mui/material";

import soutenanceService from "src/services/pfe-services/soutenanceService";

// Composant d'item de détail pour le résumé
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

const NouvelleReservation = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // States
  const [salles, setSalles] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sallesLoading, setSallesLoading] = useState(false);

  const [dialogJuryOpen, setDialogJuryOpen] = useState(false);
  const [selectedPresident, setSelectedPresident] = useState("");
  const [selectedMembres, setSelectedMembres] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // 4 Steps
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Date et Salle', 'Choix de l\'étudiant', 'Configuration du jury', 'Confirmation'];

  const [form, setForm] = useState({
    soutenanceId: null,
    salleId: "",
    etudiant: "",
    affectationStageId: null,
    date: new Date().toISOString().split('T')[0],
    heureDebut: "09:00",
    heureFin: "10:30"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch available rooms when date/time changes
  const fetchSallesDisponibles = async () => {
    if (!form.date || !form.heureDebut || !form.heureFin) return;

    setSallesLoading(true);
    try {
      // Format date as DD/MM/YYYY
      const [year, month, day] = form.date.split('-');
      const formattedDate = `${day}/${month}/${year}`;

      // Format times with :00 suffix
      const formattedHeureDeb = form.heureDebut.substring(0, 5) + ':00';
      const formattedHeureFin = form.heureFin.substring(0, 5) + ':00';

      const result = await soutenanceService.getSallesDisponibles(
        formattedDate,
        formattedHeureDeb,
        formattedHeureFin,
        1 // cursusId
      );
      setSalles(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Erreur chargement salles:", error);
      showSnackbar("Erreur lors du chargement des salles", "error");
      setSalles([]);
    } finally {
      setSallesLoading(false);
    }
  };

  // Fetch rooms when date/time changes
  useEffect(() => {
    if (form.date && form.heureDebut && form.heureFin) {
      fetchSallesDisponibles();
    }
  }, [form.date, form.heureDebut, form.heureFin]);

  // Initialize static student for testing
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
    setEtudiants([etudiantStatique]);
    setForm(prev => ({ ...prev, etudiant: "223AMT4058" }));
  }, []);

  // Fetch teachers
  const fetchEnseignants = async () => {
    try {
      const response = await soutenanceService.getAllEnseignants();
      setEmployes(response.data.data || []);
    } catch (error) {
      console.error("Erreur chargement enseignants:", error);
    }
  };

  useEffect(() => {
    fetchEnseignants();
  }, []);

  // Validation
  const validateTimeSlot = () => {
    const errors = [];
    if (!form.date) errors.push("La date est requise");
    if (!form.heureDebut) errors.push("L'heure de début est requise");
    if (!form.heureFin) errors.push("L'heure de fin est requise");
    if (form.heureDebut && form.heureFin && form.heureDebut >= form.heureFin) {
      errors.push("L'heure de début doit être avant l'heure de fin");
    }
    return errors;
  };

  const toggleMembre = (id) => {
    if (!id || id.trim() === "") return;
    setSelectedMembres(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const preparePayload = () => {
    const presidentIdValide = selectedPresident?.trim() || null;
    const membresValides = selectedMembres
      .filter(id => id?.trim() && id !== presidentIdValide);

    return {
      salleId: form.salleId,
      etudiantId: form.etudiant,
      affectationStageId: 20861,
      date: form.date,
      heureDebut: form.heureDebut,
      heureFin: form.heureFin,
      presidentId: presidentIdValide || "V-861-13",
      membresJuryIds: membresValides
    };
  };

  const handleSubmit = async () => {
    if (!form.etudiant || !form.salleId) {
      showSnackbar("Veuillez sélectionner l'étudiant et la salle !", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = preparePayload();
      const response = await soutenanceService.planifierSoutenance(payload);
      console.log("✅ Réponse:", response.data);
      setForm(prev => ({ ...prev, soutenanceId: response.data?.id || Math.random() }));
      showSnackbar("Soutenance créée avec succès !", "success");
      setActiveStep(3);
    } catch (error) {
      console.error("❌ Erreur:", error);
      showSnackbar(error.message || "Erreur lors de la planification", "error");
    } finally {
      setLoading(false);
    }
  };

  const getNomComplet = (p) => p ? `${p.prenom || ""} ${p.nom || ""}`.trim() || "Inconnu" : "Inconnu";
  const getSelectedSalle = () => salles.find(s => (s.salle?.id || s.id) === form.salleId);
  const getSelectedEtudiant = () => etudiants.find(e => e.etudiantId === form.etudiant);

  const handleNextStep = () => {
    if (activeStep === 0 && !form.salleId) {
      showSnackbar("Veuillez sélectionner une salle", "error");
      return;
    }
    if (activeStep === 1 && !form.etudiant) {
      showSnackbar("Veuillez sélectionner un étudiant", "error");
      return;
    }
    if (activeStep === 2) {
      handleSubmit();
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const selectSalle = (salleId) => {
    setForm(prev => ({ ...prev, salleId }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #b53f3f 0%, #d41010 100%)' }}>
        <CardContent sx={{ color: 'white', textAlign: 'center', py: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Planification de Soutenance
          </Typography>
          <Typography variant="h6">
            Suivez les étapes pour planifier une soutenance
          </Typography>
        </CardContent>
      </Card>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label} completed={index < activeStep}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>

              {/* Step 0: Date, Time & Room Selection */}
              {activeStep === 0 && (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <ScheduleIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Sélectionnez la date et le créneau
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value, salleId: "" })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Heure début"
                        type="time"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={form.heureDebut}
                        onChange={e => setForm({ ...form, heureDebut: e.target.value, salleId: "" })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Heure fin"
                        type="time"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={form.heureFin}
                        onChange={e => setForm({ ...form, heureFin: e.target.value, salleId: "" })}
                      />
                    </Grid>
                  </Grid>

                  {validateTimeSlot().length > 0 && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      {validateTimeSlot()[0]}
                    </Alert>
                  )}

                  {/* Room Selection Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <RoomIcon color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        Salles disponibles
                      </Typography>
                      {!sallesLoading && salles.length > 0 && (
                        <Chip label={`${salles.length} salles`} size="small" color="primary" />
                      )}
                    </Box>
                  </Box>

                  {/* Search Filter */}
                  {salles.length > 0 && (
                    <TextField
                      placeholder="Rechercher une salle..."
                      size="small"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={form.searchSalle || ""}
                      onChange={e => setForm({ ...form, searchSalle: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RoomIcon color="action" fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}

                  {sallesLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : salles.length === 0 ? (
                    <Alert severity="info">
                      Aucune salle disponible pour ce créneau. Modifiez la date ou les horaires.
                    </Alert>
                  ) : (
                    <Box sx={{ maxHeight: 350, overflowY: 'auto', pr: 1 }}>
                      <Grid container spacing={2}>
                        {salles
                          .filter(item => {
                            const salle = item.salle || item;
                            const search = (form.searchSalle || "").toLowerCase();
                            return !search ||
                              salle.nom?.toLowerCase().includes(search) ||
                              salle.localisation?.toLowerCase().includes(search);
                          })
                          .slice(0, 20) // Limit to 20 rooms for performance
                          .map((item) => {
                            const salle = item.salle || item;
                            const isSelected = form.salleId === salle.id;
                            return (
                              <Grid item xs={12} sm={6} key={salle.id}>
                                <Card
                                  sx={{
                                    cursor: 'pointer',
                                    border: isSelected ? '3px solid' : '1px solid',
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                      borderColor: 'primary.main',
                                      transform: 'translateY(-2px)',
                                      boxShadow: 3
                                    }
                                  }}
                                  onClick={() => selectSalle(salle.id)}
                                >
                                  <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                          {salle.nom}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          📍 {salle.localisation || 'Non définie'} • 👥 {salle.capacite || 'N/A'}
                                        </Typography>
                                      </Box>
                                      {isSelected && (
                                        <CheckCircleIcon color="primary" sx={{ fontSize: 24 }} />
                                      )}
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                      </Grid>
                      {salles.length > 20 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                          Affichage limité à 20 salles. Utilisez la recherche pour filtrer.
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {/* Step 1: Student Selection */}
              {activeStep === 1 && (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <SchoolIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Choix de l&apos;Étudiant
                    </Typography>
                  </Box>

                  {getSelectedEtudiant() ? (
                    <Card sx={{ mb: 3, border: '2px solid', borderColor: 'success.main', bgcolor: 'rgba(46, 125, 50, 0.08)' }}>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
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
                              <Chip label={getSelectedEtudiant().classe} size="small" color="primary" variant="outlined" />
                              <Chip label={getSelectedEtudiant().specialite} size="small" color="secondary" variant="outlined" />
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
                    <Alert severity="info">Aucun étudiant sélectionné</Alert>
                  )}
                </Box>
              )}

              {/* Step 2: Jury Configuration */}
              {activeStep === 2 && (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <GroupsIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Configuration du Jury
                    </Typography>
                  </Box>

                  <Box display="flex" gap={2} alignItems="flex-start" mb={2}>
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
                      onClick={() => setDialogJuryOpen(true)}
                      startIcon={<GroupsIcon />}
                      sx={{ minWidth: 180 }}
                    >
                      {selectedPresident ? "Modifier Jury" : "Affecter Jury"}
                    </Button>
                  </Box>

                  {selectedMembres.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Membres du jury ({selectedMembres.length}):
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

                  {!selectedPresident && (
                    <Alert severity="warning" sx={{ mt: 2 }} icon={<WarningIcon />}>
                      Le président du jury n&apos;est pas obligatoire mais recommandé.
                    </Alert>
                  )}
                </Box>
              )}

              {/* Step 3: Confirmation */}
              {activeStep === 3 && (
                <Box>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      ✅ Soutenance planifiée avec succès !
                    </Typography>
                    <Typography>
                      La soutenance a été créée.
                    </Typography>
                  </Alert>
                  <Typography variant="body1" color="text.secondary">
                    Vous pouvez maintenant consulter la liste des soutenances.
                  </Typography>
                </Box>
              )}

              {/* Action Buttons */}
              <Box display="flex" gap={2} justifyContent="space-between" mt={4}>
                <Button
                  variant="outlined"
                  onClick={handlePrevStep}
                  startIcon={<CloseIcon />}
                  disabled={loading}
                >
                  {activeStep === 0 ? "Annuler" : "Retour"}
                </Button>

                {activeStep < 3 && (
                  <Button
                    variant="contained"
                    onClick={handleNextStep}
                    disabled={loading || (activeStep === 0 && !form.salleId)}
                    startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                    sx={{ minWidth: 200 }}
                  >
                    {loading ? "Traitement..." : activeStep === 2 ? "Planifier" : "Continuer"}
                  </Button>
                )}

                {activeStep === 3 && (
                  <Button
                    variant="contained"
                    onClick={() => navigate("/pfe/soutenance")}
                    startIcon={<CheckCircleIcon />}
                  >
                    Voir les Soutenances
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Récapitulatif
              </Typography>
              <Divider sx={{ my: 2 }} />

              {form.date && (
                <DetailItem
                  icon={<ScheduleIcon />}
                  label="Date et heure"
                  value={`${form.date} • ${form.heureDebut} - ${form.heureFin}`}
                />
              )}

              {getSelectedSalle() && (
                <DetailItem
                  icon={<RoomIcon />}
                  label="Salle"
                  value={(getSelectedSalle().salle || getSelectedSalle()).nom}
                />
              )}

              {getSelectedEtudiant() && (
                <DetailItem
                  icon={<SchoolIcon />}
                  label="Étudiant"
                  value={`${getSelectedEtudiant().prenom} ${getSelectedEtudiant().nom}`}
                />
              )}

              {selectedPresident && (
                <DetailItem
                  icon={<GroupsIcon />}
                  label="Président"
                  value={getNomComplet(employes.find(e => e.idEmploye === selectedPresident))}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Jury Dialog */}
      <Dialog open={dialogJuryOpen} onClose={() => setDialogJuryOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupsIcon color="primary" />
          Composition du Jury
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Président du Jury</Typography>
              <TextField
                select
                label="Sélectionner le président"
                fullWidth
                value={selectedPresident || ""}
                onChange={e => setSelectedPresident(e.target.value)}
              >
                <MenuItem value=""><em>Aucun président</em></MenuItem>
                {employes.map((emp) => (
                  <MenuItem key={emp?.idEmploye} value={emp?.idEmploye}>
                    {getNomComplet(emp)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Membres ({selectedMembres.length})
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                {employes.map(emp => (
                  <FormControlLabel
                    key={emp?.idEmploye}
                    control={
                      <Checkbox
                        checked={selectedMembres.includes(emp?.idEmploye)}
                        onChange={() => toggleMembre(emp?.idEmploye)}
                        disabled={emp?.idEmploye === selectedPresident}
                      />
                    }
                    label={getNomComplet(emp)}
                    sx={{ width: '100%', mb: 1 }}
                  />
                ))}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogJuryOpen(false)}>Annuler</Button>
          <Button onClick={() => setDialogJuryOpen(false)} variant="contained">
            Valider
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NouvelleReservation;