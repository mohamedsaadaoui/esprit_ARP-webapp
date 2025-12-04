import PropTypes from 'prop-types';
import { useTheme } from '@emotion/react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
 
import {
  Apps,
  School,
  CalendarToday, SchoolOutlined
} from '@mui/icons-material';
import {
  Box,
  Grid,
  Stack,
  Paper,
  AppBar,
  Select,
  Toolbar,
  Popover,
  MenuItem,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';

import { bgBlur } from 'src/theme/css';
import { useAuthContext } from 'src/auth/hooks';
import { useGlobalData } from 'src/globalDataProvider';

import Logo from 'src/components/logo';
import SvgColor from 'src/components/svg-color';
import { useSettingsContext } from 'src/components/settings';

import Searchbar from '../common/searchbar';
import { NAV, HEADER } from '../config-layout';
import AccountPopover from '../common/account-popover';
import SettingsButton from '../common/settings-button';

const appIcons = [
  { id: 1, name: 'Esprit-Online', icon: <School fontSize="medium" />, path: '/online' },
  { id: 2, name: 'EDT', icon: <CalendarToday fontSize="medium" />, path: '/dashboard' },
  { id: 3, name: 'PFE', icon: <SchoolOutlined fontSize='medium' />, path: '/pfe' },
];

function Header({ onOpenNav }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const settings = useSettingsContext();
  const isNavHorizontal = settings.themeLayout === 'horizontal';
  const isNavMini = settings.themeLayout === 'mini';
  const lgUp = useResponsive('up', 'lg');
  const offset = useOffSetTop(HEADER.H_DESKTOP);
  const offsetTop = offset && !isNavHorizontal;

  const isHomePage = location.pathname === '/home';

  const { 
    cursusList, 
    anneesUniversitaires, 
    cursusSelectionne, 
    setCursusSelectionne, 
    anneeSelectionne, 
    setAnneeSelectionne, 
    semestres, 
    semestreSelectionne, 
    setSemestreSelectionne 
  } = useGlobalData();

  const [semestreActif, setSemestreActif] = useState(null);
  const [appMenuAnchor, setAppMenuAnchor] = useState(null);

  useEffect(() => {
    setSemestreSelectionne("");
    
    if (semestres.length > 0) {
      // eslint-disable-next-line no-shadow
      const semestreActif = semestres.find(semestre => semestre.etatSemestre === true);
      if (semestreActif) {
        setSemestreSelectionne(semestreActif.id);
        setSemestreActif(semestreActif);
      }
    }
    
  }, [semestres, setSemestreSelectionne]);

  const handleCursusChange = async (event) => {
    const cursusId = event.target.value;
    setCursusSelectionne(cursusId);
  };

  const handleAnneeChange = async (event) => {
    const anneeId = event.target.value;
    setAnneeSelectionne(anneeId);
  };

  const handleSemestreChange = (event) => {
    const semestreId = event.target.value;
    setSemestreSelectionne(semestreId);
  };

  const handleAppMenuOpen = (event) => {
    setAppMenuAnchor(event.currentTarget);
  };

  const handleAppMenuClose = () => {
    setAppMenuAnchor(null);
  };

const handleAppClick = (path) => {
  navigate(path);
  handleAppMenuClose(); 
};

  const { user } = useAuthContext();
  const userRoles = user?.roles || [];
  const isStudent = userRoles.includes('ETUDIANT');

  const renderHomeContent = (
    <>
      <Logo sx={{ mr: 2.5 }} />      
      

      <Searchbar />
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        <IconButton onClick={() => settings.onUpdate('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')}>
          <SvgColor src={`/assets/icons/setting/ic_${settings.themeMode === 'light' ? 'moon' : 'sun'}.svg`} />
        </IconButton>
        <AccountPopover />
      </Stack>
    </>
  );

  // Render content for other pages (full header)
  const renderContent = (
    <>
      {lgUp && isNavHorizontal && <Logo sx={{ mr: 2.5 }} />}
      {!lgUp && (
        <IconButton onClick={onOpenNav}>
          <SvgColor src="/assets/icons/navbar/ic_menu_item.svg" />
        </IconButton>
      )}
    
      {/* App Menu Icon */}
      <IconButton 
        onClick={handleAppMenuOpen}
        sx={{ 
          mr: { xs: 1, sm: 2 },
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          }
        }}
      >
        <Apps sx={{ width: 24, height: 24 }} />
      </IconButton>

      {/* App Menu Popover */}
      <Popover
        open={Boolean(appMenuAnchor)}
        anchorEl={appMenuAnchor}
        onClose={handleAppMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          mt: 1,
        }}
      >
        <Paper sx={{ p: 2, width: 320 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Applications
          </Typography>
          <Grid container spacing={1}>
            {appIcons.map((app) => (
              <Grid item xs={3} key={app.id}>
                <Box
                  onClick={() => handleAppClick(app.path)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <Box sx={{ color: theme.palette.primary.main, mb: 0.5 }}>
                    {app.icon}
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      textAlign: 'center',
                      fontSize: '0.7rem',
                      lineHeight: 1.2,
                    }}
                  >
                    {app.name}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Popover>

      {/* Hide searchbar on very small screens */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Searchbar />
      </Box>

      {/* Flexible spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Mobile-first responsive controls */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        spacing={{ xs: 0.5, sm: 1 }}
        sx={{
          position: { xs: 'absolute', sm: 'static' },
          top: { xs: '100%', sm: 'auto' },
          right: { xs: 0, sm: 'auto' },
          left: { xs: 0, sm: 'auto' },
          backgroundColor: { xs: theme.palette.background.paper, sm: 'transparent' },
          boxShadow: { xs: theme.shadows[2], sm: 'none' },
          p: { xs: 1, sm: 0 },
          zIndex: { xs: 1000, sm: 'auto' },
          borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' },
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {/* Select Controls Row */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            order: { xs: 1, sm: 0 },
          }}
        >
          {!isStudent && (
            <FormControl 
              variant="outlined" 
              size="small" 
              sx={{ 
                minWidth: { xs: '100%', sm: 80, md: 120 },
                '& .MuiSelect-select': {
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  py: { xs: 1, sm: 0.75 }
                }
              }}
            >
              <InputLabel shrink sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Cursus
              </InputLabel>
              <Select value={cursusSelectionne} onChange={handleCursusChange}>
                {cursusList.map((cursus) => (
                  <MenuItem key={cursus.id} value={cursus.id}>
                    {cursus.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FormControl 
            variant="outlined" 
            size="small" 
            sx={{ 
              minWidth: { xs: '100%', sm: 80, md: 120 },
              '& .MuiSelect-select': {
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                py: { xs: 1, sm: 0.75 }
              }
            }}
          >
            <InputLabel shrink sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Année
            </InputLabel>
            <Select value={anneeSelectionne} onChange={handleAnneeChange}>
              {anneesUniversitaires.map((annee) => (
                <MenuItem key={annee.id} value={annee.id}>
                  {annee.descriptionAnnee}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl 
            variant="outlined" 
            size="small" 
            sx={{ 
              minWidth: { xs: '100%', sm: 80, md: 120 },
              '& .MuiSelect-select': {
                fontSize: { xs: '0.875rem', sm: '0.875rem' },
                py: { xs: 1, sm: 0.75 }
              }
            }}
          >
            <InputLabel shrink sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Semestre
            </InputLabel>
            <Select value={semestreSelectionne} onChange={handleSemestreChange}>
              {semestres.map((semestre) => (
                <MenuItem key={semestre.id} value={semestre.id}>
                  {semestre.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Action Buttons Row */}
        <Stack
          direction="row"
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{
            order: { xs: 0, sm: 1 },
            justifyContent: { xs: 'flex-end', sm: 'flex-start' },
          }}
        >
          {!isStudent && <SettingsButton />}
          <IconButton 
            onClick={() => settings.onUpdate('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')}
            size="small"
          >
            <SvgColor src={`/assets/icons/setting/ic_${settings.themeMode === 'light' ? 'moon' : 'sun'}.svg`} />
          </IconButton>
          <AccountPopover />
        </Stack>
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        // Add extra height on mobile to accommodate the dropdown controls
        ...(lgUp && {
          width: `calc(100% - ${NAV.W_VERTICAL + 1}px)`,
          height: HEADER.H_DESKTOP,
          ...(offsetTop && {
            height: HEADER.H_DESKTOP_OFFSET,
          }),
          ...(isNavHorizontal && {
            width: 1,
            bgcolor: 'background.default',
            height: HEADER.H_DESKTOP_OFFSET,
            borderBottom: `dashed 1px ${theme.palette.divider}`,
          }),
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI + 1}px)`,
          }),
          ...(isHomePage && {
            width: '100%',
          }),
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { xs: 1, sm: 2, lg: 5 },
          position: 'relative',
        }}
      >
        {isHomePage ? renderHomeContent : renderContent}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func.isRequired,
};

export default Header;