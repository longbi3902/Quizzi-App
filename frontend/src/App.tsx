/**
 * App Component - Component chính của ứng dụng
 * 
 * Component này:
 * 1. Cấu hình theme (giao diện) cho toàn bộ app
 * 2. Cung cấp AuthContext cho các component con
 * 3. Cấu hình routing (điều hướng giữa các trang)
 * 4. Bảo vệ các route cần đăng nhập
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AddQuestion from './pages/AddQuestion';
import TeacherDashboard from './pages/TeacherDashboard';
import QuestionManagement from './pages/QuestionManagement';
import EditQuestion from './pages/EditQuestion';
import ExamManagement from './pages/ExamManagement';
import CreateExam from './pages/CreateExam';
import EditExam from './pages/EditExam';
import ExamCodeList from './pages/ExamCodeList';
import ExamCodeDetail from './pages/ExamCodeDetail';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import TopHeader from './components/TopHeader';

// Cấu hình theme (màu sắc, font, ...) cho Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#B2F7E4', // Màu chính (Xanh Bạc Hà - Mint)
      light: '#D4F9ED', // Màu nhạt hơn
      dark: '#8FE5D1', // Màu đậm hơn
      contrastText: '#1A1A1A', // Màu chữ trên nền primary
    },
    secondary: {
      main: '#FFC2B2', // Màu phụ (Hồng San Hô Nhạt - Coral)
      light: '#FFD9CE', // Màu nhạt hơn
      dark: '#FF9B8A', // Màu đậm hơn
      contrastText: '#1A1A1A', // Màu chữ trên nền secondary
    },
    background: {
      default: '#f8fafc', // Nền chính (màu xám nhạt)
      paper: '#FFFFFF', // Nền cho Paper/Card
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '1rem', // text-[1rem]
          fontWeight: 500, // font-medium
          color: '#666666', // text-label (màu label)
          '@media (min-width: 900px)': { // md breakpoint
            fontSize: '0.75rem', // md:text-12 (12px)
          },
        },
        shrink: {
          fontSize: '1rem',
          fontWeight: 500,
          '@media (min-width: 900px)': {
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important', // Bo góc rõ ràng hơn
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#B2F7E4', // Màu border khi hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#B2F7E4', // Màu border khi focus
            borderWidth: '1px',
          },
        },
        input: {
          fontSize: '1rem',
          padding: '12.5px 14px',
        },
        notchedOutline: {
          borderRadius: '12px !important', // Bo góc cho border
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important', // Bo góc cho input base
        },
        input: {
          fontSize: '1rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px !important', // Bo góc cho Paper
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Không viết hoa chữ
          fontWeight: 500,
          borderRadius: '12px !important', // Bo góc giống input
        },
        contained: {
          background: 'linear-gradient(135deg, #5FD4B8 0%, #8FE5D1 50%, #B2F7E4 100%)', // Gradient Mint đậm hơn
          color: '#FFFFFF', // Màu chữ trắng
          boxShadow: '0 2px 8px rgba(95, 212, 184, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4FC4A8 0%, #7FD4C0 50%, #9FE0D0 100%)', // Gradient đậm hơn khi hover
            boxShadow: '0 4px 12px rgba(95, 212, 184, 0.5)',
          },
          '&:active': {
            background: 'linear-gradient(135deg, #3FB498 0%, #6FC4B0 50%, #8FE5D1 100%)',
            boxShadow: '0 2px 6px rgba(95, 212, 184, 0.4)',
          },
          '&.Mui-disabled': {
            background: 'linear-gradient(135deg, #E0E0E0 0%, #F5F5F5 50%, #FAFAFA 100%)',
            color: '#9E9E9E',
            boxShadow: 'none',
          },
        },
      },
    },
  },
});

/**
 * ProtectedRoute - Component bảo vệ route
 * 
 * Chỉ cho phép truy cập nếu user đã đăng nhập
 * Nếu chưa đăng nhập, tự động chuyển về trang login
 * 
 * @param children - Component con cần được bảo vệ
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Đợi cho đến khi load xong từ localStorage
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Nếu có user (đã đăng nhập), hiển thị component con
  // Nếu không, chuyển về trang login
  return user ? <>{children}</> : <Navigate to="/login" />;
};

/**
 * TeacherRoute - Component bảo vệ route chỉ dành cho giáo viên
 * 
 * Chỉ cho phép truy cập nếu user đã đăng nhập và là giáo viên
 * Nếu không, tự động chuyển về trang phù hợp
 */
const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  // Đợi cho đến khi load xong từ localStorage
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'teacher') {
    return <Navigate to="/home" />;
  }
  
  return <>{children}</>;
};

/**
 * NavigateToRoleBasedHome - Component điều hướng dựa trên role
 * 
 * Giáo viên -> Dashboard giáo viên
 * Học sinh -> Home
 */
const NavigateToRoleBasedHome: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.role === 'teacher') {
    return <Navigate to="/teacher/dashboard" />;
  }
  
  return <Navigate to="/home" />;
};

/**
 * App Component - Entry point của ứng dụng
 */
function App() {
  return (
    // ThemeProvider: Cung cấp theme cho toàn bộ app
    <ThemeProvider theme={theme}>
      {/* CssBaseline: Reset CSS và áp dụng base styles */}
      <CssBaseline />
      
      {/* AuthProvider: Cung cấp AuthContext cho các component con */}
      <AuthProvider>
        {/* Router: Quản lý routing (điều hướng giữa các trang) */}
        <Router>
          <Box
            sx={{
              minHeight: '100vh',
              backgroundColor: 'background.default',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TopHeader />

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                px: { xs: 2, sm: 3 },
                py: { xs: 3, sm: 4 },
              }}
            >
              <Routes>
                {/* Route: Định nghĩa các đường dẫn và component tương ứng */}
                
                {/* Trang đăng nhập - ai cũng truy cập được */}
                <Route path="/login" element={<Login />} />
                
                {/* Trang đăng ký - ai cũng truy cập được */}
                <Route path="/register" element={<Register />} />
                
                {/* Trang Home - chỉ truy cập được khi đã đăng nhập */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                
                {/* Dashboard giáo viên - chỉ giáo viên mới vào được */}
                <Route
                  path="/teacher/dashboard"
                  element={
                    <TeacherRoute>
                      <TeacherDashboard />
                    </TeacherRoute>
                  }
                />
                
                {/* Quản lý câu hỏi - chỉ giáo viên mới vào được */}
                <Route
                  path="/teacher/questions"
                  element={
                    <TeacherRoute>
                      <QuestionManagement />
                    </TeacherRoute>
                  }
                />
                
                {/* Trang thêm câu hỏi - chỉ giáo viên mới vào được */}
                <Route
                  path="/add-question"
                  element={
                    <TeacherRoute>
                      <AddQuestion />
                    </TeacherRoute>
                  }
                />
                
                {/* Trang chỉnh sửa câu hỏi - chỉ giáo viên mới vào được */}
                <Route
                  path="/edit-question/:id"
                  element={
                    <TeacherRoute>
                      <EditQuestion />
                    </TeacherRoute>
                  }
                />
                
                {/* Quản lý đề thi - chỉ giáo viên mới vào được */}
                <Route
                  path="/teacher/exams"
                  element={
                    <TeacherRoute>
                      <ExamManagement />
                    </TeacherRoute>
                  }
                />
                
                {/* Tạo đề thi - chỉ giáo viên mới vào được */}
                <Route
                  path="/teacher/exams/create"
                  element={
                    <TeacherRoute>
                      <CreateExam />
                    </TeacherRoute>
                  }
                />
                
                {/* Chỉnh sửa đề thi - chỉ giáo viên mới vào được */}
                <Route
                  path="/teacher/exams/edit/:id"
                  element={
                    <TeacherRoute>
                      <EditExam />
                    </TeacherRoute>
                  }
                />
                
                {/* Danh sách mã đề - chỉ giáo viên mới vào được */}
                <Route
                  path="/teacher/exams/:examId/codes"
                  element={
                    <TeacherRoute>
                      <ExamCodeList />
                    </TeacherRoute>
                  }
                />
                
                {/* Chi tiết mã đề - chỉ giáo viên mới vào được */}
                <Route
                  path="/teacher/exam-codes/:id"
                  element={
                    <TeacherRoute>
                      <ExamCodeDetail />
                    </TeacherRoute>
                  }
                />
                
                {/* Route mặc định: chuyển về trang phù hợp dựa trên role */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <NavigateToRoleBasedHome />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


