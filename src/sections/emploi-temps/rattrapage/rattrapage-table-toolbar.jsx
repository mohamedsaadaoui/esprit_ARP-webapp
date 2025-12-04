import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
// ----------------------------------------------------------------------
 
export default function RattrapageTableToolbar({
  filters,
  onFilters,
  roleOptions,
  data,
}) {
  const popover = usePopover();
 

  const handleFilterStartDate = useCallback(
    (newValue) => {
      onFilters('startDate', newValue);
    },
    [onFilters]
  );

  const handleFilterName = useCallback(
    (event) => {
        const {value} = event.target;
        console.log('Recherche:', value); // Ajoutez ce log pour déboguer
        onFilters('search', value); // Mettez à jour le filtre 'search'
    },
    [onFilters]
);
  
 

  const handleExport = useCallback(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error("No data available for export");
        return; // Sort de la fonction si les données ne sont pas disponibles
    }

    // Transformez les données pour correspondre à TABLE_HEAD
    const transformedData = data.map((row) => {
        const teachersWithEmail = row.cours.employes.map(emp => `${emp.nom} ${emp.prenom} (${emp.email})`).join('\n') || 'Inconnu';
        // Déterminer l'état
        // eslint-disable-next-line no-nested-ternary
        const status = row.motifAnnulation.rattrapable ? (row.etat ? 'Rattrapé' : 'Non Rattrapé') : 'Non Rattrapable';
        
        return {
            Enseignant: teachersWithEmail,
            Module: row.cours.modules.map(module => module.designation).join(', ') || 'Inconnu',
            Classe: row.cours.classeSemestres.map(classe => classe.idClasse.nomClasse).join(', ') || 'Inconnue',
            'Date de cours': row.cours.datecours || 'Non spécifiée',
            Séance: row.cours.idplagehoraire?.codePlageHoraire || 'Inconnu',
            Motif: row.motifAnnulation.motif || 'Motif non spécifié',
            État: status // Ajout de la propriété État
        };
    });

    // Convertir les données JSON en feuille Excel
    const ws = XLSX.utils.json_to_sheet(transformedData);

    // Ajuster la largeur des colonnes
    const columnWidths = [
        { width: 40 }, // Enseignant
        { width: 30 }, // Module
        { width: 25 }, // Classe
        { width: 15 }, // Date de cours
        { width: 20 }, // Séance
        { width: 30 }, // Motif
        { width: 30 }, // État // Ajout de la largeur pour la colonne État
    ];

    ws['!cols'] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rattrapage');
    XLSX.writeFile(wb, 'export_rattrapage.xlsx'); // Télécharge le fichier Excel
}, [data]);
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
    value={filters.search} 
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
  <MenuItem
    onClick={() => {
      popover.onClose();
      handleExport(); // Appel de la fonction handleExport 
    }}
  >
    <Iconify icon="solar:export-bold" />
    Exporter
  </MenuItem>
  {/* <MenuItem
    onClick={() => {
      popover.onClose();
    }}
  >
    <Iconify icon="solar:printer-minimalistic-bold" />
    Imprimer
  </MenuItem>
  <MenuItem
    onClick={() => {
      popover.onClose();
    }}
  >
    <Iconify icon="solar:import-bold" />
    Importer
  </MenuItem> */}
</CustomPopover>
    </>
  );
}
 
RattrapageTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
    data: PropTypes.array
  
};