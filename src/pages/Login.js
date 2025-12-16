import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Login as LoginIcon,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from "@mui/icons-material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth(); // ✅ استخدم login فقط (لا adminLogin)
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      setLoading(false);
      return;
    }

    try {
      //  استخدم login فقط - سيحدد الـ API إذا كان مسؤولاً أم لا
      const result = await login(email, password);

      if (result.success) {
        //  توجيه ذكي بناءً على الصلاحيات
        setTimeout(() => {
          if (result.isAdmin) {
            // مسؤول - توجيه إلى لوحة التحكم
            navigate("/admin/dashboard", { replace: true });
          } else {
            // مستخدم عادي - توجيه إلى الصفحة الرئيسية
            navigate("/", { replace: true });
          }
        }, 300);
      } else {
        setError(result.message || "فشل تسجيل الدخول");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 500,
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <LoginIcon sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              تسجيل الدخول
            </Typography>
          </Box>

          {error && (
            <Alert
              severity={
                error.includes("🔐") || error.includes("👤")
                  ? "info"
                  : error.includes("✅")
                  ? "success"
                  : "error"
              }
              sx={{ mb: 3 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="البريد الإلكتروني"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="أدخل بريدك الإلكتروني"
              error={!!error && error.includes("خطأ")}
            />

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="كلمة المرور"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleShowPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="أدخل كلمة المرور"
              error={!!error && error.includes("خطأ")}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: "bold",
                borderRadius: 2,
                background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
                },
              }}
              disabled={loading}
              startIcon={!loading && <LoginIcon />}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </form>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ليس لديك حساب؟{" "}
              <Link
                to="/register"
                style={{
                  color: "#1976d2",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                سجل الآن
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
