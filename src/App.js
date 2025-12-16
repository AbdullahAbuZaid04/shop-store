import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
// import { ReviewsProvider } from "./contexts/ReviewContext";
import { ToastProvider } from "./components/common/Toast";

//  تصحيح المسارات
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import MainContent from "./components/common/MainContent";

//  الصفحات العامة
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";

//  صفحات المصادقة
import Login from "./pages/Login";
import Register from "./pages/Register";

//  صفحات المستخدم
import Cart from "./pages/Cart";
// import Orders from "./pages/Orders";
// import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
// import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";

//  صفحات المدير
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductsManagement from "./pages/admin/ProductsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
//import OrdersManagement from "./pages/admin/OrdersManagement";

//  صفحات حماية
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";

//  صفحات أخرى
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

// Theme مخصص للغة العربية
const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: '"Cairo", "Segoe UI", sans-serif',
  },
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
    background: { default: "#f5f5f5" },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Router>
              <div style={{ direction: "rtl" }}>
                <Header />
                <MainContent>
                  <main
                    style={{
                      minHeight: "calc(100vh - 140px)",
                    }}
                  >
                    <Routes>
                      {/*  صفحات المصادقة - للزوار فقط */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      {/*  صفحات المستخدم - محمية للمستخدمين المسجلين */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute requireAdmin={false}>
                            <Home />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/products"
                        element={
                          <ProtectedRoute requireAdmin={false}>
                            <Products />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/product/:id"
                        element={
                          <ProtectedRoute requireAdmin={false}>
                            <ProductDetails />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute requireAdmin={false}>
                            <Cart />
                          </ProtectedRoute>
                        }
                      />
                      {/* <Route
                        path="/orders"
                        element={
                          <ProtectedRoute requireAdmin={false}>
                            <Orders />
                          </ProtectedRoute>
                        }
                      /> */}
                      {/* <Route
                          path="/checkout"
                          element={
                            <ProtectedRoute requireAdmin={false}>
                              <Checkout />
                            </ProtectedRoute>
                          }
                        /> */}
                      <Route
                        path="/order-success"
                        element={
                          <ProtectedRoute requireAdmin={false}>
                            <OrderSuccess />
                          </ProtectedRoute>
                        }
                      />
                      {/* <Route
                        path="/order/:orderId"
                        element={
                          <ProtectedRoute requireAdmin={false}>
                            <OrderDetails />
                          </ProtectedRoute>
                        }
                      /> */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute requireAdmin={false}>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />

                      {/* صفحات المسؤول - محمية للمسؤولين فقط */}
                      {/* 1. لوحة التحكم الرئيسية */}
                      <Route
                        path="/admin/dashboard"
                        element={
                          <AdminProtectedRoute requireAdmin={true}>
                            <AdminDashboard />
                          </AdminProtectedRoute>
                        }
                      />

                      {/* 2. إدارة المستخدمين */}
                      <Route
                        path="/admin/users/*"
                        element={
                          <AdminProtectedRoute requireAdmin={true}>
                            <UsersManagement />
                          </AdminProtectedRoute>
                        }
                      />

                      {/* 3. إدارة المنتجات */}
                      <Route
                        path="/admin/products/*"
                        element={
                          <AdminProtectedRoute requireAdmin={true}>
                            <ProductsManagement />
                          </AdminProtectedRoute>
                        }
                      />

                      {/* 4. إدارة التصنيفات */}
                      <Route
                        path="/admin/categories/*"
                        element={
                          <AdminProtectedRoute requireAdmin={true}>
                            <CategoriesManagement />
                          </AdminProtectedRoute>
                        }
                      />

                      {/* 6. ملف المسؤول الشخصي */}
                      <Route
                        path="/admin/profile"
                        element={
                          <ProtectedRoute requireAdmin={true}>
                            <Profile isAdminProfile={true} />
                          </ProtectedRoute>
                        }
                      />

                      {/*  إعادة التوجيه */}
                      <Route
                        path="/admin"
                        element={<Navigate to="/admin/dashboard" replace />}
                      />

                      {/* إعادة توجيه غير المسؤولين من صفحات /admin */}
                      <Route
                        path="/admin/*"
                        element={
                          <AdminProtectedRoute>
                            <Navigate to="/admin/dashboard" replace />
                          </AdminProtectedRoute>
                        }
                      />

                      {/*  صفحات أخرى */}
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route
                        path="*"
                        element={<Navigate to="/404" replace />}
                      />
                    </Routes>
                  </main>
                </MainContent>
                <Footer />
              </div>
            </Router>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
