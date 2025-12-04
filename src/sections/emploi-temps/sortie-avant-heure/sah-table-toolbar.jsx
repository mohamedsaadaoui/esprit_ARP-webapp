// eslint-disable-next-line import/no-extraneous-dependencies
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import { MenuItem } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function SahTableToolbar({ filters, onFilters ,data }) {
  const popover = usePopover();

  // Fonction pour gérer la mise à jour du filtre global
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value); // Met à jour le filtre 'name'
    },
    [onFilters]
  );
  const handleExport = () => {
    // Transformez les données pour correspondre à TABLE_HEAD
    const transformedData = data.map((row) => ({
      Enseignant: `${row.idEmploye.prenom} ${row.idEmploye.nom}`,
      Cours: row.idcours.modules.map(module => module.designation).join(', '),
      Classe: row.idcours.classeSemestres.map(cs => cs.idClasse.nomClasse).join(', '),
      'Date cours': row.idcours.datecours,
      Séance: `${row.idcours.idplagehoraire.heureDebut} à ${row.idcours.idplagehoraire.heureFin}`,
      'Duree de sortie': row.dureeSortie, // Assurez-vous que vous utilisez la bonne propriété
    }));
  
    // Convertir les données JSON en feuille Excel
    const ws = XLSX.utils.json_to_sheet(transformedData);
  
    // Ajuster la largeur des colonnes
    const columnWidths = [
      { width: 20 }, // Enseignant
      { width: 30 }, // Cours
      { width: 25 }, // Classe
      { width: 15 }, 
      { width: 20 }, 
      { width: 20 }, 
    ];
  
    ws['!cols'] = columnWidths;
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'export.xlsx'); // Télécharge le fichier Excel
  };

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onFilters('startDate', newValue);
    },
    [onFilters]
  );



  return (
    <>
     
     <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
 
 <DatePicker
          label="Date cours"
          value={filters.startDate}
          onChange={handleFilterStartDate}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
          sx={{
            maxWidth: { md: 200 },
          }}
        />


        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.search} // Updated to use 'search' instead of 'name'
            onChange={handleFilterName}
            placeholder="Rechercher"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
 
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
       {/*  <MenuItem onClick={() => popover.onClose()}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>
        <MenuItem onClick={() => popover.onClose()}>
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem> */}
        <MenuItem onClick={() => { popover.onClose(); handleExport(); }}>
          <Iconify icon="solar:export-bold" />
          Exporter
        </MenuItem>
      </CustomPopover>
    </>
  );
}

SahTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  data: PropTypes.array
};
