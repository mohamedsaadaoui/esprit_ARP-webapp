import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Box,
  Grid,
  Card,
  Chip,
  Fade,
  Zoom,
  Badge,
  alpha,
  Alert,
  Button,
  Avatar,
  Select,
  useTheme,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  CardContent,
  FormControl,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Refresh as RefreshIcon,
  Sensors as SensorsIcon,
  Settings as SettingsIcon,
  Videocam as VideocamIcon,
  VolumeUp as VolumeUpIcon,
  TouchApp as TouchAppIcon,
  Schedule as ScheduleIcon,
  FilterList as FilterListIcon,
  AccessTime as AccessTimeIcon,
  ScreenShare as ScreenShareIcon,
  CalendarToday as CalendarTodayIcon,
  WorkspacePremium as WorkspacePremiumIcon,
} from "@mui/icons-material";

import soutenanceService from "src/services/pfe-services/soutenanceService";



const PlanificationSoutenances = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStatut, setSelectedStatut] = useState("TOUS");
  const [selectedCreneau, setSelectedCreneau] = useState("TOUTE_LA_JOURNEE");
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  const today = new Date().toLocaleDateString('fr-FR', options);
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Créneaux horaires
  const creneauxHoraires = [
    { value: "TOUTE_LA_JOURNEE", label: "Toute la journée", debut: "08:00:00", fin: "18:00:00" },
    { value: "MATIN", label: "Matin (8h-12h)", debut: "08:00:00", fin: "12:00:00" },
    { value: "APRES_MIDI", label: "Après-midi (14h-18h)", debut: "14:00:00", fin: "18:00:00" },
    { value: "CRENEAU_1", label: "Créneau 1 (8h-10h)", debut: "08:00:00", fin: "10:00:00" },
    { value: "CRENEAU_2", label: "Créneau 2 (10h-12h)", debut: "10:00:00", fin: "12:00:00" },
    { value: "CRENEAU_3", label: "Créneau 3 (14h-16h)", debut: "14:00:00", fin: "16:00:00" },
    { value: "CRENEAU_4", label: "Créneau 4 (16h-18h)", debut: "16:00:00", fin: "18:00:00" },
  ];

  // 🆕 FONCTION POUR DÉTERMINER LE STATUT BASÉ SUR LES SOUTENANCES
  const determinerStatutSalle = (salle, soutenances) => {
    if (!salle || !salle.salle) return "Indisponible";

    const salleId = salle.salle.id;
    const maintenant = new Date();
    const aujourdhui = maintenant.toISOString().split('T')[0];
    const heureActuelle = maintenant.toTimeString().substring(0, 5);

    // 🆕 Trouver les soutenances pour cette salle
    const soutenancesSalle = soutenances.filter(soutenance =>
      soutenance.salle && soutenance.salle.id === salleId
    );

    // Vérifier si une soutenance est en cours (même jour et heure actuelle dans le créneau)
    const soutenanceEnCours = soutenancesSalle.find(soutenance => {
      if (soutenance.dateSoutenance !== aujourdhui) return false;

      const heureDebut = soutenance.heureDebut?.substring(0, 5);
      const heureFin = soutenance.heureFin?.substring(0, 5);

      return heureDebut && heureFin && heureActuelle >= heureDebut && heureActuelle <= heureFin;
    });

    if (soutenanceEnCours) {
      return "EN_COURS";
    }

    // Vérifier les soutenances futures (même jour mais après l'heure actuelle)
    const soutenancesFutures = soutenancesSalle.filter(soutenance => {
      if (soutenance.dateSoutenance !== aujourdhui) return false;

      const heureDebut = soutenance.heureDebut?.substring(0, 5);
      return heureDebut && heureDebut > heureActuelle;
    });

    if (soutenancesFutures.length > 0) {
      return "Réservée";
    }

    // Vérifier les soutenances d'autres jours
    const soutenancesAutresJours = soutenancesSalle.filter(soutenance =>
      soutenance.dateSoutenance !== aujourdhui
    );

    if (soutenancesAutresJours.length > 0) {
      return "Réservée";
    }

    return "Disponible";
  };

  // Fonction principale pour récupérer les données
  const fetchSallesAvecSoutenances = async (date = selectedDate, creneau = selectedCreneau) => {
    setLoading(true);
    setError(null);

    try {
      const dateStr = date.toISOString().split('T')[0];
      const creneauSelectionne = creneauxHoraires.find(c => c.value === creneau) || creneauxHoraires[0];
      const cursusId = localStorage.getItem('selectedCursusId') || 1;

      console.log('🎯 Recherche salles disponibles pour:', {
        dateStr,
        creneau: creneauSelectionne.label,
        cursusId
      });

      // 🎯 RÉCUPÉRATION DES DISPONIBILITÉS
      let disponibilites = [];
      try {
        disponibilites = await soutenanceService.getDisponibiliteSalles();

        console.log(`🏫 ${disponibilites.length} disponibilités reçues de l'API`);

        // 🆕 FILTRER LES DISPONIBILITÉS PAR DATE
        const disponibilitesFiltrees = disponibilites.filter(dispo =>
          dispo.dateDebut === dateStr
        );

        console.log(`📅 ${disponibilitesFiltrees.length} disponibilités pour la date ${dateStr}`);

        disponibilites = disponibilitesFiltrees;
      } catch (error) {
        console.error('💥 Erreur récupération disponibilités:', error);
        throw new Error('Service des salles indisponible');
      }

      // 🎯 RÉCUPÉRATION DES SOUTENANCES
      let toutesSoutenances = [];
      try {
        toutesSoutenances = await soutenanceService.getAllSoutenancesWithMembres();
        console.log(`📚 ${toutesSoutenances.length} soutenances totales récupérées`);
      } catch (error) {
        console.warn('⚠️ Soutenances non disponibles:', error);
        toutesSoutenances = [];
      }

      // 🆕 TRANSFORMATION AVEC STATUTS BASÉS SUR LES SOUTENANCES
      const sallesAvecStatuts = disponibilites.map(disponibilite => {
        const { salle } = disponibilite;

        // 🎯 DÉTERMINER LE STATUT BASÉ SUR LES SOUTENANCES
        const statut = determinerStatutSalle(disponibilite, toutesSoutenances);

        // 🎯 CALCULER L'OCCUPATION
        let occupation = 0;
        if (statut === "EN_COURS") occupation = 100;
        else if (statut === "Réservée") occupation = 75;
        else occupation = 0;

        return {
          id: salle.id,
          nom: salle.nom,
          statut: statut,
          places: salle.capacite || 20,
          type: salle.typesalle || 'Salle standard',
          localisation: salle.localisation || 'Localisation non définie',
          equipements: getEquipementsFromSalle(salle),
          occupation: occupation,
          creneauDebut: disponibilite.heureDebut,
          creneauFin: disponibilite.heureFin,
          dateRecherche: dateStr,
          // Informations de la disponibilité
          disponibiliteId: disponibilite.id,
          // Informations pour les soutenances (si nécessaire)
          soutenances: toutesSoutenances.filter(s => s.salle?.id === salle.id)
        };
      });

      console.log(`🎉 ${sallesAvecStatuts.length} salles transformées avec statuts`);
      console.log("Répartition des statuts:", {
        total: sallesAvecStatuts.length,
        disponibles: sallesAvecStatuts.filter(s => s.statut === "Disponible").length,
        occupees: sallesAvecStatuts.filter(s => s.statut === "EN_COURS").length,
        reservees: sallesAvecStatuts.filter(s => s.statut === "Réservée").length
      });

      setSalles(sallesAvecStatuts);

    } catch (error) {
      console.error('💥 Erreur critique:', error);
      setError("Erreur: " + error.message);
      setSalles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const getEquipementsFromSalle = (salle) => {
    const equipements = [];

    if (salle.typesalle?.includes('Amphi') || salle.typesalle?.includes('Amphithéâtre')) {
      equipements.push('Projecteur', 'Système audio', 'Visioconférence');
    } else if (salle.typesalle?.includes('Informatique')) {
      equipements.push('Ordinateurs', 'Projecteur', 'WiFi');
    } else if (salle.typesalle?.includes('Réunion')) {
      equipements.push('Projecteur', 'Tableau', 'WiFi');
    } else {
      equipements.push('Projecteur', 'Tableau');
    }

    return equipements;
  };


  // useEffect pour le chargement initial
  useEffect(() => {
    fetchSallesAvecSoutenances();
  }, []);

  // Gestionnaires d'événements
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchSallesAvecSoutenances(newDate, selectedCreneau);
  };

  const handleCreneauChange = (event) => {
    const nouveauCreneau = event.target.value;
    setSelectedCreneau(nouveauCreneau);
    fetchSallesAvecSoutenances(selectedDate, nouveauCreneau);
  };

  const handleStatutChange = (event) => {
    setSelectedStatut(event.target.value);
  };

  const handleRefresh = () => {
    fetchSallesAvecSoutenances();
  };

  // Filtrage des salles
  const filteredSalles = salles.filter((salle) => {
    const matchesSearch = (salle.nom || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatut = selectedStatut === "TOUS" || salle.statut === selectedStatut;
    return matchesSearch && matchesStatut;
  });

  // 🆕 CALCUL DES STATISTIQUES BASÉ SUR filteredSalles
  const total = filteredSalles.length;
  const disponibles = filteredSalles.filter((s) => s.statut === "Disponible").length;
  const occupees = filteredSalles.filter((s) => s.statut === "EN_COURS").length;
  const reservees = filteredSalles.filter((s) => s.statut === "PLANIFIEE").length;

  // Fonctions d'affichage
  const getStatusColor = (statut) => {
    switch (statut) {
      case "Disponible": return theme.palette.success.main;
      case "occupée": return theme.palette.error.main;
      case "Réservée": return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "Disponible": return "🟢";
      case "occupée": return "🔴";
      case "Réservée": return "🟡";
      default: return "⚪";
    }
  };

  const creneauActuel = creneauxHoraires.find(c => c.value === selectedCreneau);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box textAlign="center">
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chargement des salles et soutenances...
          </Typography>
          <LinearProgress sx={{ width: 200, mx: 'auto' }} />
        </Box>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box p={3}>
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert severity="warning" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>

        {/* En-tête */}
        <Fade in timeout={800}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
            <Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                gutterBottom
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Tableau de Bord des Soutenances
              </Typography>
              <Typography variant="h6" color="text.secondary">
                E S P R I T • {today}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {total} salles actives • {occupees} en cours • {reservees} réservées • {disponibles} disponibles
              </Typography>
              {creneauActuel && (
                <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                  📅 {selectedDate.toLocaleDateString('fr-FR')} • 🕐 {creneauActuel.label}
                </Typography>
              )}
            </Box>
            <Box display="flex" gap={1}>
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={handleRefresh}
                sx={{ borderRadius: 3 }}
              >
                Actualiser
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Statistiques */}
        <Zoom in timeout={1000}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.light, 0.1)})`,
                p: 3,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: theme.palette.primary.main,
                }
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <PeopleIcon color="primary" />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Salles Actives
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.light}, ${alpha(theme.palette.success.main, 0.1)})`,
                p: 3,
                color: 'white',
                borderRadius: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                    <WorkspacePremiumIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {disponibles}
                    </Typography>
                    <Typography variant="body2">
                      Disponibles
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: `linear-gradient(135deg, ${theme.palette.error.light}, ${alpha(theme.palette.error.main, 0.1)})`,
                p: 3,
                color: 'white',
                borderRadius: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                    <ScheduleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {occupees}
                    </Typography>
                    <Typography variant="body2">
                      EN_COURS
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                background: `linear-gradient(135deg, ${theme.palette.warning.light}, ${alpha(theme.palette.warning.main, 0.1)})`,
                p: 3,
                color: 'white',
                borderRadius: 4,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: alpha('#fff', 0.2) }}>
                    <CalendarTodayIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {reservees}
                    </Typography>
                    <Typography variant="body2">
                      Réservées
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Zoom>

        {/* Filtres */}
        <Fade in timeout={1200}>
          <Box mb={4}>
            <Card sx={{ p: 3, borderRadius: 4, bgcolor: 'background.default' }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FilterListIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Filtres de recherche
                </Typography>
              </Box>

              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <TextField
                  placeholder="Rechercher une salle..."
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    minWidth: 200,
                    '& .MuiOutlinedInput-root': { borderRadius: 3 }
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={selectedStatut}
                    label="Statut"
                    onChange={handleStatutChange}
                    sx={{ borderRadius: 3 }}
                  >
                    <MenuItem value="TOUS">Tous les statuts</MenuItem>
                    <MenuItem value="Disponible">Disponible</MenuItem>
                    <MenuItem value="EN_COURS">EN_COURS</MenuItem>
                    <MenuItem value="Réservée">Réservée</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Créneau horaire</InputLabel>
                  <Select
                    value={selectedCreneau}
                    label="Créneau horaire"
                    onChange={handleCreneauChange}
                    sx={{ borderRadius: 3 }}
                    startAdornment={<AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                  >
                    {creneauxHoraires.map((creneau) => (
                      <MenuItem key={creneau.value} value={creneau.value}>
                        {creneau.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <DatePicker
                  label="Date de recherche"
                  value={selectedDate}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      size: 'small',
                      sx: {
                        minWidth: 180,
                        '& .MuiOutlinedInput-root': { borderRadius: 3 }
                      }
                    }
                  }}
                />

                <Box sx={{ flexGrow: 1 }} />

                <Typography variant="body2" color="text.secondary">
                  {filteredSalles.length} salles trouvées
                </Typography>
              </Box>

              <Box mt={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Chip
                  label={`Date: ${selectedDate.toLocaleDateString('fr-FR')}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  onDelete={() => handleDateChange(new Date())}
                  deleteIcon={<RefreshIcon />}
                />
                <Chip
                  label={`Créneau: ${creneauActuel?.label}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  onDelete={() => handleCreneauChange({ target: { value: 'TOUTE_LA_JOURNEE' } })}
                  deleteIcon={<RefreshIcon />}
                />
                {selectedStatut !== "TOUS" && (
                  <Chip
                    label={`Statut: ${selectedStatut}`}
                    size="small"
                    color="default"
                    variant="outlined"
                    onDelete={() => handleStatutChange({ target: { value: 'TOUS' } })}
                  />
                )}
                {search && (
                  <Chip
                    label={`Recherche: "${search}"`}
                    size="small"
                    color="default"
                    variant="outlined"
                    onDelete={() => setSearch("")}
                  />
                )}
              </Box>
            </Card>
          </Box>
        </Fade>

        {/* Liste des salles */}
        <Box>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              🏫 Salles de Soutenance
              <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                ({filteredSalles.length} salles sur {total} actives)
              </Typography>
            </Typography>

            <Box display="flex" gap={1}>
              <Button
                variant={selectedStatut === "TOUS" ? "contained" : "outlined"}
                size="small"
                onClick={() => handleStatutChange({ target: { value: 'TOUS' } })}
                sx={{ borderRadius: 2 }}
              >
                Tous
              </Button>
              <Button
                variant={selectedStatut === "Disponible" ? "contained" : "outlined"}
                size="small"
                color="success"
                onClick={() => handleStatutChange({ target: { value: 'Disponible' } })}
                sx={{ borderRadius: 2 }}
              >
                Disponibles
              </Button>
              <Button
                variant={selectedStatut === "EN_COURS" ? "contained" : "outlined"}
                size="small"
                color="error"
                onClick={() => handleStatutChange({ target: { value: 'EN_COURS' } })}
                sx={{ borderRadius: 2 }}
              >
                EN_COURS
              </Button>
              <Button
                variant={selectedStatut === "Réservée" ? "contained" : "outlined"}
                size="small"
                color="warning"
                onClick={() => handleStatutChange({ target: { value: 'Réservée' } })}
                sx={{ borderRadius: 2 }}
              >
                Réservées
              </Button>
            </Box>
          </Box>

          {filteredSalles.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Aucune salle ne correspond à vos critères de recherche
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Essayez de modifier la date, le créneau horaire, le statut ou votre recherche
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedStatut("TOUS");
                  setSearch("");
                  setSelectedCreneau("TOUTE_LA_JOURNEE");
                  setSelectedDate(new Date());
                }}
              >
                Réinitialiser les filtres
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredSalles.map((salle, index) => (
                <Grid item xs={12} lg={6} key={salle.id}>
                  <Zoom in timeout={800 + (index * 200)}>
                    <Card
                      sx={{
                        borderRadius: 4,
                        border: `2px solid ${alpha(getStatusColor(salle.statut), 0.2)}`,
                        transition: 'all 0.3s ease',
                        background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(getStatusColor(salle.statut), 0.05)})`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          borderColor: getStatusColor(salle.statut),
                          boxShadow: `0 12px 40px ${alpha(getStatusColor(salle.statut), 0.2)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        {/* En-tête de la salle */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="h5" fontWeight="bold">
                                {salle.nom}
                              </Typography>
                              <Badge
                                color={
                                  salle.statut === "Disponible" ? "success" :
                                    salle.statut === "EN_COURS" ? "error" : "warning"
                                }
                                variant="dot"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1}>
                              <PeopleIcon fontSize="small" />
                              {salle.places} places • {salle.type}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📍 {salle.localisation}
                            </Typography>

                            <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                              🕐 {salle.creneauDebut?.substring(0, 5)} - {salle.creneauFin?.substring(0, 5)}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<span>{getStatusIcon(salle.statut)}</span>}
                            label={salle.statut}
                            color={
                              salle.statut === "Disponible" ? "success" :
                                salle.statut === "EN_COURS" ? "error" : "warning"
                            }
                            variant="filled"
                            sx={{ borderRadius: 2, fontWeight: 'bold' }}
                          />
                        </Box>

                        {/* Indicateur d'occupation */}
                        {salle.occupation > 0 && (
                          <Box mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                Occupation
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {salle.occupation}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={salle.occupation}
                              color={
                                // eslint-disable-next-line no-nested-ternary
                                salle.statut === "Disponible" ? "success" :
                                  salle.statut === "EN_COURS" ? "error" : "warning"
                              }
                              sx={{ borderRadius: 2, height: 4 }}
                            />
                          </Box>
                        )}



                        {/* Technologies */}
                        {salle.technologies && salle.technologies.length > 0 && (
                          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                            {salle.technologies.map((tech, idx) => (
                              <Chip
                                key={idx}
                                label={tech}
                                size="small"
                                color="primary"
                                variant="filled"
                                sx={{ borderRadius: 1, fontSize: '0.7rem' }}
                              />
                            ))}
                          </Box>
                        )}

                        {/* Actions */}
                        <Box mt={3} display="flex" gap={1} justifyContent="space-between">
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => navigate("nouvelle", {
                              state: {
                                salleId: salle.id,
                                salleNom: salle.nom,
                                salleCapacite: salle.places,
                                selectedDate: selectedDate,
                                creneauDebut: salle.creneauDebut,
                                creneauFin: salle.creneauFin,
                                dateRecherche: salle.dateRecherche,
                                // 🆕 Passer aussi les données pour l'auto-sélection
                                autoSelectSalle: true,
                                etudiantId: "223AMT4058"
                              }
                            })}
                            disabled={salle.statut !== "Disponible"}
                            sx={{
                              borderRadius: 3,
                              flex: 1,
                              opacity: salle.statut !== "Disponible" ? 0.6 : 1
                            }}
                          >
                            {salle.statut === "Disponible" ? "Planifier Soutenance" : "Indisponible"}
                          </Button>

                          <Button
                            variant="outlined"
                            onClick={() => navigate(`${salle.id}`)}
                            sx={{ borderRadius: 3 }}
                          >
                            Détails
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Pied de page */}
        <Fade in timeout={1500}>
          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              📊 Données mises à jour en temps réel •
              Dernière actualisation: {new Date().toLocaleTimeString('fr-FR')} •
              Créneau: {creneauActuel?.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {total > 0 ? `Affichage de ${filteredSalles.length} sur ${total} salles` : 'Aucune salle disponible'}
            </Typography>
          </Box>
        </Fade>
      </Box>
    </LocalizationProvider>
  );
};

export default PlanificationSoutenances;