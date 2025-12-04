import { Toolbar, OutlinedInput, InputAdornment, IconButton } from '@mui/material';
import Iconify from 'src/components/iconify';

export default function SoutenanceTableToolbar({ filters, setFilters }) {
  return (
    <Toolbar
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 2,
        p: 2,
      }}
    >
      <OutlinedInput
        value={filters.search}
        onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        placeholder="Rechercher un étudiant, titre..."
        startAdornment={
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" />
          </InputAdornment>
        }
        sx={{ width: 260 }}
      />

      {filters.search && (
        <IconButton color="error" onClick={() => setFilters((p) => ({ ...p, search: '' }))}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      )}
    </Toolbar>
  );
}
