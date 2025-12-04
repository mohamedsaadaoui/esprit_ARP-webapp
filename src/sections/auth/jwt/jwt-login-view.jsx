import * as Yup from 'yup';
  import { useForm } from 'react-hook-form';
  import { useState, useContext } from 'react';
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
 
  import { AuthContext } from 'src/auth/context/jwt'
  import { PATH_AFTER_LOGIN } from 'src/config-global'; import userService from 'src/services/emploi-services/userService';

  import Iconify from 'src/components/iconify';
  import FormProvider, { RHFTextField } from 'src/components/hook-form';

;

 
  export default function JwtLoginView() {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState('');
    const searchParams = useSearchParams();
    const returnTo = searchParams.get('returnTo');
    const password = useBoolean();
    const {refreshAuth } = useContext(AuthContext);
 
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
 
    const onSubmit = handleSubmit(async (data) => {
      setErrorMsg('');
      try {
        const response = await userService.login({
          username: data.username,
          password: data.password,
        });
 
        // Stockage du token dans sessionStorage
        console.log("token",response);
        sessionStorage.setItem('accessToken', response.accessToken);
        sessionStorage.setItem('refreshToken', response.refreshToken);
 
        refreshAuth();        
        // Redirection après connexion réussie
        router.push(returnTo || PATH_AFTER_LOGIN);
 
      } catch (error) {
        console.error('Login error:', error);
        reset({ username: '', password: '' });
        setErrorMsg(
          typeof error === 'object' && error.message
            ? error.message
            : "Nom d'utilisateur ou mot de passe incorrect"
        );
      }
    });
 
    const renderHead = (
      <Stack
        spacing={2}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ marginTop: '30%', mb: 5 }}
      >
        <Typography variant="h4">Se connecter à esprit EDT.</Typography>
      </Stack>
    );
 
    const renderForm = (
      <Stack spacing={2.5} direction="column" alignItems="center" justifyContent="center">
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
    );
 
    return (
      <>
        {renderHead}
        {!!errorMsg && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMsg}
          </Alert>
        )}
 
        <FormProvider methods={methods} onSubmit={onSubmit}>
          {renderForm}
        </FormProvider>
      </>
    );
  }