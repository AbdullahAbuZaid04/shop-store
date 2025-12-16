import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/NotFound.css";

const NotFound = () => {
  const { user } = useAuth();
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">الصفحة غير موجودة</h1>
          <p className="error-description">
            عذراً، الصفحة التي تبحث عنها غير موجودة.
          </p>
          <div className="action-buttons">
            {user?.isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="home-btn">
                  <i className="fas fa-home btn-icon"></i>
                  العودة للوحة التحكم
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="home-btn">
                  <i className="fas fa-home btn-icon"></i>
                  العودة للرئيسية
                </Link>
                <Link to="/products" className="products-btn">
                  <i className="fas fa-shopping-bag btn-icon"></i>
                  تصفح المنتجات
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
