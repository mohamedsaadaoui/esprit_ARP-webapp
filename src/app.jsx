/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';
 
// ----------------------------------------------------------------------
 
import Router from 'src/routes/sections';
 
import ThemeProvider from 'src/theme';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
 
import { useScrollToTop } from 'src/hooks/use-scroll-to-top';
 
import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsProvider } from 'src/components/settings';
import { GlobalDataProvider } from './globalDataProvider';
import { AuthProvider } from './auth/context/jwt'; // Gardez cette importation
import { useAuthContext } from './auth/hooks'; // Importez useAuthContext depuis hooks
import Chatbot from 'src/sections/pfe/chatbot/Chatbot';
 
// ----------------------------------------------------------------------

// Composant wrapper pour le chatbot conditionnel
function ConditionalChatbot() {
  const { user } = useAuthContext();
  
  // Afficher le chatbot seulement pour les étudiants (role code4)
  const isStudent = user?.roles?.includes('code4');
  
  if (!isStudent) {
    return null;
  }
  
  return <Chatbot />;
}
 
export default function App() {
  const charAt = `
 
  ░░░    ░░░
  ▒▒▒▒  ▒▒▒▒
  ▒▒ ▒▒▒▒ ▒▒
  ▓▓  ▓▓  ▓▓
  ██      ██
 
  `;
 
  console.info(`%c${charAt}`, 'color: #5BE49B');
 
  useScrollToTop();
 
  return (
    <AuthProvider>
      <GlobalDataProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SettingsProvider
            defaultSettings={{
              themeMode: 'light',
              themeDirection: 'ltr',
              themeContrast: 'default',
              themeLayout: 'vertical',
              themeColorPresets: 'red',
              themeStretch: false,
            }}
          >
            <ThemeProvider>
              <MotionLazy>
                <SnackbarProvider>
                  <ProgressBar />
                  <Router />
                </SnackbarProvider>
              </MotionLazy>
              
              {/* Chatbot conditionnel - seulement pour les étudiants */}
              <ConditionalChatbot />
            </ThemeProvider>
          </SettingsProvider>
        </LocalizationProvider>
      </GlobalDataProvider>
    </AuthProvider>
  );
}