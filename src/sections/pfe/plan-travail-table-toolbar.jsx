import PropTypes from 'prop-types';

import Iconify from 'src/components/iconify';
import { useResponsive } from 'src/hooks/use-responsive';
import { useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';

export default function PlanTravailTableToolbar({ filters, onFilters, onResetFilters, canReset }) {
  const theme = useTheme();
  const smUp = useResponsive('up', 'sm');

  return (
    <>
      <TextField
        size="small"
        value={filters.name}
        onChange={(event) => onFilters('name', event.target.value)}
        placeholder="Rechercher..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          width: smUp ? 320 : 1,
          my: 2,
          mx: smUp ? 2 : 0,
        }}
      />

      {canReset && (
        <Tooltip title="Réinitialiser les filtres">
          <Button
            variant="outlined"
            color="error"
            onClick={onResetFilters}
            startIcon={<Iconify icon="solar:restart-bold" />}
            sx={{
              my: 2,
              mx: smUp ? 2 : 0,
            }}
          >
            Réinitialiser
          </Button>
        </Tooltip>
      )}
    </>
  );
}

PlanTravailTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func,
  canReset: PropTypes.bool,
};