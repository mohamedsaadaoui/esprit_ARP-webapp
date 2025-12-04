import * as XLSX from 'xlsx';

import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
 
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
 
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { Checkbox, FormControl, IconButton, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
 
// ----------------------------------------------------------------------
 
export default function UserTableToolbar({
  filters,
  onFilters,
  roleOptions,
  data,
  teachersOptions,
}) {
  const popover = usePopover();


  const [selectedTypeEns, setSelectedTypeEns] = useState(filters.typeEnseignant || []);
  const handleChangeTypeEns = (event) => {
    const { value } = event.target;
    setSelectedTypeEns(value);
    onFilters('typeEnseignant', value);
  };





 // Export to Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'plannings.xlsx');
  };

  const [sortedTeachers, setSortedTeachers] = useState([]);

  useEffect(() => {
    if (teachersOptions) {
      const sorted = [...teachersOptions].sort((a, b) => a.localeCompare(b));
      setSortedTeachers(sorted);
    }
  }, [teachersOptions]);


 // Search filter
 const handleFilterSearch = (event) => {
   onFilters('search', event.target.value);
 };
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
  <InputLabel>Enseignants</InputLabel>
  <Select
    multiple
    value={selectedTypeEns}
    onChange={handleChangeTypeEns}
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
        <Checkbox checked={selectedTypeEns.includes(option)} />
        {option}
      </MenuItem>
    ))}
  </Select>
</FormControl>
 
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.search} // Updated to use 'search' instead of 'name'
            onChange={handleFilterSearch}
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
            <MenuItem onClick={() => { popover.onClose(); handleExport(); }}>
              <Iconify icon="solar:export-bold" />
              Export
            </MenuItem>
          </CustomPopover>
        
    </>
  );
}
 
UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
    data: PropTypes.array,
  
    teachersOptions: PropTypes.array,
  
};