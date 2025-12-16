import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/common/Toast";
import productService from "../services/productService";
import reviewService from "../services/reviewService";

// ========== MUI Components ==========
import {
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Avatar,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Grow,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";

// ========== MUI Icons ==========
import {
  ShoppingCart as ShoppingCartIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Verified as VerifiedIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";

const ProductDetails = () => {
  // ========== Hooks ==========
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const { success, error } = useToast();

  // ========== State Variables ==========
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    body: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [productImages, setProductImages] = useState([]);

  // ========== Effects ==========
  useEffect(() => {
    fetchProductDetails();
    fetchProductReviews();
  }, [id]);

  useEffect(() => {
    if (product) {
      // إنشاء مصفوفة الصور
      const images = [product.image || "/image/store.png"];
      setProductImages(images);
    }
  }, [product]);

  // ========== Data Fetching Functions ==========
  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(id);
      setProduct(productData);
    } catch (err) {
      console.error("❌ خطأ في جلب بيانات المنتج:", err);
      error("فشل في تحميل بيانات المنتج");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductReviews = async () => {
    try {
      setReviewsLoading(true);
      const [reviewsData, stats] = await Promise.all([
        reviewService.getProductReviews(id),
        reviewService.getProductReviewStats(id),
      ]);

      setReviews(reviewsData || []);
      setReviewStats(stats);

      if (isAuthenticated) {
        try {
          const userReview = await reviewService.getUserProductReview(id);
          setMyReview(userReview);
        } catch (userReviewError) {
          console.warn("⚠️ فشل في جلب تقييم المستخدم:", userReviewError);
          setMyReview(null);
        }
      } else {
        setMyReview(null);
      }
    } catch (err) {
      console.error("❌ خطأ في جلب التقييمات:", err);
      setReviews([]);
      setReviewStats({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    } finally {
      setReviewsLoading(false);
    }
  };

  // ========== Event Handlers ==========
  const handleOpenReviewForm = () => {
    if (myReview) {
      error("لقد قمت بتقييم هذا المنتج مسبقاً. يمكنك إضافة تقييم واحد فقط.");
      return;
    }

    if (!isAuthenticated) {
      error("يجب تسجيل الدخول لإضافة تقييم");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    setReviewForm({ rating: 5, title: "", body: "" });
    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.body.trim()) {
      error("الرجاء إضافة تعليق للتقييم");
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      error("التقييم يجب أن يكون بين 1 و 5 نجوم");
      return;
    }

    setSubmittingReview(true);
    try {
      const reviewData = {
        productId: parseInt(id),
        rating: parseInt(reviewForm.rating),
        title: reviewForm.title?.trim() || "تقييم",
        body: reviewForm.body.trim(),
      };

      await reviewService.addReview(reviewData);
      success("تم إضافة تقييمك بنجاح!");

      setReviewForm({ rating: 5, title: "", body: "" });
      setShowReviewForm(false);
      await fetchProductReviews();
    } catch (err) {
      error(err.message || "حدث خطأ أثناء حفظ التقييم");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCartAction = async () => {
    if (!isAuthenticated) {
      error("يجب تسجيل الدخول لإضافة المنتج إلى السلة");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    if (!product) return;

    try {
      const itemInCart = isInCart(product.id);
      const currentQuantity = getItemQuantity(product.id);
      const newQuantity = currentQuantity + quantity;

      if (itemInCart) {
        await updateQuantity(product.id, newQuantity);
        success(`تم تحديث كمية "${product.name}" في السلة`);
      } else {
        await addToCart(product, quantity);
        success(`تم إضافة "${product.name}" إلى السلة`);
      }
    } catch (err) {
      error("فشل في الإضافة إلى السلة الكمية المحددة أكبر من المتوفرة");
    }
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = () => {
    setActiveImage(
      (prev) => (prev - 1 + productImages.length) % productImages.length
    );
  };

  // ========== Helper Functions ==========
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "تاريخ غير معروف";
    }
  };

  const formatPrice = (price) => {
    try {
      return parseFloat(price).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch {
      return "0.00";
    }
  };

  // ========== Derived Values ==========
  const itemInCart = isInCart(product?.id);
  const cartQuantity = getItemQuantity(product?.id);
  const availableStock = product?.stockQuantity || 0;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 5;

  const sortedReviews = [...reviews].sort((a, b) => {
    return (
      new Date(b.reviewDate || b.createdDate) -
      new Date(a.reviewDate || a.createdDate)
    );
  });

  // ========== Loading State ==========
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 15, textAlign: "center" }}>
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h5" sx={{ mt: 4, color: "text.secondary" }}>
          جاري تحميل تفاصيل المنتج...
        </Typography>
      </Container>
    );
  }

  // ========== Error State ==========
  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Alert
          severity="error"
          sx={{
            mb: 4,
            borderRadius: 2,
            fontSize: "1.1rem",
            py: 2,
          }}
          icon={<CloseIcon />}
        >
          المنتج غير موجود أو تم حذفه
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/products")}
          variant="contained"
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
        >
          العودة للمنتجات
        </Button>
      </Container>
    );
  }

  // ========== Main Render ==========
  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }} dir="rtl">
      {/* Breadcrumb Navigation */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" separator="›">
          <MuiLink
            color="inherit"
            href="/"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
            الرئيسية
          </MuiLink>
          <MuiLink
            color="inherit"
            href="/products"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <StoreIcon sx={{ mr: 0.5, fontSize: 20 }} />
            المنتجات
          </MuiLink>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <CategoryIcon sx={{ mr: 0.5, fontSize: 20 }} />
            {product.categoryName}
          </Typography>
          <Typography color="text.primary" fontWeight="bold">
            {product.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Product Section */}
      <Grid container spacing={4}>
        {/* Product Images Section */}
        <Grid item xs={12} md={6} lg={5}>
          <Fade in={true} timeout={800}>
            <Box>
              {/* Main Image with Navigation */}
              <Box sx={{ position: "relative", mb: 2 }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    height: 450,
                    position: "relative",
                  }}
                >
                  {!imageLoaded && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "grey.50",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  )}

                  <CardMedia
                    component="img"
                    image={productImages[activeImage]}
                    alt={product.name}
                    sx={{
                      objectFit: "contain",
                      height: "100%",
                      width: "100%",
                      p: 2,
                      bgcolor: "white",
                    }}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      e.target.src = "/image/store.png";
                    }}
                  />

                  {/* Image Navigation Arrows */}
                  {productImages.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: "absolute",
                          left: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "white" },
                        }}
                      >
                        <NavigateBeforeIcon />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "white" },
                        }}
                      >
                        <NavigateNextIcon />
                      </IconButton>
                    </>
                  )}

                  {/* Product Badges */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    {isOutOfStock ? (
                      <Chip
                        label="غير متوفر"
                        color="error"
                        size="small"
                        icon={<CloseIcon />}
                        sx={{ fontWeight: "bold", boxShadow: 1 }}
                      />
                    ) : isLowStock ? (
                      <Chip
                        label={`آخر ${availableStock}`}
                        color="warning"
                        size="small"
                        sx={{ fontWeight: "bold", boxShadow: 1 }}
                      />
                    ) : null}
                  </Box>

                  {/* Image Counter */}
                  {productImages.length > 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      <Chip
                        label={`${activeImage + 1} / ${productImages.length}`}
                        size="small"
                        sx={{ bgcolor: "rgba(0,0,0,0.7)", color: "white" }}
                      />
                    </Box>
                  )}
                </Card>
              </Box>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <Box sx={{ display: "flex", gap: 1, overflowX: "auto", py: 1 }}>
                  {productImages.map((img, index) => (
                    <Box
                      key={index}
                      onClick={() => setActiveImage(index)}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 1,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: 2,
                        borderColor:
                          activeImage === index
                            ? "primary.main"
                            : "transparent",
                        opacity: activeImage === index ? 1 : 0.7,
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={img}
                        alt={`${product.name} ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Fade>
        </Grid>

        {/* Product Details Section */}
        <Grid item xs={12} md={6} lg={7}>
          <Box>
            {/* Product Title and Actions */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h3"
                fontWeight="bold"
                gutterBottom
                sx={{
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  lineHeight: 1.3,
                }}
              >
                {product.name}
              </Typography>

              {/* Rating and Actions Row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Rating
                    value={reviewStats.averageRating || 0}
                    readOnly
                    precision={0.5}
                    size="medium"
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {reviewStats.averageRating?.toFixed(1) || "0.0"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ({reviewStats.totalReviews || 0})
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Price Section */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                bgcolor: "primary.50",
                border: 1,
                borderColor: "primary.100",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    السعر
                  </Typography>
                  <Typography variant="h2" fontWeight="bold" color="primary">
                    {formatPrice(product.price)} $
                  </Typography>
                </Box>
                {product.categoryName && (
                  <Chip
                    label={product.categoryName}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: "bold" }}
                  />
                )}
              </Box>
            </Paper>

            {/* Quick Info Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: "center",
                    bgcolor: isOutOfStock ? "error.50" : "success.50",
                    border: 1,
                    borderColor: isOutOfStock ? "error.100" : "success.100",
                  }}
                >
                  <InventoryIcon
                    sx={{
                      fontSize: 32,
                      mb: 1,
                      color: isOutOfStock ? "error.main" : "success.main",
                    }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {isOutOfStock
                      ? "غير متوفر"
                      : `متوفر (${availableStock - cartQuantity})`}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: "center",
                    bgcolor: "warning.50",
                    border: 1,
                    borderColor: "warning.100",
                  }}
                >
                  <StarIcon
                    sx={{ fontSize: 32, mb: 1, color: "warning.main" }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {reviewStats.totalReviews || 0} تقييم
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Description */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                📝 الوصف
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                  border: 1,
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: "text.secondary",
                  }}
                >
                  {product.description || "لا يوجد وصف مفصل للمنتج."}
                </Typography>
              </Paper>
            </Box>

            {/* Quantity and Add to Cart */}
            <Box sx={{ mb: 4 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: 1,
                      borderColor: "grey.200",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      الكمية
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <IconButton
                        onClick={() =>
                          setQuantity((prev) => Math.max(1, prev - 1))
                        }
                        disabled={quantity <= 1 || isOutOfStock}
                        size="small"
                        sx={{
                          border: 1,
                          borderColor: "grey.300",
                          borderRadius: 1,
                        }}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography
                        variant="h6"
                        sx={{
                          minWidth: 40,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {quantity}
                      </Typography>

                      {/* <TextField
                        value={quantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          // التحقق من أن القيمة رقم
                          if (value === "") {
                            setQuantity(1);
                          } else if (/^\d+$/.test(value)) {
                            const numValue = parseInt(value, 10);
                            if (numValue >= 1 && numValue <= availableStock) {
                              setQuantity(numValue);
                            } else if (numValue > availableStock) {
                              setQuantity(availableStock);
                            }
                          }
                        }}
                        onBlur={() => {
                          // التأكد من أن الكمية صحيحة عند فقدان التركيز
                          if (quantity < 1) setQuantity(1);
                          if (quantity > availableStock)
                            setQuantity(availableStock);
                        }}
                        size="small"
                        inputProps={{
                          style: {
                            textAlign: "center",
                            width: "60px",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                          },
                          min: 1,
                          max: availableStock,
                          type: "number",
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "40px",
                            "& input": {
                              textAlign: "center",
                              padding: "8px",
                            },
                          },
                        }}
                        variant="outlined"
                      /> */}
                      <IconButton
                        onClick={() =>
                          setQuantity((prev) =>
                            Math.min(availableStock, prev + 1)
                          )
                        }
                        disabled={quantity >= availableStock || isOutOfStock}
                        size="small"
                        sx={{
                          border: 1,
                          borderColor: "grey.300",
                          borderRadius: 1,
                        }}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={
                      itemInCart ? <CheckIcon /> : <ShoppingCartIcon />
                    }
                    onClick={handleCartAction}
                    disabled={isOutOfStock}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      fontSize: "1rem",
                      fontWeight: "bold",
                      boxShadow: 3,
                      background: itemInCart
                        ? "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)"
                        : "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                      "&:hover": {
                        boxShadow: 6,
                      },
                      "&:disabled": {
                        bgcolor: "grey.400",
                        color: "grey.600",
                      },
                    }}
                  >
                    {itemInCart
                      ? `مضاف للسلة (${cartQuantity}) | أضف المزيد`
                      : "إضافة إلى السلة"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ my: 6 }}>
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          {/* Reviews Tab Content */}
          {activeTab === 0 && (
            <Box sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 4,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  تقييمات العملاء
                </Typography>
                {/* Review Button */}
                <Button
                  variant="contained"
                  startIcon={<StarIcon />}
                  onClick={handleOpenReviewForm}
                  sx={{ borderRadius: 2 }}
                >
                  {myReview ? "تم التقييم" : "أضف تقييمك"}
                </Button>
              </Box>

              {reviewsLoading ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <CircularProgress size={60} />
                  <Typography
                    variant="h6"
                    sx={{ mt: 3, color: "text.secondary" }}
                  >
                    جاري تحميل التقييمات...
                  </Typography>
                </Box>
              ) : sortedReviews.length > 0 ? (
                <Grid container spacing={3}>
                  {sortedReviews.map((review, index) => (
                    <Grid item xs={12} md={6} key={review.id}>
                      <Grow in={true} timeout={index * 200}>
                        <Paper
                          sx={{
                            p: 3,
                            height: "100%",
                            borderRadius: 2,
                            border: 1,
                            borderColor: "grey.200",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              borderColor: "primary.light",
                              boxShadow: 3,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: "primary.main",
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {(review.userName?.[0] || "م").toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {review.userName?.split(" ")[0] || "مستخدم"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDate(review.reviewDate)}
                                </Typography>
                              </Box>
                            </Box>
                            <Rating
                              value={review.rating}
                              readOnly
                              size="small"
                            />
                          </Box>

                          {review.title && review.title !== "تقييم" && (
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{ mb: 2, color: "text.primary" }}
                            >
                              {review.title}
                            </Typography>
                          )}

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2, lineHeight: 1.7 }}
                          >
                            {review.body}
                          </Typography>

                          {review.isVerifiedPurchase && (
                            <Chip
                              icon={<VerifiedIcon />}
                              label="شراء موثوق"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Paper>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <StarIcon sx={{ fontSize: 80, color: "grey.300", mb: 3 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    لا توجد تقييمات بعد
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: 600, mx: "auto" }}
                  >
                    كن أول من يقيم هذا المنتج وساعد الآخرين في اتخاذ قرار الشراء
                  </Typography>
                  {isAuthenticated && !myReview && (
                    <Button
                      variant="contained"
                      startIcon={<StarIcon />}
                      onClick={handleOpenReviewForm}
                      size="large"
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      كن أول المقيمين
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Add Review Dialog */}
      <Dialog
        open={showReviewForm}
        onClose={handleCloseReviewForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: "hidden" },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
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
            <Typography variant="h5" fontWeight="bold">
              <StarIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              تقييم المنتج
            </Typography>
            <IconButton onClick={handleCloseReviewForm} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                تقييمك للمنتج:
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <Rating
                  value={reviewForm.rating}
                  onChange={(event, newValue) => {
                    setReviewForm({ ...reviewForm, rating: newValue || 5 });
                  }}
                  size="large"
                  sx={{ fontSize: "3rem" }}
                />
              </Box>
              <Typography
                variant="h4"
                color="primary"
                fontWeight="bold"
                align="center"
              >
                {reviewForm.rating} ⭐
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="عنوان التقييم (اختياري)"
              value={reviewForm.title}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, title: e.target.value })
              }
              placeholder="اكتب عنواناً مختصراً..."
              variant="outlined"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="تعليقك *"
              value={reviewForm.body}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, body: e.target.value })
              }
              placeholder="شاركنا تجربتك مع المنتج..."
              required
              variant="outlined"
              helperText="شارك رأيك لمساعدة الآخرين"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 4, py: 3, bgcolor: "grey.50" }}>
          <Button
            onClick={handleCloseReviewForm}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            disabled={submittingReview}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitReview}
            disabled={submittingReview || !reviewForm.body.trim()}
            startIcon={
              submittingReview ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
            sx={{
              borderRadius: 2,
              fontWeight: "bold",
              px: 4,
            }}
          >
            {submittingReview ? "جاري الحفظ..." : "إضافة التقييم"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetails;
