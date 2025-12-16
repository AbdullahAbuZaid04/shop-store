import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
  Button,
  Chip,
  Container,
  Alert,
  Stack,
  Paper,
  Snackbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Login,
  Category,
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material";
import productService from "../services/productService";
import { useAuth } from "../contexts/AuthContext";
import ProductCard from "../components/products/ProductCard";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { isAuthenticated, loading: authLoading, checkAuthStatus } = useAuth();
  const productsPerPage = 4; // 4 منتجات في كل صفحة

  useEffect(() => {
    if (!authLoading) {
      fetchProducts();
    }
  }, [authLoading, retryCount]);

  useEffect(() => {
    const checkAuthAndRetry = async () => {
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

    checkAuthAndRetry();
  }, [isAuthenticated, authLoading, checkAuthStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const productsData = await productService.getAllProducts();

      if (!productsData || productsData.length === 0) {
        const token =
          localStorage.getItem("adminToken") || localStorage.getItem("token");

        if (token) {
          setShowLoginPrompt(true);
          setError("قد تحتاج إلى تسجيل الدخول لعرض المنتجات");
        }
      }

      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
    } catch (err) {
      let errorMessage = "فشل في تحميل المنتجات";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى";

          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");

          setShowLoginPrompt(true);
        } else if (err.response.status === 403) {
          errorMessage = "ليس لديك صلاحية للوصول إلى المنتجات";
          setShowLoginPrompt(true);
        } else if (err.response.data?.Message) {
          errorMessage = err.response.data.Message;
        }
      } else if (err.message?.includes("Network")) {
        errorMessage = "فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // استخراج التصنيفات
  const categories = React.useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((p) => p.categoryName).filter(Boolean)),
    ];
    return ["الكل", ...uniqueCategories];
  }, [products]);

  // تصفية المنتجات
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "الكل") {
      filtered = filtered.filter((p) => p.categoryName === selectedCategory);
    }

    setFilteredProducts(filtered);
    setPage(1);
  }, [searchTerm, selectedCategory, products]);

  // حسابات التقسيم
  const indexOfLastProduct = page * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // وظائف التنقل بين الصفحات
  const goToFirstPage = () => setPage(1);
  const goToLastPage = () => setPage(totalPages);
  const goToNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };
  const goToPrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleCategoryChange = (category) => setSelectedCategory(category);
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("الكل");
  };
  const handleRetry = () => setRetryCount((prev) => prev + 1);
  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  const isLoading = authLoading || loading;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: "center" }}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {authLoading
            ? "جاري التحقق من المصادقة..."
            : "جاري تحميل المنتجات..."}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} dir="rtl">
      {/* العنوان الرئيسي */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          {isAuthenticated ? "🛍️ منتجات مخصصة لك" : "منتجاتنا"}
        </Typography>
        <Typography variant="h5" sx={{ opacity: 0.9 }}>
          {isAuthenticated
            ? "استكشف مجموعة المنتجات المميزة"
            : "اكتشف أحدث المنتجات والعروض المميزة"}
        </Typography>
      </Paper>

      {/* رسائل الخطأ */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: 2,
          }}
          action={
            <Stack direction="row" spacing={1}>
              <Button
                color="inherit"
                size="small"
                onClick={handleRetry}
                startIcon={<ClearIcon />}
              >
                إعادة المحاولة
              </Button>
              {(error.includes("انتهت صلاحية") ||
                error.includes("تسجيل الدخول")) && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleLoginRedirect}
                  startIcon={<Login />}
                >
                  تسجيل الدخول
                </Button>
              )}
            </Stack>
          }
        >
          <Typography fontWeight="bold">{error}</Typography>
        </Alert>
      )}

      {/* أدوات البحث والتصفية */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="ابحث عن منتج أو تصنيف..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              variant="outlined"
              disabled={!!error}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  backgroundColor: "white",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSearchTerm("")}
                      size="small"
                      disabled={!!error}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Category color="primary" />
              <Typography variant="body2" color="text.secondary">
                التصنيفات:
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => handleCategoryChange(category)}
                  disabled={!!error}
                  color={selectedCategory === category ? "primary" : "default"}
                  variant={
                    selectedCategory === category ? "filled" : "outlined"
                  }
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* معلومات التصفية */}
        {(searchTerm || selectedCategory !== "الكل") && !error && (
          <Alert
            severity="info"
            sx={{ mt: 2, borderRadius: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
              >
                مسح الفلتر
              </Button>
            }
          >
            عرض {filteredProducts.length} منتج
            {searchTerm && ` للبحث: "${searchTerm}"`}
            {selectedCategory !== "الكل" && ` في التصنيف: ${selectedCategory}`}
          </Alert>
        )}
      </Box>

      {/* عرض المنتجات */}
      {!error && currentProducts.length > 0 ? (
        <>
          {/* معلومات الصفحة */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              عرض {currentProducts.length} منتج (الصفحة {page} من {totalPages})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              إجمالي المنتجات: {filteredProducts.length}
            </Typography>
          </Box>

          {/* قائمة المنتجات */}
          <Grid container spacing={3}>
            {currentProducts.map((product) => (
              <Grid item xs={12} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {/* أزرار التنقل بين الصفحات */}
          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                mt: 6,
                p: 3,
                bgcolor: "grey.50",
                borderRadius: 3,
              }}
            >
              {/* زر الصفحة السابقة */}
              <Button
                variant="outlined"
                onClick={goToPrevPage}
                disabled={page === 1}
                startIcon={<ChevronRight />} // في RTL يكون السابق على اليمين
                sx={{ borderRadius: 2 }}
              >
                السابقة
              </Button>

              {/* عرض رقم الصفحة الحالية */}
              <Typography
                variant="h6"
                sx={{
                  px: 3,
                  py: 1,
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 2,
                  minWidth: 50,
                  textAlign: "center",
                }}
              >
                {page}
              </Typography>

              {/* زر الصفحة التالية */}
              <Button
                variant="outlined"
                onClick={goToNextPage}
                disabled={page === totalPages}
                endIcon={<ChevronLeft />} // في RTL يكون التالي على اليسار
                sx={{ borderRadius: 2 }}
              >
                التالية
              </Button>
            </Box>
          )}
        </>
      ) : !error ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "grey.50",
          }}
        >
          <SearchIcon sx={{ fontSize: 80, color: "grey.400", mb: 3 }} />
          <Typography variant="h4" color="text.secondary" gutterBottom>
            لم نعثر على منتجات مطابقة
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
          >
            حاول استخدام مصطلحات بحث مختلفة أو استعرض جميع التصنيفات
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
              sx={{ px: 4 }}
            >
              مسح عوامل التصفية
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outlined"
                size="large"
                onClick={handleLoginRedirect}
                startIcon={<Login />}
                sx={{ px: 4 }}
              >
                تسجيل الدخول
              </Button>
            )}
          </Stack>
        </Paper>
      ) : null}

      {/* Snackbar */}
      <Snackbar
        open={showLoginPrompt}
        autoHideDuration={8000}
        onClose={() => setShowLoginPrompt(false)}
        message="تسجيل الدخول يمنحك تجربة تسوق أفضل مع عروض حصرية!"
        action={
          <Button
            color="secondary"
            size="small"
            onClick={handleLoginRedirect}
            startIcon={<Login />}
          >
            تسجيل الدخول
          </Button>
        }
      />
    </Container>
  );
};

export default Products;
