import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/common/Toast";
import userService from "../services/userService";

import {
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
} from "@mui/material";

// الأيقونات
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LockIcon from "@mui/icons-material/Lock";

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // تحميل البيانات
  useEffect(() => {
    if (isAuthenticated) {
      loadProfileData();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profileData = await userService.getProfile();
      setProfile(profileData);
      setEditData(profileData);
    } catch (err) {
      error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // تحديث الملف الشخصي مع الحفاظ على isAdmin
  const handleUpdateProfile = async () => {
    try {
      // التحقق من البيانات المطلوبة
      if (!editData.firstName?.trim()) {
        error("الاسم الأول مطلوب");
        return;
      }

      const updatedProfile = await userService.updateProfile(editData);

      // ⭐ حفظ isAdmin قبل التحديث
      const currentIsAdmin = user?.isAdmin;

      // ⭐ تحديث البيانات مع الحفاظ على isAdmin
      const finalProfile = {
        ...updatedProfile,
        isAdmin: currentIsAdmin, // احتفظ بقيمة isAdmin الأصلية
      };

      setProfile(finalProfile);

      // ⭐ تحديث AuthContext مع الحفاظ على isAdmin
      updateUser({
        ...updatedProfile,
        isAdmin: currentIsAdmin,
      });

      success("تم تحديث الملف الشخصي بنجاح");
      setEditMode(false);
    } catch (err) {
      error(err.response?.data?.message || "فشل في تحديث البيانات");
    }
  };

  // معالجة تغيير كلمة المرور
  const handleChangePassword = async () => {
    // التحقق من البيانات
    if (!passwordData.currentPassword.trim()) {
      error("كلمة المرور الحالية مطلوبة");
      return;
    }

    if (!passwordData.newPassword.trim()) {
      error("كلمة المرور الجديدة مطلوبة");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      success("تم تغيير كلمة المرور بنجاح");
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      let errorMsg = "فشل في تغيير كلمة المرور";
      if (err.response?.status === 400) {
        errorMsg =
          "كلمة المرور الحالية غير صحيحة أو استخدم كلمة مرور جديدة في أحرف انجليزية";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      error(errorMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          يجب تسجيل الدخول لعرض الملف الشخصي
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          startIcon={<PersonIcon />}
        >
          تسجيل الدخول
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          جاري تحميل الملف الشخصي...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} dir="rtl">
      {/* رأس الصفحة */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          الملف الشخصي
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* المحتوى الرئيسي */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="h6">البيانات الشخصية</Typography>
                </Box>
              }
              action={
                <Stack direction="row" spacing={1}>
                  {editMode ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleUpdateProfile}
                        startIcon={<SaveIcon />}
                        size="medium"
                        sx={{ minWidth: 100 }}
                      >
                        حفظ
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => {
                          setEditMode(false);
                          setEditData(profile);
                        }}
                        startIcon={<CancelIcon />}
                        size="medium"
                        sx={{ minWidth: 100 }}
                      >
                        تراجع
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setEditMode(true)}
                        startIcon={<EditIcon />}
                        size="medium"
                        sx={{ minWidth: 120 }}
                      >
                        تعديل البيانات
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setPasswordDialog(true)}
                        startIcon={<LockIcon />}
                        size="medium"
                        sx={{ minWidth: 140 }}
                      >
                        تغيير كلمة المرور
                      </Button>
                    </>
                  )}
                </Stack>
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="الاسم الأول *"
                    value={editData.firstName || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                    error={editMode && !editData.firstName?.trim()}
                    helperText={
                      editMode && !editData.firstName?.trim() ? "مطلوب" : ""
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="الاسم الأخير"
                    value={editData.lastName || ""}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    value={user?.email || ""}
                    disabled
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="رقم الهاتف"
                    value={editData.phoneNumber || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        phoneNumber: e.target.value,
                      })
                    }
                    disabled={!editMode}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* نافذة تغيير كلمة المرور */}
      <Dialog
        open={passwordDialog}
        onClose={() => !changingPassword && setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockIcon />
            <Typography variant="h6">تغيير كلمة المرور</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="كلمة المرور الحالية *"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              disabled={changingPassword}
              error={!passwordData.currentPassword.trim()}
              helperText={!passwordData.currentPassword.trim() ? "مطلوب" : ""}
            />
            <TextField
              fullWidth
              type="password"
              label="كلمة المرور الجديدة *"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              disabled={changingPassword}
              error={!passwordData.newPassword.trim()}
              helperText={
                !passwordData.newPassword.trim()
                  ? "مطلوب"
                  : passwordData.newPassword.length < 6
                  ? "يجب أن تكون 6 أحرف على الأقل"
                  : ""
              }
            />
            <TextField
              fullWidth
              type="password"
              label="تأكيد كلمة المرور الجديدة *"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              disabled={changingPassword}
              error={
                passwordData.confirmPassword !== "" &&
                passwordData.newPassword !== passwordData.confirmPassword
              }
              helperText={
                passwordData.confirmPassword !== "" &&
                passwordData.newPassword !== passwordData.confirmPassword
                  ? "كلمات المرور غير متطابقة"
                  : ""
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setPasswordDialog(false)}
            color="inherit"
            disabled={changingPassword}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={
              changingPassword ||
              !passwordData.currentPassword.trim() ||
              !passwordData.newPassword.trim() ||
              !passwordData.confirmPassword.trim() ||
              passwordData.newPassword !== passwordData.confirmPassword ||
              passwordData.newPassword.length < 6
            }
            startIcon={changingPassword ? <CircularProgress size={20} /> : null}
          >
            {changingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
