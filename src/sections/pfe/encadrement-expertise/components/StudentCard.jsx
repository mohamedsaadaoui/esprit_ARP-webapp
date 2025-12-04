import React from 'react';
import PropTypes from 'prop-types';

import AddIcon from '@mui/icons-material/Add';
import MailIcon from '@mui/icons-material/Mail';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Card,
  Chip,
  Stack,
  Button,
  Typography,
} from '@mui/material';

const StudentCard = ({ student, showAssignButton = false, onAssignClick,onUnassignClick,onDetailsClick }) => (
  <Card
    sx={{
      borderRadius: 3,
      boxShadow: 3,
      p: 2.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'background.paper',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: 6,
      },
    }}
  >
    <Box display="flex" alignItems="center">
      <Typography variant="h4" sx={{ fontSize: 30, mr: 2 }}>🧑</Typography>
      <Box>
        <Typography fontWeight="bold">
          {student?.nom} {student?.prenom}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <MailIcon fontSize="small" sx={{ mr: 0.5 }} />
          {student?.emailEtudiant}
        </Typography>
        <Stack direction="row" spacing={1} mt={1}>
          <Chip label={student?.codeSpecialite?.designationSpecialite} size="small" />
        </Stack>
      </Box>
    </Box>
    {showAssignButton ? (
      <Button
        onClick={onAssignClick}
        variant="contained"
        startIcon={<AddIcon />}
        sx={{
          backgroundColor: 'primary.main',
          '&:hover': { backgroundColor: 'primary.dark' },
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
        }}
      >
        Assigner
      </Button>
    ) : (
      <Button
        onClick={onUnassignClick}
        variant="outlined"
        startIcon={<DeleteIcon />}
        sx={{
          color: 'error.main',
          borderColor: 'error.main',
          '&:hover': {
            backgroundColor: 'error.light',
            borderColor: 'error.dark',
          },
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 2,
        }}
      >
        Desaffecter l&apos;encadrant
      </Button>
    )}
        {onDetailsClick && (
          <Button
            onClick={onDetailsClick}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              ml: 1,
              borderRadius: 2,
            }}
          >
            Voir Etat d&apos;encadrement
          </Button>
        )}

  </Card>
);

StudentCard.propTypes = {
  student: PropTypes.shape({
    nom: PropTypes.string,
    prenom: PropTypes.string,
    emailEtudiant: PropTypes.string,
    codeSpecialite: PropTypes.shape({
      designationSpecialite: PropTypes.string,
    }),
  }).isRequired,
  showAssignButton: PropTypes.bool,
  onAssignClick: PropTypes.func,
  onUnassignClick: PropTypes.func,
  onDetailsClick: PropTypes.func,

};

export default StudentCard;