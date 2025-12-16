import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  Paper,
} from "@mui/material";
import {
  Lock as LockIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const Unauthorized = () => {
  const { user, logout } = useAuth();

  const location = useLocation();
  const message =
    location.state?.message || "ليس لديك صلاحية للوصول إلى هذه الصفحة";
  const userRole = localStorage.getItem("adminUser") ? "مسؤول" : "مستخدم";

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          borderRadius: 3,
          textAlign: "center",
          background: "linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <LockIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" color="error" gutterBottom>
            🚫 غير مصرح
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {message}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 400,
            mx: "auto",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => window.history.back()}
            sx={{ py: 1.5 }}
          >
            العودة للصفحة السابقة
          </Button>
          {user?.isAdmin ? (
            <>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/admin/dashboard"
                startIcon={<AdminIcon />}
                sx={{ py: 1.5 }}
              >
                لوحة تحكم المسؤول
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/"
                startIcon={<HomeIcon />}
                sx={{ py: 1.5 }}
              >
                الصفحة الرئيسية
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/products"
                sx={{ py: 1.5 }}
              >
                تصفح المنتجات
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            color="primary"
            size="large"
            component={Link}
            onClick={() => logout()}
            to="/login"
            sx={{ py: 1.5 }}
          >
            تسجيل الدخول بحساب آخر
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized;
