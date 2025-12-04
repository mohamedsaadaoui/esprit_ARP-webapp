import { useMemo } from 'react';
 
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
 
import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/hooks';

import SvgColor from 'src/components/svg-color';
 
// ----------------------------------------------------------------------
 
const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  
  // online icons
  emploi: icon('ic_emploi'),
  absence: icon('ic_absence'),
  results: icon('ic_results'),
  evalualtion: icon('ic_evaluation'),
  reclamation: icon('ic_reclamation'),

  meetingRoom: <MeetingRoomIcon />,
  pendingActions: <PendingActionsIcon />,
  BarChartRounded: <BarChartRoundedIcon />,
  school: <SchoolIcon />
};
 
// ----------------------------------------------------------------------
 
export function useNavData() {
  const { userPermissions, user } = useAuthContext();
  const userRoles = user?.roles || [];
 
  return useMemo(() => {
    const navSections = [];

    // EDT-ESPRIT Section
    const edtSection = {
      subheader: 'EDT-ESPRIT',
      items: [
        // Enseignants
        ...(userPermissions.includes('VIEW_ENSEIGNANTS')
          ? [{ title: 'Enseignants', path: paths.dashboard.root, icon: ICONS.user }]
          : []),
        // Charge horaire
        ...(userPermissions.includes('VIEW_CHARGE')
        ? [{ title: 'Charge horraire', path: paths.dashboard.listEnsByCours, icon: ICONS.BarChartRounded }]
        : []),

        // Planning
        ...(userPermissions.includes('VIEW_PLANNING')
          ? [{ title: 'Planning', path: paths.dashboard.one, icon: ICONS.job }]
          : []),

        ...(userPermissions.includes('VIEW_SALLE')
          ? [{ title: 'Salle', path: paths.dashboard.five, icon: ICONS.meetingRoom }]
          : []),

        ...(userPermissions.some(p =>
          ['VIEW_COUR','VIEW_COUR_SALLE','VIEW_COUR_ENSEIGNANT'].includes(p)
          )
          ? [{
              title: 'Emploi',
              path: paths.dashboard.four,
              icon: ICONS.calendar,
              children: [
                ...(userPermissions.includes('VIEW_COUR')
                  ? [{ title: 'Emploi classe', path: paths.dashboard.four }]
                  : []),
                ...(userPermissions.includes('VIEW_COUR_ENSEIGNANT')
                  ? [{ title: 'Emploi enseignant', path: paths.dashboard.six }]
                  : []),
                ...(userPermissions.includes('VIEW_COUR_SALLE')
                  ? [{ title: 'Emploi salle', path: paths.dashboard.salle }]
                  : []),
              ].filter(Boolean),
            }]
          : []),

        ...(userPermissions.some(p =>
          ['VIEW_RETARD', 'VIEW_SORTIE', 'VIEW_COUR_ANNULE'].includes(p)
          )
          ? [{
              title: 'Assiduité',
              path: paths.dashboard.seven,
              icon: ICONS.pendingActions,
              children: [
                ...(userPermissions.includes('VIEW_RETARD')
                  ? [{ title: 'Retard', path: paths.dashboard.seven }]
                  : []),
                ...(userPermissions.includes('VIEW_SORTIE')
                  ? [{ title: 'SAH', path: paths.dashboard.eight }]
                  : []),
                ...(userPermissions.includes('VIEW_COUR_ANNULE')
                  ? [{ title: 'Rattrapage', path: paths.dashboard.rattrapage }]
                  : []),
              ].filter(Boolean),
            }]
          : []),

        ...(userPermissions.includes('VIEW_MANAGE_USERS')
          ? [{
              title: 'Gestion des utilisateurs',
              path: paths.dashboard.users,
              icon: ICONS.user,
            }]
          : []),
      ].filter(Boolean),
    };

    if (edtSection.items.length > 0) {
      navSections.push(edtSection);
    }

    if (userPermissions.includes('ACCESS_ORIENTATION')) {
      const onlineSection = {
        subheader: 'Online',
        items: [
          {
            title: 'Profile',
            path: paths.online.profile,
            icon: ICONS.user,
          },
          {
            title: 'Emploi de temps',
            path: paths.online.edt,
            icon: ICONS.emploi,
          },     
          {
            title: 'Absence',
            path: paths.online.absence, 
            icon: ICONS.absence,
          },
          {
            title: 'Resultats',
            path: paths.online.resultat, 
            icon: ICONS.results,
          },
          {
            title: 'Evaluation',
            path: paths.online.grille, 
            icon: ICONS.evalualtion,
          },
          {
            title: 'Reclamation',
            path: paths.online.reclamation, 
            icon: ICONS.reclamation,
          },
        ],
      };
      navSections.push(onlineSection);
    }

    // Section PFE pour les étudiants (ACCESS_PFE) - SANS Gestion de Grille
    if (userPermissions.includes('ACCESS_PFE') && !userRoles.includes('code5','code34','code4')) {
      const pfeSection = {
        items: [
          {
            title: 'Profile',
            path: paths.PFE.profile,
            icon: ICONS.user,
          },
          {
            title: 'Gestion de Soutenance',
            path: paths.PFE.soutenance,
            icon: ICONS.file,
          },
          {
            title: 'Planification de Soutenance',
            path: paths.PFE.planificationSoutenances,
            icon: ICONS.analytics,
          },
          {
            title: 'Espace encadrement expertise',
            path: paths.PFE.encadrementExpertise,
            icon: ICONS.user,
          },
          {
            title: 'Demande de changement d enseignant',
            path: paths.PFE.demandeChangementEnseignant,
            icon: ICONS.user,
          },
          {
            title: 'Gestions des demandes',
            path: paths.PFE.listDemandesChangement,
            icon: ICONS.user,
          },
          {
            title: 'Demande de convention',
            path: paths.PFE.demandeConvention,
            icon: ICONS.file,
          },
          {
            title: 'Traiter les conventions',
            path: paths.PFE.traiterConvention,
            icon: ICONS.school,
          },
          {
            title: 'Traiter les plans de travail',
            path: paths.PFE.traiterPlanTravail,
            icon: ICONS.folder,
          },
          {
            title: 'Plan de travail',
            path: paths.PFE.planTravail,
            icon: ICONS.folder,
          },
          {
            title: 'Progression',
            path: paths.PFE.progression,
            icon: ICONS.BarChartRounded,
          }
        ].filter(Boolean),
      };
      navSections.push(pfeSection);
    }

    // Section séparée pour les enseignants (code5) - SEULEMENT Gestion de Grille
    if (userRoles.includes('code5')) {
      const teacherSection = {
        subheader: 'Enseignant',
        items: [
          {
            title: 'Profile',
            path: paths.PFE.profile,
            icon: ICONS.user,
          },
          {
            title: 'Gestion de Grille',
            path: paths.PFE.evalualtion,
            icon: ICONS.school,
          }
        ],
      };
      navSections.push(teacherSection);
    }

    return navSections;
  }, [userPermissions, userRoles]);
}