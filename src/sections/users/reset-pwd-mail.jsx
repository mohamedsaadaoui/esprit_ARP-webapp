import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LockResetIcon from '@mui/icons-material/LockReset';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import userService from 'src/services/emploi-services/userService';


export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timer, setTimer] = useState(300);
    const [isTimerActive, setIsTimerActive] = useState(false);

    useEffect(() => {
        let interval;
        if (isTimerActive && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timer]);

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handleResetCodeChange = (index, value) => {
        const newCode = resetCode.split('');
        newCode[index] = value;
        setResetCode(newCode.join(''));
    };

    const handleNewPasswordChange = (event) => {
        setNewPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    };

    const handleSendResetCode = async () => {
        setIsSubmitting(true);
        try {
            const response = await userService.requestPasswordReset(email);
            setDialogMessage(response || 'Code de réinitialisation envoyé avec succès.');
            setIsCodeSent(true);
            setTimer(300);
            setIsTimerActive(true);
        } catch (error) {
            setDialogMessage(
                error.message || "Une erreur est survenue lors de l'envoi du code de réinitialisation."
            );
        } finally {
            setIsSubmitting(false);
            setDialogOpen(true);
        }
    };

    const handleVerifyResetCode = async () => {
        setIsSubmitting(true);
        try {
            const response = await userService.verifyResetCode(email, resetCode);
            setDialogMessage(response || 'Code vérifié avec succès.');
            setIsCodeVerified(true);
        } catch (error) {
            setDialogMessage(
                error.message || "Une erreur est survenue lors de la vérification du code."
            );
        } finally {
            setIsSubmitting(false);
            setDialogOpen(true);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setDialogMessage("Les mots de passe ne correspondent pas.");
            setDialogOpen(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await userService.resetPassword(email, resetCode, newPassword);
            setDialogMessage(response || 'Mot de passe réinitialisé avec succès.');
            setTimeout(() => {
                window.location.href = '/auth/jwt/login';
            }, 2000);
        } catch (error) {
            setDialogMessage(
                error.message || "Une erreur est survenue lors de la réinitialisation du mot de passe."
            );
        } finally {
            setIsSubmitting(false);
            setDialogOpen(true);
        }
    };
    const handleResendCode = async () => {
        setIsSubmitting(true);
        try {
            const response = await userService.requestPasswordReset(email);
            setDialogMessage(response.data?.message || 'Nouveau code envoyé avec succès.');
            setTimer(300);
            setIsTimerActive(true);
        } catch (error) {
            setDialogMessage(
                error.response?.data?.message || "Une erreur est survenue lors de l'envoi du nouveau code."
            );
        } finally {
            setIsSubmitting(false);
            setDialogOpen(true);
        }
    };

    

    const handleCloseDialog = () => setDialogOpen(false);

    return (

        <>

            <Stack
                component={Card}
                spacing={2}
                sx={{
                    p: 6,
                    maxWidth: 500,
                    margin: '0 auto',
                    mt: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
            >
                {!isCodeSent && !isCodeVerified && (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Réinitialisation de mot de passe
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Entrez votre adresse e-mail pour recevoir un code de réinitialisation.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Adresse email"
                            variant="outlined"
                            value={email}
                            onChange={handleEmailChange}

                        />

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendResetCode}
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}

                        >
                            Envoyer le code
                        </Button>
                    </>
                )}

                {isCodeSent && !isCodeVerified && (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Vérification du code
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Entrez le code à 6 chiffres envoyé à votre adresse e-mail.
                        </Typography>

                        <Typography variant="subtitle1" sx={{ mb: 2 }}>
                            Temps restant: {formatTimer(timer)}
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 1,
                            }}
                        >
                            {[...Array(6)].map((_, index) => (
                                <TextField
                                    key={index}
                                    inputProps={{
                                        maxLength: 1,
                                        style: { textAlign: 'center' },
                                    }}
                                    value={resetCode[index] || ''}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        if (/^\d?$/.test(value)) {
                                            handleResetCodeChange(index, value);
                                            if (value && index < 5) {
                                                const nextInput = document.getElementById(`reset-code-${index + 1}`);
                                                if (nextInput) nextInput.focus();
                                            }
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        // Handle backspace/delete for multiple digits
                                        if (e.key === 'Backspace' || e.key === 'Delete') {
                                            e.preventDefault();

                                            // If current input is empty, focus and clear previous input
                                            if (index > 0 && !resetCode[index]) {
                                                const prevInput = document.getElementById(`reset-code-${index - 1}`);
                                                if (prevInput) {
                                                    prevInput.focus();
                                                    handleResetCodeChange(index - 1, '');
                                                }
                                            } else {
                                                // Clear current input
                                                handleResetCodeChange(index, '');

                                                // If not the first input and this input was not already empty
                                                // move focus to previous input
                                                if (index > 0) {
                                                    const prevInput = document.getElementById(`reset-code-${index - 1}`);
                                                    if (prevInput) prevInput.focus();
                                                }
                                            }
                                        }
                                    }}
                                    id={`reset-code-${index}`}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const pasteData = e.clipboardData.getData('text')
                                            .replace(/\D/g, '') // Remove non-digit characters
                                            .slice(0, 6);  // Limit to 6 digits

                                        const newResetCode = [...resetCode];

                                        // Update reset code values
                                        pasteData.split('').forEach((char, i) => {
                                            if (index + i < 6) {
                                                newResetCode[index + i] = char;
                                            }
                                        });

                                        // Update state with new reset code
                                        handleResetCodeChange(0, newResetCode.join(''));

                                        // Focus on the last pasted input or the last input if all are filled
                                        const lastPastedIndex = Math.min(index + pasteData.length - 1, 5);
                                        const targetInput = document.getElementById(`reset-code-${lastPastedIndex}`);
                                        if (targetInput) targetInput.focus();
                                    }}
                                />
                            ))}
                        </Box>



                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleVerifyResetCode}
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <CheckIcon />}
                        >
                            Vérifier le code
                        </Button>

                        {timer === 0 && (
                            <Button
                                variant="text"
                                color="primary"
                                onClick={handleResendCode}
                                disabled={isSubmitting}
                            >
                                Renvoyer le code
                            </Button>
                        )}
                    </>
                )}

                {isCodeVerified && (
                    <>
                        <Typography variant="h5" gutterBottom>
                            Nouveau mot de passe
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Entrez et confirmez votre nouveau mot de passe.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Nouveau mot de passe"
                            variant="outlined"
                            type="password"
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                        />

                        <TextField
                            fullWidth
                            label="Confirmer le mot de passe"
                            variant="outlined"
                            type="password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleResetPassword}
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <LockResetIcon />}
                        >
                            Réinitialiser le mot de passe
                        </Button>
                    </>
                )}

            </Stack>
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Notification</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {dialogMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} autoFocus>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>


        </>

    );
}

