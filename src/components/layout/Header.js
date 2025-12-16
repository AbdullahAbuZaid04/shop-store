import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../common/Toast";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Button,
  Box,
  Tooltip,
  Container,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HomeIcon from "@mui/icons-material/Home";
import StoreIcon from "@mui/icons-material/Store";
import LogoutIcon from "@mui/icons-material/Logout";

const Header = () => {
  const { clearCartLocally, getCartItemsCount } = useCart();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const cartItemsCount = getCartItemsCount();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    try {
      clearCartLocally();
      logout();
      localStorage.removeItem("cart");
      handleClose();
      success("تم تسجيل الخروج بنجاح");
      navigate("/", { replace: true });
    } catch (err) {
      navigate("/", { replace: true });
    }
  };

  //  إعادة توجيه المسؤول إذا حاول الوصول لصفحات غير مسموحة
  const handleNavigation = (path, pageName) => {
    if (isAdmin && !isAllowedForAdmin(path)) {
      error("🚫 هذه الصفحة غير متاحة للمسؤول");
      navigate("/admin/dashboard");
      return;
    }

    if (!isAuthenticated && requiresAuth(path)) {
      error(`🔐 يجب تسجيل الدخول للوصول إلى ${pageName}`);
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  //  الصفحات المسموحة للمسؤول فقط
  const isAllowedForAdmin = (path) => {
    const allowedPaths = [
      "/admin/dashboard",
      "/admin",
      "/profile",
      "/logout",
      "/login", // للخروج ثم الدخول
      "/",
      "/products",
      "/about",
      "/contact",
      "/cart",
    ];
    return allowedPaths.some((allowedPath) => path.startsWith(allowedPath));
  };

  //  الصفحات التي تتطلب تسجيل دخول
  const requiresAuth = (path) => {
    const authRequiredPaths = [
      "/cart",
      "/checkout",
      "/orders",
      "/profile",
      "/admin",
    ];
    return authRequiredPaths.some((authPath) => path.startsWith(authPath));
  };

  return (
    <AppBar position="sticky" sx={{ direction: "rtl", zIndex: 1000 }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", minHeight: "64px" }}>
          {/*  الشعار على اليسار */}
          <Typography
            variant="h6"
            component={Link}
            to={isAdmin ? "/admin/dashboard" : "/"}
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              "&:hover": { opacity: 0.8 },
            }}
          >
            {isAdmin ? "👑 لوحة التحكم" : " متجرنا"}
          </Typography>

          {/*  جميع الروابط في المنتصف */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              gap: { xs: 1, md: 2, lg: 3 },
            }}
          >
            {isAdmin ? (
              ""
            ) : (
              <>
                {/*  الرئيسية - للجميع */}
                <Tooltip title="الصفحة الرئيسية">
                  <Button
                    color="inherit"
                    startIcon={<HomeIcon />}
                    component={Link}
                    to="/"
                    sx={{ minWidth: "auto" }}
                  >
                    الرئيسية
                  </Button>
                </Tooltip>

                {/*  المنتجات - للجميع */}
                <Tooltip title="تصفح المنتجات">
                  <Button
                    color="inherit"
                    startIcon={<StoreIcon />}
                    component={Link}
                    to="/products"
                    sx={{ minWidth: "auto" }}
                  >
                    المنتجات
                  </Button>
                </Tooltip>

                {/*  سلة التسوق - تظهر للجميع ولكن عند الضغط تتحقق من التسجيل */}
                {isAuthenticated ? (
                  <Tooltip title="سلة التسوق">
                    <IconButton
                      color="inherit"
                      onClick={() => handleNavigation("/cart", "السلة")}
                      sx={{ ml: 1 }}
                    >
                      <Badge
                        badgeContent={cartItemsCount}
                        color="error"
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.7rem",
                            height: "18px",
                            minWidth: "18px",
                          },
                        }}
                      >
                        <ShoppingCartIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                ) : (
                  ""
                )}
              </>
            )}
          </Box>

          {/*  قسم الحساب على اليمين */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleMenu}
                  startIcon={
                    isAdmin ? (
                      <AdminPanelSettingsIcon color="warning" />
                    ) : (
                      <AccountCircleIcon />
                    )
                  }
                  sx={{ minWidth: "auto" }}
                >
                  {isAdmin
                    ? "المسؤول"
                    : user?.name || user?.firstName || "حسابي"}
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  sx={{ mt: 1 }}
                >
                  {/*  قائمة المسؤول */}
                  {isAdmin ? (
                    <>
                      <MenuItem
                        onClick={() => {
                          navigate("/admin/dashboard");
                          handleClose();
                        }}
                      >
                        لوحة التحكم
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          navigate("/admin/profile");
                          handleClose();
                        }}
                      >
                        الملف الشخصي
                      </MenuItem>
                    </>
                  ) : (
                    //  قائمة المستخدم العادي
                    <>
                      <MenuItem
                        onClick={() => {
                          navigate("/cart");
                          handleClose();
                        }}
                      >
                        سلة التسوق ({cartItemsCount})
                      </MenuItem>
                      {/* <MenuItem
                        onClick={() => {
                          navigate("/orders");
                          handleClose();
                        }}
                      >
                        طلباتي
                      </MenuItem> */}
                      <MenuItem
                        onClick={() => {
                          navigate("/profile");
                          handleClose();
                        }}
                      >
                        الملف الشخصي
                      </MenuItem>
                    </>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1, ml: 0.5 }} />
                    تسجيل الخروج
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  startIcon={<AccountCircleIcon />}
                  sx={{ minWidth: "auto" }}
                >
                  تسجيل الدخول
                </Button>
                <Button
                  color="inherit"
                  variant="outlined"
                  component={Link}
                  to="/register"
                  sx={{
                    minWidth: "auto",
                    borderColor: "rgba(255,255,255,0.5)",
                    "&:hover": {
                      borderColor: "white",
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  إنشاء حساب
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
