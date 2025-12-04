import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';


import axios, { endpoints } from 'src/utils/axios';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Modal } from '@mui/material';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

// Reusable Modal Component for UserBasicInfoForm
export default function UserBasicInfoFormPopup({ open, onClose }) {
  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    nom: Yup.string().required('Nom est obligatoire'),
    prenom: Yup.string().required('Prénom est obligatoire'),
    email: Yup.string()
      .required('Email est obligatoire')
      .email('Email doit être une adresse e-mail valide'),
  });

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
      };

      // Make an API call to save the user's basic info
      const response = await axios.post(endpoints.auth.createEmploye, payload); // Replace with your actual API endpoint
      const savedUser = response.data;

      reset();
      enqueueSnackbar('Create success!');
      onClose(); // Close the modal after successful submission
      console.info('Saved user data', savedUser);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Un utilisateur avec cet email existe déjà.', { variant: 'error' });
    }
  });



  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: 800,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3, // Réduire l'espacement interne
          borderRadius: 2,
          overflowY: 'auto', // Activer le défilement si le contenu dépasse
          maxHeight: '90vh', // Limiter la hauteur maximale à 90% de la hauteur de l'écran
        }}
      >
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <Card sx={{ p: 2 }}>
                <Box
                  rowGap={2}
                  columnGap={2}
                  display="grid"
                  gridTemplateColumns={{
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                  }}
                >
                  <RHFTextField name="nom" label="Nom" />
                  <RHFTextField name="prenom" label="Prénom" />
                  <RHFTextField name="email" label="Email Address" />
                </Box>

                <Stack alignItems="flex-end" sx={{ mt: 2 }}>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    Créer
                  </LoadingButton>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FormProvider>
      </Box>
    </Modal>
  );
}

UserBasicInfoFormPopup.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func
};