import PropTypes from 'prop-types';
import React, { useState } from 'react';

import {
  Box,
  Fade,
  Radio,
  Paper,
  Button,
  Dialog,
  Divider,
  useTheme,
  TextField,
  RadioGroup,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  Calculate as CalculateIcon,
  CalendarMonth as CalendarIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';

import resultsService from 'src/services/online-services/resultsService';

const AverageGradesFetcher = ({ modules }) => {
  const theme = useTheme();
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSession, setSelectedSession] = useState('P');
  const [averageData, setAverageData] = useState(null);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFetchAverage = async () => {
    if (!selectedModule || !selectedSession) {
      setError('Veuillez sélectionner un module et une session.');
      return;
    }

    setLoading(true);
    setError(''); // Reset error before fetching
    try {
      const result = await resultsService.getAverageGradesBySessionAndAnnee(selectedModule, selectedSession, '9');
      if (result.response.data.length > 0) {
        setAverageData(result.response.data[0]);
      } else {
        setAverageData(null);
      }
      setOpenDialog(true);
    } catch (err) {
      setError('Erreur lors de la récupération des moyennes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getGradeColor = (grade) => {
    if (!grade) return theme.palette.text.secondary;
    const numGrade = parseFloat(grade);
    if (numGrade >= 16) return theme.palette.success.main; // Excellent
    if (numGrade >= 14) return '#2e7d32'; // Very Good
    if (numGrade >= 12) return '#1976d2'; // Good
    if (numGrade >= 10) return '#ed6c02'; // Average
    return theme.palette.error.main; // Below Average
  };

  return (
    <Paper 
      elevation={3} 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        backgroundColor: theme.palette.primary,
        borderRadius: 2,
        maxWidth: 500,
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: '8px', 
          bgcolor: theme.palette.primary.main 
        }}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, width: '100%' }}>
        <SchoolIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        <Typography variant="h5" component="h2" fontWeight="bold" color="primary.dark">
          Récupération des Moyennes
        </Typography>
      </Box>

      <Divider sx={{ width: '100%', mb: 3 }} />

      <Box sx={{ width: '100%', mb: 2, display: 'flex', alignItems: 'center' }}>
        <LibraryBooksIcon color="primary" sx={{ mr: 1 }} />
        <TextField
          select
          label="Module"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          fullWidth
          SelectProps={{
            native: true,
          }}
          variant="outlined"
          sx={{ 
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        >
          <option value="" disabled>
            Sélectionnez un module
          </option>
          {Array.isArray(modules) && modules.length > 0 ? (
            modules.map((module) => (
              <option key={module.codeModule} value={module.codeModule}>
                {module.moduleName}
              </option>
            ))
          ) : (
            <option value="" disabled>
              Aucun module disponible
            </option>
          )}
        </TextField>
      </Box>

      <Box sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body1" fontWeight="medium">Session</Typography>
        </Box>
        <RadioGroup
          row
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          sx={{ 
            justifyContent: 'center',
            '& .MuiFormControlLabel-root': {
              mx: 2,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              px: 2,
              py: 0.5,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            },
            '& .Mui-checked': {
              '& + span': {
                color: theme.palette.primary.main,
                fontWeight: 'bold',
              },
            },
          }}
        >
          <FormControlLabel 
            value="P" 
            control={<Radio color="primary" />} 
            label="Principale" 
          />
          <FormControlLabel 
            value="R" 
            control={<Radio color="primary" />} 
            label="Rattrapage" 
          />
        </RadioGroup>
      </Box>

      <Button 
        variant="contained" 
        onClick={handleFetchAverage}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <BarChartIcon />}
        sx={{ 
          px: 4,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          boxShadow: theme.shadows[2],
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }}
      >
        {loading ? 'Chargement...' : 'Voir la moyenne'}
      </Button>

      {error && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: theme.palette.error.main }}>
          <RefreshIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="error">{error}</Typography>
        </Box>
      )}

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        TransitionComponent={Fade}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          elevation: 5,
          sx: { 
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalculateIcon sx={{ mr: 1 }} />
            Note Moyenne
          </Box>
          <CloseIcon 
            onClick={handleCloseDialog} 
            sx={{ cursor: 'pointer' }} 
          />
        </DialogTitle>
        <DialogContent sx={{ padding: '24px', backgroundColor: '#f9f9fa' }}>
          {averageData ? (
            <Box sx={{ textAlign: 'left' }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6">
                  Notes moyennes:
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: getGradeColor(averageData.averageResult),
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {averageData.averageResult} <span style={{ fontSize: '1rem', marginLeft: '4px' }}>/20</span>
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LibraryBooksIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body1">
                    Module: <span style={{ fontWeight: '500' }}>{averageData.moduleName}</span>
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body1">
                    Année académique: <span style={{ fontWeight: '500' }}>{averageData.academicYearDescription}</span>
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <GroupsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="body1">
                    Nombre d&apos;étudiants calculé: <span style={{ fontWeight: '500' }}>{averageData.dataCount}</span>
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: 150, 
              flexDirection: 'column', 
              gap: 2 
            }}>
              <RefreshIcon color="action" fontSize="large" />
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                Aucune donnée disponible.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: '#f9f9fa' }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

AverageGradesFetcher.propTypes = {
  modules: PropTypes.arrayOf(
    PropTypes.shape({
      codeModule: PropTypes.string.isRequired,
      moduleName: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default AverageGradesFetcher;