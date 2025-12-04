import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import WorkIcon from '@mui/icons-material/Work';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import userService from 'src/services/emploi-services/userService';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
} from 'src/components/hook-form';
 
// Schéma de validation
const NewUserSchema = Yup.object().shape({
  username: Yup.string().required('Username est requis'),
  email: Yup.string()
    .required('Email est requis')
    .email('Email doit etre une adresse email valide'),
  cursuses: Yup.array().min(1, 'Au moins un cursus est requis'),
  roles: Yup.array().min(1, 'Au moins un rôle est requis'),
});
 
export default function CreateUserForm({ onClose, fetchUsers }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
 
  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      username: '',
      email: '',
      cursuses: [],
      roles: [],
    },
  });
 
  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = methods;
 
  const [roles, setRoles] = useState([]);
  const [cursus, setCursus] = useState([]);
  const [loadingCursus, setLoadingCursus] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
 
  // Watch selected cursuses (fallback to [])
  const selectedCursus = watch('cursuses', []);
 
  // Fetch all cursus on mount
  useEffect(() => {
    const fetchCursus = async () => {
      try {
        const data = await userService.getAllCursus();
        setCursus(data);
      } catch (error) {
        console.error('Error fetching cursus:', error);
        enqueueSnackbar('Error fetching cursus', { variant: 'error' });
      } finally {
        setLoadingCursus(false);
      }
    };
    fetchCursus();
  }, [enqueueSnackbar]);
 
  // Fetch roles whenever selectedCursus changes
  useEffect(() => {
    const fetchRolesByCursus = async () => {
      if (selectedCursus.length === 0) {
        setRoles([]);
        return;
      }
 
      setLoadingRoles(true);
      try {
        const promises = selectedCursus.map((c) =>
          userService.getRolesByCursus(c.id)
        );
        const results = await Promise.all(promises);
        // Flatten unique roles
        const allRoles = results.flat();
        const uniqueRoles = Array.from(
          new Map(allRoles.map((r) => [r.id, r])).values()
        );
        setRoles(uniqueRoles);
      } catch (error) {
        console.error('Error fetching roles by cursus:', error);
        enqueueSnackbar('Error fetching roles', { variant: 'error' });
      } finally {
        setLoadingRoles(false);
      }
    };
 
    fetchRolesByCursus();
  }, [selectedCursus, enqueueSnackbar]);
 
  // Reset selected roles if they no longer match fetched roles
  useEffect(() => {
    const currentRoles = watch('roles', []);
    if (currentRoles.length > 0 && roles.length > 0) {
      const valid = currentRoles.every((r) =>
        roles.some((opt) => opt.id === r.id)
      );
      if (!valid) setValue('roles', []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roles]);
 
  const onSubmit = async (data) => {
    try {
      const transformedData = {
        ...data,
        cursuses: data.cursuses.map((c) => c.id),
        roles: data.roles.map((r) => r.id),
      };
 
      await userService.register(transformedData);
      enqueueSnackbar('User created successfully!', { variant: 'success' });
      fetchUsers();
      onClose();
      router.replace(paths.dashboard.users);
    } catch (error) {
      console.error('Error creating user:', error);
      const message = error.response?.data?.message || 'An unexpected error occurred';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };
 
  return (
    <>
      <Backdrop
        open={isSubmitting || loadingCursus || loadingRoles}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#fff' }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
 
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <Typography
            variant="h4"
            sx={{ mb: { xs: 3, md: 5 }, textAlign: 'center', fontWeight: 'bold' }}
          >
            Créer nouveau utilisateur
          </Typography>
 
          <Box rowGap={5} columnGap={5} display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}>
            <RHFTextField
              name="username"
              label="Nom d'utilisateur"
              InputProps={{ startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
            />
 
            <RHFTextField
              name="email"
              label="Adresse email"
              InputProps={{ startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} /> }}
            />
 
            <RHFAutocomplete
              name="cursuses"
              label="Cursus"
              multiple
              options={cursus}
              getOptionLabel={(opt) => opt.nom}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              icon={<WorkIcon sx={{ color: 'text.secondary', mr: 1 }} />}
            />
 
            <RHFAutocomplete
              name="roles"
              label="Rôles"
              multiple
              options={roles}
              getOptionLabel={(opt) => opt.labelRole}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              icon={<WorkIcon sx={{ color: 'text.secondary', mr: 1 }} />}
              disabled={selectedCursus.length === 0}
            />
          </Box>
 
          <Stack alignItems="center" sx={{ mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || loadingCursus || loadingRoles}
              sx={{ width: '50%', py: 1.5, fontSize: '1rem' }}
            >
              Créer Utilisateur
            </Button>
          </Stack>
        </Card>
      </FormProvider>
    </>
  );
}
 
CreateUserForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
};