import React from 'react';
import PropTypes from 'prop-types';

import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Box, Card, Typography, CircularProgress } from '@mui/material';

// icon mapping
const iconMap = {
  Total: <GroupIcon fontSize="large" color="primary" />,
  'En attente': <HourglassEmptyIcon fontSize="large" sx={{ color: '#fbc02d' }} />,
  Résolues: <CheckCircleIcon fontSize="large" sx={{ color: '#4caf50' }} />,
  'En cours': <CircularProgress  fontSize="large" sx={{ color: '#2196f3' }} />,
};

const StatCard = ({ label, count }) => (
  <Card
    sx={{
      flex: 1,
      p: 2.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: 2,
      borderRadius: 3,
      minHeight: 100,
    }}
  >
    <Box sx={{ mb: 1 }}>{iconMap[label] || iconMap.Total}</Box>
    <Typography variant="h6">{label}</Typography>
    <Typography variant="h4" fontWeight="bold" mt={1}>
      {count}
    </Typography>
  </Card>
);

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
};

export default StatCard;
