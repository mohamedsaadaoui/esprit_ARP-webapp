import { useState, useEffect } from 'react';
import {
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button, 
  TextField, 
  MenuItem, 
  Grid, 
  CircularProgress,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Alert,
  InputAdornment,
  Paper,
  alpha,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  ListItemText,
  Card,
  CardContent,  
  Checkbox
} from '@mui/material';
import {
 Update as UpdateIcon,
  Close as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  MeetingRoom as RoomIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import soutenanceService from 'src/services/pfe-services/soutenanceService';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function EditSoutenanceDialog({ open, onClose, soutenance, onUpdated, salles = [], employes = [] }) {
  const theme = useTheme();
  const [formValues, setFormValues] = useState({
    dateSoutenance: '',
    heureDebut: '',
    heureFin: '',
    salleId: '',
    presidentId: '',
    statut: '',
    membresJuryIds: []
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableSalles, setAvailableSalles] = useState([]);
  const [juryMembres, setJuryMembres] = useState([]);
  const [loadingMembres, setLoadingMembres] = useState(false);

  // Statuts disponibles
  const STATUT_OPTIONS = [
    { value: 'EN_ATTENTE', label: '🟡 En Attente', color: 'warning' },
    { value: 'PLANIFIEE', label: '🔵 Planifiée', color: 'info' },
    { value: 'TERMINEE', label: '✅ Terminée', color: 'success' },
    { value: 'ANNULEE', label: '❌ Annulée', color: 'error' }
  ];

  // 🆕 Fonction pour obtenir le président sélectionné
  const getSelectedPresident = () => {
    return employes.find(p => p.idEmploye === formValues.presidentId);
  };

  // 🆕 CORRECTION : Filtrer les membres disponibles (exclure le président sélectionné)
  const availableMembres = employes.filter(employe => 
    employe.idEmploye !== formValues.presidentId
  );

  // Fonction utilitaire pour formater l'heure
  const formatTime = (time) => {
    if (!time) return '';
    if (time.includes(':')) {
      const parts = time.split(':');
      return parts.length === 2 ? `${time}:00` : time;
    }
    return time;
  };

  // Fonction pour charger les membres du jury
  const loadJuryMembres = async (soutenanceId) => {
    try {
      setLoadingMembres(true);
      console.log('🔍 Chargement des membres du jury pour soutenance:', soutenanceId);
      
      const membresData = await soutenanceService.getMembresBySoutenance(soutenanceId);
      
      console.log('✅ Données reçues de l\'API:', membresData);
      
      // S'assurer que c'est un tableau
      const membresArray = Array.isArray(membresData) ? membresData : [];
      
      console.log('👥 Tableau final:', membresArray);
      console.log('👥 Nombre de membres:', membresArray.length);
      
      setJuryMembres(membresArray);
      return membresArray;
    } catch (error) {
      console.error('❌ Erreur chargement membres jury:', error);
      const emptyArray = [];
      setJuryMembres(emptyArray);
      return emptyArray;
    } finally {
      setLoadingMembres(false);
    }
  };

  // 🆕 FONCTION CORRIGÉE : Gestion robuste de la mise à jour du jury
  const handleUpdateJury = async () => {
    try {
      console.log('🔄 Début mise à jour du jury...');
      console.log('Nouveau président:', formValues.presidentId);
      console.log('Nouveaux membres:', formValues.membresJuryIds);

      // 1. Récupérer l'ancienne composition
      const anciensMembres = await loadJuryMembres(soutenance.id);
      console.log('👥 Anciens membres récupérés:', anciensMembres);

      // 2. Identifier les membres à supprimer et à ajouter
      const ancienPresident = anciensMembres.find(m => m.roleJury === 'PRESIDENT');
      const anciensMembresIds = anciensMembres
        .filter(m => m.roleJury === 'MEMBRE' && m.idEmploye?.idEmploye)
        .map(m => m.idEmploye.idEmploye);

      console.log('🔄 Ancien président:', ancienPresident?.idEmploye?.idEmploye);
      console.log('🔄 Anciens membres réguliers:', anciensMembresIds);

      // 3. Gérer le président
      if (formValues.presidentId && formValues.presidentId !== ancienPresident?.idEmploye?.idEmploye) {
        console.log(`👑 Changement de président: ${ancienPresident?.idEmploye?.idEmploye} -> ${formValues.presidentId}`);
        
        // Supprimer l'ancien président s'il existe
        if (ancienPresident?.id) {
          console.log('🗑️ Suppression ancien président');
          await soutenanceService.supprimerMembreJury(ancienPresident.id);
        }
        
        // Ajouter le nouveau président
        console.log(`👑 Ajout nouveau président: ${formValues.presidentId}`);
        await soutenanceService.affecterPresident(soutenance.id, formValues.presidentId);
      }

      // 4. Gérer les membres réguliers
      const membresToRemove = anciensMembresIds.filter(id => !formValues.membresJuryIds.includes(id));
      const membresToAdd = formValues.membresJuryIds.filter(id => !anciensMembresIds.includes(id));

      console.log('👥 Membres à supprimer:', membresToRemove);
      console.log('👥 Membres à ajouter:', membresToAdd);

      // Supprimer les membres qui ne sont plus dans la liste
      for (const membreId of membresToRemove) {
        const membreToRemove = anciensMembres.find(m => 
          m.idEmploye?.idEmploye === membreId && m.roleJury === 'MEMBRE'
        );
        if (membreToRemove?.id) {
          console.log(`🗑️ Suppression membre: ${membreId}`);
          await soutenanceService.supprimerMembreJury(membreToRemove.id);
        }
      }

      // Ajouter les nouveaux membres
      if (membresToAdd.length > 0) {
        console.log(`👥 Ajout ${membresToAdd.length} nouveaux membres`);
        await soutenanceService.ajouterMembres(
          soutenance.id, 
          membresToAdd, 
          'MEMBRE'
        );
      }

      // 5. Cas spécial : si le président a été retiré mais pas remplacé
      if (!formValues.presidentId && ancienPresident?.id) {
        console.log('🗑️ Suppression président (aucun nouveau président sélectionné)');
        await soutenanceService.supprimerMembreJury(ancienPresident.id);
      }

      console.log('✅ Mise à jour du jury terminée avec succès');

    } catch (err) {
      console.error('❌ Erreur mise à jour jury:', err);
      throw new Error(err.response?.data?.message || 'Erreur lors de la mise à jour du jury');
    }
  };

  // 🆕 FONCTION ALTERNATIVE : Méthode de réinitialisation complète
  const handleResetCompleteJury = async () => {
    try {
      console.log('🔄 Réinitialisation COMPLÈTE du jury...');

      // 1. Récupérer tous les membres actuels
      const membresActuels = await loadJuryMembres(soutenance.id);
      
      // 2. Supprimer tous les membres existants
      for (const membre of membresActuels) {
        if (membre.id) {
          console.log(`🗑️ Suppression membre existant: ${membre.id}`);
          await soutenanceService.supprimerMembreJury(membre.id);
        }
      }

      // 3. Ajouter le nouveau président si sélectionné
      if (formValues.presidentId) {
        console.log(`👑 Ajout nouveau président: ${formValues.presidentId}`);
        await soutenanceService.affecterPresident(soutenance.id, formValues.presidentId);
      }

      // 4. Ajouter les nouveaux membres si sélectionnés
      if (formValues.membresJuryIds.length > 0) {
        console.log(`👥 Ajout ${formValues.membresJuryIds.length} nouveaux membres`);
        await soutenanceService.ajouterMembres(
          soutenance.id, 
          formValues.membresJuryIds, 
          'MEMBRE'
        );
      }

      // 5. Recharger l'affichage
      await loadJuryMembres(soutenance.id);
      
      console.log('✅ Réinitialisation du jury terminée avec succès');

    } catch (err) {
      console.error('❌ Erreur réinitialisation jury:', err);
      throw new Error(err.response?.data?.message || 'Erreur lors de la réinitialisation du jury');
    }
  };

  // 🐛 Fonction de debug
  const debugEmployes = () => {
    console.log('🔍 DEBUG Employes:', {
      employesProp: employes,
      employesLength: employes?.length,
      employesFirst: employes?.[0],
      formPresidentId: formValues.presidentId
    });
    
    if (employes && employes.length > 0) {
      employes.forEach((p, index) => {
        console.log(`👤 Employe ${index}:`, {
          id: p.idEmploye,
          nom: p.nom,
          prenom: p.prenom,
          email: p.email
        });
      });
    }
  };

  // Initialiser le formulaire
  const initializeForm = async () => {
    try {
      console.log('📋 Données soutenance reçues:', soutenance);

      // 1. Pré-remplir les valeurs de base
      const initialValues = {
        dateSoutenance: soutenance.dateSoutenance || '',
        heureDebut: soutenance.heureDebut?.substring(0, 5) || '',
        heureFin: soutenance.heureFin?.substring(0, 5) || '',
        salleId: soutenance.salle?.id || '',
        presidentId: '',
        statut: soutenance.statut || 'EN_ATTENTE',
        membresJuryIds: []
      };

      console.log('🎯 Valeurs initiales du formulaire:', initialValues);
      setFormValues(initialValues);

      // 2. Charger les membres du jury depuis l'API
      const membresJury = await loadJuryMembres(soutenance.id);
      
      console.log('🔍 Données membres jury complètes:', membresJury);

      // 3. Extraire président et membres
      let presidentId = '';
      const membresIds = [];

      if (Array.isArray(membresJury)) {
        membresJury.forEach(membre => {
          if (membre?.roleJury === 'PRESIDENT' && membre.idEmploye?.idEmploye) {
            presidentId = membre.idEmploye.idEmploye;
            console.log(`👑 Président trouvé: ${presidentId}`);
          } else if (membre?.roleJury === 'MEMBRE' && membre.idEmploye?.idEmploye) {
            membresIds.push(membre.idEmploye.idEmploye);
            console.log(`👥 Membre trouvé: ${membre.idEmploye.idEmploye}`);
          }
        });
      }

      // 4. Fallback : si pas de président dans le jury mais présent dans la soutenance
      if (!presidentId && soutenance.idPresidentJury?.idEmploye) {
        presidentId = soutenance.idPresidentJury.idEmploye;
        console.log(`🔄 Utilisation président de la soutenance: ${presidentId}`);
      }

      console.log('📝 IDs à pré-remplir - Président:', presidentId, 'Membres:', membresIds);

      // 5. Mettre à jour le formulaire
      setFormValues(prev => ({ 
        ...prev, 
        presidentId: presidentId,
        membresJuryIds: membresIds
      }));

      console.log('✅ Formulaire initialisé - Président:', presidentId, 'Membres:', membresIds.length);

    } catch (error) {
      console.error('❌ Erreur initialisation formulaire:', error);
      throw error;
    }
  };

  // Gérer les salles disponibles
  const initializeSalles = () => {
    if (salles.length > 0) {
      setAvailableSalles(salles);
    } else {
      const fetchSalles = async () => {
        try {
          const sallesData = await soutenanceService.getDisponibiliteSalles();
          setAvailableSalles(sallesData.map(d => d.salle));
        } catch (err) {
          console.error('Erreur chargement salles:', err);
        }
      };
      fetchSalles();
    }
  };

  useEffect(() => {
    if (!soutenance || !open) return;

    console.log('📋 Initialisation du formulaire pour soutenance:', soutenance.id);
    
    setLoading(true);

    // Exécuter l'initialisation
    const executeInitialization = async () => {
      try {
        await initializeForm();
        initializeSalles();
        debugEmployes(); // 🐛 DEBUG
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    executeInitialization();
    
  }, [soutenance, salles, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleMembresChange = (event) => {
    const { value } = event.target;
    setFormValues(prev => ({ 
      ...prev, 
      membresJuryIds: typeof value === 'string' ? value.split(',') : value 
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formValues.dateSoutenance) {
      errors.push('La date est requise');
    }
    if (!formValues.heureDebut || !formValues.heureFin) {
      errors.push('Les horaires sont requis');
    }
    if (!formValues.salleId) {
      errors.push('La salle est requise');
    }
    if (new Date(`${formValues.dateSoutenance}T${formValues.heureDebut}`) >= 
        new Date(`${formValues.dateSoutenance}T${formValues.heureFin}`)) {
      errors.push('L\'heure de fin doit être après l\'heure de début');
    }
    
    // Validation du jury
    if (!formValues.presidentId && formValues.membresJuryIds.length === 0) {
      errors.push('Veuillez sélectionner au moins un président ou des membres du jury');
    }
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      if (!soutenance?.id) {
        setError('ID de soutenance manquant');
        return;
      }

      // 1. Mettre à jour les infos de base de la soutenance
      const payload = {
        id: parseInt(soutenance.id),
        salleId: parseInt(formValues.salleId),
        dateSoutenance: formValues.dateSoutenance,
        heureDebut: formatTime(formValues.heureDebut),
        heureFin: formatTime(formValues.heureFin),
        libelle: `Soutenance - ${soutenance.idAffectationStage?.etudiant?.nom || ''}`,
        statut: formValues.statut
      };

      console.log('🔧 Payload de base envoyé:', payload);

      await soutenanceService.updateSoutenance(soutenance.id, payload);
      
      // 2. Mettre à jour la composition du jury
      console.log('🎯 Début mise à jour jury...');
      
      // Utiliser la méthode de réinitialisation complète pour plus de fiabilité
      await handleResetCompleteJury();
      
      console.log('✅ Soutenance ET jury mis à jour avec succès');
      
      if (onUpdated) {
        onUpdated();
      }
      onClose(true);

    } catch (err) {
      console.error('❌ Erreur détaillée:', err);
      console.error('❌ Response data:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedSalle = () => availableSalles.find(s => s.id === parseInt(formValues.salleId));

  return (
    <Dialog 
      open={open} 
      onClose={() => onClose(false)} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 50%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        pb: 2
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main'
          }}>
            <UpdateIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Modifier la Soutenance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mettez à jour les détails de la soutenance #{soutenance?.id}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : (
          <Box p={3}>
            {/* Informations de l'étudiant */}
            {soutenance?.idAffectationStage?.etudiant && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 3,
                  background: alpha(theme.palette.primary.main, 0.02),
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Étudiant concerné
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="600">
                      {soutenance.idAffectationStage.etudiant.nom} {soutenance.idAffectationStage.etudiant.prenom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {soutenance.idAffectationStage.etudiant.etudiantId}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Affichage des membres actuels du jury */}
            {loadingMembres ? (
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
                  <CircularProgress size={24} />
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Chargement de la composition du jury
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Récupération des membres en cours...
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ) : juryMembres.length > 0 ? (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  mb: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.03)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
                  borderColor: alpha(theme.palette.success.main, 0.1),
                  borderWidth: 2
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="success.main" gutterBottom>
                      🎯 Composition Actuelle du Jury
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                      <Chip 
                        icon={<PersonIcon />}
                        label={`${juryMembres.length} membre(s)`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip 
                        icon={<SchoolIcon />}
                        label={`${juryMembres.filter(m => m.roleJury === 'PRESIDENT').length} président`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        icon={<GroupsIcon />}
                        label={`${juryMembres.filter(m => m.roleJury === 'MEMBRE').length} membre(s)`}
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                    <GroupsIcon />
                  </Avatar>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box>
                  {/* Président */}
                  {juryMembres.filter(m => m.roleJury === 'PRESIDENT').length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon color="primary" />
                        Président du Jury
                      </Typography>
                      <Grid container spacing={2}>
                        {juryMembres
                          .filter(membre => membre.roleJury === 'PRESIDENT')
                          .map((membre, index) => (
                            <Grid item xs={12} key={membre.idEmploye?.idEmploye || `president-${index}`}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  borderColor: 'primary.main',
                                  background: alpha(theme.palette.primary.main, 0.02)
                                }}
                              >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar 
                                      sx={{ 
                                        width: 48, 
                                        height: 48, 
                                        fontSize: '1rem',
                                        bgcolor: 'primary.main',
                                        fontWeight: 'bold'
                                      }}
                                    >
                                      {membre.idEmploye?.prenom?.[0]}{membre.idEmploye?.nom?.[0]}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="h6" fontWeight="bold">
                                        {membre.idEmploye?.prenom} {membre.idEmploye?.nom}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {membre.idEmploye?.email || 'Email non disponible'}
                                      </Typography>
                                      <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                                        <Chip 
                                          label="PRÉSIDENT" 
                                          size="small" 
                                          color="primary"
                                          variant="filled"
                                          icon={<SchoolIcon />}
                                        />
                                        <Chip 
                                          label={`ID: ${membre.idEmploye?.idEmploye}`} 
                                          size="small" 
                                          variant="outlined"
                                        />
                                      </Box>
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  )}

                  {/* Membres réguliers */}
                  {juryMembres.filter(m => m.roleJury === 'MEMBRE').length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupsIcon color="action" />
                        Membres du Jury ({juryMembres.filter(m => m.roleJury === 'MEMBRE').length})
                      </Typography>
                      <Grid container spacing={2}>
                        {juryMembres
                          .filter(membre => membre.roleJury === 'MEMBRE')
                          .map((membre, index) => (
                            <Grid item xs={12} md={6} key={membre.idEmploye?.idEmploye || `membre-${index}`}>
                              <Card 
                                variant="outlined" 
                                sx={{ 
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 2,
                                    borderColor: 'primary.light'
                                  }
                                }}
                              >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                  <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar 
                                      sx={{ 
                                        width: 40, 
                                        height: 40, 
                                        fontSize: '0.9rem',
                                        bgcolor: 'secondary.main'
                                      }}
                                    >
                                      {membre.idEmploye?.prenom?.[0]}{membre.idEmploye?.nom?.[0]}
                                    </Avatar>
                                    <Box flex={1}>
                                      <Typography variant="body1" fontWeight="medium">
                                        {membre.idEmploye?.prenom} {membre.idEmploye?.nom}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" noWrap>
                                        {membre.idEmploye?.email || membre.idEmploye?.idEmploye}
                                      </Typography>
                                    </Box>
                                    <Box textAlign="right">
                                      <Chip 
                                        label="MEMBRE" 
                                        size="small" 
                                        color="default"
                                        variant="outlined"
                                      />
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  )}
                </Box>

                <Box mt={3} pt={2} borderTop={1} borderColor="divider">
                  <Typography variant="caption" color="text.secondary">
                    💡 Les modifications que vous apportez ci-dessous mettront à jour cette composition
                  </Typography>
                </Box>
              </Paper>
            ) : (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  mb: 3,
                  textAlign: 'center',
                  background: alpha(theme.palette.warning.main, 0.02)
                }}
              >
                <Box sx={{ maxWidth: 300, margin: '0 auto' }}>
                  <Avatar sx={{ bgcolor: 'warning.light', width: 60, height: 60, margin: '0 auto 16px' }}>
                    <GroupsIcon />
                  </Avatar>
                  <Typography variant="h6" color="warning.main" gutterBottom>
                    Aucun membre assigné
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Cette soutenance n'a pas encore de jury constitué. 
                    Utilisez les champs ci-dessous pour sélectionner le président et les membres.
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Message d'erreur */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Date et horaires */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon color="primary" />
                  Date et Horaires
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Date de soutenance"
                  type="date"
                  name="dateSoutenance"
                  value={formValues.dateSoutenance}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
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
                  label="Heure de début"
                  type="time"
                  name="heureDebut"
                  value={formValues.heureDebut}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Heure de fin"
                  type="time"
                  name="heureFin"
                  value={formValues.heureFin}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Salle et Président */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RoomIcon color="primary" />
                  Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Salle de soutenance */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Salle de soutenance"
                  name="salleId"
                  value={formValues.salleId}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RoomIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">
                    <em>Sélectionner une salle</em>
                  </MenuItem>
                  {availableSalles.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      <Box>
                        <Typography variant="body1" fontWeight="600">
                          {s.nom}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {s.typesalle} • {s.capacite} places • {s.localisation || 'Non localisée'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                {getSelectedSalle() && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Chip 
                      label={`Capacité: ${getSelectedSalle().capacite} places`} 
                      size="small" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={getSelectedSalle().typesalle} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                )}
              </Grid>

              {/* 🆕 PRÉSIDENT DU JURY - SECTION CORRIGÉE AVEC employes */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Président du jury"
                  name="presidentId"
                  value={formValues.presidentId}
                  onChange={handleChange}
                  fullWidth
                  disabled={!employes || employes.length === 0}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="">
                    <em>
                      {employes.length === 0 
                        ? 'Aucun président disponible' 
                        : 'Sélectionner un président'
                      }
                    </em>
                  </MenuItem>
                  {employes.map((p) => (
                    <MenuItem key={p.idEmploye} value={p.idEmploye}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                          {p.prenom?.[0]}{p.nom?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body1">
                            {p.prenom} {p.nom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.email || `ID: ${p.idEmploye}`}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                
                {/* Affichage informatif */}
                {employes.length === 0 && (
                  <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
                    <Typography variant="body2">
                      Aucun enseignant disponible pour le rôle de président.
                    </Typography>
                  </Alert>
                )}
                
                {formValues.presidentId && getSelectedPresident() && (
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`Président: ${getSelectedPresident().prenom} ${getSelectedPresident().nom}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                )}
              </Grid>

              {/* Membres du jury */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon color="primary" />
                  Membres du Jury
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <FormControl fullWidth>
                  <InputLabel>Membres du jury</InputLabel>
                  <Select
                    multiple
                    name="membresJuryIds"
                    value={formValues.membresJuryIds}
                    onChange={handleMembresChange}
                    input={<OutlinedInput label="Membres du jury" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const membre = employes.find(m => m.idEmploye === value);
                          return (
                            <Chip 
                              key={value} 
                              label={membre ? `${membre.prenom} ${membre.nom}` : value} 
                              size="small" 
                            />
                          );
                        })}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {availableMembres.map((membre) => (
                      <MenuItem key={membre.idEmploye} value={membre.idEmploye}>
                        <Checkbox checked={formValues.membresJuryIds.indexOf(membre.idEmploye) > -1} />
                        <ListItemText 
                          primary={`${membre.prenom} ${membre.nom}`} 
                          secondary={membre.email} 
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {formValues.membresJuryIds.length} membre(s) sélectionné(s)
                </Typography>
              </Grid>

              {/* Statut */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" />
                  Statut de la Soutenance
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  select
                  label="Statut"
                  name="statut"
                  value={formValues.statut}
                  onChange={handleChange}
                  fullWidth
                >
                  {STATUT_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip 
                          label={option.label.split(' ')[0]} 
                          size="small" 
                          color={option.color}
                          variant="filled"
                        />
                        <Typography>
                          {option.label.split(' ').slice(1).join(' ')}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={() => onClose(false)} 
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{ borderRadius: 2 }}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          sx={{ borderRadius: 2, minWidth: 120 }}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}