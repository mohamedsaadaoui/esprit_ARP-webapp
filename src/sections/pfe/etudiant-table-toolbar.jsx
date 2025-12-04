import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { IconButton, MenuItem } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function UserTableToolbar({
  filters,
  onFilters,
  data
}) {
  const popover = usePopover();
  const [openPopup, setOpenPopup] = useState(false); // State to control the modal

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const flattenData = (vacataires) => vacataires.map(item => ({
    nom: item.nom,
    prenom: item.prenom,
    email: item.email,
    cin: item.cin,
    recrutementDate: item.recrutementDate ? new Date(item.recrutementDate).toLocaleDateString() : 'N/A',
    cnss: item.cnss,
  }));

  const handleExportToExcel = () => {
    if (data && data.length > 0) {
      try {
        const flatData = flattenData(data);
        const worksheet = XLSX.utils.json_to_sheet(flatData);
  
        // Set column widths
        const columnWidths = [
          { wch: 15 }, // Width for column A (nom)
          { wch: 15 }, // Width for column B (prenom)
          { wch: 25 }, // Width for column C (email)
          { wch: 15 }, // Width for column D (cin)
          { wch: 20 }, // Width for column E (recrutementDate)
          { wch: 15 }, // Width for column F (cnss)
        ];
  
        worksheet['!cols'] = columnWidths;
  
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Vacataires');
        XLSX.writeFile(workbook, 'liste_des_etudiant_pfe.xlsx');
      } catch (error) {
        console.error("Error exporting to Excel:", error);
      }
    } else {
      console.error("No data to export.");
    }
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
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Chercher par nom, prenom ou email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen} aria-label="more options">
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
        <MenuItem onClick={handleExportToExcel}>
          <Iconify icon="mdi:microsoft-excel" />
          Excel
        </MenuItem>
                {/* Add a new MenuItem to open the modal */}
        <MenuItem onClick={() => {
          setOpenPopup(true);
          popover.onClose();
        }}>
          <Iconify icon="eva:plus-fill" />
          Ajouter
        </MenuItem>
      </CustomPopover>
      {/* <UserBasicInfoFormPopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
      /> */}
    </>
  );
}

UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      nom: PropTypes.string,
      prenom: PropTypes.string,
      email: PropTypes.string,
      cin: PropTypes.string,
      recrutementDate: PropTypes.string,
      cnss: PropTypes.string,
    })
  ),
};