import React from 'react';
import PropTypes from 'prop-types';

import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  Box,
  Card,
  Chip,
  Divider,
  Typography,
} from '@mui/material';

const statusColor = {
  'EN_ATTENTE': 'warning',
  'RESOLUE': 'success',
  'EN_COURS': 'info',
};

const ReclamationCard = ({ item, onVoirDetails }) => (
  <Card
    sx={{
      p: 2.5,
      borderRadius: 3,
      boxShadow: 2,
      borderLeft: '5px solid #c51414',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Box display="flex" alignItems="center" mb={2}>
      <Box
        sx={{
          backgroundColor: '#c51414',
          color: 'white',
          width: 45,
          height: 45,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          mr: 2,
        }}
      >
        {item.nom
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)}
      </Box>
      <Box>
        <Typography fontWeight="bold">{item.nom}</Typography>
        <Typography variant="body2" color="text.secondary">
          ID: {item.studentId}
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Chip
        label={item.statut}
        color={statusColor[item.statut]}
        variant="filled"
        size="small"
      />
    </Box>

    <Box display="flex" alignItems="center" mb={1}>
      <DescriptionIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
      <Typography><strong>{item.type}</strong></Typography>
    </Box>
    <Box display="flex" alignItems="center" mb={1}>
      <EmailIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
      <Typography>{item.email}</Typography>
    </Box>
    <Box display="flex" alignItems="center" mb={1}>
      <CalendarTodayIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
      <Typography>{item.date}</Typography>
    </Box>

    <Divider sx={{ my: 1.5 }} />

    <Box display="flex" justifyContent="space-between">
      <Typography variant="caption"> </Typography>
      <Typography
        variant="body2"
        fontWeight="bold"
        color="primary"
        sx={{ cursor: 'pointer' }}
        onClick={() => onVoirDetails(item)}
      >
        Voir détails
      </Typography>
    </Box>
  </Card>
  
);

ReclamationCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nom: PropTypes.string.isRequired,
    studentId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    statut: PropTypes.oneOf(['En attente', 'Résolue', 'En cours']).isRequired,
  }).isRequired,
  onVoirDetails: PropTypes.func.isRequired,
};

export default ReclamationCard;
