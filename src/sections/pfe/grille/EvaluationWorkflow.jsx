import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Button,
  Fade,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge
} from '@mui/material';
import {
  School as SchoolIcon,
  RecordVoiceOver as VoiceIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  CorporateFare as CorporateFareIcon,
  Class as ClassIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import GrilleAcademique from './GrilleAcademique';
import GrilleSoutenance from './GrilleSoutenance';
import GrilleExpert from './GrilleExpert';
import GrilleEntreprise from './GrilleEntreprise';

function TabPanel({ children, value, index }) {
  return (
    <Fade in={value === index} timeout={500}>
      <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
      </div>
    </Fade>
  );
}

// 🆕 DONNÉES MOCKÉES POUR TEST
const mockEtudiants = [
  {
    etudiantId: 'ETU001',
    nom: 'Dupont',
    prenom: 'Jean',
    departement: 'Informatique',
    option: 'GL',
    entreprise: 'Google',
    projet: 'Système de gestion cloud'
  },
  {
    etudiantId: 'ETU002',
    nom: 'Martin',
    prenom: 'Marie',
    departement: 'Informatique',
    option: 'SI',
    entreprise: 'Microsoft',
    projet: 'Application mobile'
  },
  {
    etudiantId: 'ETU003',
    nom: 'Bernard',
    prenom: 'Pierre',
    departement: 'Génie Civil',
    option: 'BTP',
    entreprise: 'Bouygues',
    projet: 'Pont suspendu'
  },
  {
    etudiantId: 'ETU004',
    nom: 'Dubois',
    prenom: 'Sophie',
    departement: 'Électronique',
    option: 'Robotique',
    entreprise: 'Tesla',
    projet: 'Système autonome'
  }
];

const EvaluationWorkflow = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [etudiants, setEtudiants] = useState([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [etudiantInfo, setEtudiantInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  // Récupération des paramètres de navigation
  useEffect(() => {
    if (location.state) {
      const { 
        selectedEtudiant: etudiantId, 
        selectedGrilleType: grilleType,
        etudiantInfo: info 
      } = location.state;
      
      console.log('Paramètres reçus:', location.state);
      
      if (etudiantId) {
        setSelectedEtudiant(etudiantId);
      }
      
      if (grilleType) {
        const tabIndex = grilles.findIndex(grille => 
          grille.value === grilleType
        );
        if (tabIndex !== -1) {
          setActiveTab(tabIndex);
        }
      }
      
      if (info) {
        setEtudiantInfo(info);
      }
    }
  }, [location.state]);

  const grilles = [
    { 
      value: 'ACADEMIQUE', 
      label: 'Académique', 
      icon: <SchoolIcon />, 
      component: GrilleAcademique,
      description: 'Évaluation par l\'encadrant académique'
    },
    { 
      value: 'SOUTENANCE', 
      label: 'Soutenance', 
      icon: <VoiceIcon />, 
      component: GrilleSoutenance,
      description: 'Évaluation du jury de soutenance'
    },
    { 
      value: 'EXPERT', 
      label: 'Expert', 
      icon: <GavelIcon />, 
      component: GrilleExpert,
      description: 'Évaluation par un expert métier'
    },
    { 
      value: 'ENTREPRISE', 
      label: 'Entreprise', 
      icon: <BusinessIcon />, 
      component: GrilleEntreprise,
      description: 'Évaluation par l\'encadrant professionnel'
    },
  ];

  // 🆕 FONCTION AMÉLIORÉE POUR CHARGER LES ÉTUDIANTS
// 🆕 CORRECTION : Fonction améliorée pour charger les étudiants
const fetchEtudiants = async (useMock = false) => {
  try {
    setLoading(true);
    setError(null);
    
    if (useMock) {
      // Utiliser les données mockées
      console.log('Utilisation des données mockées');
      const etudiantsFormatted = mockEtudiants.map(etudiant => ({
        ...etudiant,
        nomComplet: `${etudiant.prenom} ${etudiant.nom}`.trim(),
        searchableText: `${etudiant.prenom} ${etudiant.nom} ${etudiant.etudiantId} ${etudiant.departement} ${etudiant.option} ${etudiant.entreprise || ''}`
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()
      }));
      
      setEtudiants(etudiantsFormatted);
      setFilteredEtudiants(etudiantsFormatted);
      setUseMockData(true);
      return;
    }

    // 🆕 CORRECTION : URL avec paramètre search vide pour récupérer tous les étudiants
    console.log('Tentative de connexion à l\'API...');
    const apiUrl = 'http://localhost:8021/api/etudiants?search=';
    console.log('URL appelée:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Données API reçues:', data);
    
    if (!Array.isArray(data)) {
      throw new Error('Format de données invalide: attendu un tableau');
    }

    const etudiantsFormatted = data.map(etudiant => {
      const nom = etudiant.nom || '';
      const prenom = etudiant.prenom || '';
      const etudiantId = etudiant.etudiantId || '';
      const departement = etudiant.departement || '';
      const option = etudiant.option || '';
      
      return {
        ...etudiant,
        nom,
        prenom,
        etudiantId,
        departement,
        option,
        nomComplet: `${prenom} ${nom}`.trim(),
        searchableText: `${prenom} ${nom} ${etudiantId} ${departement} ${option} ${etudiant.entreprise || ''}`
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim()
      };
    });
    
    console.log('Étudiants formatés:', etudiantsFormatted);
    setEtudiants(etudiantsFormatted);
    setFilteredEtudiants(etudiantsFormatted);
    setUseMockData(false);
    
  } catch (err) {
    console.error('Erreur détaillée:', err);
    
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      setError('Erreur de connexion: Impossible d\'accéder au serveur. Vérifiez que le serveur Spring est démarré sur le port 8021.');
    } else {
      setError(`Erreur: ${err.message}`);
    }
    
  } finally {
    setLoading(false);
  }
};

  // Chargement initial
  useEffect(() => {
    fetchEtudiants();
  }, []);

  // Filtrage des étudiants
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEtudiants(etudiants);
      return;
    }

    const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filtered = etudiants.filter(etudiant => {
      if (!etudiant.searchableText) return false;
      return searchTerms.every(term => 
        etudiant.searchableText.includes(term)
      );
    });

    console.log(`Recherche: "${searchTerm}" -> ${filtered.length} résultats`);
    setFilteredEtudiants(filtered);
  }, [searchTerm, etudiants]);

  // Fonction pour récupérer les détails d'un étudiant
  const fetchEtudiantDetail = async (etudiantId) => {
    if (!etudiantId) {
      console.error('ID étudiant manquant');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let etudiant = etudiants.find(e => e.etudiantId === etudiantId);
      
      if (!etudiant) {
        // Si l'étudiant n'est pas dans la liste, essayer de le récupérer depuis l'API
        if (!useMockData) {
          const res = await fetch(`http://localhost:8021/api/etudiants/${etudiantId}`);
          if (!res.ok) throw new Error(`Étudiant non trouvé (${res.status})`);
          etudiant = await res.json();
        } else {
          throw new Error('Étudiant non trouvé dans les données disponibles');
        }
      }

      const etudiantInfoComplet = {
        ...etudiant,
        nom: etudiant.nom || '',
        prenom: etudiant.prenom || '',
        etudiantId: etudiant.etudiantId || etudiantId,
        nomComplet: `${etudiant.prenom || ''} ${etudiant.nom || ''}`.trim(),
        departement: etudiant.departement || 'Non spécifié',
        option: etudiant.option || 'Non spécifié',
        entreprise: etudiant.entreprise || 'Non spécifié',
        projet: etudiant.projet || 'Non spécifié'
      };

      // Tentative de récupération de l'affectation (uniquement si pas en mode mock)
      if (!useMockData) {
        try {
          const affectRes = await fetch(`http://localhost:8021/api/affectation-stage/${etudiantId}`);
          if (affectRes.ok) {
            const affectation = await affectRes.json();
            etudiantInfoComplet.affectation = affectation;
            etudiantInfoComplet.entreprise = affectation?.entreprise?.nomEntreprise || etudiantInfoComplet.entreprise;
            etudiantInfoComplet.projet = affectation?.projet?.titreProjet || etudiantInfoComplet.projet;
          }
        } catch (affectError) {
          console.warn('Aucune affectation trouvée:', affectError);
        }
      }

      setEtudiantInfo(etudiantInfoComplet);
      
    } catch (err) {
      console.error('Erreur fetch détail étudiant:', err);
      setError(`Impossible de charger les détails: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEtudiant) {
      fetchEtudiantDetail(selectedEtudiant);
      setSearchDialogOpen(false);
    } else {
      setEtudiantInfo(null);
    }
  }, [selectedEtudiant]);

  const handleEtudiantChange = (etudiantId) => {
    setSelectedEtudiant(etudiantId);
    setError(null);
    setSearchTerm('');
  };

  const handleResetSelection = () => {
    setSelectedEtudiant('');
    setEtudiantInfo(null);
    setActiveTab(0);
    setError(null);
    setSearchTerm('');
  };

  const handleOpenSearchDialog = () => {
    setSearchDialogOpen(true);
    setSearchTerm('');
  };

  const handleSelectFromDialog = (etudiantId) => {
    handleEtudiantChange(etudiantId);
  };

  const getAvatarColor = (id) => {
    if (!id) return '#9e9e9e';
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'
    ];
    const index = id.toString().charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (etudiant) => {
    const prenom = etudiant?.prenom || '';
    const nom = etudiant?.nom || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || '?';
  };

  // 🆕 FONCTION PUT UTILISER LES DONNÉES MOCKÉES
  const handleUseMockData = () => {
    fetchEtudiants(true);
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, #f8f9ff 0%, #eef2ff 100%)',
        minHeight: '100vh',
        py: 4,
        px: { xs: 1, sm: 3 },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 1300,
          mx: 'auto',
          borderRadius: 4,
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #b53f3f 0%, #d41010 100%)',
            color: 'white',
            textAlign: 'center',
            py: 4,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          
          <PeopleIcon sx={{ fontSize: 60, opacity: 0.9, mb: 1, position: 'relative', zIndex: 1 }} />
          <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="bold" sx={{ position: 'relative', zIndex: 1 }}>
            Évaluation des Stages
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, position: 'relative', zIndex: 1 }}>
            {selectedEtudiant ? `Évaluation de ${etudiantInfo?.nomComplet || 'l\'étudiant'}` : 'Sélectionnez un étudiant pour accéder à ses grilles d\'évaluation'}
          </Typography>

          {useMockData && (
            <Chip
              label="Mode démo - Données de test"
              color="warning"
              variant="filled"
              sx={{
                mt: 2,
                background: 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                zIndex: 1
              }}
            />
          )}

          {location.state && (
            <Chip
              label="Redirection depuis la gestion des soutenances"
              color="success"
              variant="filled"
              sx={{
                mt: 1,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                zIndex: 1
              }}
            />
          )}
        </Box>

        {/* Sélection Étudiant */}
        <Box sx={{ p: { xs: 2, sm: 4 }, borderBottom: '1px solid #e0e0e0' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>Chargement des étudiants...</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1, flexDirection: isSmallScreen ? 'column' : 'row' }}>
                  {isSmallScreen ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>Sélectionner un étudiant</InputLabel>
                      <Select
                        value={selectedEtudiant}
                        label="Sélectionner un étudiant"
                        onChange={(e) => handleEtudiantChange(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Choisir un étudiant</em>
                        </MenuItem>
                        {etudiants.map((e) => (
                          <MenuItem key={e.etudiantId} value={e.etudiantId}>
                            {e.prenom} {e.nom} — {e.etudiantId}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={handleOpenSearchDialog}
                      startIcon={<SearchIcon />}
                      sx={{
                        flex: 1,
                        py: 1.5,
                        borderRadius: 2,
                        borderColor: '#3f51b5',
                        color: '#3f51b5',
                        '&:hover': {
                          borderColor: '#303f9f',
                          backgroundColor: 'rgba(63, 81, 181, 0.04)'
                        }
                      }}
                    >
                      {selectedEtudiant ? 'Changer d\'étudiant' : 'Rechercher un étudiant'}
                    </Button>
                  )}

                  {!isSmallScreen && (
                    <TextField
                      placeholder="Rechercher un étudiant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={etudiants.length === 0}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color={etudiants.length === 0 ? "disabled" : "primary"} />
                          </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                          <InputAdornment position="end">
                            <Button
                              size="small"
                              onClick={() => setSearchTerm('')}
                              sx={{ minWidth: 'auto' }}
                            >
                              <ClearIcon fontSize="small" />
                            </Button>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'white'
                        }
                      }}
                      size="small"
                    />
                  )}
                </Box>
              )}

              {!isSmallScreen && searchTerm && etudiants.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    mt: 1,
                    maxHeight: 200,
                    overflow: 'auto',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <List dense>
                    {filteredEtudiants.slice(0, 10).map((etudiant) => (
                      <ListItem
                        key={etudiant.etudiantId}
                        button
                        onClick={() => handleSelectFromDialog(etudiant.etudiantId)}
                        selected={selectedEtudiant === etudiant.etudiantId}
                      >
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: getAvatarColor(etudiant.etudiantId),
                              width: 32,
                              height: 32,
                              fontSize: '0.8rem'
                            }}
                          >
                            {getInitials(etudiant)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={`${etudiant.prenom} ${etudiant.nom}`}
                          secondary={`${etudiant.etudiantId} • ${etudiant.departement}`}
                        />
                      </ListItem>
                    ))}
                    {filteredEtudiants.length === 0 && searchTerm && (
                      <ListItem>
                        <ListItemText 
                          primary="Aucun étudiant trouvé" 
                          secondary="Essayez avec d'autres termes de recherche"
                          sx={{ textAlign: 'center', color: 'text.secondary', py: 2 }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {etudiantInfo ? (
                <Card
                  sx={{
                    bgcolor: 'rgba(99, 102, 241, 0.1)',
                    borderLeft: '5px solid #3f51b5',
                    borderRadius: 3,
                    color: 'text.primary',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: getAvatarColor(etudiantInfo.etudiantId),
                            width: 40,
                            height: 40
                          }}
                        >
                          {getInitials(etudiantInfo)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {etudiantInfo.nomComplet}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {etudiantInfo.etudiantId}
                          </Typography>
                        </Box>
                      </Box>
                      <Button 
                        size="small" 
                        onClick={handleResetSelection}
                        sx={{ minWidth: 'auto', p: 0.5 }}
                      >
                        ✕
                      </Button>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ClassIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>Département:</strong> {etudiantInfo.departement}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Option:</strong> {etudiantInfo.option}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CorporateFareIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>Entreprise:</strong> {etudiantInfo.entreprise}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WorkIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>Affectation:</strong>{' '}
                            {etudiantInfo.affectation ? (
                              <Chip label="Validée" color="success" size="small" />
                            ) : (
                              <Chip label="En attente" color="warning" size="small" />
                            )}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Projet:</strong> {etudiantInfo.projet}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.02)',
                    border: '2px dashed #e0e0e0',
                    borderRadius: 3,
                    textAlign: 'center',
                    py: 3
                  }}
                >
                  <CardContent>
                    <PersonIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {etudiants.length === 0 && !loading ? 'Aucun étudiant disponible' : 'Aucun étudiant sélectionné'}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mt: 2 }} 
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => fetchEtudiants()}
                    startIcon={<RefreshIcon />}
                  >
                    Réessayer
                  </Button>
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleUseMockData}
                  >
                    Utiliser données de test
                  </Button>
                </Box>
              }
            >
              <Typography variant="body2" fontWeight="bold">
                {error}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Vérifiez que le serveur backend est démarré sur le port 8021.
              </Typography>
            </Alert>
          )}

          {useMockData && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Mode démonstration activé</strong> - Vous utilisez des données de test. 
                Pour utiliser les données réelles, démarrez le serveur backend et cliquez sur "Réessayer".
              </Typography>
            </Alert>
          )}
        </Box>

        {/* Dialogue de recherche avancée */}
        <Dialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SearchIcon color="primary" />
              Rechercher un étudiant
              <Chip 
                label={`${etudiants.length} étudiants`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              {useMockData && (
                <Chip 
                  label="Données de test" 
                  size="small" 
                  color="warning" 
                />
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              placeholder="Rechercher par nom, prénom, ID, département, option..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2, mt: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {filteredEtudiants.length} étudiant(s) trouvé(s) {searchTerm && `pour "${searchTerm}"`}
            </Typography>

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredEtudiants.map((etudiant) => (
                <ListItem
                  key={etudiant.etudiantId}
                  button
                  onClick={() => handleSelectFromDialog(etudiant.etudiantId)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    border: selectedEtudiant === etudiant.etudiantId ? '2px solid #3f51b5' : '1px solid #e0e0e0',
                    bgcolor: selectedEtudiant === etudiant.etudiantId ? 'rgba(63, 81, 181, 0.08)' : 'white'
                  }}
                >
                  <ListItemIcon>
                    <Badge
                      color={etudiant.affectation ? "success" : "warning"}
                      variant="dot"
                    >
                      <Avatar
                        sx={{
                          bgcolor: getAvatarColor(etudiant.etudiantId),
                          width: 40,
                          height: 40
                        }}
                      >
                        {getInitials(etudiant)}
                      </Avatar>
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {etudiant.prenom} {etudiant.nom}
                        </Typography>
                        <Chip
                          label={etudiant.etudiantId}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2">
                          {etudiant.departement} • {etudiant.option}
                        </Typography>
                        {etudiant.entreprise && etudiant.entreprise !== 'Non spécifié' && (
                          <Typography variant="body2" color="primary">
                            Entreprise: {etudiant.entreprise}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {filteredEtudiants.length === 0 && searchTerm && (
                <ListItem>
                  <ListItemText 
                    primary="Aucun étudiant ne correspond à votre recherche" 
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Terme recherché: "{searchTerm}"
                        </Typography>
                        <Typography variant="body2">
                          Essayez avec d'autres mots-clés ou vérifiez l'orthographe.
                        </Typography>
                      </Box>
                    }
                    sx={{ textAlign: 'center', py: 3 }}
                  />
                </ListItem>
              )}
              {filteredEtudiants.length === 0 && !searchTerm && etudiants.length === 0 && (
                <ListItem>
                  <ListItemText 
                    primary="Aucun étudiant disponible" 
                    secondary="Impossible de charger la liste des étudiants depuis le serveur"
                    sx={{ textAlign: 'center', py: 3 }}
                  />
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSearchDialogOpen(false)}>
              Fermer
            </Button>
            <Button 
              onClick={() => setSearchTerm('')}
              disabled={!searchTerm}
            >
              Effacer la recherche
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reste du composant */}
        {selectedEtudiant ? (
          <Box>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons="auto"
              sx={{
                background: '#f6f7fb',
                borderBottom: '1px solid #ddd',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  minHeight: 60,
                },
              }}
            >
              {grilles.map((g, i) => (
                <Tab
                  key={i}
                  icon={g.icon}
                  iconPosition="start"
                  label={isMobile ? g.label : g.label}
                  sx={{
                    '&.Mui-selected': {
                      color: '#3f51b5',
                      background: 'rgba(63, 81, 181, 0.08)',
                    },
                  }}
                />
              ))}
            </Tabs>

            <Box sx={{ px: 3, pt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {grilles[activeTab]?.description}
              </Typography>
            </Box>

            {grilles.map((g, i) => {
              const GrilleComponent = g.component;
              return (
                <TabPanel key={i} value={activeTab} index={i}>
                  {loading ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      minHeight="200px"
                      flexDirection="column"
                    >
                      <CircularProgress />
                      <Typography sx={{ mt: 2 }}>Chargement de la grille {g.label}...</Typography>
                    </Box>
                  ) : (
                    <GrilleComponent 
                      selectedEtudiant={selectedEtudiant} 
                      etudiantInfo={etudiantInfo} 
                    />
                  )}
                </TabPanel>
              );
            })}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SchoolIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.3, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {etudiants.length === 0 ? 'Aucun étudiant disponible' : 'Aucun étudiant sélectionné'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {etudiants.length === 0 
                ? 'Impossible de charger la liste des étudiants. Vérifiez la connexion au serveur.'
                : 'Veuillez choisir un étudiant dans la liste pour accéder à ses grilles d\'évaluation'
              }
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleOpenSearchDialog}
              disabled={etudiants.length === 0}
              sx={{
                background: 'linear-gradient(90deg, #3f51b5, #673ab7)',
                color: 'white',
                px: 4,
                py: 1.2,
                borderRadius: 3,
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              {etudiants.length === 0 ? 'Aucun étudiant disponible' : 'Rechercher un étudiant'}
            </Button>
            
            {etudiants.length === 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={() => fetchEtudiants()}
                  startIcon={<RefreshIcon />}
                  sx={{ mr: 1 }}
                >
                  Réessayer la connexion
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={handleUseMockData}
                  color="secondary"
                >
                  Utiliser données de test
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EvaluationWorkflow;