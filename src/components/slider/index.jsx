import React, { useState, useEffect } from 'react';

import {useTheme } from "@mui/material/styles"
import { Box, Typography } from '@mui/material';

import profileService from 'src/services/online-services/profileService';

const SlidingHeadline = () => {
  const [holidayMessage, setHolidayMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const theme = useTheme()


  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const { response } = await profileService.getNextHolidays();
        const {data} = response;

        const message = `Les prochaines vacances (${data.nom}) auront lieu du ${data.dateDebut} au ${data.dateFin}. Il vous reste ${data.waitTime} jours avant le début de ces vacances.`;
        setHolidayMessage(message);
      } catch (error) {
        setHolidayMessage('Pas de vacances à venir pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  return (
    <Box sx={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '100%',
      bgcolor: theme.palette.primary.main,
      color: 'white',
      p: 1
    }}>
      <Box
        sx={{
          display: 'inline-block',
          animation: 'slide 20s linear infinite',
          whiteSpace: 'nowrap',
          paddingRight: loading ? 0 : '50px'
        }}
      >
        {loading ? (
          <Typography variant="h6">Chargement des informations...</Typography>
        ) : (
          <Typography variant="h6">
            {holidayMessage}
          </Typography>
        )}
      </Box>
      <style>
        {`
          @keyframes slide {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
    </Box>
  );
};

export default SlidingHeadline;
