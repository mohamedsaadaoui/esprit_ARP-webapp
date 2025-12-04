import React, { useState } from 'react';

import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import { Checkbox, ListItemText } from '@mui/material';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// eslint-disable-next-line react/prop-types
export default function EdtToolbar({ onSelectEnseignant }) {
  const popover = usePopover();
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [enseignants] = useState([]);

  
  const handleTeacherChange = (event) => {
    const selectedId = event.target.value;
    setSelectedTeacherId(selectedId);
    onSelectEnseignant(selectedId); // Appel du callback avec l'ID sélectionné
  };

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1, justifyContent: 'space-between' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200, width: '300px' }}>
          <Select
            value={selectedTeacherId}
            onChange={handleTeacherChange}
            displayEmpty
            inputProps={{ 'aria-label': 'Enseignant' }}
            renderValue={(selected) => {
              if (!selected) return 'Sélectionnez un enseignant'; // Placeholder
              const enseignant = enseignants.find(e => e.id === selected);
              return enseignant ? `${enseignant.nom} ${enseignant.prenom}` : 'Sélectionnez un enseignant';
            }}
          >
            {enseignants.map((enseignant) => (
              <MenuItem key={enseignant.id} value={enseignant.id}>
                <Checkbox checked={selectedTeacherId === enseignant.id} />
                <ListItemText primary={`${enseignant.nom} ${enseignant.prenom}`} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem onClick={() => console.log("Imprimer")}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimer
        </MenuItem>
      </CustomPopover>
    </>
  );
}