import React from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';

import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import {
  Box,
  Chip,
  Paper,
  Dialog,
  Button,
  Divider,
  TextField,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import ReclamationService from 'src/services/pfe-services/reclamationService';

const statusLabels = {
  EN_ATTENTE: { label: 'En attente', color: 'warning' },
  RESOLUE: { label: 'Résolue', color: 'success' },
  EN_COURS: { label: 'En cours', color: 'info' },
};

const ReclamationDetailsDialog = ({ open, handleClose, data }) => {

  const { enqueueSnackbar } = useSnackbar();

  const [adminResponse, setAdminResponse] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  if (!data) return null;

  const {
    id,
    nomEtudiant,
    prenomEtudiant,
    idEtudiant,
    emailEtudiant,
    typeReclamation,
    dateCreation,
    description,
    statut,
    commentaire
  } = data.data;

  const formattedDate = new Date(dateCreation).toLocaleString('fr-FR');

  const handleSubmitResponse = () => {

  setSubmitting(true);
  ReclamationService.traiterReclamation(id, adminResponse)
    .then((response) => {
      enqueueSnackbar(response.data.message, { variant: 'success' ,autoHideDuration:2000});
      handleClose();
    })
    .catch((error) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error',autoHideDuration:2000 });
      console.error(error);
    })
    .finally(() => {
      setSubmitting(false);
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
       <Box
        sx={{
          backgroundColor: '#c51414',
          color: 'white',
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          mr: 2,
        }}
      >
        <SwapHorizRoundedIcon fontSize="medium" />
      </Box>
          <Typography fontWeight="bold" variant="h6">
            Détails de la demande de : {nomEtudiant} {prenomEtudiant}
          </Typography>
          <Box flexGrow={1} />
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider sx={{ my: 2 }} />

      <DialogContent dividers>
        {/* Section: Informations étudiant */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          🧑 Informations de l&apos;étudiant
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fafafa' }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>
              <strong>Nom complet</strong><br />
              {prenomEtudiant} {nomEtudiant}
            </Typography>
            <Typography>
              <strong>ID Étudiant</strong><br />
              {idEtudiant}
            </Typography>
          </Box>
          <Typography>
            <strong>Email</strong><br />
            {emailEtudiant}
          </Typography>
        </Paper>
        <Divider sx={{ my: 2 }} />

        {/* Section: Détails de la réclamation */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          📄 Détails de la réclamation
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fafafa' }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>
            <strong>Type de réclamation</strong><br />
            {typeReclamation}
          </Typography>
          <Typography>
            <strong>Statut</strong><br />
            <Chip
              label={statusLabels[statut]?.label}
              color={statusLabels[statut]?.color}
              size="small"
            />
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <CalendarTodayIcon fontSize="small" />
          <Typography>
            <strong>Date de création:</strong> {formattedDate}
          </Typography>
        </Box>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* Section: Description */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          💬 Description mise par l&apos;etudiant
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#fafafa' }}>
          <Typography variant="body2">
            {description}
          </Typography>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* Section: Réponse de l'administrateur */}
      {commentaire ? (
  <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#e6f4ea' }}>
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      ✅ Votre réponse
    </Typography>
    <Typography variant="body2">{commentaire}</Typography>
  </Paper>
) : (
  <>
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      ✏️ Réponse de l&apos;administrateur
    </Typography>

    <Paper
      variant="outlined"
      sx={{
        p: 3,
        backgroundColor: '#f9f9f9',
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder="Écrivez votre réponse ici..."
        variant="outlined"
        value={adminResponse}
        onChange={(e) => setAdminResponse(e.target.value)}
        InputProps={{
          sx: {
            backgroundColor: 'white',
            borderRadius: 1,
          },
        }}
      />

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button
          variant="contained"
          color="primary"
          disabled={submitting || !adminResponse.trim()}
          onClick={handleSubmitResponse}
          sx={{
            backgroundColor: '#c51414',
            textTransform: 'none',
            px: 3,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#a81212',
            },
          }}
        >
          {submitting ? 'Envoi en cours...' : 'Envoyer la réponse'}
        </Button>
      </Box>
    </Paper>
  </>
)}

      </DialogContent>
    </Dialog>
  );
};

ReclamationDetailsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  data: PropTypes.object,
};

export default ReclamationDetailsDialog;
