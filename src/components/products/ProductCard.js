import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../common/Toast";

import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Skeleton,
} from "@mui/material";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckIcon from "@mui/icons-material/Check";
import LockIcon from "@mui/icons-material/Lock";
import InfoIcon from "@mui/icons-material/Info";
import BlockIcon from "@mui/icons-material/Block";

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const {
    addToCart,
    isInCart,
    getItemQuantity,
    loading: cartLoading,
    removeFromCart,
    updateQuantity,
  } = useCart();

  const { success, error } = useToast();
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  // الحصول على حالة المنتج في السلة
  const cartStatus = isInCart?.(product?.id);
  const itemQuantity = getItemQuantity?.(product?.id) || 0;

  const handleProductClick = useCallback(
    (e) => {
      e?.stopPropagation();
      if (product?.id !== undefined) {
        navigate(`/product/${product.id}`);
      } else {
        error("⚠ لا يمكن فتح تفاصيل منتج غير صالح");
      }
    },
    [product?.id, navigate, error]
  );

  const handleAddToCart = useCallback(
    async (e) => {
      e?.stopPropagation();

      if (!isAuthenticated) {
        error("🔐 يجب تسجيل الدخول لإضافة المنتج للسلة");
        navigate("/login", { state: { from: "/products" } });
        return;
      }

      if (!product || !product.id) {
        error("⚠ المنتج غير صالح");
        return;
      }

      setLocalLoading(true);
      try {
        // استخدام الدالة المحدثة
        await addToCart(product, 1);

        success(`✅ تم إضافة "${product.name}" إلى السلة`);
      } catch (err) {
        error(`⚠ فشل إضافة المنتج: ${err.message || "حدث خطأ غير معروف"}`);
      } finally {
        setLocalLoading(false);
      }
    },
    [isAuthenticated, product, addToCart, error, success, navigate]
  );

  // دالة لزيادة الكمية
  const handleIncreaseQuantity = useCallback(
    async (e) => {
      e?.stopPropagation();

      if (!isAuthenticated || !product?.id) return;

      setLocalLoading(true);
      try {
        const currentQuantity = getItemQuantity?.(product.id) || 0;
        await updateQuantity(product.id, currentQuantity + 1);
        success(`✅ تم زيادة كمية "${product.name}"`);
      } catch (err) {
        error(`❌ فشل تحديث الكمية: ${err.message}`);
      } finally {
        setLocalLoading(false);
      }
    },
    [isAuthenticated, product, updateQuantity, getItemQuantity, success, error]
  );

  // دالة لتقليل الكمية
  const handleDecreaseQuantity = useCallback(
    async (e) => {
      e?.stopPropagation();

      if (!isAuthenticated || !product?.id) return;

      setLocalLoading(true);
      try {
        const currentQuantity = getItemQuantity?.(product.id) || 0;
        if (currentQuantity <= 1) {
          await removeFromCart(product.id);
          success(`✅ تم إزالة "${product.name}" من السلة`);
        } else {
          await updateQuantity(product.id, currentQuantity - 1);
          success(`✅ تم تقليل كمية "${product.name}"`);
        }
      } catch (err) {
        error(`❌ فشل تحديث الكمية: ${err.message}`);
      } finally {
        setLocalLoading(false);
      }
    },
    [
      isAuthenticated,
      product,
      removeFromCart,
      updateQuantity,
      getItemQuantity,
      success,
      error,
    ]
  );

  const getButtonState = () => {
    if (!product)
      return {
        text: "غير متوفر",
        color: "secondary",
        icon: <BlockIcon />,
        disabled: true,
        showQuantity: false,
      };

    if (!isAuthenticated)
      return {
        text: "سجل الدخول للشراء",
        color: "secondary",
        icon: <LockIcon />,
        disabled: false,
        showQuantity: false,
      };

    const isLoading = cartLoading || localLoading;

    if (isLoading)
      return {
        text: "جاري المعالجة...",
        color: "primary",
        icon: <ShoppingCartIcon />,
        disabled: true,
        showQuantity: false,
      };

    const isProductInCart = cartStatus && itemQuantity > 0;

    if (isProductInCart)
      return {
        text: "في السلة",
        color: "success",
        icon: <CheckIcon />,
        disabled: false,
        showQuantity: true,
        quantity: itemQuantity,
      };

    return {
      text: "أضف للسلة",
      color: "primary",
      icon: <ShoppingCartIcon />,
      disabled: false,
      showQuantity: false,
    };
  };

  const buttonState = getButtonState();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 2,
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
        overflow: "hidden",
      }}
    >
      <Box
        sx={{ position: "relative", overflow: "hidden", height: 200 }}
        onClick={handleProductClick}
      >
        {!imageLoaded && !imageError && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            sx={{ borderRadius: "12px 12px 0 0" }}
          />
        )}

        {!imageError && (
          <CardMedia
            component="img"
            height="200"
            image={product.image || "/image/store.png"}
            alt={product?.name || "product"}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            sx={{
              display: imageLoaded ? "block" : "none",
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
        )}

        {isAuthenticated && cartStatus && (
          <Chip
            label={`في السلة (${itemQuantity})`}
            color="success"
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              fontWeight: "bold",
              backgroundColor: "success.main",
              color: "white",
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1, pt: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, cursor: "pointer", mb: 1 }}
          onClick={handleProductClick}
        >
          {product?.name || "اسم غير متوفر"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {product?.categoryName || "غير مصنف"}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
            {product?.price ?? "---"} $
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color={product?.stockQuantity > 0 ? "success.main" : "error.main"}
          sx={{
            mt: 1,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {product?.stockQuantity > 0
            ? `متبقي: ${product.stockQuantity - itemQuantity} قطعة`
            : "❌ غير متوفر"}
        </Typography>
      </CardContent>

      <CardActions sx={{ mt: "auto", px: 2, pb: 2, pt: 0 }}>
        {buttonState.showQuantity && itemQuantity > 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleDecreaseQuantity}
              disabled={localLoading || cartLoading}
              sx={{ minWidth: 40, px: 1 }}
            >
              -
            </Button>

            <Box
              sx={{
                flex: 1,
                textAlign: "center",
                backgroundColor: "success.light",
                color: "success.contrastText",
                py: 1,
                borderRadius: 1,
                fontWeight: "bold",
              }}
            >
              {itemQuantity} في السلة
            </Box>

            <Button
              variant="outlined"
              color="primary"
              onClick={handleIncreaseQuantity}
              disabled={localLoading || cartLoading}
              sx={{ minWidth: 40, px: 1 }}
            >
              +
            </Button>
          </Box>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color={buttonState.color}
            onClick={handleAddToCart}
            startIcon={buttonState.icon}
            disabled={
              buttonState.disabled ||
              product?.stockQuantity === 0 ||
              localLoading ||
              cartLoading
            }
            sx={{
              fontWeight: "bold",
              py: 1,
              borderRadius: 2,
              position: "relative",
            }}
          >
            {buttonState.text}
            {(localLoading || cartLoading) && (
              <Box
                sx={{
                  position: "absolute",
                  right: 8,
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              >
                ⟳
              </Box>
            )}
          </Button>
        )}
      </CardActions>

      {!isAuthenticated && (
        <Box sx={{ textAlign: "center", pb: 2, pt: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <InfoIcon fontSize="small" />
            سجل الدخول لإضافة المنتج للسلة
          </Typography>
        </Box>
      )}

      {/* مؤشر التحميل */}
      {(localLoading || cartLoading) && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3498db",
              animation: "spin 1s linear infinite",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        </Box>
      )}
    </Card>
  );
};

export default ProductCard;
