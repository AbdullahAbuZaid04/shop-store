import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/common/Toast";
import productService from "../../services/productService";
import userService from "../../services/userService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  const handleShopAsCustomer = async () => {
    try {
      await logout();
      success("تم تسجيل الخروج بنجاح");
      navigate("/login");
    } catch (err) {
      error("فشل في تسجيل الخروج");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsData = await productService.getAllProducts();
      setStats((prevStats) => ({
        ...prevStats,
        totalProducts: productsData.length,
      }));
    } catch (err) {
      error("فشل في تحميل المنتجات");
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAllUsers();
      setStats((prevStats) => ({
        ...prevStats,
        totalUsers: usersData.totalCount || 0,
      }));
    } catch (err) {
      error("فشل في تحميل المستخدمين");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* الشريط الجانبي */}
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-cog me-2"></i>
                لوحة التحكم
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <Link
                  to="/admin"
                  className="list-group-item list-group-item-action active"
                >
                  <i className="fas fa-tachometer-alt me-2"></i>
                  الإحصائيات
                </Link>
                <Link
                  to="/admin/products"
                  className="list-group-item list-group-item-action"
                >
                  <i className="fas fa-box me-2"></i>
                  إدارة المنتجات
                </Link>
                <Link
                  to="/admin/users"
                  className="list-group-item list-group-item-action"
                >
                  <i className="fas fa-users me-2"></i>
                  إدارة المستخدمين
                </Link>
                <Link
                  to="/admin/categories"
                  className="list-group-item list-group-item-action"
                >
                  <i className="fas fa-tags me-2"></i>
                  إدارة التصنيفات
                </Link>
                <button
                  className="list-group-item list-group-item-action text-success"
                  onClick={handleShopAsCustomer}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  التسوق كعميل
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="col-md-9">
          {/* إحصائيات سريعة */}
          <div className="row mb-4">
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        إجمالي المبيعات
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {stats.totalSales.toLocaleString()} $
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-info shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        المنتجات
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {stats.totalProducts}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-box fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-warning shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        المستخدمين
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {stats.totalUsers}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-users fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
