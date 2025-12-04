import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Paper, TextField, IconButton, Typography, Avatar, Fab,
  Slide, Card, CardContent, Chip
} from '@mui/material';
import {
  Send as SendIcon, Chat as ChatIcon, Close as CloseIcon,
  SmartToy as BotIcon, Person as PersonIcon, School as SchoolIcon
} from '@mui/icons-material';
import { chatbotService } from 'src/services/pfe-services/chatbotService';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Questions fréquentes des étudiants
  const studentQuestions = [
    "Quand est ma soutenance ?",
    "Comment est noté le PFE ?", 
    "Qui sont les membres du jury ?",
    "Quand rendre mon rapport ?",
    "Comment se passe le stage ?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

// Dans votre composant React, modifiez handleSendMessage :
const handleSendMessage = async (messageText = null) => {
    const finalMessage = messageText || inputMessage;
    if (!finalMessage.trim() || loading) return;

    const userMessage = {
        id: Date.now(),
        content: finalMessage,
        sender: 'user',
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputMessage('');
    setLoading(true);

    try {
        // 🔥 ENVOI AVEC USERNAME DYNAMIQUE (récupéré de l'authentification)
        const userEmail = localStorage.getItem('userEmail') || 'etudiant@esprit.tn';
        const studentId = localStorage.getItem('studentId') || '04-1MT-073'; // À adapter
        
        const response = await chatbotService.sendMessage(finalMessage, studentId);
        
        const botMessage = {
            id: Date.now() + 1,
            content: response,
            sender: 'bot',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);

    } catch (error) {
        const errorMessage = {
            id: Date.now() + 1,
            content: "❌ Service momentanément indisponible. Réessaie dans quelques minutes.",
            sender: 'bot',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setLoading(false);
    }
};

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const formatMessage = (content) => {
    const contentString = typeof content === 'string' ? content : String(content || '');
    return contentString.split('\n').map((line, index) => (
      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
        {line}
      </Typography>
    ));
  };

  return (
    <>
      {/* Bouton flottant */}
      <Fab
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        {isOpen ? <CloseIcon /> : <SchoolIcon />}
      </Fab>

      {/* Fenêtre de chat */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 24,
            width: 350,
            height: 500,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
          }}
        >
          {/* En-tête étudiant */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <SchoolIcon />
            <Typography variant="h6" fontWeight="bold">
              Assistant PFE
            </Typography>
          </Box>

          {/* Zone des messages */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflow: 'auto',
              bgcolor: 'grey.50'
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  👋 Salut ! Je peux t'aider avec ton PFE
                </Typography>
              </Box>
            )}

            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1,
                  maxWidth: '90%',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  <Avatar sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: message.sender === 'user' ? 'secondary.main' : 'primary.main'
                  }}>
                    {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                  </Avatar>
                  <Card sx={{ 
                    bgcolor: message.sender === 'user' ? 'primary.light' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary'
                  }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      {formatMessage(message.content)}
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <BotIcon />
                  </Avatar>
                  <Card>
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2">Je réfléchis...</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Questions rapides */}
          {messages.length === 0 && (
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Questions fréquentes :
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {studentQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    onClick={() => handleQuickQuestion(question)}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      justifyContent: 'flex-start',
                      '& .MuiChip-label': { textAlign: 'left' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Zone de saisie */}
          <Box sx={{ p: 2, bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Pose ta question..."
                size="small"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                disabled={loading}
              />
              <IconButton
                color="primary"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || loading}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default Chatbot;