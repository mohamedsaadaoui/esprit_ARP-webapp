import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import ReCAPTCHA from 'react-google-recaptcha';
import { useRef, useState, useContext } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { AuthContext } from 'src/auth/context/jwt';
import userService from 'src/services/emploi-services/userService';
import { PATH_AFTER_LOGIN ,RECAPTCHA_SECRET } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

export default function JwtLoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [errorMsg, setErrorMsg] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);

  const password = useBoolean();
  const { refreshAuth } = useContext(AuthContext);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required("Le nom d'utilisateur est requis"),
    password: Yup.string().required('Mot de passe est requis'),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaReset = () => {
    recaptchaRef.current?.reset();
    setRecaptchaToken(null);
  };
const onSubmit = handleSubmit(async (data) => {
  setErrorMsg('');



  try {
    const response = await userService.login({
      username: data.username,
      password: data.password,
      recaptchaToken,
    });

    sessionStorage.setItem('accessToken', response.accessToken);
    setRecaptchaToken(null); 

    refreshAuth();
    router.push(returnTo || PATH_AFTER_LOGIN);
  } catch (error) {
    console.error('Login error payload:', error);
    setErrorMsg(error.message || 'Une erreur est survenue.');
    reset({ username: '', password: '' });
    handleRecaptchaReset();
  }
});


  return (
    <>
      <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ mt: '30%', mb: 5 }}>
        <Typography variant="h4">Se connecter à esprit EDT.</Typography>
      </Stack>

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2.5} alignItems="center" justifyContent="center">
          <RHFTextField name="username" label="Nom d'utilisateur" />
          <RHFTextField
            name="password"
            label="Mot de passe"
            type={password.value ? 'text' : 'password'}
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

          <Typography variant="body2" align="center">
            <Link href="/resetPwd" style={{ textDecoration: 'none', color: 'inherit' }}>
              Mot de passe oublié ?
            </Link>
          </Typography>
          <ReCAPTCHA
            sitekey={RECAPTCHA_SECRET}
            onChange={handleRecaptchaChange}
            ref={recaptchaRef}
          />

     

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Se connecter
          </LoadingButton>
        </Stack>
      </FormProvider>
    </>
  );
}
