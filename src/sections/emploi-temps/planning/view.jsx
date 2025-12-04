import React from 'react';

import {
  Container,
  Typography,

} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';



export default function OneView() {
  
  return (
    <Container >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Typography variant="h4"> Planning </Typography>
        </LocalizationProvider>
    </Container>
  );  
}
