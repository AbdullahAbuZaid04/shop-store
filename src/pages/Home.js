import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Alert,
  Container,
  Snackbar,
  Paper,
  Stack,
  Fade,
  Grow,
  Zoom,
} from "@mui/material";

import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ProductCard from "../components/products/ProductCard";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import productService from "../services/productService";

const Home = () => {
  const { isAuthenticated, loading: authLoading, checkAuthStatus } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showAuthMessage, setShowAuthMessage] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading, retryCount]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      if (authLoading) return;

      if (!isAuthenticated) {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token");

        if (token) {
          await checkAuthStatus?.();
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 500);
        }
      }
    };

    checkAuthAndFetch();
  }, [isAuthenticated, authLoading, checkAuthStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const productsData = await productService.getAllProducts();
      setProducts(productsData || []);

      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      if (token && (!productsData || productsData.length === 0)) {
        setShowAuthMessage(true);
      }
    } catch (err) {
      let errorMessage = "فشل في تحميل المنتجات";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى";
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          setShowAuthMessage(true);
        } else if (err.response.status === 403) {
          errorMessage = "ليس لديك صلاحية للوصول إلى المنتجات";
        } else if (err.response.data?.Message) {
          errorMessage = err.response.data.Message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleRegisterRedirect = () => {
    window.location.href = "/register";
  };

  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  const isLoading = authLoading || loading;

  // منتجات مميزة (أول 4 منتجات أو أقل)
  const featuredProducts = products.slice(0, 4);

  return (
    <Box sx={{ overflow: "hidden" }}>
      {/* ---------- HERO SECTION ---------- */}
      <Box
        sx={{
          pt: { xs: 6, md: 10 },
          pb: { xs: 6, md: 8 },
          background: "linear-gradient(135deg, #1976d2, #1565c0)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={800}>
                <Box>
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{
                      fontSize: { xs: "2rem", md: "2.8rem" },
                      lineHeight: 1.2,
                      mb: 2,
                    }}
                  >
                    {isAuthenticated
                      ? "أهلاً وسهلاً بعودتك! 👋"
                      : "تجربة تسوق استثنائية 🛍️"}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      opacity: 0.9,
                      fontSize: { xs: "1rem", md: "1.2rem" },
                    }}
                  >
                    {isAuthenticated
                      ? "استكشف أحدث المنتجات والعروض الحصرية المخصصة لك"
                      : "اكتشف عالمًا من المنتجات المميزة"}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                    {isAuthenticated && (
                      <Button
                        component={Link}
                        to="/products"
                        variant="contained"
                        size="large"
                        startIcon={<ShoppingBagIcon />}
                        sx={{
                          bgcolor: "white",
                          color: "#667eea",
                          fontWeight: "bold",
                          borderRadius: 2,
                          px: 4,
                          "&:hover": {
                            bgcolor: "grey.100",
                            transform: "translateY(-2px)",
                            boxShadow: 4,
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        ابدأ التسوق
                      </Button>
                    )}

                    {!isAuthenticated && (
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={handleLoginRedirect}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          borderColor: "white",
                          color: "white",
                          borderRadius: 2,
                          px: 3,
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.1)",
                            borderColor: "white",
                          },
                        }}
                      >
                        تسجيل الدخول
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            <Grid item xs={12} md={6}>
              <Zoom in={true} timeout={1000}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                    position: "relative",
                    "&:hover img": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    src="/image/store.png"
                    alt="متجر إلكتروني"
                    sx={{
                      height: { xs: 250, md: 350 },
                      width: "100%",
                      objectFit: "cover",
                      transition: "transform 0.5s ease",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      left: 0,
                      p: 2,
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.7))",
                      color: "white",
                    }}
                  ></Box>
                </Card>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ---------- FEATURED PRODUCTS ---------- */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              {isAuthenticated ? "منتجات مخصصة لك" : "أحدث المنتجات  "}
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/products"
            variant="outlined"
            size="large"
            sx={{ borderRadius: 2, px: 3 }}
          >
            عرض الكل
          </Button>
        </Box>

        {/* حالة التحميل */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <Box textAlign="center">
              <CircularProgress size={60} thickness={4} />
              <Typography variant="h6" sx={{ mt: 3, color: "text.secondary" }}>
                {authLoading ? "جاري التحقق..." : "جاري تحميل المنتجات..."}
              </Typography>
            </Box>
          </Box>
        )}

        {/* رسالة الخطأ */}
        {error && !isLoading && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              borderRadius: 2,
              "& .MuiAlert-message": { width: "100%" },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
                startIcon={<RefreshIcon />}
                sx={{ mt: 1 }}
              >
                إعادة المحاولة
              </Button>
            }
          >
            <Typography fontWeight="bold">{error}</Typography>
          </Alert>
        )}
        {/* عرض المنتجات المميزة */}
        {!error && !isLoading && featuredProducts.length > 0 && (
          <Grid container spacing={3}>
            {featuredProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Grow in={true} timeout={index * 200}>
                  <Box>
                    <ProductCard product={product} />
                  </Box>
                </Grow>
              </Grid>
            ))}
          </Grid>
        )}

        {/* إذا لم توجد منتجات */}
        {!error && !isLoading && products.length === 0 && (
          <Paper
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "grey.50",
            }}
          >
            <Box sx={{ fontSize: 60, color: "grey.300", mb: 3 }}>🛒</Box>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              لا توجد منتجات حالياً
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {isAuthenticated
                ? "سيكون لدينا منتجات جديدة قريباً"
                : "سجل دخولك لعرض المزيد من المنتجات"}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                component={Link}
                to="/products"
                variant="contained"
                size="large"
                startIcon={<ShoppingBagIcon />}
              >
                تصفح المتجر
              </Button>
              {!isAuthenticated && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLoginRedirect}
                >
                  تسجيل الدخول
                </Button>
              )}
            </Stack>
          </Paper>
        )}
      </Container>

      {/* ---------- CALL TO ACTION ---------- */}
      {!isAuthenticated && (
        <Box
          sx={{
            py: 8,
            background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
          }}
        >
          <Container maxWidth="lg">
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                p: 3,
                textAlign: "center",
                bgcolor: "white",
                border: "1px solid #e5e7eb",
              }}
            >
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                انضم إلينا الآن! 🎁
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
              >
                سجل حسابك مجاناً واستمتع بالمنتجات
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRegisterRedirect}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, minWidth: 180 }}
                >
                  إنشاء حساب جديد
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLoginRedirect}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, minWidth: 180 }}
                >
                  تسجيل الدخول
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={showAuthMessage}
        autoHideDuration={6000}
        onClose={() => setShowAuthMessage(false)}
        message="سجل دخولك للاستفادة من جميع المزايا"
        action={
          <Button color="primary" size="small" onClick={handleLoginRedirect}>
            تسجيل الدخول
          </Button>
        }
      />
    </Box>
  );
};

export default Home;
