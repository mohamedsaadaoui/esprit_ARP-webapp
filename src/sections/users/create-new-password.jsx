import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';

import userService from 'src/services/emploi-services/userService'; // Ajoutez cette ligne

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import DialogContentText from '@mui/material/DialogContentText';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

export default function CreateNewPassword() {
    const password = useBoolean();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [token, setToken] = useState('');
    const [searchParams] = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setDialogMessage('Token non trouvé dans l’URL.');
            setDialogOpen(true);
        }
    }, [searchParams]);

    const ChangePassWordSchema = Yup.object().shape({
        newPassword: Yup.string()
            .required('Nouveau mot de passe est requis')
            .min(6, 'Nouveau mot de passe doit contenir minimum 6 caractères')
            .notOneOf([Yup.ref('oldPassword')], 'Le nouveau mot de passe doit être différent de l\'ancien.'),
        confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Les mots de passe doivent correspondre'),
    });

    const defaultValues = {
        newPassword: '',
        confirmNewPassword: '',
    };

    const methods = useForm({
        resolver: yupResolver(ChangePassWordSchema),
        defaultValues,
    });

    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (data) => {
        try {
            await userService.createPassword(token, {
                newPassword: data.newPassword,
                newPasswordConfirmation: data.confirmNewPassword,
            });

            setDialogMessage('Mot de passe créé avec succès.');
            reset();
            router.replace(paths.auth.jwt.login);
        } catch (error) {
            setDialogMessage(
                error.message || 'Une erreur est survenue lors de la création du mot de passe.'
            );
        } finally {
            setDialogOpen(true);
        }
    });

    const handleCloseDialog = () => setDialogOpen(false);

    return (
        <>
            <FormProvider methods={methods} onSubmit={onSubmit}>
                <Stack
                    component={Card}
                    spacing={3}
                    sx={{
                        p: 3,
                        maxWidth: 600,
                        margin: '0 auto',
                    }}
                >
                    <RHFTextField
                        name="newPassword"
                        label="Nouveau mot de passe"
                        type={password.value ? 'text' : 'password'}
                        inputProps={{
                            minLength: 6,
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={password.onToggle} edge="end">
                                        <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <RHFTextField
                        name="confirmNewPassword"
                        type={password.value ? 'text' : 'password'}
                        label="Confirmer nouveau mot de passe"
                        inputProps={{
                            minLength: 6,
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={password.onToggle} edge="end">
                                        <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <LoadingButton type="submit" variant="contained" loading={isSubmitting} sx={{ ml: 'auto' }}>
                        Enregistrer
                    </LoadingButton>
                </Stack>
            </FormProvider>

            {/* Dialog for Alerts */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Notification</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogMessage}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}