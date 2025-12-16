import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  Email,
  Lock,
  Person,
  Phone,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/common/Toast";
import authService from "../services/authService";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "", // ✅ أضف هذا الحقل
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // التحقق من صحة البيانات
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "الاسم الأول مطلوب";
    if (!formData.lastName.trim()) newErrors.lastName = "الاسم الأخير مطلوب";

    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    // ✅ التحقق من رقم الهاتف
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "رقم الهاتف مطلوب";
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,20}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "رقم الهاتف غير صحيح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون على الأقل 6 أحرف";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      // إضافة رقم هاتف افتراضي إذا لم يتم إدخاله
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber || "0000000000", // قيمة افتراضية
      };

      const response = await authService.register(userData);


      // ✅ منطق مبسط: إذا كان status code 200/201 أو هناك data
      if (
        response.success ||
        (response.data && Object.keys(response.data).length > 0) ||
        response.message?.includes("تم")
      ) {
        success("تم إنشاء الحساب بنجاح! 🎉");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setServerError(response.message || "حدث خطأ أثناء التسجيل");
        toastError("فشل في إنشاء الحساب");
      }
    } catch (err) {

      // إذا كان الخطأ يحتوي على رسالة مفيدة
      if (err.message && err.message.includes("success")) {
        // حتى لو كان catch، قد يكون التسجيل ناجحاً
        success("تم إنشاء الحساب! يرجى تسجيل الدخول");
        navigate("/login");
      } else {
        setServerError("حدث خطأ في الاتصال بالخادم");
        toastError("فشل في إنشاء الحساب");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }} dir="rtl">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            إنشاء حساب جديد
          </Typography>
          <Typography variant="body2" color="text.secondary">
            انضم إلى عائلة متجرنا واستمتع بتجربة تسوق فريدة
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="الاسم الأول"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.firstName}
            helperText={errors.firstName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="الاسم الأخير"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.lastName}
            helperText={errors.lastName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="البريد الإلكتروني"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            type="email"
            error={!!errors.email}
            helperText={errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />

          {/* ✅ أضف حقل رقم الهاتف */}
          <TextField
            fullWidth
            label="رقم الهاتف"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            margin="normal"
            required
            type="tel"
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber || "مثال: 0551234567"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
            placeholder="05xxxxxxxx"
          />

          <TextField
            fullWidth
            label="كلمة المرور"
            name="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            type={showPassword ? "text" : "password"}
            error={!!errors.password}
            helperText={errors.password || "على الأقل 6 أحرف"}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="تأكيد كلمة المرور"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            type={showConfirmPassword ? "text" : "password"}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
          >
            {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب جديد"}
          </Button>
        </Box>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            لديك حساب بالفعل؟{" "}
            <Link
              to="/login"
              style={{
                color: "#1976d2",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              سجل الدخول هنا
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
