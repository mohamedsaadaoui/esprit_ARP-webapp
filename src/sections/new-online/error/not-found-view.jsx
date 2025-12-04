import { m } from 'framer-motion';

import HomeIcon from '@mui/icons-material/Home';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { 
  Box, 
  Button, 
  useTheme, 
  Container,
  Typography
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import CompactLayout from 'src/layouts/compact';
import { PageNotFoundIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function NotFoundView() {
  const theme = useTheme();
  
  return (
    <CompactLayout>
      <Container component={MotionContainer} sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph sx={{ color: theme.palette.error.main }}>
            <SentimentDissatisfiedIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
            Sorry, Page Not Found!
          </Typography>
        </m.div>

        <m.div variants={varBounce().in}>
          <Box sx={{ height: 260, mx: 'auto', my: { xs: 5, sm: 10 } }}>
            <PageNotFoundIllustration />
          </Box>
        </m.div>

        <Typography sx={{ color: theme.palette.text.secondary, mb: 5, maxWidth: 480, mx: 'auto' }}>
          Sorry, we couldn`&apos;t find the page you`&apos;re looking for. Perhaps you`&apos;ve mistyped the URL? 
          Be sure to check your spelling.
        </Typography>

        <Button
          component={RouterLink}
          href="/"
          size="large"
          color="primary"
          variant="contained"
          startIcon={<HomeIcon />}
          sx={{
            px: 3,
            bgcolor: theme.palette.primary.main,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            boxShadow: theme.shadows[3],
          }}
        >
          Go to Home
        </Button>
      </Container>
    </CompactLayout>
  );
}