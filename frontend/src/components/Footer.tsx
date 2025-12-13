/**
 * Footer - Component footer cho ứng dụng
 */

import React from 'react';
import { Box, Container, Grid, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#059669',
        color: '#ffffff',
        mt: 'auto',
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.75rem',
            }}
          >
            © 2024 Quizzi - Hệ thống thi trắc nghiệm trực tuyến
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

