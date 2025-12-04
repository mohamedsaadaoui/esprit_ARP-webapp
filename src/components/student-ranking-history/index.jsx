import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import GradeIcon from '@mui/icons-material/Grade';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { 
  Box, 
  Card, 
  Fade, 
  alpha, 
  Paper, 
  useTheme,
  Typography,
  CircularProgress
} from '@mui/material';

import profileService from 'src/services/online-services/profileService';

const StudentRankingCard = ({ 
  etudiantId, 
  nomClasse, 
  idAnnee = 9, 
  idSession = "P" 
}) => {
  const theme = useTheme();
  const [rankingData, setRankingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        setLoading(true);
        const { response } = await profileService.getStudentRankingParams(
          etudiantId,
          nomClasse,
          idAnnee,
          idSession
        );
        setRankingData(response.data[0]);
      } catch (err) {
        console.error('Error fetching ranking data:', err);
        setError('Aucun classement disponible pour le moment');
      } finally {
        setLoading(false);
      }
    };

    if (etudiantId && nomClasse) {
      fetchRankingData();
    }
  }, [etudiantId, nomClasse, idAnnee, idSession]);

  const getRankInfo = (rank, total) => {
    if (!rank || !total) return { color: '#757575', text: 'Non classé' };
    
    const percentile = (rank / total) * 100;
    
    if (percentile <= 10) return { color: '#FFD700', text: 'Excellent' };
    if (percentile <= 25) return { color: '#2196F3', text: 'Très bien' };
    if (percentile <= 50) return { color: '#4CAF50', text: 'Bien' }; 
    if (percentile <= 75) return { color: '#FF9800', text: 'Moyen' }; 
    return { color: '#757575', text: 'À améliorer' }; 
  };

  if (loading) {
    return (
      <Card sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[3],
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress size={40} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Card>
    );
  }

  if (error || !rankingData) {
    return (
      <Card sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[3],
        bgcolor: alpha(theme.palette.error.light, 0.1),
        height: '100%'
      }}>
        <Typography color="error" align="center">
          {error || 'No ranking data available'}
        </Typography>
      </Card>
    );
  }

  const { rank, totalStudents, moyenne, nomClasse: classe } = rankingData;
  const rankInfo = getRankInfo(rank, totalStudents);
  const rankPercentile = totalStudents ? Math.round((rank / totalStudents) * 100) : null;

  return (
    <Fade in timeout={500}>
      <Card sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[10],
        position: 'relative',
        overflow: 'visible',
        height: '100%',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '5px',
          backgroundColor: theme.palette.primary.main,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }
      }}>
        <Paper
          sx={{
            position: 'absolute',
            top: -15,
            left: 20,
            zIndex: 1,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            p: 1,
            px: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            fontWeight: 'bold',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiEventsIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            <Typography variant="subtitle1" fontWeight="bold">Classement</Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, mb: 2, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{
              fontWeight: 'bold',
              color: rankInfo.color,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              my: 2
            }}
          >
            {rank}
            <Typography 
              component="span" 
              sx={{ 
                fontSize: '1.2rem', 
                color: theme.palette.text.secondary,
                ml: 1, 
                fontWeight: 'normal',
                alignSelf: 'flex-end',
                mb: 1
              }}
            >
              / {totalStudents}
            </Typography>
          </Typography>

          <Typography 
            variant="h6" 
            sx={{ 
              color: rankInfo.color,
              mb: 1,
              fontWeight: 'medium',
              bgcolor: alpha(rankInfo.color, 0.1),
              py: 0.5,
              px: 2,
              borderRadius: 2,
              display: 'inline-block'
            }}
          >
            {rankInfo.text}
          </Typography>

          {rankPercentile && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                mb: 3
              }}
            >
              Top {rankPercentile}% de la classe
            </Typography>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2,
          mt: 4,
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          p: 2,
          borderRadius: 2,
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GradeIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="subtitle1">Moyenne:</Typography>
            </Box>
            <Typography 
              variant="subtitle1" 
              fontWeight="bold" 
              sx={{ 
                py: 0.5, 
                px: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                borderRadius: 1,
                color: theme.palette.text.primary
              }}
            >
              {moyenne}/20
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="subtitle1">Classe:</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {classe}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
              <Typography variant="subtitle1">Effectif:</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {totalStudents} étudiants
            </Typography>
          </Box>
        </Box>
      </Card>
    </Fade>
  );
};

StudentRankingCard.propTypes = {
    etudiantId: PropTypes.string.isRequired,
    nomClasse: PropTypes.string.isRequired,
    idAnnee: PropTypes.number,
    idSession: PropTypes.string,
  };

export default StudentRankingCard;
  