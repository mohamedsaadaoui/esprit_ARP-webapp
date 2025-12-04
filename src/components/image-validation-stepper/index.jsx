"use client"

import { useState } from "react"
import {
  Box,
  Step,
  Alert,
  Paper,
  Button,
  Stepper,
  StepLabel,
  Typography,
  StepContent,
  CircularProgress,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VerifiedIcon from "@mui/icons-material/Verified"
import PropTypes from "prop-types"

const steps = [
  {
    label: "Sélectionner une image",
    description: "Choisissez une photo claire de votre visage",
    icon: <PhotoCameraIcon />,
  },
  {
    label: "Vérification de la qualité",
    description: "Nous vérifions que votre photo respecte nos critères",
    icon: <VisibilityIcon />,
  },
  {
    label: "Validation finale",
    description: "Confirmez votre nouvelle photo de profil",
    icon: <VerifiedIcon />,
  },
]

export default function ImageValidationStepper({ open, onClose, onImageValidated, selectedImage }) {
  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [validationResult, setValidationResult] = useState(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateImage = async (imageData) => {
    setIsValidating(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const validationChecks = {
      hasValidFormat: imageData && imageData.startsWith("data:image/"),
      isNotTooLarge: true, 
      isNotBlurry: Math.random() > 0.3, 
      showsFace: Math.random() > 0.2,
      isAppropriate: Math.random() > 0.1,
    }

    const isValid = Object.values(validationChecks).every((check) => check)

    setValidationResult({
      isValid,
      checks: validationChecks,
      message: isValid
        ? "Votre photo respecte tous nos critères de qualité !"
        : "Votre photo ne respecte pas certains critères. Veuillez en choisir une autre.",
    })

    setIsValidating(false)

    if (isValid) {
      setActiveStep(2)
    }

    return isValid
  }

  const handleNext = async () => {
    if (activeStep === 0) {
      setActiveStep(1)
      await validateImage(selectedImage)
    } else if (activeStep === 2) {
      onImageValidated(selectedImage)
      handleClose()
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
      setValidationResult(null)
    }
  }

  const handleClose = () => {
    setActiveStep(0)
    setValidationResult(null)
    setIsValidating(false)
    onClose()
  }

  const handleRetry = () => {
    setValidationResult(null)
    setActiveStep(0)
  }

  if (!open) return null

  return (
    <Paper
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "90%", sm: "600px" },
        maxHeight: "80vh",
        overflow: "auto",
        zIndex: 1300,
        p: 3,
        borderRadius: 3,
        boxShadow: theme.shadows[20],
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}>
        Validation de votre photo de profil
      </Typography>

      {/* Guidelines Image */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <img
          src="/assets/instructions.png"
          alt="Guidelines showing examples of appropriate profile photos"
          style={{
            maxWidth: "100%",
            height: "50%",
            borderRadius: "8px",
            border: `2px solid ${theme.palette.divider}`,
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Suivez ces exemples pour une photo de profil appropriée
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              icon={step.icon}
              sx={{
                "& .MuiStepIcon-root": {
                  color: activeStep >= index ? theme.palette.primary.main : theme.palette.grey[400],
                },
              }}
            >
              <Typography variant="h6">{step.label}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {step.description}
              </Typography>

              {/* Step 0: Image Selection */}
              {index === 0 && selectedImage && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: `3px solid ${theme.palette.primary.main}`,
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Image sélectionnée
                  </Typography>
                </Box>
              )}

              {/* Step 1: Validation Process */}
              {index === 1 && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  {isValidating ? (
                    <Box>
                      <CircularProgress size={40} sx={{ mb: 2 }} />
                      <Typography variant="body2">Analyse de votre photo en cours...</Typography>
                    </Box>
                  ) : (
                    validationResult && (
                      <Box>
                        <Alert
                          severity={validationResult.isValid ? "success" : "error"}
                          sx={{ mb: 2 }}
                          icon={validationResult.isValid ? <CheckCircleIcon /> : <CancelIcon />}
                        >
                          {validationResult.message}
                        </Alert>

                        {/* Validation Details */}
                        <Box sx={{ textAlign: "left" }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Critères de validation :
                          </Typography>
                          {Object.entries(validationResult.checks).map(([key, passed]) => (
                            <Box key={key} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              {passed ? (
                                <CheckCircleIcon sx={{ color: "success.main", mr: 1, fontSize: 16 }} />
                              ) : (
                                <CancelIcon sx={{ color: "error.main", mr: 1, fontSize: 16 }} />
                              )}
                              <Typography variant="body2">
                                {key === "hasValidFormat" && "Format d'image valide"}
                                {key === "isNotTooLarge" && "Taille appropriée"}
                                {key === "isNotBlurry" && "Image nette et claire"}
                                {key === "showsFace" && "Visage visible"}
                                {key === "isAppropriate" && "Contenu approprié"}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )
                  )}
                </Box>
              )}

              {/* Step 2: Final Confirmation */}
              {index === 2 && validationResult?.isValid && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Parfait ! Votre photo est prête à être utilisée.
                  </Typography>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mb: 1 }}>
                <Button disabled={isValidating} onClick={handleNext} variant="contained" sx={{ mr: 1 }}>
                  {index === steps.length - 1 ? "Confirmer" : "Suivant"}
                </Button>
                <Button disabled={index === 0 || isValidating} onClick={handleBack}>
                  Retour
                </Button>
                {validationResult && !validationResult.isValid && (
                  <Button onClick={handleRetry} sx={{ ml: 1 }} color="primary">
                    Choisir une autre photo
                  </Button>
                )}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Close Button */}
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Button onClick={handleClose} color="inherit">
          Fermer
        </Button>
      </Box>
    </Paper>
  )
}

// Props validation
ImageValidationStepper.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImageValidated: PropTypes.func.isRequired,
  selectedImage: PropTypes.string,
}

ImageValidationStepper.defaultProps = {
  selectedImage: null,
}
