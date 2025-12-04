import React, { useState, useEffect } from 'react';
import { PhoneIcon, SchoolIcon, WorkflowIcon } from 'lucide-react';

import { EmailRounded, EventAvailable, Person2Outlined } from '@mui/icons-material';
import {
  Box,
  Tab,
  Tabs,
  Stack,
  Button,
  Dialog,
  Divider,
  TextField,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
} from '@mui/material';

import EtudiantService from 'src/services/pfe-services/etudiantService';
import EncadrementExpertiseService from 'src/services/pfe-services/encadrementExpertiseService';

import { ConfirmDialog } from 'src/components/custom-dialog';

import TabPanel from './components/TabPanel';
import MentorCard from './components/MentorCard';
import StudentCard from './components/StudentCard';
import VirtualList from './components/VirtualList';
import AssignExpertDialog from './components/DialogAssignExpert';
import AssignEncadrantDialog from './components/DialogAssignEncadrant';

const EncadrementExpertise = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [openDialogEncadrement, setOpenDialogEncadrement] = useState(false);
  const [openDialogExpertise, setOpenDialogExpertise] = useState(false);

  const [studentsUnassignedEncadrant, setStudentsUnassignedEncadrant] = useState([]);
  const [studentsAssignedEncadrant, setStudentsAssignedEncadrant] = useState([]);
  const [studentsUnassignedExpert, setStudentsUnassignedExpert] = useState([]);
  const [studentsAssignedExpert, setStudentsAssignedExpert] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [experts, setExperts] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  
  const [searchUnassignedStudent, setSearchUnassignedStudent] = useState('');
  const [searchAssignedStudent, setSearchAssignedStudent] = useState('');
  const [searchEncadrant, setSearchEncadrant] = useState('');

  const [searchUnassignedStudentExpertise, setSearchUnassignedStudentExpertise] = useState('');
  const [searchAssignedStudentExpertise, setSearchAssignedStudentExpertise] = useState('');
  const [searchExpert, setSearchExpert] = useState('');

  const [openDialogDeleteEncadrement, setOpenDialogDeleteEncadrement] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState(null);
const [openEtatDialog, setOpenEtatDialog] = useState(false);
const [etatEncadrement, setEtatEncadrement] = useState(null);

  const fetchData = async () => {
    try {
      const [
        encadrantsRes,
        expertsRes,
        unassignedEncadrantRes,
        assignedEncadrantRes,
        unassignedExpertRes,
        assignedExpertRes,
      ] = await Promise.all([
        EncadrementExpertiseService.getAllEncadrants(),
        EncadrementExpertiseService.getAllExperts(),
        EtudiantService.getAllStudentsWithoutEncadrantByAnnee(9),
        EtudiantService.getAllStudentsHaveEncadrantByAnnee(9),
        EtudiantService.getAllStudentsWithoutExpertByAnnee(9),
        EtudiantService.getAllStudentsHaveExpertByAnnee(9),
      ]);

      setMentors(encadrantsRes.data.data);
      setStudentsUnassignedEncadrant(unassignedEncadrantRes.data);
      setStudentsAssignedEncadrant(assignedEncadrantRes.data);
      setExperts(expertsRes.data.data);
      setStudentsUnassignedExpert(unassignedExpertRes.data);
      setStudentsAssignedExpert(assignedExpertRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


const handleOpenDialogEncadrement = (idEtudiant) => {
  setSelectedStudentId(idEtudiant);
  setOpenDialogEncadrement(true);
};

const handleCloseDialogEncadrement = () => setOpenDialogEncadrement(false);

const handleOpenDialogExpertise = (idEtudiant) => {
  setSelectedStudentId(idEtudiant);
  setOpenDialogExpertise(true);
};

const handleCloseDialogExpertise = () => setOpenDialogExpertise(false);

const handleDesaffectEncadrant = async () => {
  try {
    await EncadrementExpertiseService.DesaffectEncadrant(selectedEtudiant.etudiantId);
    setStudentsAssignedEncadrant((prev) =>
      prev.filter((s) => s.etudiantId !== selectedEtudiant.etudiantId)
    );
    setOpenDialogDeleteEncadrement(false);
    setSelectedEtudiant(null);
  } catch (error) {
    console.error("Erreur lors de la désaffectation :", error);
  }
};


const handleOpenConfirmDialog = (etudiant) => {
  setSelectedEtudiant(etudiant);
  setOpenDialogDeleteEncadrement(true);
};

const handleOpenEtatDialog = async (etudiantId) => {
  try {
    const response = await EncadrementExpertiseService.getEtatEncadrementExpertiseByStudent(etudiantId);
    setEtatEncadrement(response.data.data);
    setOpenEtatDialog(true);
  } catch (error) {
    console.error('Erreur lors de la récupération de l’état d’encadrement :', error);
  }
};



  return (
    <>
      <Box
        sx={{
          px: 3,
          py: 3,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
          sx={{ height: 60 }}
        >
          <Tab label="Encadrement" sx={{ fontSize: '1.2rem', fontWeight: 'bold', px: 40, py: 2 }} />
          {/* <Tab label="Expertise" sx={{ fontSize: '1.2rem', fontWeight: 'bold', px: 40, py: 2 }} /> */}
        </Tabs>

        <Box sx={{ flexGrow: 1, minHeight: 0, mt: 2 }}>
          <TabPanel value={tabIndex} index={0}>
            <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
              {/* Students (Encadrement) */}
              <Box sx={{ width: '48%', display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
                {/* Non-assigned students */}
                <Box
                  sx={{
                    flex: 0.6,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                    🎓 Étudiants non assignés ({studentsUnassignedEncadrant.length})
                  </Typography>
                  <TextField
                    label="Rechercher un étudiant"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchUnassignedStudent}
                    onChange={(e) => setSearchUnassignedStudent(e.target.value)}
                    sx={{ mb: 2 }}
                    />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <VirtualList
                    items={studentsUnassignedEncadrant.filter((s) =>
                      `${s.nom} ${s.prenom} ${s.emailEtudiant}`
                        .toLowerCase()
                        .includes(searchUnassignedStudent.toLowerCase())
                    )}
                    renderItem={(s) => (
                      <StudentCard
                        student={s}
                        showAssignButton
                        onAssignClick={() => handleOpenDialogEncadrement(s.etudiantId)}
                      />
                    )}
                  />

                  </Box>
                </Box>

                {/* Assigned students */}
                <Box
                  sx={{
                    flex: 0.4,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                    ✅ Étudiants assignés ({studentsAssignedEncadrant.length})
                  </Typography>
                     <TextField
                      label="Rechercher un étudiant"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={searchAssignedStudent}
                      onChange={(e) => setSearchAssignedStudent(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    <VirtualList
                    items={studentsAssignedEncadrant.filter((s) =>
                      `${s.nom} ${s.prenom} ${s.emailEtudiant}`
                        .toLowerCase()
                        .includes(searchAssignedStudent.toLowerCase())
                    )}
                    renderItem={(s) => (
                      <StudentCard
                        student={s}
                        onUnassignClick={() => handleOpenConfirmDialog(s)}
                        onDetailsClick={() => handleOpenEtatDialog(s.etudiantId)}

                      />
                    )}
                  />
                  </Box>
                </Box>
              </Box>

              {/* Mentors */}
              <Box
                sx={{
                  width: '48%',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                  🧑 Liste des encadrants ({mentors.length})
                </Typography>
                <TextField
                  label="Rechercher un encadrant"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchEncadrant}
                  onChange={(e) => setSearchEncadrant(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ flex: 1, minHeight: 0 }}>
                <VirtualList
                  items={mentors.filter((m) =>
                    `${m.nom} ${m.prenom} ${m.email}`
                      .toLowerCase()
                      .includes(searchEncadrant.toLowerCase())
                  )}
                  renderItem={(m) => <MentorCard mentor={m} />}
                  itemHeight={100}
                />
            
                </Box>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabIndex} index={1}>
            <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
              {/* Students (Expertise) */}
              <Box sx={{ width: '48%', display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
                {/* Non-assigned experts */}
                <Box
                  sx={{
                    flex: 0.6,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                    🎓 Étudiants non assignés ({studentsUnassignedExpert.length})
                  </Typography>
                  <TextField
                  label="Rechercher un etudiant"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchUnassignedStudentExpertise}
                  onChange={(e) => setSearchUnassignedStudentExpertise(e.target.value)}
                  sx={{ mb: 2 }}
                  />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
          
                    <VirtualList
                      items={studentsUnassignedExpert.filter((s) =>
                        `${s.nom} ${s.prenom} ${s.emailEtudiant}`
                          .toLowerCase()
                          .includes(searchUnassignedStudentExpertise.toLowerCase())
                      )}
                      renderItem={(s) => (
                        <StudentCard
                          student={s}
                          showAssignButton
                          onAssignClick={() => handleOpenDialogExpertise(s.etudiantId)}
                        />
                      )}
                      itemHeight={100}
                    />
                  </Box>
                </Box>

                {/* Assigned experts */}
                <Box
                  sx={{
                    flex: 0.4,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 3,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                    ✅ Étudiants assignés ({studentsAssignedExpert.length})
                  </Typography>
                  <TextField
                    label="Rechercher un etudiant"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchAssignedStudentExpertise}
                    onChange={(e) => setSearchAssignedStudentExpertise(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                      <VirtualList
                      items={studentsAssignedExpert.filter((s) =>
                        `${s.nom} ${s.prenom} ${s.emailEtudiant}`
                          .toLowerCase()
                          .includes(searchAssignedStudentExpertise.toLowerCase())
                      )}
                      renderItem={(s) => (
                        <StudentCard
                          student={s}
                          onAssignClick={() => handleOpenDialogExpertise(s.etudiantId)}
                        />
                      )}
                      itemHeight={100}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Experts */}
              <Box
                sx={{
                  width: '48%',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                  🧑 Liste des experts ({experts.length})
                </Typography>
                <TextField
                    label="Rechercher un enseignant expert"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchExpert}
                    onChange={(e) => setSearchExpert(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                <Box sx={{ flex: 1, minHeight: 0 }}>
                      <VirtualList
                      items={experts.filter((m) =>
                      `${m.nom} ${m.prenom} ${m.email}`
                      .toLowerCase()
                      .includes(searchExpert.toLowerCase())
                  )}
                  renderItem={(e) => <MentorCard mentor={e} />}
                  itemHeight={100}
                />
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </Box>
      </Box>

      <AssignEncadrantDialog
       openDialog={openDialogEncadrement}
       handleCloseDialog={handleCloseDialogEncadrement}
       studentId={selectedStudentId}
       refreshData={fetchData}
      />

       <AssignExpertDialog
       openDialog={openDialogExpertise}
       handleCloseDialog={handleCloseDialogExpertise}
       studentId={selectedStudentId}
       refreshData={fetchData}
      />

      <ConfirmDialog
      open={openDialogDeleteEncadrement}
      onClose={() => setOpenDialogDeleteEncadrement(false)}
      title="Confirmer la désaffectation"
      content={
        selectedEtudiant && (
          <Typography variant="body2">
            Êtes-vous sûr de vouloir désaffecter cet étudiant ?
            <br />
            Étudiant : <strong>{selectedEtudiant.nom} {selectedEtudiant.prenom}</strong>
            <br />
            Email : <strong>{selectedEtudiant.emailEtudiant}</strong>
          </Typography>
        )
      }
      action={
        <Button variant="contained" color="error" onClick={handleDesaffectEncadrant}>
          Confirmer
        </Button>
      }
      />

<Dialog
  open={openEtatDialog}
  onClose={() => setOpenEtatDialog(false)}
  maxWidth="sm"
  fullWidth
  scroll="paper"
>
  <DialogTitle sx={{ fontWeight: 'bold', fontSize: 22, mb: 1 }}>
    🧾 Détails Encadrement / Expertise
  </DialogTitle>

  <DialogContent dividers>
    {etatEncadrement ? (
      <Stack spacing={3}>

        {/* Étudiant */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            <Person2Outlined sx={{ mr: 1, verticalAlign: 'middle' }} />
            Étudiant
          </Typography>
           <Typography sx={{ ml: 4, fontSize: 16, fontWeight: 600 }}>
            {etatEncadrement.etudiantId}
          </Typography>
          <Typography sx={{ ml: 4, fontSize: 16, fontWeight: 600 }}>
            {etatEncadrement.nomEtudiant} {etatEncadrement.prenomEtudiant}
          </Typography>
          <Typography sx={{ ml: 4, display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 0.5 }}>
            <EmailRounded fontSize="small" sx={{ mr: 0.5 }} /> {etatEncadrement.emailEtudiant || 'Non disponible'}
          </Typography>
        </Box>

        <Divider />

        {/* Encadrant */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            <WorkflowIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Encadrant
          </Typography>
          <Typography sx={{ ml: 4, fontSize: 16, fontWeight: 600 }}>
            {etatEncadrement.nomEncadrant} {etatEncadrement.prenomEncadrant}
          </Typography>
          <Typography sx={{ ml: 4, display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 0.5 }}>
            <EmailRounded fontSize="small" sx={{ mr: 0.5 }} /> {etatEncadrement.emailEncadrant || 'Non disponible'}
          </Typography>
          <Typography sx={{ ml: 4, display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 0.5 }}>
            <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} /> {etatEncadrement.telephoneEncadrant || 'Non disponible'}
          </Typography>
          <Typography sx={{ ml: 4, display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 0.5 }}>
            <EventAvailable fontSize="small" sx={{ mr: 0.5 }} />{' '}
            {etatEncadrement.dateAffectationEncadrant
              ? new Date(etatEncadrement.dateAffectationEncadrant).toLocaleString()
              : 'Date non disponible'}
          </Typography>
        </Box>

        <Divider />

        {/* Expert */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Expert
          </Typography>

          {etatEncadrement.idExpert ? (
            <>
              <Typography sx={{ ml: 4, fontSize: 16, fontWeight: 600 }}>
                {etatEncadrement.nomExpert} {etatEncadrement.prenomExpert}
              </Typography>
              <Typography sx={{ ml: 4, display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 0.5 }}>
                <EmailRounded fontSize="small" sx={{ mr: 0.5 }} /> {etatEncadrement.emailExpert || 'Non disponible'}
              </Typography>
              <Typography sx={{ ml: 4, display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 0.5 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} /> {etatEncadrement.telephoneExpert || 'Non disponible'}
              </Typography>
            </>
          ) : (
            <Typography sx={{ ml: 4, color: 'text.secondary', fontStyle: 'italic' }}>
              Aucun expert affecté
            </Typography>
          )}
        </Box>
      </Stack>
    ) : (
      <Typography align="center" sx={{ py: 6, fontStyle: 'italic', color: 'text.secondary' }}>
        Chargement...
      </Typography>
    )}
  </DialogContent>

  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button onClick={() => setOpenEtatDialog(false)} variant="outlined" color="primary">
      Fermer
    </Button>
  </DialogActions>
</Dialog>


    </>
  );
};

export default EncadrementExpertise;
