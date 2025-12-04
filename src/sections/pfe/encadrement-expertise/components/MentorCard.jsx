import React from 'react';
import PropTypes from 'prop-types';

import MailIcon from '@mui/icons-material/Mail';
import {
  Card,
  Chip,
  Stack,
  Typography,
} from '@mui/material';

const MentorCard = ({ mentor }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: 3,
      p: 2.5,
      backgroundColor: 'background.paper',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: 6,
      },
    }}
  >
    <Typography fontWeight="bold" variant="subtitle1">{mentor?.nom} {mentor?.prenom}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
      <MailIcon fontSize="small" sx={{ mr: 0.5 }} />
      {mentor?.email}
    </Typography>
    <Stack direction="row" spacing={1} mt={1}>
      <Chip label="8 encadrements" size="small" />
      <Chip label="4 expertises" size="small" />
    </Stack>
  </Card>
);

MentorCard.propTypes = {
  mentor: PropTypes.shape({
    nom: PropTypes.string.isRequired,
    prenom: PropTypes.string,
    email: PropTypes.string.isRequired,
    nbEncadrements: PropTypes.number,
    nbExpertises: PropTypes.number,
  }).isRequired,
};

export default MentorCard;