import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Fade from '@mui/material/Fade';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import { TablePagination } from '@mui/material';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import { alpha, useTheme } from '@mui/material/styles';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircularProgress from '@mui/material/CircularProgress';
import PermissionBasedGuard from "src/auth/guard/permession-based-guard"

import reclamationService from 'src/services/online-services/reclamationService';

import { useSettingsContext } from 'src/components/settings';

import ReclamationStatus from 'src/components/reclamation-status';

const UserReclamations = ({ etudiantId, newReclamation, resetNewReclamation }) => {
  const theme = useTheme();
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchReclamations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reclamationService.getReclamationsByEtudiant(etudiantId);
      
      const formattedData = data.map(item => ({
        id: item.id || `temp-${Date.now()}`,
        type: { 
          id: item.typeReclamationId || null,
          nom: item.typeReclamation || 'Réclamation' 
        },
        description: item.description,
        codeModule: item.noteModuleId || null,
        dateCreation: item.dateCreation,
        statutReclamation: item.status || 'EN_ATTENTE',
        commentaire: item.commentaire,
        etudiantId: item.etudiantId
      }));
      
      setReclamations(formattedData);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des réclamations :', err);
      setError('Pas de Reclamations');
      setLoading(false);
    }
  }, [etudiantId]);

  useEffect(() => {
    if (etudiantId) {
      fetchReclamations();
    }
  }, [etudiantId, fetchReclamations]);

  // Handle new reclamation
  useEffect(() => {
    if (newReclamation) {
      setReclamations(prevReclamations => [newReclamation, ...prevReclamations]);
      resetNewReclamation();
      // Reset to first page when a new reclamation is added
      setPage(0);
    }
  }, [newReclamation, resetNewReclamation]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated data
  const paginatedReclamations = reclamations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && reclamations.length === 0) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );
  
  if (error && reclamations.length === 0) return (
    <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
  );
  
  return (
    <Box sx={{ mt: 5 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center',
          color: theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 1
        }}
      >
        <FeedbackIcon sx={{ mr: 1 }} /> Mes réclamations
      </Typography>
      
      {reclamations.length === 0 ? (
        <Alert severity="info">Vous n&apos;avez pas encore de réclamations.</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedReclamations.map((reclamation, index) => (
              <Grid item xs={12} key={reclamation.id || `new-${index}`}>
                <Fade in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 0, 
                      overflow: 'hidden',
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        px: 2, 
                        py: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {reclamation.type?.nom || 'Unknown Type'}
                      </Typography>
                      <ReclamationStatus status={reclamation.statutReclamation || 'EN_ATTENTE'} />
                    </Box>
                    
                    <CardContent>
                      {reclamation.codeModule && (
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label={`Module: ${reclamation.codeModule}`} 
                            size="small" 
                            variant="outlined" 
                            color="info"
                          />
                        </Box>
                      )}
                      
                      <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                        {reclamation.description}
                      </Typography>
                      
                      <Box sx={{ 
                        mt: 3, 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        alignItems: 'center',
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                      }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="caption">
                          {formatDate(reclamation.dateCreation)}
                        </Typography>
                      </Box>
                      
                      {reclamation.commentaire && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              bgcolor: alpha(theme.palette.background.default, 0.5),
                              borderRadius: 1
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1, color: theme.palette.secondary.main }}>
                              Response:
                            </Typography>
                            <Typography variant="body2">
                              {reclamation.commentaire}
                            </Typography>
                          </Paper>
                        </>
                      )}
                    </CardContent>
                  </Paper>
                </Fade>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <TablePagination
              component="div"
              count={reclamations.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5]}
              labelRowsPerPage="Par page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  flexWrap: 'wrap',
                },
                '& .MuiTablePagination-selectLabel': {
                  margin: 1,
                },
                '& .MuiTablePagination-select': {
                  margin: 1,
                },
                '& .MuiTablePagination-displayedRows': {
                  margin: 1,
                },
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};
// Form for creating new reclamations
const ReclamationForm = ({ 
  reclamationTypes, 
  modules, 
  selectedType, 
  selectedModule, 
  description, 
  loading,
  handleTypeChange, 
  handleModuleChange, 
  setDescription, 
  handleSubmit 
}) => {
  const theme = useTheme();
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Type de réclamation</InputLabel>
            <Select
              value={selectedType}
              onChange={handleTypeChange}
              label="Reclamation Type"
            >
              {reclamationTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {modules.length > 0 && (
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Module</InputLabel>
              <Select
                value={selectedModule}
                onChange={handleModuleChange}
                label="Module"
              >
                {modules.map((module) => (
                  <MenuItem key={module.codeModule} value={module.codeModule}>
                    {module.designation}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Veuillez fournir des détails sur votre réclamation..."
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.light,
                },
              },
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ 
              mt: 2,
              px: 4,
              py: 1,
              borderRadius: '8px',
              boxShadow: theme.shadows[3],
              '&:hover': {
                boxShadow: theme.shadows[8],
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Soumettre Reclamation'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};


export default function ReclamationView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const [reclamationTypes, setReclamationTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [newReclamation, setNewReclamation] = useState(null);
  
  const etudiantId = '243AMT0464';
  
  useEffect(() => {
    const fetchReclamationTypes = async () => {
      try {
        const { response } = await reclamationService.getAllActiveTypeReclamation();
        setReclamationTypes(response.data || []);
      } catch (error) {
        console.error('Échec de la récupération des types de récupération :', error);
        setNotification({
          open: true,
          message: 'Échec du chargement des types de récupération',
          severity: 'error'
        });
      }
    };
    
    fetchReclamationTypes();
  }, []);
  
  useEffect(() => {
    const fetchModules = async () => {
      if (selectedType && reclamationTypes.find(type => type.id === selectedType)?.nom.toLowerCase().includes('module')) {
        try {
          const { response } = await reclamationService.getEtudiantModulesBySemestreAndClasse();
          setModules(response.data || []);
        } catch (error) {
          console.error('Échec de la récupération des modules :', error);
          setNotification({
            open: true,
            message: 'Échec du chargement des modules',
            severity: 'error'
          });
        }
      } else {
        setModules([]);
        setSelectedModule('');
      }
    };
    
    fetchModules();
  }, [selectedType, reclamationTypes]);
  
  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setSelectedModule('');
  };
  
  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
  };
  
  const resetNewReclamation = () => {
    setNewReclamation(null);
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!selectedType || !description) {
      setNotification({
        open: true,
        message: 'Veuillez remplir tous les champs obligatoires',
        severity: 'error'
      });
      return;
    }
    
    const reclamationData = {
      typeReclamationId: selectedType,
      etudiantId,
      description,
      codeModule: selectedModule || null
    };
    
    try {
      setLoading(true);
      const result = await reclamationService.addReclamation(reclamationData);
      setLoading(false);
      
      // Create a temporary reclamation object to add to the list
      const selectedTypeObj = reclamationTypes.find(type => type.id === selectedType);
      const newReclamationObj = {
        id: result.id || `temp-${Date.now()}`,
        type: {
          id: selectedType,
          nom: selectedTypeObj?.nom || 'Unknown Type'
        },
        description,
        codeModule: selectedModule,
        dateCreation: new Date().toISOString(),
        statutReclamation: 'EN_ATTENTE', // Default enum value for new reclamations
        etudiantId
      };
      
      // Set the new reclamation to be added to the list
      setNewReclamation(newReclamationObj);
      
      // Reset form
      setSelectedType('');
      setSelectedModule('');
      setDescription('');
      
      setNotification({
        open: true,
        message: 'Réclamation soumise avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Échec de la soumission de la réclamation :', error);
      setLoading(false);
      setNotification({
        open: true,
        message: 'Échec de la soumission de la réclamation :',
        severity: 'error'
      });
    }
  };
  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
        <PermissionBasedGuard permissions={['ACCESS_ORIENTATION']} hasContent>

    <Container maxWidth={settings.themeStretch ? false : 'xl'}>

      <Card 
        sx={{ 
          mb: 5, 
          overflow: 'visible',
          boxShadow: theme.shadows[10],
          borderRadius: 2,
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '5px',
            backgroundColor: theme.palette.primary.main,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center',
              color: theme.palette.primary.main
            }}
          >
            <FeedbackIcon sx={{ mr: 1 }} /> Soumettre une nouvelle réclamation
          </Typography>
          
          <ReclamationForm 
            reclamationTypes={reclamationTypes}
            modules={modules}
            selectedType={selectedType}
            selectedModule={selectedModule}
            description={description}
            loading={loading}
            handleTypeChange={handleTypeChange}
            handleModuleChange={handleModuleChange}
            setDescription={setDescription}
            handleSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
      
      <UserReclamations 
        etudiantId={etudiantId} 
        newReclamation={newReclamation}
        resetNewReclamation={resetNewReclamation}
      />
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
        </PermissionBasedGuard>

  );
}

UserReclamations.propTypes = {
  etudiantId: PropTypes.string.isRequired,
  newReclamation: PropTypes.object,
  resetNewReclamation: PropTypes.func.isRequired,
};

// ReclamationForm PropTypes
ReclamationForm.propTypes = {
  reclamationTypes: PropTypes.array.isRequired,
  modules: PropTypes.array.isRequired,
  selectedType: PropTypes.string.isRequired,
  selectedModule: PropTypes.string,
  description: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  handleTypeChange: PropTypes.func.isRequired,
  handleModuleChange: PropTypes.func.isRequired,
  setDescription: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};