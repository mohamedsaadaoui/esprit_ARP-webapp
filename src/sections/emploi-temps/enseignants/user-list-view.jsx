import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import enseignantService from 'src/services/emploi-services/enseignantService'; // Importez votre service ici
 
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
 
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
 
import { _roles } from 'src/_mock';
import { useGlobalData } from 'src/globalDataProvider';
import PermissionBasedGuard from 'src/auth/guard/permession-based-guard';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import TableHeadCustomSalle from 'src/components/table/table-head-customSalle';
import {
  useTable,
  getComparator,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import UserTableRow from './user-table-row';
import UserTableToolbar from './user-table-toolbar';
import { UserTableRowSkeleton } from './UserTableRowSkeleton';
// ----------------------------------------------------------------------
  
const TABLE_HEAD = [
  { id: 'nomPrenom', label: 'Nom et Prénom', width: 380 },
  { id: 'cin', label: 'CIN', width :180 },
  { id: 'numeroTelephone', label: 'Numéro de Téléphone' },
  { id: 'typeEnseignant', label: 'Type', width:120 },
  { id: 'status', label: 'Status', width: 120 },
  { id: 'action', label: 'Action', width: 120 },
 
 
 
 
 
 
];
 
const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
  email: '',
  cin: '',  
  numeroTelephone: '',
  typeEnseignant: [],
};
 
// ----------------------------------------------------------------------
 
export default function UserListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();
  const { cursusSelectionne,semestreSelectionne} = useGlobalData();

  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loadingList, setLoadingList] = useState(true);



const dataFiltered = applyFilter({
    inputData: Array.isArray(tableData) ? tableData : [],
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset = !isEqual(defaultFilters, filters);
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;











  useEffect(() => {
    const fetchData = async () => {
      try {
        const enseignants = await enseignantService.getEnseignantsBySemestreEtCursus(semestreSelectionne, cursusSelectionne);
        setTableData(enseignants);
      } catch (error) {
        enqueueSnackbar(`Error fetching teachers: ${error.message}`, { variant: 'error' });
      } finally {
        setLoadingList(false); // Set loading to false after data fetch
      }
    };
  
    fetchData();
  }, [enqueueSnackbar, cursusSelectionne, semestreSelectionne]);
  // const dataFiltered = applyFilter({
  //   inputData: tableData,
  //   comparator: getComparator(table.order, table.orderBy),
  //   filters,
  // });
 
  // const dataInPage = dataFiltered.slice(
  //   table.page * table.rowsPerPage,
  //   table.page * table.rowsPerPage + table.rowsPerPage
  // );
 
  // const denseHeight = table.dense ? 56 : 56 + 20;
  // const canReset = !isEqual(defaultFilters, filters);
  // const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;
 
  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );
 
  // const handleResetFilters = useCallback(() => {
  //   setFilters(defaultFilters);
  // }, []);
 
  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
 
      enqueueSnackbar('Delete success!');
 
      setTableData(deleteRow);
 
      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  );
 
  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
 
    enqueueSnackbar('Delete success!');
 
    setTableData(deleteRows);
 
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);
 
  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );
 

  const teachersOptions = [...new Set(tableData.map(item => item.typeEnseignant))].filter(Boolean);

 
  return (
    <PermissionBasedGuard permissions={['VIEW_ENSEIGNANTS']}hasContent>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard },
           
            { name: 'Enseignant' },
          ]}

        />
        <Card>
         {/*
<Tabs
  value={filters.status}
  onChange={handleFilterStatus}
  sx={{
    px: 2.5,
    boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
  }}
>
  {STATUS_OPTIONS.map((tab) => (
    <Tab
      key={tab.value}
      iconPosition="end"
      value={tab.value}
      label={tab.label}
      icon={
        <Label
          variant={
            ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
          }
          color={
            (tab.value === 'active' && 'success') ||
            (tab.value === 'pending' && 'warning') ||
            (tab.value === 'banned' && 'error') ||
            'default'
          }
        >  
          {['active', 'pending', 'banned', 'rejected'].includes(tab.value)
            ? tableData.filter((user) => user.status === tab.value).length
            : tableData.length}
        </Label>
      }
    />
  ))}
</Tabs>
*/}
 
 
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            roleOptions={_roles}
            data={dataFiltered}
            teachersOptions={teachersOptions}

          />
 
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />
 
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustomSalle
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />
 
 <TableBody>
  {loadingList ? (
    [...Array(6)].map((_, index) => <UserTableRowSkeleton key={index} />)
  ) : (
    dataFiltered.slice(
      table.page * table.rowsPerPage,
      table.page * table.rowsPerPage + table.rowsPerPage
    ).map((row) => (
      <UserTableRow key={row.id} row={row} onEditRow={() => handleEditRow(row.id)} />
    ))
  )}
</TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
 
          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>
 
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />

</PermissionBasedGuard>
    
  );
}
 
// ----------------------------------------------------------------------
function applyFilter({ inputData, comparator, filters }) {

  if (!Array.isArray(inputData)) {
    console.log("inputData is not an array:", inputData);
    return [];
  }
  
  const { search, status, role ,typeEnseignant} = filters;
 
  const stabilizedThis = inputData.map((el, index) => [el, index]);
 
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
 
  inputData = stabilizedThis.map((el) => el[0]);
 
  // Filtering by search term
  if (search) {
    inputData = inputData.filter((user) => {
      const lowerCaseSearch = search.toLowerCase();
      return (
        user.nom?.toLowerCase().includes(lowerCaseSearch) ||
        user.prenom?.toLowerCase().includes(lowerCaseSearch) ||
        user.email?.toLowerCase().includes(lowerCaseSearch) ||
        user.cin?.toLowerCase().includes(lowerCaseSearch) ||
        user.numeroTelephone?.toLowerCase().includes(lowerCaseSearch) ||
        user.typeEnseignant?.toLowerCase().includes(lowerCaseSearch) // Include typeEnseignant in search
      );
    });
  }

  if (typeEnseignant.length > 0) {
    inputData = inputData.filter((ens) =>
      typeEnseignant.includes(ens.typeEnseignant)
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }
 
  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }
 
  return inputData;
}