import * as Yup from 'yup';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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

import { useBoolean } from 'src/hooks/use-boolean';

import { RoleBasedGuard } from 'src/auth/guard';
import userService from 'src/services/emploi-services/userService';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';


export default function AccountChangePassword() {
    const password = useBoolean();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');

    const ChangePassWordSchema = Yup.object().shape({
        oldPassword: Yup.string().required('Old Password is required'),
        newPassword: Yup.string()
            .required('New Password is required')
            .min(6, 'Password must be at least 6 characters')
            .test(
                'no-match',
                'New password must be different than old password',
                (value, { parent }) => value !== parent.oldPassword
            ),
        confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match'),
    });

    const defaultValues = {
        oldPassword: '',
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
            const token = sessionStorage.getItem('accessToken');   
            if (!token) {
                setDialogMessage('Token expiré, veuillez reconnecter.');
                setDialogOpen(true);
                return;
            }
    
            const payload = {
                currentPassword: data.oldPassword,
                newPassword: data.newPassword, 
                confirmationPassword: data.confirmNewPassword,
            };
    
            await userService.changePassword(token, payload);
    
            setDialogMessage('Mot de passe changé avec succès!');
            reset();
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Échec de la mise à jour du mot de passe.';
            setDialogMessage(errorMessage);
        } finally {
            setDialogOpen(true);
        }
    });

    const handleCloseDialog = () => setDialogOpen(false);

    return (
        <RoleBasedGuard  hasContent>

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
                            name="oldPassword"
                            type={password.value ? 'text' : 'password'}
                            label="Old Password"
                            inputProps={{
                                minLength: 6,  // Enforce a minimum length of 6 characters
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
                            name="newPassword"
                            label="New Password"
                            type={password.value ? 'text' : 'password'}
                            inputProps={{
                                minLength: 6,  // Enforce a minimum length of 6 characters
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
                            label="Confirm New Password"
                            inputProps={{
                                minLength: 6,  // Enforce a minimum length of 6 characters
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
                            Save Changes
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
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

            </>
        </RoleBasedGuard>

    );
}
