/**
 * TeacherLayout - Layout cho giáo viên với sidebar bên trái
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/Quiz';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ClassIcon from '@mui/icons-material/Class';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import Footer from './Footer';

const DRAWER_WIDTH = 260;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Trang chủ', icon: <DashboardIcon />, path: '/teacher/dashboard' },
  { text: 'Quản lý câu hỏi', icon: <QuizIcon />, path: '/teacher/questions' },
  { text: 'Quản lý đề thi', icon: <ListAltIcon />, path: '/teacher/exams' },
  { text: 'Quản lý lớp học', icon: <ClassIcon />, path: '/teacher/classes' },
  { text: 'Thông tin cá nhân', icon: <AccountCircleIcon />, path: '/teacher/profile' },
];

const TeacherLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseMenu();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ borderRadius: 0 }}>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 0.5,
          pl: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: 'transparent',
          borderRadius: 0,
        }}
      >
        <Box
          component="img"
          src="/logo_quiz_v3.png"
          alt="Quizzi Logo"
          sx={{
            width: 40,
            height: 40,
            objectFit: 'contain',
          }}
        />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
          Quizzi
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/teacher/dashboard' && location.pathname.startsWith(item.path));
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                sx={{
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': {
                    backgroundColor: '#e0f2fe',
                    color: '#059669',
                    borderRight: '3px solid #059669',
                    '&:hover': {
                      backgroundColor: '#e0f2fe',
                    },
                  },
                  '&:hover': {
                    backgroundColor: '#f3f4f6',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? '#059669' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Top AppBar - Header giống TopHeader */}
        <AppBar
          position="fixed"
          elevation={0}
          square
          sx={{
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { sm: `${DRAWER_WIDTH}px` },
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
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="body2"
            sx={{ display: { xs: 'none', md: 'inline' }, fontWeight: 600 }}
          >
            Trang thi trắc nghiệm uy tín số 1 Việt Nam
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            <Button
              color="inherit"
              startIcon={<AccountCircleIcon />}
              endIcon={<ExpandMoreIcon />}
              onClick={handleOpenMenu}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              {user?.name || user?.email}
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Đăng xuất
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRadius: '0 !important',
              borderTopLeftRadius: '0 !important',
              borderTopRightRadius: '0 !important',
              borderBottomLeftRadius: '0 !important',
              borderBottomRightRadius: '0 !important',
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRadius: '0 !important',
              borderTopLeftRadius: '0 !important',
              borderTopRightRadius: '0 !important',
              borderBottomLeftRadius: '0 !important',
              borderBottomRightRadius: '0 !important',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
      </Box>
    </Box>
  );
};

export default TeacherLayout;

