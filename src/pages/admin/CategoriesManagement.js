import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/common/Toast";
import categoriesService from "../../services/categoryService";

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { success, error } = useToast();

  // بيانات القائمة الجانبية
  const menuItems = [
    { path: "/admin", icon: "fas fa-tachometer-alt", label: "الإحصائيات" },
    { path: "/admin/products", icon: "fas fa-box", label: "إدارة المنتجات" },
    { path: "/admin/users", icon: "fas fa-users", label: "إدارة المستخدمين" },
    {
      path: "/admin/categories",
      icon: "fas fa-tags",
      label: "إدارة التصنيفات",
      active: true,
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoriesService.getCategories();
      setCategories(categoriesData || []);
      console.log(`✅ تم تحميل ${categoriesData.length} تصنيف`);
    } catch (err) {
      console.error("❌ خطأ في جلب التصنيفات:", err);
      error(err.message || "فشل في تحميل التصنيفات");
    } finally {
      setLoading(false);
    }
  };

  // تصفية التصنيفات باستخدام useMemo للأداء
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const searchLower = searchTerm.toLowerCase();
    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(searchLower) ||
        (category.description &&
          category.description.toLowerCase().includes(searchLower))
    );
  }, [categories, searchTerm]);

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        error("يرجى إدخال اسم التصنيف");
        return;
      }

      setActionLoading(true);

      const categoryData = {
        name: newCategory.name.trim(),
        description: newCategory.description?.trim() || "",
      };

      console.log("📤 إضافة تصنيف جديد:", categoryData);

      await categoriesService.addCategory(categoryData);
      success("تم إضافة التصنيف بنجاح");

      // إعادة تعيين الحقول
      setNewCategory({ name: "", description: "" });
      setShowAddModal(false);

      // إعادة تحميل البيانات
      await fetchCategories();
    } catch (err) {
      console.error("❌ خطأ في إضافة التصنيف:", err);
      error(err.message || "فشل في إضافة التصنيف");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;

    try {
      setActionLoading(true);

      const categoryData = {
        name: selectedCategory.name.trim(),
        description: selectedCategory.description?.trim() || "",
      };

      console.log(`🔄 تحديث التصنيف ${selectedCategory.id}:`, categoryData);

      await categoriesService.updateCategory(selectedCategory.id, categoryData);
      success("تم تعديل التصنيف بنجاح");

      setShowEditModal(false);
      setSelectedCategory(null);

      await fetchCategories();
    } catch (err) {
      console.error("❌ خطأ في تعديل التصنيف:", err);
      error(err.message || "فشل في تعديل التصنيف");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      setActionLoading(true);

      // التحقق أولاً إذا كان يمكن حذف التصنيف
      try {
        const canDelete = await categoriesService.canDeleteCategory(
          selectedCategory.id
        );
        if (!canDelete.canDelete) {
          error(canDelete.message);
          return;
        }
      } catch (checkError) {
        console.warn("⚠️ فشل في التحقق من إمكانية الحذف:", checkError);
        // استمر في محاولة الحذف
      }

      console.log(`🗑️ حذف التصنيف ${selectedCategory.id}`);

      await categoriesService.deleteCategory(selectedCategory.id);
      success("تم حذف التصنيف بنجاح");

      setShowDeleteModal(false);
      setSelectedCategory(null);

      await fetchCategories();
    } catch (err) {
      console.error("❌ خطأ في حذف التصنيف:", err);
      error(err.message || "فشل في حذف التصنيف");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShopAsCustomer = () => {
    logout();
    success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const openEditModal = (category) => {
    setSelectedCategory({
      ...category,
      name: category.name || "",
      description: category.description || "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setNewCategory({
      name: "",
      description: "",
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
            <p className="mt-2">جاري تحميل التصنيفات...</p>
          </div>
        </div>
      </div>
    );
  }

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
          {/* الرأس وأزرار التحكم */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1">إدارة التصنيفات</h4>
              <p className="text-muted mb-0">
                عرض {filteredCategories.length} من {categories.length} تصنيف
              </p>
            </div>
            <div className="d-flex gap-2">
              <div className="w-30">
                <input
                  type="text"
                  className="form-control"
                  placeholder="ابحث في التصنيفات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                إضافة تصنيف
              </button>
            </div>
          </div>

          {/* جدول التصنيفات */}
          <div className="card shadow">
            <div className="card-body">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-tags fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">لا توجد تصنيفات</h5>
                  <p className="text-muted">
                    {searchTerm.trim()
                      ? "لم يتم العثور على تصنيفات تطابق معايير البحث"
                      : "لم يتم إضافة أي تصنيفات حتى الآن"}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    إضافة تصنيف جديد
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th width="80">ID</th>
                        <th>اسم التصنيف</th>
                        <th>الوصف</th>
                        <th width="100">المنتجات</th>
                        <th width="150">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((category) => (
                        <tr key={category.id}>
                          <td>
                            <span className="badge bg-secondary">
                              {category.id}
                            </span>
                          </td>
                          <td>
                            <strong>{category.name}</strong>
                          </td>
                          <td>
                            <small className="text-muted">
                              {category.description || "لا يوجد وصف"}
                            </small>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                category.productCount > 0
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {category.productCount} منتج
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => openEditModal(category)}
                                title="تعديل"
                                disabled={actionLoading}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => openDeleteModal(category)}
                                title="حذف"
                                disabled={
                                  actionLoading || category.productCount > 0
                                }
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                            {category.productCount > 0 && (
                              <small className="text-danger d-block mt-1">
                                يحتوي على منتجات
                              </small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal إضافة تصنيف */}
      {showAddModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">إضافة تصنيف جديد</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">اسم التصنيف *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    placeholder="أدخل اسم التصنيف"
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">الوصف</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    placeholder="أدخل وصف التصنيف"
                    disabled={actionLoading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  disabled={actionLoading}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddCategory}
                  disabled={actionLoading || !newCategory.name.trim()}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      جاري الإضافة...
                    </>
                  ) : (
                    "إضافة التصنيف"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal تعديل تصنيف */}
      {showEditModal && selectedCategory && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تعديل التصنيف</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">اسم التصنيف *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedCategory.name || ""}
                    onChange={(e) =>
                      setSelectedCategory({
                        ...selectedCategory,
                        name: e.target.value,
                      })
                    }
                    required
                    disabled={actionLoading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">الوصف</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={selectedCategory.description || ""}
                    onChange={(e) =>
                      setSelectedCategory({
                        ...selectedCategory,
                        description: e.target.value,
                      })
                    }
                    disabled={actionLoading}
                  />
                </div>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <small>
                    هذا التصنيف يحتوي على {selectedCategory.productCount || 0}{" "}
                    منتج
                    {selectedCategory.productCount > 0
                      ? ". تعديل التصنيف سيؤثر على المنتجات المرتبطة به."
                      : "."}
                  </small>
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
                  onClick={handleEditCategory}
                  disabled={actionLoading || !selectedCategory.name?.trim()}
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

      {/* Modal تأكيد الحذف */}
      {showDeleteModal && selectedCategory && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">تأكيد الحذف</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  هل أنت متأكد من أنك تريد حذف التصنيف{" "}
                  <strong>"{selectedCategory.name}"</strong>؟
                </p>

                {selectedCategory.productCount > 0 ? (
                  <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>تحذير:</strong> هذا التصنيف يحتوي على{" "}
                    {selectedCategory.productCount} منتج.
                    <br />
                    <small>
                      حذف التصنيف سيؤدي إلى إزالة جميع المنتجات المرتبطة به.
                    </small>
                  </div>
                ) : (
                  <p className="text-muted">هذا الإجراء لا يمكن التراجع عنه.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteCategory}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-trash me-2"></i>
                      {selectedCategory.productCount > 0
                        ? "حذف مع المنتجات"
                        : "حذف التصنيف"}
                    </>
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

export default CategoriesManagement;
