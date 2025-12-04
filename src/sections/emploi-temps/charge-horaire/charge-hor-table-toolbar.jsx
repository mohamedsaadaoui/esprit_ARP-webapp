import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Select, Checkbox, InputLabel, FormControl, OutlinedInput } from '@mui/material';

import { useAuthContext } from 'src/auth/hooks';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function OrderTableToolbar({ 
  filters, 
  onFilters,
  classesOptions,
  teachersOptions,
  modulesOptions,
  data 
}) {
  const popover = usePopover();
  const { userPermissions } = useAuthContext();
  
  // États pour les options triées
  const [sortedClasses, setSortedClasses] = useState([]);
  const [sortedTeachers, setSortedTeachers] = useState([]);
  const [sortedModules, setSortedModules] = useState([]);

  // Trier les classes par numéro
  useEffect(() => {
    if (classesOptions) {
      const sorted = [...classesOptions].sort((a, b) => {
        // Extraire les numéros des noms de classe
        // eslint-disable-next-line radix
        const numA = parseInt(a.match(/\d+/)?.[0] || 0);
        // eslint-disable-next-line radix
        const numB = parseInt(b.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });
      setSortedClasses(sorted);
    }
  }, [classesOptions]);

  // Trier les enseignants par ordre alphabétique
  useEffect(() => {
    if (teachersOptions) {
      const sorted = [...teachersOptions].sort((a, b) => a.localeCompare(b));
      setSortedTeachers(sorted);
    }
  }, [teachersOptions]);

  // Trier les modules par ordre alphabétique
  useEffect(() => {
    if (modulesOptions) {
      const sorted = [...modulesOptions].sort((a, b) => a.localeCompare(b));
      setSortedModules(sorted);
    }
  }, [modulesOptions]);

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterCoursDate = useCallback(
    (newValue) => {
      onFilters('coursDate', newValue);
    },
    [onFilters]
  );

  // Classes filter
  const [selectedClasses, setSelectedClasses] = useState(filters.nomClasse || []);
  const handleChangeClasses = (event) => {
    const { value } = event.target;
    setSelectedClasses(value);
    onFilters('nomClasse', value);
  };

  // Teachers filter
  const [selectedTeachers, setSelectedTeachers] = useState(filters.nomPrenom || []);
  const handleChangeTeachers = (event) => {
    const { value } = event.target;
    setSelectedTeachers(value);
    onFilters('nomPrenom', value);
  };

  // Modules filter
  const [selectedModules, setSelectedModules] = useState(filters.designationMatiere || []);
  const handleChangeModules = (event) => {
    const { value } = event.target;
    setSelectedModules(value);
    onFilters('designationMatiere', value);
  };

  const handleExport = useCallback(() => {
    const exportData = data.flatMap(item => 
      item.cours?.length > 0 
        ? item.cours.map(cours => ({
            'Enseignant': item.nomPrenom,
            'Classe': item.nomClasse,
            'Module': item.designationMatiere,
            'Date': cours.dateCours,
            'Heure début': cours.plageHoraire?.heureDebut,
            'Heure fin': cours.plageHoraire?.heureFin,
          }))
        : [{
            'Enseignant': item.nomPrenom,
            'Classe': item.nomClasse,
            'Module': item.designationMatiere,
          }]
    );

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Cours");
    XLSX.writeFile(wb, `details_cours_${new Date().toISOString().slice(0,10)}.xlsx`);
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
       <FormControl sx={{ width: 200 }}>
  <InputLabel>Classes</InputLabel>
  <Select
    multiple
    value={selectedClasses}
    onChange={handleChangeClasses}
    input={<OutlinedInput label="Classes" />}
    renderValue={(selected) => selected.join(', ')}
    MenuProps={{
      PaperProps: {
        style: {
          maxHeight: 200, // Hauteur maximale pour le menu
          width: 200, // Largeur souhaitée
        },
      },
    }}
  >
    {sortedClasses.map((option) => (
      <MenuItem key={option} value={option}>
        <Checkbox checked={selectedClasses.includes(option)} />
        {option}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl sx={{ width: 200 }}>
  <InputLabel>Enseignants</InputLabel>
  <Select
    multiple
    value={selectedTeachers}
    onChange={handleChangeTeachers}
    input={<OutlinedInput label="Enseignants" />}
    renderValue={(selected) => selected.join(', ')}
    MenuProps={{
      PaperProps: {
        style: {
          maxHeight: 200, // Hauteur maximale pour le menu
          width: 200, // Largeur souhaitée
        },
      },
    }}
  >
    {sortedTeachers.map((option) => (
      <MenuItem key={option} value={option}>
        <Checkbox checked={selectedTeachers.includes(option)} />
        {option}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<FormControl sx={{ width: 200 }}>
  <InputLabel>Modules</InputLabel>
  <Select
    multiple
    value={selectedModules}
    onChange={handleChangeModules}
    input={<OutlinedInput label="Modules" />}
    renderValue={(selected) => selected.join(', ')}
    MenuProps={{
      PaperProps: {
        style: {
          maxHeight: 200, // Hauteur maximale pour le menu
          width: 200, // Largeur souhaitée
        },
      },
    }}
  >
    {sortedModules.map((option) => (
      <MenuItem key={option} value={option}>
        <Checkbox checked={selectedModules.includes(option)} />
        {option}
      </MenuItem>
    ))}
  </Select>
</FormControl>

        <DatePicker
          label="Date cours"
          value={filters.coursDate}
          onChange={handleFilterCoursDate}
          slotProps={{
            textField: {
              fullWidth: true,
            },
          }}
          sx={{
            maxWidth: { md: 150 },
          }}
        />

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 0.5 }}>
          <TextField
            fullWidth
            value={filters.name || ''}
            onChange={handleFilterName}
            placeholder="Recherche..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />
          
          {userPermissions.includes('EXPORT_CHARGE') && (
            <IconButton onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          )}
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
            handleExport();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}

OrderTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  classesOptions: PropTypes.array,
  teachersOptions: PropTypes.array,
  modulesOptions: PropTypes.array,
  data: PropTypes.array
};