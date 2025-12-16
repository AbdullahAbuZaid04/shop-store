import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  ShoppingCart as ShoppingCartIcon,
  Logout as LogoutIcon,
  Store as StoreIcon,
} from "@mui/icons-material";

const OrderSuccess = () => {
  const { clearCart, totalPrice } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // بيانات الطلب من location state
  const orderData = location.state || {
    orderNumber: `#${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    total: totalPrice || "0.00",
    orderDate: new Date().toLocaleDateString("ar-SA"),
  };

  const handleContinueShopping = () => {
    clearCart();
    navigate("/products");
  };

  const handleViewOrders = () => {
    navigate("/orders");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {}
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} dir="rtl">
      {/* بطاقة النجاح الرئيسية */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 6, textAlign: "center" }}>
          <CheckCircleIcon
            sx={{
              fontSize: 80,
              color: "success.main",
              mb: 2,
            }}
          />

          <Typography
            variant="h3"
            fontWeight="bold"
            color="success.main"
            gutterBottom
          >
            تم طلبك بنجاح🎉
          </Typography>

          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
            شكراً لثقتك بنا، {user?.firstName || "عزيزي العميل"}
          </Typography>

          {/* تفاصيل الطلب */}
          <Box
            sx={{
              maxWidth: 500,
              mx: "auto",
              p: 3,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: 1,
              mb: 4,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              تفاصيل الطلب
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">رقم الطلب:</Typography>
                <Typography fontWeight="bold">
                  {orderData.orderNumber}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">المبلغ الإجمالي:</Typography>
                <Typography fontWeight="bold" color="primary">
                  {orderData.total.toLocaleString()} $
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">تاريخ الطلب:</Typography>
                <Typography fontWeight="bold">{orderData.orderDate}</Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* أزرار الإجراءات */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 3 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinueShopping}
              startIcon={<StoreIcon />}
              size="large"
              sx={{ minWidth: 200 }}
            >
              التسوق من جديد
            </Button>

            {/* <Button
              variant="outlined"
              onClick={handleViewOrders}
              startIcon={<ShoppingCartIcon />}
              size="large"
              sx={{ minWidth: 200 }}
            >
              عرض طلباتي
            </Button> */}
          </Stack>

          {/* زر تسجيل الخروج */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 3, pt: 3, borderTop: "1px dashed #ddd" }}
          >
            <Typography variant="body2" color="text.secondary">
              انتهيت من التسوق؟
            </Typography>

            <Button
              variant="text"
              color="error"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              size="medium"
              sx={{
                minWidth: 150,
                border: "1px solid",
                borderColor: "error.light",
                "&:hover": {
                  backgroundColor: "rgba(244, 67, 54, 0.1)",
                },
              }}
            >
              تسجيل الخروج
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderSuccess;
