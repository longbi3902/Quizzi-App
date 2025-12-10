import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TopHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isTeacher = user?.role === 'teacher';
  const isMenuOpen = Boolean(anchorEl);

  const handleLogin = () => navigate('/login');

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!user) return;
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleCloseMenu();
    navigate('/login');
  };

  const goToAccount = () => {
    navigate('/home');
    handleCloseMenu();
  };

  const goToDashboard = () => {
    if (isTeacher) {
      navigate('/teacher/dashboard');
    } else {
      navigate('/home');
    }
    handleCloseMenu();
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      square
      sx={{
        background: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #059669 100%)',
        color: '#ffffff',
        borderRadius: '0 !important',
        boxShadow: 'none',
      }}
    >
      <Toolbar
        variant="dense"
        sx={{
          minHeight: 44,
          px: { xs: 2, sm: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{ display: { xs: 'none', md: 'inline' }, fontWeight: 600 }}
        >
          Trang thi trắc nghiệm uy tín số 1 Việt Nam
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {!user && (
            <Button color="inherit" onClick={handleLogin} sx={{ fontWeight: 600 }}>
              Đăng nhập
            </Button>
          )}

          {user && (
            <>
              <Button
                color="inherit"
                startIcon={<AccountCircleIcon />}
                endIcon={<ExpandMoreIcon />}
                onClick={handleOpenMenu}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                {user.name || user.email}
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleCloseMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {isTeacher && <MenuItem onClick={goToDashboard}>Dashboard</MenuItem>}
                <MenuItem onClick={goToAccount}>Thông tin tài khoản</MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopHeader;

