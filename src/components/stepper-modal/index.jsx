import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { Box, Step, Modal, Button, Stepper, StepLabel, Typography } from '@mui/material';

const steps = [
  'Taille & Format',
  'Positions Valides',
  'Telecharger'
];

const StepperModal = ({ open, onClose, onSave }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [base64Image, setBase64Image] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png") && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result);
        setActiveStep(activeStep + 1); // Move to the next step
      };
      reader.readAsDataURL(file);
    } else {
      alert("Veuillez télécharger une image valide (PNG ou JPEG) de moins de 5MB.");
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onSave(base64Image); // Save the image on the last step
      onClose(); // Close the modal after saving
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
        m: 2,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '600px' },
      }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Typography variant="body1" sx={{ mt: 2 }}>
         Veuillez télécharger une image valide (PNG ou JPEG) de moins de 5MB.
          </Typography>
        )}

        {activeStep === 1 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body1">Voici un exemple de la bonne position de l&apos;image.</Typography>
            <img src="public\assets\instructions.png" alt="Correct Position" style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
        )}

{activeStep === 2 && (
  <Box sx={{ mb: 2 }}>
    <label htmlFor="upload-image">
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleImageChange}
        id="upload-image"
        style={{
          display: 'none', 
        }}
      />
      <Button variant="outlined" component="span" sx={{ width: '100%', mb: 2 }}>
        Télécharger une image
      </Button>
    </label>
    {base64Image && (
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">Aperçu de l&apos;image :</Typography>
        <img src={base64Image} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
      </Box>
    )}
  </Box>
)}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" onClick={handleNext} sx={{ backgroundColor: '#ce171f', color: 'white' }}>
            {activeStep === steps.length - 1 ? 'Enregistrer' : 'Suivant'}
          </Button>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack}>
              Précédent
            </Button>
          )}
          <Button variant="outlined" onClick={onClose}>
            Annuler
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

StepperModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default StepperModal;