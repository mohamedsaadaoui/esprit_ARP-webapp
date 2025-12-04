import React, { useState } from 'react';
import { useSnackbar } from 'notistack';

import SendIcon from '@mui/icons-material/Send';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import {
  Box,
  Card,
  Button,
  MenuItem,
  Container,
  TextField,
  Typography,
  CardContent,
} from '@mui/material';

import ReclamationService from 'src/services/pfe-services/reclamationService';

export default function ReclamationEncadrantOuExpertForm() {

  const [formData, setFormData] = useState({
    typeReclamation: '',
    description: '',
  });
const { enqueueSnackbar } = useSnackbar();

  const idEtudiant = "223AMT4058";
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    // Convertir typeReclamation string en number selon backend (exemple)
    const typeMapping = {
      changement_encadrant: 6,
      changement_expert: 7
    };

    const payload = {
      idEtudiant,
      description: formData.description.trim(),
      typeReclamation: typeMapping[formData.typeReclamation] || 7,
    };

    console.log("PAYLOAD",payload);

    try {
      const response = await ReclamationService.demandeChangement(payload);
      enqueueSnackbar(response.data.message, { variant: 'success' ,autoHideDuration:2000});
      setFormData({ typeReclamation: '', description: '' });
    } catch (error) {
      enqueueSnackbar(error.response.data.message, { variant: 'error',autoHideDuration:2000 });
      console.error("ERROR ",error)
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'white',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        py: 6,
        mt: 0,
      }}
    >
      <Container maxWidth="sm">
        <Box textAlign="center" mb={3}>
          <PersonOutlineIcon sx={{ fontSize: 48, color: '#c51414' }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Demande de Changement
          </Typography>
          <Typography variant="body1">
            Soumettez votre demande de changement d&apos;encadrant ou d’expert PFE
          </Typography>
        </Box>

        <Card elevation={3}>
          <Box
            sx={{
              background: '#c51414',
              color: 'white',
              px: 3,
              py: 1.5,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <InfoOutlinedIcon />
            <Typography variant="subtitle1" fontWeight="bold">
              Formulaire de Demande
            </Typography>
          </Box>

          <CardContent component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" mb={2}>
              Veuillez remplir tous les champs marqués d’un astérisque (*)
            </Typography>

            <TextField
              label="Type de réclamation *"
              select
              fullWidth
              required
              name="typeReclamation"
              value={formData.typeReclamation}
              onChange={handleChange}
              margin="normal"
              placeholder="Sélectionnez le type de demande"
            >
              <MenuItem value="">Sélectionnez</MenuItem>
              <MenuItem value="changement_encadrant">Changement d&apos;encadrant</MenuItem>
              <MenuItem value="changement_expert">Changement d’expert</MenuItem>
            </TextField>

            <TextField
              label="Description de la demande *"
              fullWidth
              required
              multiline
              minRows={3}
              placeholder="Ex: Je souhaite changer l'expert de mon PFE"
              margin="normal"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <Box textAlign="center" mt={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                sx={{
                  background: '#c51414',
                  color: 'white',
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Envoyer la demande
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
