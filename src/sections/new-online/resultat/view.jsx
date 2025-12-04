import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import SchoolIcon from '@mui/icons-material/School';
import { alpha, useTheme } from '@mui/material/styles';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuthContext } from "src/auth/hooks"
import resultsService from 'src/services/online-services/resultsService';

import AverageGradesFetcher from 'src/components/average-grades';
import ResultsDetails from 'src/components/results-details-table';

export default function ResultatView() {
  const theme = useTheme();
  const [result, setResult] = useState(null);
  const [modulesResult, setModulesResult] = useState([]);
  const { user } = useAuthContext() ;
   const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [fetchErrorResult, setFetchErrorResult] = useState(null);
  const [fetchErrorModules, setFetchErrorModules] = useState(null);
  const [noModuleNotesInserted, setNoModuleNotesInserted] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0); 
  const etudiantId = user?.sub;
  const annee = '9'; 
  const sessionId = selectedTab === 0 ? 'P' : 'R';

    useEffect(() => {
    if (!user) {
      navigate('/auth/jwt/login', { replace: true });
    }
  }, [user, navigate]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setFetchErrorResult(null);
      setFetchErrorModules(null);
      setNoModuleNotesInserted(false); 
      setResult(null);
      setModulesResult([]);

      try {
        const { response } = await resultsService.getEtudiantResultBySession(etudiantId, sessionId);
        setResult(response.data);
      } catch (err) {
        console.error('Error fetching result:', err);
        setFetchErrorResult("Aucun résultat n'est disponible pour le moment");
      }

      try {
        const { response } = await resultsService.getEtudiantModulesResultBySessionAndAnnee(etudiantId, annee, sessionId);
        if (response.data.length === 0) {
          setNoModuleNotesInserted(true);
        } else {
          setModulesResult(response.data);
        }
      } catch (err) {
        console.error('Error fetching module results:', err);
        setFetchErrorModules('Erreur de chargement des résultats des modules');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [etudiantId, annee, sessionId]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" flexDirection="column" gap={2} minHeight="200px" alignItems="center" justifyContent="center">
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Chargement des résultats...
          </Typography>
        </Box>
      );
    }

    if (fetchErrorResult) {
      return (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            bgcolor: alpha(theme.palette.error.main, 0.05),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            borderRadius: 2
          }}
        >
          <Typography variant="body1" color="error.main">
            {fetchErrorResult}
          </Typography>
        </Paper>
      );
    }

    if (result) {
      const isSuccess = result.moyenne >= 10;
      const statusColor = isSuccess ? theme.palette.success.main : theme.palette.error.main;

      return (
        <Fade in timeout={500}>
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pb: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}>
              <AssessmentIcon 
                sx={{ 
                  mr: 1.5, 
                  color: statusColor,
                  fontSize: 28
                }} 
              />
              <Typography variant='h5' sx={{ fontWeight: 'medium' }}>
                Moyenne: <Box component="span" sx={{ color: statusColor, fontWeight: 'bold' }}>
                {result && result.moyenne !== undefined ? result.moyenne.toFixed(2) : 'N/A'}
                </Box>
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pb: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}>
              <SchoolIcon 
                sx={{ 
                  mr: 1.5, 
                  color: statusColor,
                  fontSize: 28
                }} 
              />
              <Typography variant='h5' sx={{ fontWeight: 'medium' }}>
                Décision: <Box component="span" sx={{ color: statusColor, fontWeight: 'bold' }}>
                  {result.decisionResultat}
                </Box>
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              pb: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}>
              <EventNoteIcon 
                sx={{ 
                  mr: 1.5, 
                  color: theme.palette.primary.main,
                  fontSize: 28
                }} 
              />
              <Typography variant='h6'>
                Session: <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {result.session === 'P' ? 'Principale' : 'Rattrapage'}
                </Box>
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mt: 1
            }}>
              <AccessTimeIcon 
                sx={{ 
                  mr: 1, 
                  color: theme.palette.text.secondary,
                  fontSize: 20
                }} 
              />
              <Typography variant='body2' color="text.secondary">
                Date de Saisie: {formatDate(result.dateSaisie)}
              </Typography>
            </Box>
          </Box>
        </Fade>
      );
    }

    return (
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
        Aucune donnée disponible
      </Typography>
    );
  };

  const renderModulesContent = () => {
    if (loading) {
      return (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
        </Box>
      );
    }

    if (noModuleNotesInserted) {
      return (
        <Fade in timeout={600}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.05),
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Aucun module inséré, veuillez réessayer plus tard.
            </Typography>
          </Paper>
        </Fade>
      );
    }

    if (fetchErrorModules) {
      return (
        <Fade in timeout={600}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
            }}
          >
            <Typography variant="body1" color="error.main">
              Pas de notes saisies par l&apos;enseignant à ce moment.
            </Typography>
          </Paper>
        </Fade>
      );
    }

    return modulesResult.length > 0 ? (
      <Fade in timeout={700}>
        <Box>
          <ResultsDetails results={modulesResult} />
        </Box>
      </Fade>
    ) : (
      <Fade in timeout={600}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Aucun résultat pour les modules.
          </Typography>
        </Paper>
      </Fade>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            position: 'relative',
            display: 'inline-block',
            fontWeight: 'bold',
            '&:after': {
              content: '""',
              position: 'absolute',
              width: '60%',
              height: '4px',
              bottom: '-10px',
              left: '20%',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '2px'
            }
          }}
        >
          Résultats Étudiant
        </Typography>
      </Box>

      <Card 
        sx={{ 
          mb: 4, 
          overflow: 'visible',
          boxShadow: theme.shadows[3],
          borderRadius: 2
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            centered
            sx={{
              bgcolor: theme.palette.background.paper,
              borderRadius: '8px 8px 0 0',
              borderBottom: `1px solid ${theme.palette.divider}`,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab 
              label="Session Principale" 
              icon={<EventNoteIcon />}
              iconPosition="start"
              sx={{
                py: 2,
                px: 3,
                borderRadius: '8px 0 0 0',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }
              }} 
            />
            <Tab 
              label="Session Rattrapage" 
              icon={<EventNoteIcon />}
              iconPosition="start"
              sx={{
                py: 2,
                px: 3,
                borderRadius: '0 8px 0 0',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 'bold',
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }
              }} 
            />
          </Tabs>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              overflow: 'hidden',
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
                  color: theme.palette.primary.main,
                  pb: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <AssessmentIcon sx={{ mr: 1 }} /> Résultat Global
              </Typography>
              
              {renderContent()}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          {noModuleNotesInserted ? null : (
            <Fade in timeout={800}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: theme.shadows[5],
                  overflow: 'hidden',
                  position: 'relative',
                  }}
              >
                <CardContent sx={{ p: 3 }}>
     
                  
                  <AverageGradesFetcher modules={modulesResult} />
                </CardContent>
              </Card>
            </Fade>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3, 
            display: 'flex', 
            alignItems: 'center',
            color: theme.palette.primary.main
          }}
        >
          <SchoolIcon sx={{ mr: 1 }} /> Détails des Modules
        </Typography>
        
        {renderModulesContent()}
      </Box>
    </Container>
  );
}