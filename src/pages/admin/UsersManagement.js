import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/common/Toast";
import userService from "../../services/userService";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [upgradingUser, setUpgradingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const { success, error } = useToast();

  // بيانات القائمة الجانبية
  const menuItems = [
    { path: "/admin", icon: "fas fa-tachometer-alt", label: "الإحصائيات" },
    { path: "/admin/products", icon: "fas fa-box", label: "إدارة المنتجات" },
    {
      path: "/admin/users",
      icon: "fas fa-users",
      label: "إدارة المستخدمين",
      active: true,
    },
    {
      path: "/admin/categories",
      icon: "fas fa-tags",
      label: "إدارة التصنيفات",
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers(
        pagination.page,
        pagination.pageSize
      );

      // معالجة البيانات
      const processedUsers = data.users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName || "غير",
        lastName: user.lastName || "محدد",
        fullName:
          user.fullName ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        phoneNumber: user.phoneNumber,
        role: user.role,
        isAdmin: user.isAdmin,
        isActive: user.isActive || user.emailConfirmed,
        emailConfirmed: user.emailConfirmed,
        orders: user.ordersCount || 0,
        totalSpent: user.totalSpent || 0,
        lastLogin: user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString("ar-SA")
          : "لم يسجل دخول",
        joinDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("ar-SA")
          : new Date().toLocaleDateString("ar-SA"),
        addresses: user.addresses || [],
      }));

      setUsers(processedUsers);
      setPagination({
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1,
      });
    } catch (err) {
      error(err.response?.data?.message || "فشل في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  // دالة للحصول على لون وشارة الدور
  const getRoleBadge = (role) => {
    const roleInfo = userService.getRoleInfo(role);
    return `badge bg-${roleInfo?.color || "secondary"}`;
  };

  // تصفية المستخدمين
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm);

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? user.isActive : !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleUpdateUser = async () => {
    if (!editingUser) {
      error("لا يوجد مستخدم للتعديل");
      return;
    }

    try {
      setActionLoading(true);
      // استخدام updateUserById بدلاً من updateUser
      await userService.updateUserById(editingUser.id, editForm);
      success("تم تحديث بيانات المستخدم بنجاح");
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || "فشل في تحديث المستخدم");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpgradeToAdminClick = (user) => {
    if (user.id === currentUser?.id) {
      error("أنت مسؤول بالفعل");
      return;
    }
    if (user.isAdmin) {
      error("المستخدم مسؤول بالفعل");
      return;
    }
    setUpgradingUser(user);
    setShowUpgradeModal(true);
  };

  const handleUpgradeToAdmin = async () => {
    if (!upgradingUser) return;

    try {
      setActionLoading(true);
      await userService.upgradeToAdmin(upgradingUser.id);
      success("تم ترقية المستخدم إلى مسؤول بنجاح");
      setShowUpgradeModal(false);
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || "فشل في ترقية المستخدم");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShopAsCustomer = () => {
    logout();
    success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // تغيير الصفحة
  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage });
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
        <p className="mt-2">جاري تحميل المستخدمين...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
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
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`list-group-item list-group-item-action ${
                      item.active ? "active" : ""
                    }`}
                  >
                    <i className={`${item.icon} me-2`}></i>
                    {item.label}
                  </Link>
                ))}
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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">إدارة المستخدمين</h4>
              <p className="text-muted mb-0">
                عرض {filteredUsers.length} من {users.length} مستخدم
                {pagination.totalCount > 0 &&
                  ` (إجمالي ${pagination.totalCount})`}
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="w-20">
                <input
                  type="text"
                  className="form-control"
                  placeholder="ابحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* أدوات التصفية */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">الدور</label>
                  <select
                    className="form-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">جميع الأدوار</option>
                    {userService.getRoleOptions().map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={resetFilters}
                  >
                    <i className="fas fa-refresh me-2"></i>
                    إعادة تعيين
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* جدول المستخدمين */}
          <div className="card shadow">
            <div className="card-body">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-users-slash fa-3x mb-3"></i>
                  <h5>لا توجد مستخدمين</h5>
                  <p>لم يتم العثور على مستخدمين تطابق معايير البحث</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>المستخدم</th>
                          <th>الدور</th>
                          <th width="250">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div
                                  className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                  style={{ width: "40px", height: "40px" }}
                                >
                                  {user.firstName?.charAt(0) || "U"}
                                  {user.lastName?.charAt(0) || ""}
                                </div>
                                <div>
                                  <strong>{user.fullName}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {user.email}
                                  </small>
                                  {user.phoneNumber && <br />}
                                  {user.phoneNumber && (
                                    <small className="text-muted">
                                      {user.phoneNumber}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={getRoleBadge(user.role)}>
                                {userService.getRoleInfo(user.role).label}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                {!user.isAdmin && (
                                  <button
                                    className="btn btn-outline-success"
                                    onClick={() =>
                                      handleUpgradeToAdminClick(user)
                                    }
                                    title="ترقية إلى مسؤول"
                                  >
                                    <i className="fas fa-crown"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* الترقيم */}
                  {pagination.totalPages > 1 && (
                    <nav className="d-flex justify-content-center mt-3">
                      <ul className="pagination">
                        <li
                          className={`page-item ${
                            pagination.page === 1 ? "disabled" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => changePage(pagination.page - 1)}
                            disabled={pagination.page === 1}
                          >
                            السابق
                          </button>
                        </li>

                        {Array.from(
                          { length: Math.min(5, pagination.totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                              pageNum = i + 1;
                            } else if (
                              pagination.page >=
                              pagination.totalPages - 2
                            ) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.page - 2 + i;
                            }

                            return (
                              <li
                                key={pageNum}
                                className={`page-item ${
                                  pagination.page === pageNum ? "active" : ""
                                }`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => changePage(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          }
                        )}

                        <li
                          className={`page-item ${
                            pagination.page === pagination.totalPages
                              ? "disabled"
                              : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => changePage(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                          >
                            التالي
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* مودال تعديل المستخدم */}
      {showEditModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تعديل المستخدم</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">الاسم الأول *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">الاسم الأخير *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={editForm.phoneNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phoneNumber: e.target.value })
                    }
                    placeholder="+9665XXXXXXXX"
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateUser}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال ترقية إلى مسؤول */}
      {showUpgradeModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">ترقية إلى مسؤول</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUpgradeModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-4">
                  <div className="display-1 text-warning mb-3">
                    <i className="fas fa-crown"></i>
                  </div>
                  <h5>ترقية المستخدم إلى مسؤول</h5>
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  أنت على وشك ترقية المستخدم{" "}
                  <strong>{upgradingUser?.fullName}</strong> إلى مسؤول.
                </div>

                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>ملاحظة:</strong> المستخدم المسؤول سيكون لديه صلاحيات
                  كاملة للوصول إلى لوحة التحكم وإدارة النظام.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUpgradeModal(false)}
                  disabled={actionLoading}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleUpgradeToAdmin}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      جاري الترقية...
                    </>
                  ) : (
                    "نعم، قم بالترقية"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
