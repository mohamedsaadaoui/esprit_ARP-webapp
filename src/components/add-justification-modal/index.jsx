import PropTypes from 'prop-types';
import React, { useState } from 'react';

import {
  Box,
  Dialog,
  Button,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import absenceService from 'src/services/online-services/absenceService';

const JustificationModal = ({ open, onClose, absenceId }) => {
  const [description, setDescription] = useState('');
  const [dateJustification, setDateJustification] = useState('');
  const [document, setDocument] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!description.trim()) newErrors.description = 'La description est requise.';
    if (!dateJustification) newErrors.dateJustification = 'La date est requise.';
    if (!document) {
      newErrors.document = 'Le document est requis.';
    } else if (document.type !== 'application/pdf') {
      newErrors.document = 'Seuls les fichiers PDF sont autorisés.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await absenceService.addJustificationToAbsence({
        absenceId,
        description,
        dateJustification,
        document,
      });
      onClose();
      window.location.reload(); // Recharger la page après la soumission
    } catch (error) {
      console.error('Erreur lors de l’ajout de la justification :', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>
        Ajouter une justification
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={dateJustification}
            onChange={(e) => setDateJustification(e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.dateJustification}
            helperText={errors.dateJustification}
          />
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ textTransform: 'none' }}
            >
              {document ? document.name : 'Téléverser un document'}
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.type !== 'application/pdf') {
                    setErrors((prev) => ({
                      ...prev,
                      document: 'Seuls les fichiers PDF sont autorisés.',
                    }));
                    setDocument(null);
                  } else {
                    setErrors((prev) => ({ ...prev, document: '' }));
                    setDocument(file);
                  }
                }}
              />
            </Button>
            {errors.document && (
              <Typography color="error" variant="body2" mt={1}>
                {errors.document}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Soumettre
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

JustificationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  absenceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default JustificationModal;
