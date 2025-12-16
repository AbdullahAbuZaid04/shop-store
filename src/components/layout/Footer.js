import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Fab,
  Fade,
  Stack,
} from "@mui/material";

// Icons
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import HomeIcon from "@mui/icons-material/Home";

const Footer = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  // مراقبة التمرير لإظهار/إخفاء زر العودة للأعلى
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      component="footer"
      dir="rtl"
      sx={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#cbd5e1",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "300px",
          height: "300px",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "200px",
          height: "200px",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
        },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          mt: "30px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Main Content */}
        <Grid container spacing={6} sx={{ mb: 6 }}>
          {/* Brand & Social */}
          <Grid item xs={12} md={3}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <ShoppingBagIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="white">
                    متجرنا
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{ mb: 3, lineHeight: 1.8, color: "#cbd5e1" }}
              >
                نقدم لكم أفضل المنتجات بأعلى جودة، مع خدمة عملاء متميزة
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              color="white"
              mb={3}
              sx={{
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  right: 0,
                  width: "100%",
                  height: "3px",
                  background: "linear-gradient(90deg, #3b82f6, #10b981)",
                  borderRadius: 2,
                },
              }}
            >
              روابط سريعة
            </Typography>
            <Stack spacing={1}>
              <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1,
                    px: 1,
                    borderRadius: 1,
                    color: "#cbd5e1",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "rgba(59, 130, 246, 0.1)",
                    },
                  }}
                >
                  <HomeIcon sx={{ fontSize: 18, color: "inherit" }} />
                  <Typography variant="body2">الرئيسية</Typography>
                </Box>
              </Link>

              <Link
                to="/products"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1,
                    px: 1,
                    borderRadius: 1,
                    color: "#cbd5e1",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "primary.main",
                      bgcolor: "rgba(59, 130, 246, 0.1)",
                    },
                  }}
                >
                  <Inventory2Icon sx={{ fontSize: 18, color: "inherit" }} />
                  <Typography variant="body2">جميع المنتجات</Typography>
                </Box>
              </Link>
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography
              variant="h6"
              color="white"
              mb={3}
              sx={{
                position: "relative",
                display: "inline-block",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -8,
                  right: 0,
                  width: "100%",
                  height: "3px",
                  background: "linear-gradient(90deg, #3b82f6, #10b981)",
                  borderRadius: 2,
                },
              }}
            >
              معلومات التواصل
            </Typography>

            <Stack spacing={2}>
              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <PlaceIcon sx={{ fontSize: 20, color: "cbd5e1", mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                    فلسطين - قطاع غزة
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="flex-start" gap={1.5}>
                <PhoneIcon sx={{ fontSize: 20, color: "cbd5e1", mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: "#cbd5e1" }}>
                    +970 590 000 000
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Box
          sx={{
            pt: 4,
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body2"
                align="left"
                sx={{
                  color: "#94a3b8",
                  mb: 5,
                }}
              >
                متــجرنــا — {new Date().getFullYear()}{" "}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Scroll to Top Button */}
      <Fade in={showScrollButton}>
        <Fab
          size="medium"
          onClick={scrollToTop}
          sx={{
            position: "fixed",
            bottom: 24,
            left: 24,
            zIndex: 1000,
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            color: "white",
            boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 30px rgba(59, 130, 246, 0.4)",
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          aria-label="العودة للأعلى"
        >
          <ArrowUpwardIcon />
        </Fab>
      </Fade>
    </Box>
  );
};

export default Footer;
