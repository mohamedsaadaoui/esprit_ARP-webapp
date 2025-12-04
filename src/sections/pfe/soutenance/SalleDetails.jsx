import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Avatar,
  Divider,
  LinearProgress,
  Alert,
  Container,
  Paper,
  Stack,
  IconButton,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  FormControlLabel,
  Switch
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  VideoCameraBack as VideoIcon,
  ScreenShare as ScreenShareIcon,
  VolumeUp as VolumeIcon,
  TouchApp as TouchIcon,
  Wifi as WifiIcon,
  Computer as ComputerIcon,
  Edit as EditIcon,
  Bookmark as BookmarkIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import axios from "axios";

const SalleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [salle, setSalle] = useState(null);
  const [soutenances, setSoutenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour le dialogue de modification
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nom: "",
    typesalle: "",
    capacite: "",
    localisation: "",
    statut: true
  });
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Types de salles prédéfinis
  const typesSalle = [
    "Amphithéâtre",
    "Salle de cours",
    "Salle informatique",
    "Laboratoire",
    "Salle de réunion",
    "Salle de conférence"
  ];

  // 🆕 FONCTION AMÉLIORÉE : Récupérer les informations de la salle
// 🆕 FONCTION CORRIGÉE : Récupérer les informations de la salle
const fetchSalleDetails = async () => {
  try {
    setLoading(true);
    setError(null);

    console.log("🔍 Récupération des détails pour la salle ID:", id);

    // 1. Récupérer directement via l'endpoint qui fonctionne
    const dispoResponse = await axios.get(`http://localhost:8222/api/salle/disponibiliteSalle/disponibilite/${id}`);
    const disponibilites = dispoResponse.data;
    
    console.log("📦 Données reçues de l'API disponibilite:", disponibilites);

    if (disponibilites.length === 0) {
      throw new Error("Aucune disponibilité trouvée pour cette salle");
    }

    // 2. Extraire les infos de la salle (première disponibilité)
    const salleInfo = disponibilites[0].salle;
    const salleId = salleInfo.id;

    console.log("✅ Salle récupérée:", salleInfo);

    // 3. Récupérer les soutenances pour cette salle
    let soutenancesSalle = [];
    try {
      const soutenancesResponse = await axios.get("http://localhost:8021/sout");
      soutenancesSalle = soutenancesResponse.data.filter(sout => 
        sout.salle?.id === salleId
      );
      setSoutenances(soutenancesSalle);
      console.log(`📚 ${soutenancesSalle.length} soutenances trouvées`);
    } catch (soutError) {
      console.error("Erreur récupération soutenances:", soutError);
    }

    // 4. Déterminer le statut actuel
    const maintenant = new Date();
    let statutActuel = 'DISPONIBLE';
    let soutenanceEnCours = null;
    let prochaineSoutenance = null;

    // Logique de détermination du statut
    if (soutenancesSalle.length > 0) {
      soutenanceEnCours = soutenancesSalle.find(sout => {
        const heureDebut = new Date(`${sout.dateSoutenance}T${sout.heureDebut}`);
        const heureFin = new Date(`${sout.dateSoutenance}T${sout.heureFin}`);
        return maintenant >= heureDebut && maintenant <= heureFin;
      });

      if (soutenanceEnCours) {
        statutActuel = 'EN_COURS';
      } else {
        const soutenancesFutures = soutenancesSalle.filter(sout => {
          const heureDebut = new Date(`${sout.dateSoutenance}T${sout.heureDebut}`);
          return maintenant < heureDebut;
        });

        if (soutenancesFutures.length > 0) {
          prochaineSoutenance = soutenancesFutures.reduce((prev, current) => {
            const prevHeure = new Date(`${prev.dateSoutenance}T${prev.heureDebut}`);
            const currentHeure = new Date(`${current.dateSoutenance}T${current.heureDebut}`);
            return prevHeure < currentHeure ? prev : current;
          });
          statutActuel = 'A_VENIR';
        }
      }
    }

    // 5. Construire l'objet final
    const salleComplete = {
      ...salleInfo,
      soutenance: soutenanceEnCours,
      prochaine: prochaineSoutenance,
      disponibilites: disponibilites,
      statutActuel: statutActuel
    };

    console.log("🎉 Salle complète prête:", salleComplete);
    setSalle(salleComplete);
    
  } catch (err) {
    console.error("❌ Erreur récupération salle:", err);
    // Fallback en cas d'erreur
    const salleFallback = {
      id: parseInt(id),
      nom: `Salle ${id}`,
      typesalle: "Type inconnu",
      capacite: 0,
      localisation: "Localisation inconnue",
      statut: true,
      statutActuel: 'DISPONIBLE'
    };
    setSalle(salleFallback);
    setError("Impossible de charger les détails de la salle");
  } finally {
    setLoading(false);
  }
};
  // Fonction pour charger la liste des cursus
  const fetchCursusList = async () => {
    try {
      const response = await axios.get("http://localhost:8222/api/cursus/all");
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des cursus:", error);
      return [];
    }
  };

  // Ouvrir le dialogue de modification
  const handleOpenEditDialog = () => {
    if (salle) {
      setEditFormData({
        nom: salle.nom || "",
        typesalle: salle.typesalle || "",
        capacite: salle.capacite || "",
        localisation: salle.localisation || "",
        statut: salle.statutactif !== false
      });
      setOpenEditDialog(true);
    }
  };

  // Fermer le dialogue
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Soumettre la modification
  const handleSubmitUpdate = async () => {
    try {
      if (!editFormData.nom?.trim() || !editFormData.typesalle || !editFormData.capacite || !editFormData.localisation?.trim()) {
        setSnackbar({
          open: true,
          message: "Veuillez remplir tous les champs obligatoires",
          severity: "error"
        });
        return;
      }

      setUpdating(true);
      
      const updateData = {
        nom: editFormData.nom.trim(),
        typesalle: editFormData.typesalle,
        capacite: parseInt(editFormData.capacite),
        localisation: editFormData.localisation.trim()
      };

      const response = await axios.put(
        `http://localhost:8222/api/salle/contSalle/update/${id}`,
        updateData
      );

      setSalle(prev => ({
        ...prev,
        ...updateData
      }));

      setSnackbar({
        open: true,
        message: "Salle modifiée avec succès!",
        severity: "success"
      });

      handleCloseEditDialog();
      
    } catch (error) {
      console.error("Erreur modification:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la modification de la salle",
        severity: "error"
      });
    } finally {
      setUpdating(false);
    }
  };

  // Activer/désactiver la salle
// Activer/désactiver la salle
const handleToggleStatus = async () => {
  try {
    const response = await axios.put(
      `http://localhost:8222/api/salle/contSalle/statut/${id}`
    );
    
    setSalle(prev => ({
      ...prev,
      statut: response.data.statut // CORRECTION: statut au lieu de statutactif
    }));

    setSnackbar({
      open: true,
      message: `Salle ${response.data.statut ? 'activée' : 'désactivée'} avec succès!`,
      severity: "success"
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    setSnackbar({
      open: true,
      message: "Erreur lors du changement de statut",
      severity: "error"
    });
  }
};

  const getEquipementIcon = (equipement) => {
    const icons = {
      "Projecteur": <ScreenShareIcon fontSize="small" />,
      "Visioconférence": <VideoIcon fontSize="small" />,
      "Système audio": <VolumeIcon fontSize="small" />,
      "Écran tactile": <TouchIcon fontSize="small" />,
      "WiFi": <WifiIcon fontSize="small" />,
      "Ordinateurs": <ComputerIcon fontSize="small" />,
    };
    return icons[equipement] || <ScreenShareIcon fontSize="small" />;
  };

  const getEquipementsFromSalle = (salle) => {
    if (salle.equipements && salle.equipements.length > 0) {
      return salle.equipements;
    }
    
    const equipements = [];
    if (salle.typesalle?.includes('Amphi') || salle.typesalle?.includes('Amphithéâtre')) {
      equipements.push('Projecteur', 'Système audio', 'Visioconférence');
    } else if (salle.typesalle?.includes('Informatique')) {
      equipements.push('Ordinateurs', 'Projecteur', 'WiFi');
    } else {
      equipements.push('Projecteur', 'Tableau');
    }
    return equipements;
  };

  // 🆕 FONCTION POUR CALCULER LA PROGRESSION
  const calculerProgression = (soutenance) => {
    if (!soutenance) return 0;
    
    const maintenant = new Date();
    const debut = new Date(`${soutenance.dateSoutenance}T${soutenance.heureDebut}`);
    const fin = new Date(`${soutenance.dateSoutenance}T${soutenance.heureFin}`);
    
    if (maintenant < debut) return 0;
    if (maintenant > fin) return 100;
    
    const dureeTotale = fin - debut;
    const tempsEcoule = maintenant - debut;
    return Math.round((tempsEcoule / dureeTotale) * 100);
  };

  const getStatusColor = (statut) => {
    const colors = {
      'EN_COURS': 'error',
      'A_VENIR': 'warning',
      'DISPONIBLE': 'success'
    };
    return colors[statut] || 'default';
  };

  const getStatusLabel = (statut) => {
    const labels = {
      'EN_COURS': 'Occupée',
      'A_VENIR': 'Réservée',
      'DISPONIBLE': 'Disponible'
    };
    return labels[statut] || statut;
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

// Ajoutez ce test temporairement pour voir la structure exacte
useEffect(() => {
  const testAPI = async () => {
    try {
      const response = await axios.get(`http://localhost:8222/api/salle/contSalle/${id}`);
      console.log("Structure de l'API contSalle:", response.data);
      
      const allResponse = await axios.get("http://localhost:8222/api/salle/contSalle/all");
      console.log("Structure de l'API all:", allResponse.data[0]);
    } catch (error) {
      console.error("Test API error:", error);
    }
  };
  
  testAPI();
  fetchSalleDetails();
}, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chargement des détails de la salle...
            </Typography>
            <LinearProgress sx={{ width: 200, mx: 'auto', mt: 2 }} />
          </Box>
        </Box>
      </Container>
    );
  }

  if (!salle) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" onClick={() => navigate(-1)}>
              Retour
            </Button>
          }
        >
          Impossible de charger les détails de cette salle
        </Alert>
      </Container>
    );
  }

  const equipements = getEquipementsFromSalle(salle);
  const currentStatus = salle.statutActuel || 'DISPONIBLE';
  const progression = salle.soutenance ? calculerProgression(salle.soutenance) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header avec navigation */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {salle.nom}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Détails de la salle de soutenance
            </Typography>
          </Box>
          <Chip
            label={getStatusLabel(currentStatus)}
            color={getStatusColor(currentStatus)}
            sx={{ 
              ml: 'auto',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              padding: '8px 16px'
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Colonne principale - Informations détaillées */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Carte d'informations principales */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon color="primary" />
                    Informations Générales
                  </Typography>
         <Chip 
  label={salle.statut !== false ? "Active" : "Inactive"} 
  color={salle.statut !== false ? "success" : "error"} 
  variant="outlined"
/>
                </Box>
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <PeopleIcon color="primary" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Capacité
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {salle.capacite} places
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <SchoolIcon color="secondary" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Type de salle
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {salle.typesalle || 'Standard'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <LocationIcon color="info" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Localisation
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {salle.localisation || 'Non spécifiée'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Carte des équipements */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoIcon color="primary" />
                  Équipements & Technologies
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" gap={1} flexWrap="wrap">
                  {equipements.map((equipement, idx) => (
                    <Chip
                      key={idx}
                      icon={getEquipementIcon(equipement)}
                      label={equipement}
                      variant="outlined"
                      color="primary"
                      sx={{ 
                        borderRadius: 2,
                        padding: '8px 12px',
                        fontSize: '0.9rem',
                        '& .MuiChip-icon': { ml: 1 }
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* 🆕 SOUTENANCE EN COURS AVEC PROGRESSION */}
            {salle.soutenance && (
              <Card sx={{ borderRadius: 3, border: `2px solid ${theme.palette.error.main}20` }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                      <ScheduleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="error">
                        Soutenance en Cours
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        En cours de déroulement
                      </Typography>
                    </Box>
                  </Box>

                  {/* Barre de progression */}
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Progression de la soutenance
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="error">
                        {progression}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progression}
                      color="error"
                      sx={{ borderRadius: 2, height: 8 }}
                    />
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Étudiant
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {salle.soutenance.idAffectationStage?.etudiant ? 
                              `${salle.soutenance.idAffectationStage.etudiant.nom} ${salle.soutenance.idAffectationStage.etudiant.prenom}` : 
                              'Non spécifié'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <SchoolIcon color="action" />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Président du jury
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {salle.soutenance.idPresidentJury ? 
                              `${salle.soutenance.idPresidentJury.prenom} ${salle.soutenance.idPresidentJury.nom}` : 
                              'Non spécifié'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <CalendarIcon color="action" />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Horaire
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {salle.soutenance.heureDebut} - {salle.soutenance.heureFin}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {salle.soutenance.libelle && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Sujet de la soutenance
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="body1" fontStyle="italic">
                            {salle.soutenance.libelle}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* 🆕 PROCHAINE SOUTENANCE */}
            {salle.prochaine && (
              <Card sx={{ borderRadius: 3, border: `2px solid ${theme.palette.warning.main}20` }}>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                      <BookmarkIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        Prochaine Soutenance
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Programmée prochainement
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <PersonIcon color="action" />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Étudiant
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {salle.prochaine.idAffectationStage?.etudiant ? 
                              `${salle.prochaine.idAffectationStage.etudiant.nom} ${salle.prochaine.idAffectationStage.etudiant.prenom}` : 
                              'Non spécifié'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <CalendarIcon color="action" />
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">
                            Horaire
                          </Typography>
                          <Typography variant="body1" fontWeight="600">
                            {salle.prochaine.heureDebut} - {salle.prochaine.heureFin}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {salle.prochaine.libelle && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Sujet
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="body1" fontStyle="italic">
                            {salle.prochaine.libelle}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* 🆕 HISTORIQUE DES SOUTENANCES */}
            {soutenances.length > 0 && (
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon color="primary" />
                    Historique des Soutenances ({soutenances.length})
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={2}>
                    {soutenances.slice(0, 5).map((soutenance, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body1" fontWeight="600">
                              {soutenance.idAffectationStage?.etudiant ? 
                                `${soutenance.idAffectationStage.etudiant.nom} ${soutenance.idAffectationStage.etudiant.prenom}` : 
                                'Étudiant'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {soutenance.dateSoutenance} • {soutenance.heureDebut} - {soutenance.heureFin}
                            </Typography>
                          </Box>
                          <Chip 
                            label="Terminée" 
                            size="small" 
                            color="default"
                            variant="outlined"
                          />
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* Colonne latérale - Actions et résumé */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Carte de réservation */}
            <Card sx={{ borderRadius: 3, position: 'sticky', top: 100 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main'
                }}>
                  <SchoolIcon sx={{ fontSize: 40 }} />
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Réserver cette salle
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Planifiez une soutenance dans cette salle équipée
                </Typography>

                <Stack spacing={1}>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate("/pfe/soutenance/planification/nouvelle", { state: { salleId: salle.id } })}
                    startIcon={<CalendarIcon />}
disabled={currentStatus !== 'DISPONIBLE' || salle.statut === false}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    {currentStatus === 'DISPONIBLE' && salle.statutactif !== false ? 'Réserver Maintenant' : 'Indisponible'}
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large"
                    startIcon={<EditIcon />}
                    onClick={handleOpenEditDialog}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    Modifier les détails
                  </Button>

                  <Button 
                    variant="outlined" 
                    size="large"
                    color={salle.statutactif !== false ? "error" : "success"}
                    onClick={handleToggleStatus}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
{salle.statut !== false ? "Désactiver" : "Activer"} la salle
                  </Button>
                </Stack>

                {(currentStatus !== 'DISPONIBLE' || salle.statutactif === false) && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
{salle.statut === false ? "Salle désactivée" : 
                     currentStatus === 'EN_COURS' ? "Soutenance en cours" : 
                     "Réservation programmée"}
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Carte de statut */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Statut de Disponibilité
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 
                        currentStatus === 'EN_COURS' ? 'error.main' :
                        currentStatus === 'A_VENIR' ? 'warning.main' : 'success.main'
                    }}
                  />
                  <Typography variant="body1" fontWeight="600">
                    {getStatusLabel(currentStatus)}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {currentStatus === 'EN_COURS' 
                    ? 'Soutenance en cours dans cette salle' 
                    : currentStatus === 'A_VENIR'
                    ? 'Soutenance programmée prochainement'
                    : 'Salle disponible pour réservation'
                  }
                </Typography>

                {soutenances.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      📊 {soutenances.length} soutenance(s) planifiée(s)
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialogue de modification de la salle */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight="bold">
            Modifier la salle
          </Typography>
          <IconButton onClick={handleCloseEditDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de la salle"
                  name="nom"
                  value={editFormData.nom}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Type de salle</InputLabel>
                  <Select
                    name="typesalle"
                    value={editFormData.typesalle}
                    label="Type de salle"
                    onChange={handleInputChange}
                  >
                    {typesSalle.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacité"
                  name="capacite"
                  type="number"
                  value={editFormData.capacite}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Localisation"
                  name="localisation"
                  value={editFormData.localisation}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCloseEditDialog}
            color="inherit"
          >
            Annuler
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmitUpdate}
            disabled={updating}
            startIcon={updating ? null : <SaveIcon />}
          >
            {updating ? "Modification..." : "Enregistrer les modifications"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SalleDetails;