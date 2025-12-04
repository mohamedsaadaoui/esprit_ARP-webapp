import { useState, useEffect, useRef } from 'react';
import {
  Card, 
  Table, 
  Tabs, 
  Tab, 
  Container, 
  TableBody, 
  TableContainer,
  Box,
  Grid,
  Typography,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  alpha,
  useTheme
} from '@mui/material';
import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableEmptyRows,
  TablePaginationCustom
} from 'src/components/table';
import Label from 'src/components/label';
import soutenanceService from 'src/services/pfe-services/soutenanceService';
import SoutenanceTableRow from './SoutenanceTableRow';
import SoutenanceTableToolbar from './SoutenanceTableToolbar';
import EditSoutenanceDialog from './EditSoutenanceDialog';

// Icons
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Groups as GroupsIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  PlayArrow as PlayArrowIcon,
  DoneAll as DoneAllIcon,
  Block as BlockIcon
} from '@mui/icons-material';

// OPTIONS DE STATUT SIMPLIFIÉES
const STATUS_OPTIONS = [
  { value: 'all', label: 'Toutes', color: 'default', icon: <AssignmentIcon /> },
  { value: 'EN_ATTENTE', label: 'En attente', color: 'warning', icon: <AccessTimeIcon /> },
  { value: 'PLANIFIEE', label: 'Planifiée', color: 'info', icon: <PlayArrowIcon /> },
  { value: 'EN_COURS', label: 'En cours', color: 'primary', icon: <PlayArrowIcon /> },
  { value: 'TERMINEE', label: 'Terminée', color: 'success', icon: <DoneAllIcon /> },
  { value: 'ANNULEE', label: 'Annulée', color: 'error', icon: <BlockIcon /> },
  { value: 'REPORTEE', label: 'Reportée', color: 'secondary', icon: <AccessTimeIcon /> }
];

const TABLE_HEAD = [
  { id: 'id', label: 'ID', width: 60 },
  { id: 'etudiant', label: 'Étudiant', width: 150 },
  { id: 'date', label: 'Date', width: 120 },
  { id: 'heure', label: 'Horaire', width: 120 },
  { id: 'salle', label: 'Salle', width: 120 },
  { id: 'president', label: 'Président', width: 150 },
  { id: 'membres', label: 'Membres', width: 100 },
  { id: 'statutSoutenance', label: 'Statut Soutenance', width: 140 },
  { id: 'actions', label: 'Actions', width: 100 }
];  

// 🆕 FONCTION AMÉLIORÉE : Vérifier si une soutenance est en cours en temps réel
const isSoutenanceEnCours = (soutenance, maintenant = new Date()) => {
  if (!soutenance.dateSoutenance || !soutenance.heureDebut || !soutenance.heureFin) {
    return false;
  }
  
  try {
    // Formater les heures (supprimer les secondes si présentes)
    const heureDebut = soutenance.heureDebut.split(':').slice(0, 2).join(':');
    const heureFin = soutenance.heureFin.split(':').slice(0, 2).join(':');
    
    const [debutHeures, debutMinutes] = heureDebut.split(':');
    const [finHeures, finMinutes] = heureFin.split(':');
    
    // Créer les dates de début et fin
    const dateDebut = new Date(soutenance.dateSoutenance);
    dateDebut.setHours(parseInt(debutHeures), parseInt(debutMinutes), 0, 0);
    
    const dateFin = new Date(soutenance.dateSoutenance);
    dateFin.setHours(parseInt(finHeures), parseInt(finMinutes), 0, 0);
    
    // Vérifier si nous sommes dans l'intervalle
    const estEnCours = maintenant >= dateDebut && maintenant <= dateFin;
    
    // Log de débogage (optionnel)
    if (estEnCours) {
      console.log(`🎯 Soutenance ${soutenance.id} en cours:`, {
        maintenant: maintenant.toLocaleString(),
        debut: dateDebut.toLocaleString(),
        fin: dateFin.toLocaleString()
      });
    }
    
    return estEnCours;
  } catch (error) {
    console.error('Erreur calcul temps soutenance:', error, soutenance);
    return false;
  }
};

// FONCTION : Transforme les données avec les membres du jury
function mapSoutenanceData(apiData) {
  console.log('🔍 Données avec membres:', apiData);
  
  return apiData.map(s => {
    const statutSoutenance = s.statut || 'EN_ATTENTE';
    
    // RÉCUPÉRATION DES MEMBRES DU JURY
    let membresJury = s.membresJury || [];
    
    console.log(`👥 Soutenance ${s.id}: ${membresJury.length} membres`);
    
    return {
      id: s.id,
      etudiant: s.idAffectationStage?.etudiant?.nom && s.idAffectationStage?.etudiant?.prenom
        ? `${s.idAffectationStage.etudiant.nom} ${s.idAffectationStage.etudiant.prenom}`
        : 'N/A',
      date: s.dateSoutenance || 'N/A',
      heure: s.heureDebut && s.heureFin ? `${s.heureDebut} - ${s.heureFin}` : 'N/A',
      salle: s.salle?.nom || (s.salle?.id ? `Salle #${s.salle.id}` : 'N/A'),
      president: s.idPresidentJury?.nom && s.idPresidentJury?.prenom
        ? `${s.idPresidentJury.nom} ${s.idPresidentJury.prenom}`
        : 'N/A',
      membres: membresJury,
      statutSoutenance: statutSoutenance,
      rawData: s // 🆕 CONSERVE LES DONNÉES BRUTES AVEC LES HEURES
    };
  });
}

// COMPOSANT STATISTIQUES
const StatsCard = ({ title, value, subtitle, icon, color, progress, trend }) => {
  const theme = useTheme();
  
  const safeColors = {
    primary: theme.palette.primary,
    info: theme.palette.info,
    warning: theme.palette.warning,
    success: theme.palette.success,
    error: theme.palette.error,
    secondary: theme.palette.secondary
  };

  const colorData = safeColors[color] || safeColors.primary;
  
  return (
    <Card sx={{ 
      p: 3, 
      background: `linear-gradient(135deg, ${alpha(colorData.light || colorData.main, 0.15)} 0%, ${alpha(colorData.main, 0.08)} 100%)`,
      border: `1px solid ${alpha(colorData.main, 0.2)}`,
      borderRadius: 3,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 32px ${alpha(colorData.main, 0.2)}`,
        borderColor: alpha(colorData.main, 0.4),
      }
    }}>
      {/* Élément décoratif */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(colorData.main, 0.1)} 0%, transparent 70%)`,
        }}
      />
      
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" position="relative">
        <Box sx={{ flex: 1 }}>
          <Typography variant="h3" fontWeight="bold" color={`${color}.main`} gutterBottom>
            {value}
          </Typography>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
          
          {progress !== undefined && (
            <Box sx={{ mt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" color="text.secondary">
                  Progression
                </Typography>
                <Typography variant="caption" fontWeight="bold" color={`${color}.main`}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                color={color}
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: alpha(colorData.main, 0.1)
                }}
              />
            </Box>
          )}
          
          {trend && (
            <Chip 
              label={trend} 
              size="small" 
              color={trend.includes('+') ? 'success' : 'error'}
              variant="outlined"
              sx={{ mt: 1, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            backgroundColor: alpha(colorData.main, 0.1),
            color: `${color}.main`,
            ml: 2
          }}
        >
          {icon}
        </Box>
      </Box>
    </Card>
  );
};

export default function SoutenanceListView() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const table = useTable();
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [loading, setLoading] = useState(false);
  const [soutenancesEnCours, setSoutenancesEnCours] = useState(0);
  const timerRef = useRef(null);
  
  // STATISTIQUES
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    terminee: 0,
    enAttente: 0
  });

  // Dialog édition
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSoutenance, setSelectedSoutenance] = useState(null);
  const [salles, setSalles] = useState([]);
  const [presidents, setPresidents] = useState([]);

  // 🆕 FONCTION : Mettre à jour les soutenances en cours en temps réel
  const updateSoutenancesEnCours = () => {
    if (tableData.length === 0) return;
    
    const maintenant = new Date();
    let count = 0;
    
    // 🆕 UTILISER LES DONNÉES BRUTES POUR LE CALCUL TEMPS RÉEL
    tableData.forEach(soutenance => {
      if (isSoutenanceEnCours(soutenance.rawData, maintenant)) {
        count++;
      }
    });
    
    setSoutenancesEnCours(count);
    console.log(`🕐 ${count} soutenance(s) en cours à ${maintenant.toLocaleTimeString()}`);
  };

  // 🆕 EFFET : Timer pour mise à jour automatique en temps réel
  useEffect(() => {
    if (tableData.length > 0) {
      // Mettre à jour immédiatement
      updateSoutenancesEnCours();
      
      // 🆕 CONFIGURER LE TIMER POUR MISE À JOUR PLUS FRÉQUENTE
      timerRef.current = setInterval(updateSoutenancesEnCours, 30000); // 🆕 Toutes les 30 secondes
      
      // Nettoyer le timer à la destruction
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [tableData]);

  // 🆕 EFFET : Mettre à jour quand les données changent
  useEffect(() => {
    if (tableData.length > 0) {
      updateSoutenancesEnCours();
    }
  }, [tableData]);

  const fetchSoutenances = async () => {
    try {
      setLoading(true);
      
      // UTILISER LA MÉTHODE AVEC MEMBRES
      const response = await soutenanceService.getAllSoutenancesWithMembres();
      const mappedData = mapSoutenanceData(response);
      setTableData(mappedData);

      // Calcul des statistiques
      const statsData = {
        total: mappedData.length,
        enAttente: mappedData.filter(s => s.statutSoutenance === 'EN_ATTENTE').length,
        planifiee: mappedData.filter(s => s.statutSoutenance === 'PLANIFIEE').length,
        enCours: mappedData.filter(s => s.statutSoutenance === 'EN_COURS').length,
        terminee: mappedData.filter(s => s.statutSoutenance === 'TERMINEE').length,
        annulee: mappedData.filter(s => s.statutSoutenance === 'ANNULEE').length,
        reportee: mappedData.filter(s => s.statutSoutenance === 'REPORTEE').length
      };
      setStats(statsData);

      // Chargement des données supplémentaires
      const sallesRes = await soutenanceService.getAllSalles();
      const presidentsRes = await soutenanceService.getAllPresidents();
      setSalles(sallesRes.data);
      setPresidents(presidentsRes.data);
      
    } catch (err) {
      console.error('Erreur API Soutenances:', err);
      //enqueueSnackbar('Erreur de chargement des soutenances', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoutenances();
  }, []);

  const handleEditRow = (row) => {
    setSelectedSoutenance(row.rawData);
    setEditDialogOpen(true);
  };

  const handleDeleteRow = async (row) => {
    try {
      await soutenanceService.deleteSoutenance(row.id);
      enqueueSnackbar('Soutenance supprimée avec succès', { variant: 'success' });
      fetchSoutenances();
    } catch (err) {
      console.error('Erreur suppression:', err);
      enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' });
    }
  };

  const handleUpdated = () => {
    fetchSoutenances();
    enqueueSnackbar('Soutenance mise à jour avec succès', { variant: 'success' });
  };

  const dataFiltered = applyFilter(tableData, filters);

  // FONCTION POUR LES COULEURS DES TABS
  const getTabColor = (tabValue) => {
    const safeColors = {
      'EN_ATTENTE': 'warning',
      'PLANIFIEE': 'info',
      'EN_COURS': 'primary',
      'TERMINEE': 'success',
      'ANNULEE': 'error',
      'REPORTEE': 'secondary',
      'all': 'default'
    };
    return safeColors[tabValue] || 'default';
  };

  // CALCUL DES POURCENTAGES POUR LES STATS
  const totalSoutenances = stats.total;
  const tauxTermine = totalSoutenances ? (stats.terminee / totalSoutenances) * 100 : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header avec Breadcrumbs */}
      <Box sx={{ mb: 4 }}>
        <CustomBreadcrumbs
          heading={
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                🎓 Gestion des Soutenances
              </Typography>
            </Box>
          }
          links={[
            { name: 'Dashboard', href: '/' }, 
            { name: 'Soutenances', href: '#' }
          ]}
        />
      </Box>

      {/* CARTES DE STATISTIQUES */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total"
            value={stats.total}
            subtitle="Soutenances"
            icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
      
        <Grid item xs={2} md={16}>
          <Card sx={{ 
            p: 2, 
            textAlign: 'center', 
            bgcolor: alpha(theme.palette.info.main, 0.05),
            border: soutenancesEnCours > 0 ? `2px solid ${theme.palette.info.main}` : 'none',
            animation: soutenancesEnCours > 0 ? 'pulse 2s infinite' : 'none',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animation de fond pour les soutenances en cours */}
            {soutenancesEnCours > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.1)} 0%, transparent 50%)`,
                  animation: 'shimmer 3s infinite',
                }}
              />
            )}
            
            <Box position="relative" zIndex={1}>
              <Typography variant="h6" color="info.main" fontWeight="bold" gutterBottom>
                🕐 En Cours Maintenant
              </Typography>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {soutenancesEnCours} soutenance(s)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🆕 Mise à jour en temps réel • Dernière actualisation: {new Date().toLocaleTimeString()}
              </Typography>
              
              {/* Indicateur de statut */}
              {soutenancesEnCours > 0 ? (
                <Chip 
                  label="ACTIF" 
                  size="small" 
                  color="info" 
                  sx={{ mt: 1 }}
                  icon={<PlayArrowIcon />}
                />
              ) : (
                <Chip 
                  label="PAUSE" 
                  size="small" 
                  color="default" 
                  sx={{ mt: 1 }}
                  variant="outlined"
                />
              )}
            </Box>
          </Card>
        </Grid>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Terminé"
            value={stats.terminee}
            subtitle="Soutenances finalisées"
            icon={<DoneAllIcon sx={{ fontSize: 32 }} />}
            color="success"
            progress={tauxTermine}
            trend={`${Math.round(tauxTermine)}%`}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="En Attente"
            value={stats.Planifiée}
            subtitle="À planifier"
            icon={<AccessTimeIcon sx={{ fontSize: 32 }} />}
            color="warning"
            progress={totalSoutenances ? (stats.enAttente / totalSoutenances) * 100 : 0}
          />
        </Grid>
      </Grid>

      {/* Indicateurs de performance */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              Taux de Finalisation: {Math.round(tauxTermine)}%
            </Typography>
          </Card>
        </Grid>
    
      </Grid>

      {/* Carte principale avec tableau */}
      <Card sx={{ 
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: theme.shadows[4],
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}>
        {/* TABS */}
        <Tabs
          value={filters.status}
          onChange={(e, val) => setFilters(p => ({ ...p, status: val }))}
          sx={{
            px: 3,
            pt: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
            boxShadow: theme => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {STATUS_OPTIONS.map(tab => {
            const count = tableData.filter(s => 
              tab.value === 'all' ? true : s.statutSoutenance === tab.value
            ).length;
            
            const tabColor = getTabColor(tab.value);
            
            return (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.icon}
                    <Typography variant="body2" fontWeight="600">
                      {tab.label}
                    </Typography>
                    <Label 
                      color={tabColor}
                      sx={{ 
                        borderRadius: 2,
                        minWidth: 24,
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {count}
                    </Label>
                  </Box>
                }
                sx={{
                  minHeight: 60,
                  borderRadius: 2,
                  mx: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette[tabColor]?.main || theme.palette.primary.main, 0.12),
                    color: `${tabColor}.main`,
                    fontWeight: 'bold'
                  }
                }}
              />
            );
          })}
        </Tabs>

        {/* Toolbar de recherche et filtres */}
        <SoutenanceTableToolbar 
          filters={filters} 
          setFilters={setFilters}
          onRefresh={fetchSoutenances}
          loading={loading}
        />

        {/* Tableau des soutenances */}
        <TableContainer>
          <Scrollbar>
            <Table sx={{ minWidth: 1200 }}>
              <TableHeadCustom 
                headLabel={TABLE_HEAD}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  '& th': {
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    py: 2,
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              />
              <TableBody>
                {dataFiltered
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <SoutenanceTableRow
                      key={row.id}
                      row={row}
                      onEditRow={handleEditRow}
                      onDeleteRow={handleDeleteRow}
                    />
                  ))}
                
                <TableEmptyRows 
                  emptyRows={Math.max(0, table.rowsPerPage - dataFiltered.length)} 
                  height={80}
                />
                
                <TableNoData 
                  notFound={!dataFiltered.length}
                  sx={{ 
                    py: 10,
                    '& td': { 
                      border: 'none',
                      textAlign: 'center'
                    }
                  }}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        {/* Pagination */}
        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            py: 2
          }}
        />
      </Card>

      {/* Dialog d'édition */}
      <EditSoutenanceDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        soutenance={selectedSoutenance}
        onUpdated={handleUpdated}
        salles={salles}
        presidents={presidents}
      />
    </Container>
  );
}

// FONCTION DE FILTRAGE BASÉE SUR StatutSoutenance
function applyFilter(data, filters) {
  let filtered = [...data];
  
  if (filters.status !== 'all') {
    filtered = filtered.filter(s => s.statutSoutenance === filters.status);
  }
  
  if (filters.search) {
    filtered = filtered.filter(s => 
      s.etudiant.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.salle.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.president.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.statutSoutenance.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  
  return filtered;
}