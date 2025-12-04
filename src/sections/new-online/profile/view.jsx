"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

import FlagIcon from "@mui/icons-material/Flag"
import EditIcon from "@mui/icons-material/Edit"
import CakeIcon from "@mui/icons-material/Cake"
import PhoneIcon from "@mui/icons-material/Phone"
import BuildIcon from "@mui/icons-material/Build"
import PersonIcon from "@mui/icons-material/Person"
import SchoolIcon from "@mui/icons-material/School"
import ArticleIcon from "@mui/icons-material/Article"
import { alpha, useTheme } from "@mui/material/styles"
import FeedbackIcon from "@mui/icons-material/Feedback"
import BusinessIcon from "@mui/icons-material/Business"
import EventNoteIcon from "@mui/icons-material/EventNote"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import AssessmentIcon from "@mui/icons-material/Assessment"
import RateReviewIcon from "@mui/icons-material/RateReview"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import MailOutlineIcon from "@mui/icons-material/MailOutline"
import ArchitectureIcon from "@mui/icons-material/Architecture"
import {
  Box,
  Card,
  Link,
  Fade,
  Alert,
  Paper,
  Avatar,
  Button,
  Divider,
  Container,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material"

import { paths } from "src/routes/paths"

import { useAuthContext } from "src/auth/hooks"
import profileService from "src/services/online-services/profileService"

import Logo from "src/components/logo"
import SlidingHeadline from "src/components/slider"
import ProfileEdit from "src/components/update-profile"
import { useSettingsContext } from "src/components/settings"
import StudentRankingCard from "src/components/student-ranking-history"
import PermissionBasedGuard from "src/auth/guard/permession-based-guard"

export default function ProfileView() {
  const theme = useTheme()
  const settings = useSettingsContext()
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuthContext()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [expandedPanel, setExpandedPanel] = useState("panel1")

  useEffect(() => {
    if (!user) {
      navigate(paths.auth.jwt.login, { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading || !user) {
        return
      }

      try {
        setLoading(true)
        const userId = user?.sub

        if (!userId) {
          throw new Error("User ID not found in token")
        }

        const { response } = await profileService.getEtudiantData(userId)
        setProfileData(response.data)
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Error fetching profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, authLoading])

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false)
  }

  const handleProfileSave = async (updatedData) => {
    try {
      setProfileData(updatedData)
      setEditModalOpen(false)
    } catch (err) {
      console.error("Error updating profile:", err)
      throw err
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  if (loading)
    return (
      <Container
        sx={{
          pt: 4,
          pb: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: "text.secondary" }}>
          Chargement du profil...
        </Typography>
      </Container>
    )

  if (error)
    return (
      <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            p: 2,
          }}
        >
          {error}
        </Alert>
      </Container>
    )

  return (
    <PermissionBasedGuard permissions={['ACCESS_ORIENTATION']} hasContent>
    <Container maxWidth={settings.themeStretch ? false : "xl"} sx={{ pt: 4, pb: 8 }}>
      <Box sx={{ mb: 6 }}>
        <SlidingHeadline />
      </Box>


      <Fade in timeout={500}>
        <Card
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: theme.shadows[10],
            position: "relative",
            overflow: "visible",
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "5px",
              backgroundColor: theme.palette.primary.main,
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            },
          }}
        >
          <Paper
            sx={{
              position: "absolute",
              top: -15,
              left: 20,
              zIndex: 1,
              backgroundColor: theme.palette.primary.main,
              color: "white",
              p: 1.5,
              px: 3,
              borderRadius: 2,
              boxShadow: theme.shadows[5],
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            {profileData.classe}
          </Paper>

          <Box
            sx={{
              position: "absolute",
              top: { xs: 8, sm: 12, md: 15 },
              right: { xs: 8, sm: 12, md: 15 },
              zIndex: 1,
              p: { xs: 0.5, sm: 0.75, md: 1 },
              borderRadius: 1,
              fontSize: "0.8rem",
              pointerEvents: "none",
              display: { xs: "none", sm: "block" },
            }}
          >
            <Logo />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              pb: 3,
            }}
          >
            <Avatar
              alt={`${profileData.nom} ${profileData.prenom}`}
              src={profileData.base64Image}
              sx={{
                width: 180,
                height: 180,
                mb: 2,
                border: `3px solid #ce171f`,
                boxShadow: `0px 4px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.03)",
                },
              }}
            />

            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {profileData.nom} {profileData.prenom}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
                p: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderRadius: 2,
              }}
            >
              <MailOutlineIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="subtitle1" fontWeight="medium">
                {profileData.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4, borderColor: alpha(theme.palette.primary.main, 0.2) }} />


          {/* Coordonnées Accordion */}
          <Accordion
            expanded={expandedPanel === "panel1"}
            onChange={handleAccordionChange("panel1")}
            sx={{
              mb: 2,
              borderRadius: "8px !important",
              overflow: "hidden",
              boxShadow: expandedPanel === "panel1" ? theme.shadows[3] : theme.shadows[1],
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
              sx={{
                bgcolor: expandedPanel === "panel1" ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                borderLeft: expandedPanel === "panel1" ? `4px solid #ce171f` : "none",
                transition: "all 0.2s ease",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PhoneIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                <Typography variant="h6">Coordonnées</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PhoneIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Téléphone:</strong> {profileData.telephone}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MailOutlineIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Email:</strong> {profileData.email}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Informations personnelles Accordion */}
          <Accordion
            expanded={expandedPanel === "panel2"}
            onChange={handleAccordionChange("panel2")}
            sx={{
              mb: 2,
              borderRadius: "8px !important",
              overflow: "hidden",
              boxShadow: expandedPanel === "panel2" ? theme.shadows[3] : theme.shadows[1],
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
              sx={{
                bgcolor: expandedPanel === "panel2" ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                borderLeft: expandedPanel === "panel2" ? `4px solid #ce171f` : "none",
                transition: "all 0.2s ease",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PersonIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                <Typography variant="h6">Informations personnelles</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Genre:</strong> {profileData.sexe === "M" ? "Masculin" : "Féminin"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FlagIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Nationalité:</strong> {profileData.nationalite}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CakeIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Date de Naissance:</strong> {formatDate(profileData.dateNaissance)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationOnIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Lieu de Naissance:</strong> {profileData.lieuNaissance}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ArticleIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Document Officiel:</strong> {profileData.officialIdentifier}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Informations académiques Accordion */}
          <Accordion
            expanded={expandedPanel === "panel3"}
            onChange={handleAccordionChange("panel3")}
            sx={{
              mb: 2,
              borderRadius: "8px !important",
              overflow: "hidden",
              boxShadow: expandedPanel === "panel3" ? theme.shadows[3] : theme.shadows[1],
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
              sx={{
                bgcolor: expandedPanel === "panel3" ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                borderLeft: expandedPanel === "panel3" ? `4px solid #ce171f` : "none",
                transition: "all 0.2s ease",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <SchoolIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                <Typography variant="h6">Informations académiques</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <BusinessIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Institution:</strong> {profileData.institutionName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ArchitectureIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                  <Typography variant="body1">
                    <strong>Spécialité:</strong> {profileData.specialite}
                  </Typography>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Outils Esprit Accordion */}
          <Accordion
            expanded={expandedPanel === "panel4"}
            onChange={handleAccordionChange("panel4")}
            sx={{
              mb: 3,
              borderRadius: "8px !important",
              overflow: "hidden",
              boxShadow: expandedPanel === "panel4" ? theme.shadows[3] : theme.shadows[1],
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
              sx={{
                bgcolor: expandedPanel === "panel4" ? alpha(theme.palette.primary.main, 0.05) : "transparent",
                borderLeft: expandedPanel === "panel4" ? `4px solid #ce171f` : "none",
                transition: "all 0.2s ease",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <BuildIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                <Typography variant="h6">Outils Esprit</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Link
                  href={paths.online.resultat}
                  underline="none"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: "translateX(5px)",
                    },
                  }}
                >
                  <AssessmentIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ color: "text.primary" }}>
                    Note Module Moyenne
                  </Typography>
                </Link>

                <Link
                  href={paths.online.absence}
                  underline="none"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: "translateX(5px)",
                    },
                  }}
                >
                  <EventNoteIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ color: "text.primary" }}>
                    Module à étudier cette semestre
                  </Typography>
                </Link>

                <Link
                  href={paths.online.evaluation}
                  underline="none"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: "translateX(5px)",
                    },
                  }}
                >
                  <RateReviewIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ color: "text.primary" }}>
                    Évaluez-nous
                  </Typography>
                </Link>

                <Link
                  href={paths.online.reclamation}
                  underline="none"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: "translateX(5px)",
                    },
                  }}
                >
                  <FeedbackIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ color: "text.primary" }}>
                    Réclamer
                  </Typography>
                </Link>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => setEditModalOpen(true)}
              sx={{
                textTransform: "none",
                backgroundColor: theme.palette.primary.main,
                color: "white",
                boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                fontWeight: "bold",
                fontSize: "1rem",
                px: 4,
                py: 1.2,
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#a50000",
                  transform: "translateY(-2px)",
                  boxShadow: `0px 6px 15px ${alpha(theme.palette.primary.main, 0.5)}`,
                },
              }}
            >
              <EditIcon sx={{ mr: 1 }} />
              Modifier Profil
            </Button>
          </Box>
        </Card>
      </Fade>

      {/* Profile Edit Modal Component */}
      <ProfileEdit
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profileData={profileData}
        onSave={handleProfileSave}
      />


    </Container>
    </PermissionBasedGuard>
  )
}
