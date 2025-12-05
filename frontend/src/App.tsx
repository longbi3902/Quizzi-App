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
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Cấu hình theme (màu sắc, font, ...) cho Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Màu chính (xanh dương)
    },
    secondary: {
      main: '#dc004e', // Màu phụ (đỏ hồng)
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
  const { user } = useAuth();
  
  // Nếu có user (đã đăng nhập), hiển thị component con
  // Nếu không, chuyển về trang login
  return user ? <>{children}</> : <Navigate to="/login" />;
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
            
            {/* Route mặc định: chuyển về trang login */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


