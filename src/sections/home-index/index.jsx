import { useNavigate } from "react-router-dom"
import { useMemo, useState, useEffect } from "react"

import {
  Box,
  Card,
  Chip,
  Grid,
  Fade,
  Grow,
  alpha,
  Stack,
  Avatar,
  Button,
  useTheme,
  Container,
  Typography,
  CardContent,
} from "@mui/material"
import {
  Payment as PaymentIcon,
  School as AcademicIcon,
  Schedule as ScheduleIcon,
  Assignment as DocumentIcon,
  LibraryBooks as LibraryIcon,
  TrendingUp as AnalyticsIcon, SchoolOutlined
} from "@mui/icons-material"

import SettingsAccordion from "src/components/theme-control-panel"
import { useAuthContext } from "src/auth/hooks"

// Optimized service configuration
const SERVICES = [
  {
    id: "academic-portal",
    icon: AcademicIcon,
    name: "Academic Portal",
    description: "Comprehensive student services & course management",
    color: "#2563eb",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    url: "/online",
    category: "core",
    priority: 1,
  },
  {
    id: "schedule",
    icon: ScheduleIcon,
    name: "Schedule Manager",
    description: "Smart timetable & calendar integration",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    url: "/dashboard",
    category: "core",
    priority: 2,
  },
  {
    id: "analytics",
    icon: AnalyticsIcon,
    name: "Performance Analytics",
    description: "Academic progress & performance insights",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
    url: "/analytics",
    category: "premium",
    priority: 3,
  },
  {
    id: "documents",
    icon: DocumentIcon,
    name: "Document Center",
    description: "Transcripts, certificates & official records",
    color: "#ea580c",
    gradient: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
    url: "/documents",
    category: "standard",
    priority: 4,
  },
  {
    id: "library",
    icon: LibraryIcon,
    name: "Digital Library",
    description: "Research resources & academic databases",
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
    url: "/library",
    category: "standard",
    priority: 5,
  },
  {
    id: "finance",
    icon: PaymentIcon,
    name: "Financial Services",
    description: "Tuition, scholarships & payment management",
    color: "#be123c",
    gradient: "linear-gradient(135deg, #be123c 0%, #9f1239 100%)",
    url: "/finance",
    category: "standard",
    priority: 6,
  },
    {
    id: "PFE",
    icon: SchoolOutlined,
    name: "PFE",
    description: "Final Year Project Management", // Updated description
    color: "#d946ef", // Changed to purple color
    gradient: "linear-gradient(135deg, #d946ef 0%, #a855f7 100%)", // Purple gradient
    url: "/pfe", // Consider using a specific PFE route
    category: "core",
    priority: 7,
  }
]

export default function EspritPortal() {
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { user } = useAuthContext()
  const theme = useTheme()
  const navigate = useNavigate()

  // Optimized authentication check
  useEffect(() => {
    if (!user) {
      navigate("/auth/jwt/login")
      return undefined
    }

    const timer = setTimeout(() => setMounted(true), 150)
    return () => clearTimeout(timer)
  }, [user, navigate])

  // Memoized filtered services
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return SERVICES
    return SERVICES.filter((service) => service.category === selectedCategory)
  }, [selectedCategory])

  const handleServiceClick = (url) => {
    navigate(url)
  }

  const categories = [
    { id: "all", label: "All Services", count: SERVICES.length },
    { id: "core", label: "Core", count: SERVICES.filter((s) => s.category === "core").length },
    { id: "premium", label: "Premium", count: SERVICES.filter((s) => s.category === "premium").length },
    { id: "standard", label: "Standard", count: SERVICES.filter((s) => s.category === "standard").length },
  ]

  if (!user) return null

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        position: "relative",
      }}
    >
      {/* Optimized background decoration */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "240px",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          clipPath: "polygon(0 0, 100% 0, 100% 75%, 0 100%)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: 3, pb: 12 }}>
        {/* Professional Header */}
        <Fade in timeout={600}>
          <Card
            elevation={0}
            sx={{
              mb: 4,
              background: `rgba(255, 255, 255, 0.95)`,
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      fontSize: "1.25rem",
                      fontWeight: 600,
                    }}
                  >
                    EP
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        fontSize: { xs: "1.5rem", sm: "1.75rem" },
                        mb: 0.5,
                      }}
                    >
                      ESPRIT Portal
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.95rem",
                      }}
                    >
                      Professional Academic Platform
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Chip
                    icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }} />}
                    label="Active"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
               
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Service Categories */}
        <Fade in={mounted} timeout={800}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 3,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              Academic Services & Tools
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ gap: 1 }}>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    bgcolor: selectedCategory === category.id ? theme.palette.text.primary : "transparent",
                    color: selectedCategory === category.id ? theme.palette.primary.main : theme.palette.text.primary,
                    borderColor: alpha(theme.palette.text.primary, 0.3),
                    "&:hover": {
                      bgcolor: selectedCategory === category.id ? theme.palette.text.primary : alpha(theme.palette.text.primary, 0.1),
                      borderColor: theme.palette.text.primary,
                    },
                  }}
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </Stack>
          </Box>
        </Fade>

        {/* Optimized Services Grid */}
        <Grid container spacing={3} justifyContent="center">
          {filteredServices.map((service, index) => {
            const IconComponent = service.icon
            const delay = index * 100

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={service.id}>
                <Grow in={mounted} timeout={800 + delay}>
                  <Card
                    onClick={() => handleServiceClick(service.url)}
                    sx={{
                      cursor: "pointer",
                      height: "100%",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      border: "none",
                      borderRadius: 2,
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "3px",
                        background: service.gradient,
                      },
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 12px 24px ${alpha(service.color, 0.15)}`,
                        "& .service-icon": {
                          transform: "scale(1.05)",
                        },
                      },
                      ...(service.category === "premium" && {
                        border: `1px solid ${alpha(service.color, 0.2)}`,
                      }),
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: "center" }}>
                      <Box
                        className="service-icon"
                        sx={{
                          width: 56,
                          height: 56,
                          mx: "auto",
                          mb: 2,
                          borderRadius: 2,
                          background: service.gradient,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "transform 0.3s ease",
                          boxShadow: `0 4px 12px ${alpha(service.color, 0.25)}`,
                        }}
                      >
                        <IconComponent sx={{ fontSize: 28, color: theme.palette.text.primary }} />
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          mb: 1,
                          fontSize: "1rem",
                        }}
                      >
                        {service.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.85rem",
                          lineHeight: 1.4,
                          mb: 2,
                        }}
                      >
                        {service.description}
                      </Typography>

                      {service.category === "premium" && (
                        <Chip
                          label="Premium"
                          size="small"
                          sx={{
                            background: service.gradient,
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            )
          })}
          
        </Grid>
                    <SettingsAccordion />

      </Container>

      {/* Professional Fixed Footer */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          py: 1.5,
          px: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: "0.85rem",
              }}
            >
              © {new Date().getFullYear()} ESPRIT - École Supérieure Privée d&apos;Ingénierie et de Technologies
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  animation: "pulse 2s infinite",
                  "@keyframes pulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                }}
              >
                System Operational
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
