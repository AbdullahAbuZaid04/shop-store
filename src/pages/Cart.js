import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Grid,
  Divider,
  Avatar,
  Container,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper, // تم إضافته
} from "@mui/material";

import {
  Delete as DeleteIcon, // تم تصحيح اسم الـ icon
  Close as CloseIcon,
  Warning as WarningIcon, // تم تصحيح اسم الـ icon
} from "@mui/icons-material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PaymentIcon from "@mui/icons-material/Payment";
import RefreshIcon from "@mui/icons-material/Refresh";

const Cart = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    error,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
  } = useCart();

  const navigate = useNavigate();

  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const isAdmin = user?.role === "admin";

  // جلب محتويات السلة عند تحميل الصفحة
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      refreshCart();
    }
  }, [isAuthenticated, isAdmin]);

  // حذف منتج من السلة
  const handleRemoveItem = async (productId) => {
    setLocalLoading(true);
    try {
      await removeFromCart(productId);
      showSnackbar("تم حذف المنتج من السلة");
    } catch (err) {
      showSnackbar("فشل في حذف المنتج", "error");
    } finally {
      setLocalLoading(false);
    }
  };

  // زيادة كمية المنتج
  const handleIncreaseQuantity = async (productId, currentQuantity) => {
    setLocalLoading(true);
    try {
      await updateQuantity(productId, currentQuantity + 1);
      showSnackbar("تم زيادة الكمية");
    } catch (err) {
      showSnackbar("فشل في تحديث الكمية", "error");
    } finally {
      setLocalLoading(false);
    }
  };

  // تقليل كمية المنتج
  const handleDecreaseQuantity = async (productId, currentQuantity) => {
    setLocalLoading(true);
    try {
      if (currentQuantity <= 1) {
        await removeFromCart(productId);
        showSnackbar("تم إزالة المنتج من السلة");
      } else {
        await updateQuantity(productId, currentQuantity - 1);
        showSnackbar("تم تقليل الكمية");
      }
    } catch (err) {
      showSnackbar("فشل في تحديث الكمية", "error");
    } finally {
      setLocalLoading(false);
    }
  };

  // دالة فتح Dialog
  const handleOpenClearDialog = () => {
    setOpenClearDialog(true);
  };

  // دالة إغلاق Dialog
  const handleCloseClearDialog = () => {
    if (!isClearingCart) {
      setOpenClearDialog(false);
    }
  };

  // دالة تفريغ السلة المعدلة
  const handleClearCart = async () => {
    setIsClearingCart(true);
    try {
      await clearCart();
      showSnackbar("✅ تم تفريغ السلة بنجاح");
      handleCloseClearDialog();
    } catch (err) {
      console.error("❌ خطأ في تفريغ السلة:", err);
      showSnackbar("❌ فشل في تفريغ السلة", "error");
    } finally {
      setIsClearingCart(false);
    }
  };

  // ✅ دوال آمنة
  const safeItems = Array.isArray(items) ? items : [];
  const isLoading = loading || localLoading;

  const getSafeName = (item) => {
    return item?.Name || "منتج غير معروف";
  };

  const getSafePrice = (item) => {
    return typeof item?.Price === "number" ? item.Price : 0;
  };

  const getSafeQuantity = (item) => {
    return Math.max(typeof item?.Quantity === "number" ? item.Quantity : 0, 0);
  };

  const getSafeImage = (item) => {
    return item?.Image || "/image/store.png";
  };

  const getSafeCategory = (item) => {
    return item?.CategorytName || item?.CategoryName || "غير مصنف";
  };

  const getSafeProductId = (item) => {
    return item?.ProductId || item?.id || "";
  };

  const safeToLocaleString = (value) => {
    if (typeof value !== "number" || isNaN(value)) return "0.00";
    return value.toLocaleString(undefined, {
      // تم تصحيح دالة toLocaleString
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateSafeTotal = () => {
    return safeItems.reduce((total, item) => {
      return total + getSafePrice(item) * getSafeQuantity(item);
    }, 0);
  };

  // دالة لتحويل السعر إلى تنسيق
  const formatPrice = (price) => {
    return safeToLocaleString(price);
  };

  // إذا كان المستخدم مديراً
  if (isAdmin && isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // تم تصحيح Typo: "ustifyContent" إلى "justifyContent"
            alignItems: "center",
            textAlign: "center",
            gap: 3,
            p: 4,
            borderRadius: 3,
            backgroundColor: "warning.light",
          }}
        >
          <WarningIcon sx={{ fontSize: 80, color: "warning.main" }} />
          <Typography variant="h4" color="warning.main" gutterBottom>
            غير مسموح للمدير بالوصول لعربة التسوق
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            يرجى استخدام حساب عميل لإتمام عملية الشراء
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/admin")}
            size="large"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            العودة للوحة التحكم
          </Button>
        </Box>
      </Container>
    );
  }

  // إذا لم يكن مسجلاً دخول
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: 3,
          }}
        >
          <WarningIcon sx={{ fontSize: 80, color: "warning.main" }} />
          <Typography variant="h4" color="warning.main" gutterBottom>
            يجب تسجيل الدخول
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            يرجى تسجيل الدخول لعرض سلة التسوق
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login", { state: { from: "/cart" } })}
            size="large"
            sx={{ mt: 2, borderRadius: 2 }}
          >
            تسجيل الدخول
          </Button>
        </Box>
      </Container>
    );
  }

  // عرض التحميل
  if (isLoading && safeItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: 3,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            جاري تحميل السلة...
          </Typography>
        </Box>
      </Container>
    );
  }

  // إذا كانت السلة فارغة
  if (safeItems.length === 0 && !isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: 3,
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 100, color: "grey.400" }} />
          <Typography variant="h4" color="text.secondary" gutterBottom>
            سلة التسوق فارغة
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            لم تقم بإضافة أي منتجات إلى السلة بعد
          </Typography>

          <Button
            variant="contained"
            component={Link}
            to="/products"
            startIcon={<ShoppingBagIcon />}
            size="large"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
            }}
          >
            ابدأ التسوق الآن
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }} dir="rtl">
        {/* زر تحديث السلة */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              🛒 سلة التسوق ({safeItems.length} منتج)
            </Typography>
            <Typography variant="h6" color="text.secondary">
              إجمالي العناصر في السلة:{" "}
              {totalItems ||
                safeItems.reduce(
                  (total, item) => total + getSafeQuantity(item),
                  0
                )}
            </Typography>
          </Box>
        </Box>

        {/* عرض رسالة الخطأ */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* قسم المنتجات */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ShoppingCartIcon color="primary" />
                    <Typography variant="h5" fontWeight="bold">
                      منتجاتك ({safeItems.length})
                    </Typography>
                  </Box>
                }
                action={
                  <Tooltip title="تفريغ السلة">
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleOpenClearDialog}
                      disabled={isLoading}
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      تفريغ السلة
                    </Button>
                  </Tooltip>
                }
              />

              <CardContent sx={{ p: 0 }}>
                {safeItems.map((item, index) => {
                  const productId = getSafeProductId(item);
                  const quantity = getSafeQuantity(item);
                  const price = getSafePrice(item);
                  const total = price * quantity;

                  return (
                    <Box
                      key={productId || `cart-item-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 3,
                        borderBottom: index < safeItems.length - 1 ? 1 : 0,
                        borderColor: "divider",
                        transition: "background-color 0.2s",
                        "&:hover": {
                          backgroundColor: "grey.50",
                        },
                        opacity: isLoading ? 0.7 : 1,
                      }}
                    >
                      {/* صورة المنتج */}
                      <Avatar
                        src={getSafeImage(item)}
                        alt={getSafeName(item)}
                        variant="rounded"
                        sx={{
                          width: 80,
                          height: 80,
                          cursor: productId ? "pointer" : "default",
                        }}
                        onClick={() =>
                          productId && navigate(`/product/${productId}`)
                        }
                        onError={(e) => {
                          e.target.src = "/image/store.png";
                        }}
                      />

                      {/* معلومات المنتج */}
                      <Box sx={{ flexGrow: 1, mx: 3 }}>
                        <Typography
                          variant="h6"
                          fontWeight={600}
                          sx={{ cursor: productId ? "pointer" : "default" }}
                          onClick={() =>
                            productId && navigate(`/product/${productId}`)
                          }
                        >
                          {getSafeName(item)}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip
                            label={getSafeCategory(item)}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`الكمية: ${quantity}`}
                            size="small"
                            color="primary"
                          />
                        </Stack>
                      </Box>

                      {/* السعر والكمية */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 3 }}
                      >
                        {/* السعر للقطعة */}
                        <Box sx={{ textAlign: "center", minWidth: 100 }}>
                          <Typography variant="body2" color="text.secondary">
                            سعر القطعة
                          </Typography>
                          <Typography
                            variant="h6"
                            color="primary"
                            fontWeight="bold"
                          >
                            {formatPrice(price)} $
                          </Typography>
                        </Box>

                        {/* الكمية */}
                        <Box sx={{ textAlign: "center", minWidth: 120 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            الكمية
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDecreaseQuantity(productId, quantity)
                              }
                              disabled={isLoading}
                              sx={{
                                border: 1,
                                borderColor: "grey.300",
                                borderRadius: 1,
                              }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>

                            <Typography
                              sx={{
                                minWidth: 40,
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {isLoading ? (
                                <CircularProgress size={16} />
                              ) : (
                                quantity
                              )}
                            </Typography>

                            <IconButton
                              size="small"
                              onClick={() =>
                                handleIncreaseQuantity(productId, quantity)
                              }
                              disabled={isLoading}
                              sx={{
                                border: 1,
                                borderColor: "grey.300",
                                borderRadius: 1,
                              }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* المجموع */}
                        <Box sx={{ textAlign: "center", minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">
                            الإجمالي
                          </Typography>
                          <Typography
                            variant="h6"
                            color="success.main"
                            fontWeight="bold"
                          >
                            {formatPrice(total)} $
                          </Typography>
                        </Box>

                        {/* حذف */}
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(productId)}
                          disabled={isLoading}
                          sx={{
                            ml: 2,
                            "&:hover": {
                              backgroundColor: "error.light",
                              color: "white",
                            },
                          }}
                        >
                          {isLoading ? (
                            <CircularProgress size={20} />
                          ) : (
                            <DeleteIcon />
                          )}
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          {/* ملخص الطلب */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                position: "sticky",
                top: 100,
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h5" fontWeight="bold">
                    ملخص الطلب
                  </Typography>
                }
              />

              <CardContent>
                {/* تفاصيل الطلب */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>عدد المنتجات:</Typography>
                    <Typography fontWeight="bold">
                      {safeItems.length}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>إجمالي القطع:</Typography>
                    <Typography fontWeight="bold">
                      {totalItems ||
                        safeItems.reduce(
                          (total, item) => total + getSafeQuantity(item),
                          0
                        )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>مجموع المنتجات:</Typography>
                    <Typography fontWeight="bold">
                      {formatPrice(totalPrice || calculateSafeTotal())} $
                    </Typography>
                  </Box>

                  <Divider />

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">المجموع الكلي:</Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {formatPrice(totalPrice || calculateSafeTotal())} $
                    </Typography>
                  </Box>
                </Stack>

                {/* أزرار الإجراءات */}
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<PaymentIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      foالإجماليntSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                    // onClick={() => {
                    //   alert(
                    //     "قريبًا إن شاء الله، سيتم تسجيل خروجك الآن شكرًا شكرًا"
                    //   );
                    //   clearCart();
                    //   logout();
                    //   navigate("/");
                    // }}
                    onClick={() => {
                      navigate("/order-success");
                    }}
                    disabled={safeItems.length === 0}
                  >
                    إتمام الشراء
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    component={Link}
                    to="/products"
                    startIcon={<ShoppingBagIcon />}
                    sx={{ py: 1.5, borderRadius: 2 }}
                  >
                    مواصلة التسوق
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar للإشعارات */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openClearDialog}
        onClose={handleCloseClearDialog}
        aria-labelledby="clear-cart-dialog-title"
        aria-describedby="clear-cart-dialog-description"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden" },
        }}
      >
        <DialogTitle
          id="clear-cart-dialog-title"
          sx={{
            bgcolor: "error.main",
            color: "white",
            py: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <WarningIcon sx={{ fontSize: 28 }} />
              <Typography variant="h5" fontWeight="bold">
                تأكيد تفريغ السلة
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseClearDialog}
              sx={{ color: "white" }}
              disabled={isClearingCart}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: "center" }}>
              <DeleteIcon sx={{ fontSize: 80, color: "error.light", mb: 2 }} />
            </Box>

            <DialogContentText
              id="clear-cart-dialog-description"
              sx={{
                fontSize: "1.1rem",
                textAlign: "center",
                color: "text.primary",
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                color="error"
              >
                ⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه
              </Typography>

              <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                هل أنت متأكد من أنك تريد حذف جميع المنتجات من سلة التسوق؟
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mt: 2,
                  borderRadius: 2,
                  bgcolor: "error.50",
                  border: 1,
                  borderColor: "error.100",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">
                    عدد المنتجات:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    {safeItems.length} منتج
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    إجمالي السعر:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    {formatPrice(calculateSafeTotal())} $
                  </Typography>
                </Box>
              </Paper>
            </DialogContentText>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 4, py: 3, bgcolor: "grey.50" }}>
          <Button
            onClick={handleCloseClearDialog}
            variant="outlined"
            sx={{ borderRadius: 2, px: 4 }}
            disabled={isClearingCart}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleClearCart}
            variant="contained"
            color="error"
            startIcon={
              isClearingCart ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
            disabled={isClearingCart}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            {isClearingCart ? "جاري التفريغ..." : "نعم، تفريغ السلة"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Cart;
