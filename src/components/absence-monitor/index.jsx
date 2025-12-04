import PropTypes from 'prop-types';
import React, { useState, useEffect ,useCallback} from 'react';

import { 
  Info as InfoIcon, 
  School as SchoolIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  Box, 
  Card, 
  Grid, 
  Paper, 
  Alert, 
  Divider, 
  Tooltip, 
  Skeleton, 
  useTheme, 
  Container, 
  Typography,
  IconButton,
  CardContent,
  LinearProgress,
  CircularProgress
} from '@mui/material';

import absenceService from 'src/services/online-services/absenceService';

const AbsenceMonitor = ({etudiantId}) => {
  const [modules, setModules] = useState([]);
  const [absenceData, setAbsenceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
const fetchData = useCallback(async () => {
  setLoading(true);
  setError(null);
 
  try {
    const { response } = await absenceService.getEtudiantModulesBySemestreAndClasse();
    setModules(response.data);
   
    const absencePromises = response.data.map(module =>
      absenceService.getTauxAbsenceByModule(etudiantId, module.codeModule, '2022-01-01', '2025-12-31')
    );
    const results = await Promise.all(absencePromises);
    setAbsenceData(results.map(res => res.response.data));
  } catch (err) {
    setError(err.message || "Pas d'absence en ce moment, réessayez plus tard.");
  } finally {
    setLoading(false);
  }
}, [etudiantId]); 

useEffect(() => {
  fetchData();
}, [fetchData]);

  const getProgressColor = (value) => {
    if (value < 15) return theme.palette.success.main;
    if (value < 30) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const renderSkeleton = () => (
    <Box sx={{ mt: 3 }}>
      {[1, 2, 3, 4].map((item) => (
        <Box key={item} sx={{ mb: 3 }}>
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="20%" height={20} />
        </Box>
      ))}
    </Box>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Chargement des modules et des données d&apos;absence...
          </Typography>
          {renderSkeleton()}
        </Box>
      );
    }

    if (error) {
      return (
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            my: 3, 
            display: 'flex', 
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle1">
            {error}
          </Typography>
        </Alert>
      );
    }

    if (modules.length === 0) {
      return (
        <Alert 
          severity="info" 
          variant="filled"
          sx={{ my: 3, borderRadius: 2 }}
        >
          <Typography variant="subtitle1">
            Aucun module disponible pour ce semestre.
          </Typography>
        </Alert>
      );
    }

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {modules.map((module) => {
          const absenceInfo = absenceData.find(data => data.codeModule === module.codeModule);
          const absenceRate = absenceInfo ? absenceInfo.tauxAbsence : 0;
          const progressColor = getProgressColor(absenceRate);
          
          return (
            <Grid item xs={12} md={6} key={module.codeModule}>
              <Card 
                variant="outlined" 
                sx={{ 
                  position: 'relative',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                {absenceRate >= 30 && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      backgroundColor: theme.palette.error.main,
                      p: 0.5,
                      borderBottomLeftRadius: 8
                    }}
                  >
                    <WarningIcon sx={{ color: '#fff' }} />
                  </Box>
                )}
                
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {module.designation}
                    </Typography>
                    <Tooltip title="Code du module: Informations sur le module">
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          ml: 1, 
                          backgroundColor: theme.palette.grey[200],
                          py: 0.5,
                          px: 1,
                          borderRadius: 1
                        }}
                      >
                        {module.codeModule}
                      </Typography>
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ position: 'relative', mt: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={absenceRate} 
                      sx={{ 
                        height: 16,
                        borderRadius: 1,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: progressColor,
                          borderRadius: 1
                        }
                      }} 
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'bold', 
                          color: absenceRate > 50 ? '#fff' : '#000'
                        }}
                      >
                        {`${absenceRate}%`}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    
                    <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: progressColor
                          }}
                        >
                          {(() => {
                            if (absenceRate >= 30) {
                              return 'Risque d\'échec !';
                            }
                            if (absenceRate >= 15) {
                              return 'Attention';
                            }
                            return '---';
                          })()}
                        </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Paper 
        elevation={3}
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden' 
        }}
      >
        <Box 
          sx={{ 
            backgroundColor: theme.palette.primary.main, 
            py: 2, 
            px: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ fontSize: 28, color: '#fff', mr: 1 }} />
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
              Suivi des Absences
            </Typography>
          </Box>
          
          <Tooltip title="Rafraîchir les données">
            <IconButton 
              onClick={fetchData} 
              disabled={loading}
              sx={{ color: '#fff' }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Ce tableau affiche vos taux d&apos;absence par module pour le semestre en cours.
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {renderContent()}
          
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="textSecondary">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};


AbsenceMonitor.propTypes = {
  etudiantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default AbsenceMonitor;