import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Box, 
  TextField, 
  Button, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Checkbox, 
  FormControlLabel, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Divider,
  Alert,
  Snackbar,
  Paper,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  IconButton
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  MeetingRoom as RoomIcon,
  Schedule as ScheduleIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterIcon,
  Warning as WarningIcon
} from "@mui/icons-material";
import axios from "axios";

// 🔧 Configuration centralisée des APIs
const API_CONFIG = {
  SOUTENANCE: "http://localhost:8021",
  SALLE: "http://localhost:8222",
  EMPLOYE: "http://localhost:8222"
};

// 🆕 Validation des filtres
const validateFilters = () => {
  const errors = [];
  
  if (!filters.date) errors.push("La date est requise");
  if (!filters.heureDebut) errors.push("L'heure de début est requise");
  if (!filters.heureFin) errors.push("L'heure de fin est requise");
  
  if (filters.heureDebut && filters.heureFin) {
    if (filters.heureDebut >= filters.heureFin) {
      errors.push("L'heure de début doit être avant l'heure de fin");
    }
  }
  
  return errors;
};

const handleApplyFilters = () => {
  const errors = validateFilters();
  if (errors.length > 0) {
    showSnackbar(errors[0], "error");
    return;
  }
  
  fetchSallesDisponibles(filters);
  setForm(prev => ({
    ...prev,
    date: filters.date,
    heureDebut: filters.heureDebut,
    heureFin: filters.heureFin
  }));
};
// 🔧 Fonction API centralisée avec gestion d'erreur
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await axios({
      url: endpoint,
      ...options,
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw new Error(error.response?.data?.error || "Erreur de connexion au serveur");
  }
};

// 🆕 Composant de carte de salle
// 🆕 Composant de carte de salle - VERSION ADAPTÉE
const SalleCard = ({ salle, isSelected, onSelect }) => {
  // 🆕 Gérer les deux structures de données possibles
  const salleData = salle.salle || salle;
  const disponibiliteData = salle;

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2
        }
      }}
      onClick={onSelect}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {salleData.nom || "Salle sans nom"}
            </Typography>
            <Chip 
              label={salleData.typesalle || "Type inconnu"} 
              size="small" 
              color="secondary" 
              sx={{ mb: 1 }}
            />
          </Box>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <RoomIcon />
          </Avatar>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body2" color="text.secondary">
              📍 {salleData.localisation || "Localisation non spécifiée"}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Typography variant="body2" color="text.secondary">
              👥 Capacité: {salleData.capacite || "N/A"} places
            </Typography>
          </Box>

          {/* 🆕 Afficher les informations de disponibilité si disponibles */}
          {(disponibiliteData.dateDebut || disponibiliteData.heureDebut) && (
            <>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Typography variant="body2" color="success.main">
                  ✅ Disponible le {disponibiliteData.dateDebut || "Date non spécifiée"}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.primary" fontWeight="medium">
                  🕐 {disponibiliteData.heureDebut || "--:--"} - {disponibiliteData.heureFin || "--:--"}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {isSelected && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2" color="success.dark" textAlign="center">
              ✓ Salle sélectionnée  

            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

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
  const [filtersLoading, setFiltersLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [dialogJuryOpen, setDialogJuryOpen] = useState(false);
  const [dialogEtudiantOpen, setDialogEtudiantOpen] = useState(false);

  // 🆕 CORRECTION : Initialiser avec des tableaux vides et valider les IDs
  const [selectedPresident, setSelectedPresident] = useState("");
  const [selectedMembres, setSelectedMembres] = useState([]);

  const [searchEtudiant, setSearchEtudiant] = useState("");

  // 🔔 Notifications modernes
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // 🎯 Steps pour le processus
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Sélection de la salle', 'Choix de l\'étudiant', 'Configuration du jury', 'Confirmation'];

  // 🆕 Filtres pour les salles
// 🆕 CORRECTION : Initialisation des filtres avec date du jour par défaut
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
    date: location.state?.date || defaultDate || "",
    heureDebut: location.state?.heureDebut || defaultHeureDebut || "08:00",
    heureFin: location.state?.heureFin || defaultHeureFin || "18:00"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
const compareHeures = (heure1, heure2) => {
  const [h1, m1] = heure1.split(':').map(Number);
  const [h2, m2] = heure2.split(':').map(Number);
  return (h1 * 60 + m1) - (h2 * 60 + m2);
};

// 🔹 Charger salles disponibles avec filtres - VERSION AMÉLIORÉE
const fetchSallesDisponibles = async (filters) => {
  setFiltersLoading(true);
  try {
    const toutesDisponibilites = await apiCall(
      `${API_CONFIG.SALLE}/api/salle/disponibiliteSalle/toutesDisponibilites`
    );

    console.log("🔍 Filtres appliqués:", filters);
    console.log("📦 Données reçues:", toutesDisponibilites);

    // 🆕 FILTRAGE ROBUSTE
    const sallesFiltrees = toutesDisponibilites.filter(dispo => {
      // Vérification de la date
      if (filters.date && dispo.dateDebut !== filters.date) {
        return false;
      }

      // Vérification du créneau horaire
      if (filters.heureDebut && filters.heureFin) {
        // Normaliser les formats d'heure
        const debutDispo = dispo.heureDebut?.length === 8 
          ? dispo.heureDebut.substring(0, 5) 
          : dispo.heureDebut;
        
        const finDispo = dispo.heureFin?.length === 8 
          ? dispo.heureFin.substring(0, 5) 
          : dispo.heureFin;

        const debutRecherche = filters.heureDebut;
        const finRecherche = filters.heureFin;

        console.log(`⏰ Comparaison: ${debutRecherche}-${finRecherche} vs ${debutDispo}-${finDispo}`);

        // Vérifier si le créneau recherché est COMPLÈTEMENT inclus dans la disponibilité
        const debutRechercheMinutes = compareHeures(debutRecherche, "00:00");
        const finRechercheMinutes = compareHeures(finRecherche, "00:00");
        const debutDispoMinutes = compareHeures(debutDispo, "00:00");
        const finDispoMinutes = compareHeures(finDispo, "00:00");

        if (debutRechercheMinutes < debutDispoMinutes || finRechercheMinutes > finDispoMinutes) {
          return false;
        }
      }

      return true;
    });

    console.log("✅ Salles filtrées trouvées:", sallesFiltrees.length, sallesFiltrees);
    setSalles(sallesFiltrees);
  } catch (error) {
    console.error("❌ Erreur récupération salles:", error);
    showSnackbar(error.message, "error");
    setSalles([]);
  } finally {
    setFiltersLoading(false);
  }
};

{/* Indicateur de filtrage */}
{form.date && (
  <Alert severity="info" sx={{ mb: 2 }}>
    <Typography variant="body2">
      📅 Filtrage actif : <strong>{form.date}</strong> de <strong>{form.heureDebut}</strong> à <strong>{form.heureFin}</strong>
    </Typography>
  </Alert>
)}

{/* Résultats de recherche */}
<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <Typography variant="body2" color="text.secondary">
    {salles.length > 0 
      ? `🎯 ${salles.length} salle(s) correspondant aux critères`
      : "❌ Aucune salle ne correspond aux critères de recherche"
    }
  </Typography>
  
  {salles.length > 0 && (
    <Button 
      size="small" 
      onClick={() => {
        setFilters({
          date: "",
          heureDebut: "08:00",
          heureFin: "18:00"
        });
        setForm(prev => ({ ...prev, salleId: "" }));
        fetchSallesDisponibles({
          date: "",
          heureDebut: "08:00",
          heureFin: "18:00"
        });
      }}
    >
      Effacer les filtres
    </Button>
  )}
</Box>
  // 🔹 Charger salles au démarrage
// 🔹 Charger salles au démarrage avec les filtres par défaut
useEffect(() => {
  const initialFilters = {
    date: location.state?.date || defaultDate || new Date().toISOString().split('T')[0],
    heureDebut: location.state?.heureDebut || defaultHeureDebut || "08:00",
    heureFin: location.state?.heureFin || defaultHeureFin || "18:00"
  };
  
  setFilters(initialFilters);
  fetchSallesDisponibles(initialFilters);
}, []);



  // 🔹 Charger enseignants disponibles
  const fetchEnseignants = async () => {
    if (!form.date || !form.heureDebut || !form.heureFin) return;
    
    try {
      const heureDebutFormatted = form.heureDebut.length === 5 ? form.heureDebut + ":00" : form.heureDebut;
      const heureFinFormatted = form.heureFin.length === 5 ? form.heureFin + ":00" : form.heureFin;
      
      const enseignants = await apiCall(`${API_CONFIG.SOUTENANCE}/api/disponibilites`, {
        params: {
          dateDebut: form.date,
          heureDebut: heureDebutFormatted,
          heureFin: heureFinFormatted,
          semestreId: 1,
          cursusId: 2
        }
      });
      
      // 🆕 FILTRER LES ENSEIGNANTS AVEC DES IDs VALIDES
      const enseignantsValides = enseignants.filter(emp => 
        emp.idEmploye && emp.idEmploye.trim() !== ""
      );
      
      setEmployes(enseignantsValides);
    } catch (error) {
      console.error("Erreur récupération enseignants :", error);
      setEmployes([]);
    }
  };

  // 🔹 Charger enseignants quand la date ou les horaires changent
  useEffect(() => {
    fetchEnseignants();
  }, [form.date, form.heureDebut, form.heureFin]);

  // 🔹 Charger étudiants filtrés
  const fetchEtudiants = async (search) => {
    try {
      const etudiantsData = await apiCall(
        `${API_CONFIG.SOUTENANCE}/api/etudiants?search=${search}&limit=100`
      );
      setEtudiants(etudiantsData);
    } catch (error) {
      console.error("Erreur récupération étudiants:", error); 
      setEtudiants([]);
    }
  };

  const handleSearchChange = (e) => {
    const search = e.target.value;
    setSearchEtudiant(search);
    if (search.length >= 2) {
      fetchEtudiants(search);
    } else if (search.length === 0) {
      setEtudiants([]);
    }
  };

const handleSalleChange = (salleId) => {
  const selected = salles.find(s => {
    // 🆕 Gérer les deux structures de données
    const salleData = s.salle || s;
    return salleData.id === salleId;
  });
  
  if (selected) {
    const salleData = selected.salle || selected;
    setForm({
      ...form,
      salleId: salleData.id,
      date: selected.dateDebut || form.date,
      heureDebut: selected.heureDebut || form.heureDebut,
      heureFin: selected.heureFin || form.heureFin
    });
  }
  setActiveStep(1);
};

  // 🆕 Validation des horaires
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

  // 🆕 CORRECTION : Toggle membre avec validation
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

// 🔹 Récupérer automatiquement affectationStageId - VERSION CORRIGÉE
const fetchAffectationStage = async (etudiantId) => {
  try {
    console.log(`🔍 Recherche affectation pour étudiant: ${etudiantId}`);
    
    const affectation = await apiCall(
      `${API_CONFIG.SOUTENANCE}/api/affectation-stage/${etudiantId}`
    );
    
    console.log("📦 Affectation trouvée:", affectation);
    
    // 🆕 CORRECTION : Vérifier la structure de la réponse
    if (affectation && affectation.id) {
      return affectation.id;
    } else if (affectation && affectation.idAffectationStage) {
      return affectation.idAffectationStage;
    } else {
      console.warn("⚠️ Aucun ID d'affectation trouvé dans la réponse:", affectation);
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur récupération affectationStage :", error);
    
    // 🆕 FALLBACK : Essayer avec un autre endpoint si disponible
    try {
      console.log("🔄 Tentative de fallback...");
      const fallbackResponse = await apiCall(
        `${API_CONFIG.SOUTENANCE}/api/affectations/etudiant/${etudiantId}`
      );
      
      if (fallbackResponse && fallbackResponse.length > 0) {
        const firstAffectation = fallbackResponse[0];
        return firstAffectation.id || firstAffectation.idAffectationStage;
      }
    } catch (fallbackError) {
      console.error("❌ Fallback échoué:", fallbackError);
    }
    
    return null;
  }
};

const selectEtudiant = async (etudiantId) => {
  if (!etudiantId) {
    showSnackbar("ID étudiant invalide", "error");
    return;
  }
  
  console.log(`🎓 Sélection étudiant: ${etudiantId}`);
  
  // 🆕 Afficher un indicateur de chargement
  setLoading(true);
  
  try {
    const affectationId = await fetchAffectationStage(etudiantId);
    
    console.log(`📋 Affectation ID récupéré: ${affectationId}`);
    
    if (!affectationId) {
      showSnackbar(
        "⚠️ Aucune affectation de stage trouvée pour cet étudiant. La soutenance sera créée sans affectation.",
        "warning"
      );
    }
    
    setForm({ 
      ...form, 
      etudiant: etudiantId,
      affectationStageId: affectationId
    });
    
    setDialogEtudiantOpen(false);
    setActiveStep(2);
    
  } catch (error) {
    console.error("❌ Erreur sélection étudiant:", error);
    showSnackbar("Erreur lors de la sélection de l'étudiant", "error");
  } finally {
    setLoading(false);
  }
};

  // 🆕 CORRECTION : Préparer le payload avec validation
  const preparePayload = () => {
    // 🆕 VALIDER ET FILTRER LES IDs
    const presidentIdValide = selectedPresident && selectedPresident.trim() !== "" 
      ? selectedPresident 
      : null;

    const membresValides = selectedMembres
      .filter(id => id && id.trim() !== "")
      .filter(id => id !== presidentIdValide); // Éviter les doublons

    return {
      salleId: form.salleId,
      etudiantId: form.etudiant,
      affectationStageId: form.affectationStageId,
      date: form.date,
      heureDebut: form.heureDebut,
      heureFin: form.heureFin,
      presidentId: presidentIdValide,
      membresJuryIds: membresValides
    };
  };

  // 🔹 Submit formulaire planification - VERSION CORRIGÉE
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
      
      console.log("📤 Payload envoyé:", payload); // Pour debug

      const result = await apiCall(`${API_CONFIG.SOUTENANCE}/sout/planifier`, {
        method: 'POST',
        data: payload
      });

      setForm(prev => ({ ...prev, soutenanceId: result.id }));
      showSnackbar("Soutenance planifiée avec succès !");
      setActiveStep(3);
    } catch (error) {
      console.error("❌ Erreur détaillée:", error);
      showSnackbar(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const openEtudiantDialog = () => { 
    fetchEtudiants(""); 
    setDialogEtudiantOpen(true); 
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
const getSelectedSalle = () => {
  return salles.find(s => {
    const salleData = s.salle || s;
    return salleData.id === form.salleId;
  });
};  const getSelectedEtudiant = () => etudiants.find(e => e.etudiantId === form.etudiant);

  // 🆕 Navigation entre les étapes
  const handleNextStep = () => {
    if (activeStep === 0 && !form.salleId) {
      showSnackbar("Veuillez sélectionner une salle", "error");
      return;
    }
    if (activeStep === 1 && !form.etudiant) {
      showSnackbar("Veuillez sélectionner un étudiant", "error");
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  // 🆕 Appliquer les filtres
  const handleApplyFilters = () => {
    fetchSallesDisponibles(filters);
    setForm(prev => ({
      ...prev,
      date: filters.date,
      heureDebut: filters.heureDebut,
      heureFin: filters.heureFin
    }));
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
          <AssignmentIcon sx={{ fontSize: 48, mb: 2 }} />
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
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Formulaire principal */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {/* Étape 1: Sélection de la salle */}
              {activeStep === 0 && (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <RoomIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Choisissez une salle disponible
                    </Typography>
                  </Box>

                  {/* Filtres */}
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FilterIcon fontSize="small" />
                      Filtres de recherche
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Date"
                          type="date"
                          fullWidth
                          size="small"
                          value={filters.date}
                          onChange={e => setFilters({...filters, date: e.target.value})}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Heure début"
                          type="time"
                          fullWidth
                          size="small"
                          value={filters.heureDebut}
                          onChange={e => setFilters({...filters, heureDebut: e.target.value})}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          label="Heure fin"
                          type="time"
                          fullWidth
                          size="small"
                          value={filters.heureFin}
                          onChange={e => setFilters({...filters, heureFin: e.target.value})}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Button 
                          variant="contained" 
                          onClick={handleApplyFilters}
                          startIcon={<SearchIcon />}
                          fullWidth
                          sx={{ height: '40px' }}
                          disabled={filtersLoading}
                        >
                          {filtersLoading ? <CircularProgress size={20} /> : "Rechercher"}
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Grille des salles */}
                  {filtersLoading ? (
                    <Box textAlign="center" py={4}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Recherche des salles disponibles...
                      </Typography>
                    </Box>
                  ) : salles.length > 0 ? (
                    <Grid container spacing={2}>
                      {salles.map(salle => (
                        <Grid item xs={12} md={6} key={salle.id}>
                          <SalleCard
                            salle={salle}
                            isSelected={form.salleId === salle.salle?.id}
                            onSelect={() => handleSalleChange(salle.salle?.id)}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      Aucune salle disponible pour les critères sélectionnés.
                      Vérifiez la date et les horaires.
                    </Alert>
                  )}
                </Box>
              )}

              {/* Étape 2: Choix de l'étudiant */}
              {activeStep === 1 && (
                <Box sx={{ mb: 4 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SchoolIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Choix de l'Étudiant
                    </Typography>
                  </Box>

                  <Box display="flex" gap={2} alignItems="flex-start">
                    <TextField 
                      label="Étudiant sélectionné" 
                      fullWidth 
                      value={getSelectedEtudiant() ? `${getSelectedEtudiant().nom} ${getSelectedEtudiant().prenom}` : ""} 
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={openEtudiantDialog}
                      startIcon={<PersonIcon />}
                      sx={{ minWidth: 180 }}
                    >
                      Choisir Étudiant
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Étape 3: Date et horaires */}
              {(activeStep === 1 || activeStep === 2) && (
                <Box sx={{ mb: 4 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <ScheduleIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      Date et Horaires
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Date" 
                        type="date" 
                        fullWidth 
                        InputLabelProps={{ shrink: true }}
                        value={form.date || ""} 
                        onChange={e => setForm({...form, date: e.target.value})}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ScheduleIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Heure début" 
                        type="time" 
                        fullWidth 
                        InputLabelProps={{ shrink: true }}
                        value={form.heureDebut || ""} 
                        onChange={e => setForm({...form, heureDebut: e.target.value})}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField 
                        label="Heure fin" 
                        type="time" 
                        fullWidth 
                        InputLabelProps={{ shrink: true }}
                        value={form.heureFin || ""} 
                        onChange={e => setForm({...form, heureFin: e.target.value})}
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
                      Le président du jury n'est pas obligatoire mais recommandé.
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
                      La soutenance a été créée avec l'ID: <strong>{form.soutenanceId}</strong>
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
                  onClick={activeStep === 0 ? () => navigate(-1) : handlePrevStep}
                  startIcon={<CloseIcon />}
                  disabled={loading}
                >
                  {activeStep === 0 ? "Annuler" : "Retour"}
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
                <AssignmentIcon color="primary" />
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

      {/* Dialog Étudiant */}
      <Dialog open={dialogEtudiantOpen} onClose={() => setDialogEtudiantOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" />
          Choisir un Étudiant
        </DialogTitle>
        <DialogContent>
          <TextField 
            label="Rechercher un étudiant..." 
            fullWidth 
            value={searchEtudiant} 
            onChange={handleSearchChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {etudiants.map(e => (
              <ListItem 
                key={e.etudiantId} 
                button 
                onClick={() => selectEtudiant(e.etudiantId)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {e.prenom?.[0]}{e.nom?.[0]}
                </Avatar>
                <ListItemText 
                  primary={`${e.nom} ${e.prenom}`}
                  secondary={
                    <Box>
                      <Typography variant="body2">ID: {e.etudiantId}</Typography>
                      <Typography variant="body2" color="text.secondary">{e.emailEtudiant}</Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
            {etudiants.length === 0 && searchEtudiant.length >= 2 && (
              <ListItem>
                <ListItemText primary="Aucun étudiant trouvé" secondary="Essayez avec d'autres termes de recherche" />
              </ListItem>
            )}
            {etudiants.length === 0 && searchEtudiant.length < 2 && (
              <ListItem>
                <ListItemText primary="Commencez à taper pour rechercher un étudiant" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogEtudiantOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Jury - VERSION CORRIGÉE */}
      <Dialog open={dialogJuryOpen} onClose={handleJuryDialogClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupsIcon color="primary" />
          Composition du Jury
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Sélectionnez le président et les membres du jury. Le président n'est pas obligatoire.
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
                  <MenuItem key={emp.idEmploye} value={emp.idEmploye}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {emp.prenom?.[0]}{emp.nom?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{getNomComplet(emp)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {emp.specialite || "Enseignant"}
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