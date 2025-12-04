import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import GradeIcon from '@mui/icons-material/Grade';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Box,
  Grid,
  Card,
  Fade,
  Paper,
  Alert,
  alpha,
  Select,
  Button,
  Rating,
  Divider,
  MenuItem,
  Snackbar,
  useTheme,
  Container,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  CardContent,
} from '@mui/material';
import PermissionBasedGuard from "src/auth/guard/permession-based-guard"

import { useAuthContext } from 'src/auth/hooks';
import evaluationService from 'src/services/online-services/evaluationService';

import UserEvaluations from 'src/components/user-evaluations-table';

const EvaluationView = () => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = '#0a4d8c'; // Secondary color for accents

  // Custom theme palette
  const customPalette = {
    primary: {
      main: primaryColor,
      light: alpha(primaryColor, 0.6),
      lighter: alpha(primaryColor, 0.1),
      dark: '#a11119',
    },
    secondary: {
      main: secondaryColor,
      light: alpha(secondaryColor, 0.7),
      lighter: alpha(secondaryColor, 0.1),
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  };

  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [modules, setModules] = useState([]);
  const { user } = useAuthContext();
  const etudiantId = user?.etudiantId || user?.sub;

  const navigate = useNavigate();

  const [selectedModule, setSelectedModule] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [ratings, setRatings] = useState({});
  const [description, setDescription] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);
  
  // 1. Add a state variable to trigger the refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const nomClasse = '1ALINFO1';
  const evaluationTypeMapping = {
    EVALUATION_ENSEIGNANT: 'Evaluation Enseignant',
    EVALUATION_MODULE: 'Evaluation Module',
    EVALUATION_STAGES: 'Evaluation Stages',
    EVALUATION_GENERALE: 'Evaluation Générale',
  };

  useEffect(() => {
    if (!user) {
      navigate('/auth/jwt/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchEvaluationTypes = async () => {
      try {
        setLoading(true);
        const { response } = await evaluationService.getAllTypeEvals();
        setEvaluationTypes(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des types d'évaluation :", error);
        setLoading(false);
      }
    };
    fetchEvaluationTypes();
  }, []);

  const handleTypeChange = async (event) => {
    const typeId = event.target.value;
    setSelectedType(typeId);
    setSelectedTeacher('');
    setSelectedModule('');
    setRatings({});
    setModules([]);
    setCriteria([]);
    setTeachers([]);

    try {
      setLoading(true);
      const { response: criteriaResponse } = await evaluationService.getEvalCriteria(typeId);
      setCriteria(criteriaResponse.data);

      if (typeId === 1 || typeId === '1') {
        const { response: teacherResponse } =
          await evaluationService.getEmployePlanningByClasse(nomClasse);

        if (teacherResponse.status === 404) {
          setSnackbarMessage(`Erreur: ${teacherResponse.message}`);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setLoading(false);
          return; // Block further execution
        }

        const formattedTeachers = teacherResponse.data.map((t) => ({
          id: t.idEmploye,
          name: `${t.prenom} ${t.nom}`,
        }));
        setTeachers(formattedTeachers);
      }

      if (typeId === 2 || typeId === '2') {
        const { response: moduleResponse } =
          await evaluationService.getEtudiantModulesBySemestreAndClasse();
        setModules(moduleResponse.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur dans handleTypeChange :', error);
      setSnackbarMessage(error.message || "Une erreur s'est produite");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleRatingChange = (criteriaIndex, newValue) => {
    setRatings({ ...ratings, [criteriaIndex]: newValue });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const evaluationDetails = criteria.map((item, index) => ({
        criteria: index + 1,
        score: ratings[index] || 0,
      }));

      const evaluationData = {
        etudiantId,
        idTypeEvaluation: parseInt(selectedType, 10),
        idEmploye: isTypeOne ? selectedTeacher : null,
        codeModule: isTypeTwo ? selectedModule : null,
        details: evaluationDetails,
        idAnnee: 9,
        description: description || null,
      };

      await evaluationService.createEvaluation(evaluationData);
      setSnackbarMessage('Évaluation soumise avec succès !');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Reset form state
      setRatings({});
      setDescription('');

      // 2. Trigger the refresh by updating the state
      setRefreshTrigger(prev => prev + 1);

      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la soumission de l'évaluation :", error.message);
      setSnackbarMessage(error.message || 'Échec de la soumission');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const allRatingsFilled = criteria.length > 0 && criteria.every((_, index) => ratings[index] !== undefined);
  const hasModules = Array.isArray(modules) && modules.length > 0;
  const isTypeTwo = selectedType === 2 || selectedType === '2';
  const isTypeOne = selectedType === 1 || selectedType === '1';

  return (
        <PermissionBasedGuard permissions={['ACCESS_ORIENTATION']} hasContent>

    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography
          variant="h4"
          sx={{
            position: 'relative',
            display: 'inline-block',
            fontWeight: 'bold',
            color: customPalette.primary.main,
            '&:after': {
              content: '""',
              position: 'absolute',
              width: '60%',
              height: '4px',
              bottom: '-10px',
              left: '20%',
              backgroundColor: customPalette.primary.main,
              borderRadius: '2px',
            },
          }}
        >
          Système d&apos;Évaluation
        </Typography>
      </Box>

      <Card
        elevation={4}
        sx={{
          mb: 5,
          overflow: 'visible',
          boxShadow: theme.shadows[8],
          borderRadius: 2,
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '5px',
            backgroundColor: customPalette.primary.main,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              color: customPalette.primary.main,
            }}
          >
            <AssessmentIcon sx={{ mr: 1 }} /> Nouvelle Évaluation
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Box mt={2}>
            {/* Type Selection */}
            <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
              <InputLabel>Type d&apos;Évaluation</InputLabel>
              <Select
                value={selectedType}
                onChange={handleTypeChange}
                label="Type d'Évaluation"
                sx={{
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: customPalette.primary.main,
                  },
                }}
              >
                {evaluationTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {evaluationTypeMapping[type.type] || type.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress sx={{ color: customPalette.primary.main }} />
              </Box>
            )}

            {/* Teacher Selection (for type 1) */}
            {isTypeOne && teachers.length > 0 && (
              <Fade in timeout={500}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                  <InputLabel>Choisir l&apos;Enseignant</InputLabel>
                  <Select
                    value={selectedTeacher}
                    onChange={(event) => setSelectedTeacher(event.target.value)}
                    label="Choisir l'Enseignant"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customPalette.primary.main,
                      },
                    }}
                    startAdornment={
                      <SchoolIcon sx={{ mr: 1, ml: -0.5, color: customPalette.secondary.main }} />
                    }
                  >
                    {teachers.map((teacher) => (
                      <MenuItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Fade>
            )}

            {/* Module Selection (for type 2) */}
            {isTypeTwo && hasModules && (
              <Fade in timeout={500}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                  <InputLabel>Sélectionner le Module</InputLabel>
                  <Select
                    value={selectedModule}
                    onChange={(event) => setSelectedModule(event.target.value)}
                    label="Sélectionner le Module"
                    sx={{
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: customPalette.primary.main,
                      },
                    }}
                    startAdornment={
                      <SchoolIcon sx={{ mr: 1, ml: -0.5, color: customPalette.secondary.main }} />
                    }
                  >
                    {modules.map((module) => (
                      <MenuItem key={module.codeModule} value={module.codeModule}>
                        {module.designation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Fade>
            )}

            {/* Criteria Section */}
            {criteria.length > 0 && (
              <Fade in timeout={800}>
                <Box mt={3}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      backgroundColor: customPalette.primary.lighter,
                      borderColor: customPalette.primary.light,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: customPalette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <GradeIcon sx={{ mr: 1 }} /> Critères d&apos;Évaluation
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      {criteria.map((item, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderRadius: 1,
                              backgroundColor: 'white',
                              border: '1px solid',
                              borderColor: ratings[index]
                                ? customPalette.primary.light
                                : 'transparent',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                borderColor: customPalette.primary.light,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              },
                            }}
                          >
                            <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                              {item.criteria}
                            </Typography>
                            <Rating
                              name={`rating-${index}`}
                              value={ratings[index] || 0}
                              onChange={(event, newValue) => handleRatingChange(index, newValue)}
                              max={5}
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: customPalette.primary.main,
                                },
                                '& .MuiRating-iconHover': {
                                  color: customPalette.primary.light,
                                },
                              }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Box>
              </Fade>
            )}

            {/* Description TextField */}
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Description (optionnelle)"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              sx={{
                mt: 3,
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: customPalette.primary.light,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: customPalette.primary.main,
                  },
                },
              }}
              placeholder="Ajoutez des commentaires ou des précisions concernant votre évaluation..."
            />

            {/* Submit and Cancel Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-start' }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: customPalette.primary.main,
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: customPalette.primary.dark,
                  },
                  '&:disabled': {
                    backgroundColor: alpha(customPalette.primary.main, 0.5),
                  },
                  py: 1.5,
                  px: 4,
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 10px rgba(206, 23, 31, 0.3)',
                }}
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !selectedType ||
                  (isTypeOne && !selectedTeacher) ||
                  (isTypeTwo && !selectedModule) ||
                  !allRatingsFilled
                }
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Soumettre"}
              </Button>

              <Button
                variant="outlined"
                sx={{
                  borderColor: customPalette.primary.main,
                  color: customPalette.primary.main,
                  '&:hover': {
                    borderColor: customPalette.primary.dark,
                    backgroundColor: alpha(customPalette.primary.main, 0.04),
                  },
                  py: 1.5,
                  px: 4,
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                }}
                onClick={() => {
                  setSelectedType('');
                  setSelectedTeacher('');
                  setSelectedModule('');
                  setRatings({});
                  setDescription('');
                  setCriteria([]);
                  setTeachers([]);
                  setModules([]);
                }}
                disabled={loading}
              >
                Annuler
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* User Evaluations Section */}
      <Box mt={4}>
        {/* 3. Pass the trigger prop to the child component */}
        <UserEvaluations studentId={etudiantId} refreshTrigger={refreshTrigger} />
      </Box>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          elevation={6}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
        </PermissionBasedGuard>

  );
};

export default EvaluationView;