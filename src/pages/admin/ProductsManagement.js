import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../components/common/Toast";
import productService from "../../services/productService";
import categoriesService from "../../services/categoryService";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // States for add product
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
    isActive: true,
    isFeatured: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // States for edit product
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        categoriesService.getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);

      console.log(
        `✅ تم تحميل ${productsData.length} منتج و ${categoriesData.length} تصنيف`
      );
    } catch (err) {
      console.error("❌ خطأ في جلب البيانات:", err);
      error(err.message || "فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  // دالة رفع الصورة للإضافة
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      error("نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, GIF, WEBP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      error("حجم الملف كبير جداً. الحد الأقصى 5MB");
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUseImageUrl(false);
    setImageUrl("");
  };

  // دالة رفع الصورة للتعديل
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      error("نوع الملف غير مدعوم. يرجى رفع صورة (JPG, PNG, GIF, WEBP)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      error("حجم الملف كبير جداً. الحد الأقصى 5MB");
      return;
    }

    setEditImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // دالة إزالة الصورة المرفوعة للإضافة
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");

    const fileInput = document.getElementById("productImageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // دالة إزالة الصورة المرفوعة للتعديل
  const handleRemoveEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);

    const fileInput = document.getElementById("editProductImageUpload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // دالة إضافة منتج جديد
  const handleAddProduct = async () => {
    // التحقق من البيانات الأساسية
    if (!newProduct.name.trim()) {
      error("اسم المنتج مطلوب");
      return;
    }

    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      error("يرجى إدخال سعر صحيح (يجب أن يكون أكبر من 0)");
      return;
    }

    if (!newProduct.categoryId) {
      error("يرجى اختيار تصنيف");
      return;
    }

    try {
      setActionLoading(true);

      // إعداد بيانات المنتج للإرسال
      const productData = {
        name: newProduct.name.trim(),
        description: newProduct.description?.trim() || "",
        price: parseFloat(newProduct.price),
        stockQuantity: parseInt(newProduct.stockQuantity) || 0,
        categoryId: parseInt(newProduct.categoryId),
        isActive: newProduct.isActive,
        isFeatured: newProduct.isFeatured,
      };

      // إذا كان هناك ملف صورة
      if (imageFile) {
        productData.imageFile = imageFile;
      }
      // إذا كان هناك رابط صورة
      else if (useImageUrl && imageUrl.trim() !== "") {
        productData.imageUrl = imageUrl.trim();
      }

      console.log("📤 إنشاء المنتج:", productData);

      // إنشاء المنتج
      await productService.createProduct(productData);

      // إعادة تحميل البيانات
      await fetchData();

      // إعادة تعيين الحقول
      resetAddModal();

      success("تم إضافة المنتج بنجاح");
    } catch (err) {
      console.error("❌ خطأ في إضافة المنتج:", err);
      error(err.message || "فشل في إضافة المنتج");
    } finally {
      setActionLoading(false);
    }
  };

  // دالة تعديل منتج
  const handleEditProduct = async () => {
    if (!selectedProduct) return;

    // التحقق من البيانات الأساسية
    if (!selectedProduct.name.trim()) {
      error("اسم المنتج مطلوب");
      return;
    }

    if (!selectedProduct.price || parseFloat(selectedProduct.price) <= 0) {
      error("يرجى إدخال سعر صحيح");
      return;
    }

    if (!selectedProduct.categoryId) {
      error("يرجى اختيار تصنيف");
      return;
    }

    try {
      setActionLoading(true);

      // إعداد بيانات المنتج
      const productData = {
        name: selectedProduct.name.trim(),
        description: selectedProduct.description || "",
        price: parseFloat(selectedProduct.price),
        stockQuantity: parseInt(selectedProduct.stockQuantity) || 0,
        categoryId: parseInt(selectedProduct.categoryId),
        isActive: selectedProduct.isActive !== false,
        isFeatured: selectedProduct.isFeatured || false,
        removeImage: selectedProduct.removeImage || false,
      };

      // إذا كان هناك ملف صورة جديد
      if (editImageFile) {
        productData.imageFile = editImageFile;
      }
      // إذا كان هناك رابط صورة جديد (من حقل رابط الصورة في التعديل)
      else if (
        selectedProduct.newImageUrl &&
        selectedProduct.newImageUrl.trim() !== ""
      ) {
        productData.imageUrl = selectedProduct.newImageUrl.trim();
      }

      console.log(`🔄 تحديث المنتج ${selectedProduct.id}:`, productData);

      // تحديث المنتج
      await productService.updateProduct(selectedProduct.id, productData);

      // إعادة تحميل البيانات
      await fetchData();

      // إغلاق المودال
      setShowEditModal(false);
      setSelectedProduct(null);
      setEditImageFile(null);
      setEditImagePreview(null);

      success("تم تعديل المنتج بنجاح");
    } catch (err) {
      console.error("❌ خطأ في تعديل المنتج:", err);
      error(err.message || "فشل في تعديل المنتج");
    } finally {
      setActionLoading(false);
    }
  };

  // دالة حذف منتج
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setActionLoading(true);
      await productService.deleteProduct(selectedProduct.id);
      await fetchData();

      setShowDeleteModal(false);
      setSelectedProduct(null);
      success("تم حذف المنتج بنجاح");
    } catch (err) {
      error(err.message || "فشل في حذف المنتج");
    } finally {
      setActionLoading(false);
    }
  };

  const handleShopAsCustomer = () => {
    logout();
    success("تم تسجيل الخروج بنجاح");
    navigate("/");
  };

  const openEditModal = (product) => {
    setSelectedProduct({
      ...product,
      newImageUrl: "", // حقل جديد لرابط الصورة في التعديل
      removeImage: false,
    });
    setEditImageFile(null);
    setEditImagePreview(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  // دالة إعادة تعيين نموذج الإضافة
  const resetAddModal = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      categoryId: "",
      isActive: true,
      isFeatured: false,
    });
    setImageFile(null);
    setImagePreview(null);
    setUseImageUrl(false);
    setImageUrl("");
    setShowAddModal(false);
  };

  // الحصول على اسم التصنيف
  const getCategoryName = (categoryId) => {
    if (!categoryId) return "غير معروف";
    const category = categories.find(
      (cat) => cat.id?.toString() === categoryId.toString()
    );
    return category ? category.name : "غير معروف";
  };

  // تصفية المنتجات
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesCategory =
        categoryFilter === "all" ||
        product.categoryId?.toString() === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "متوفر"
          ? product.stockQuantity > 0
          : product.stockQuantity === 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "50vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  // بيانات القائمة الجانبية
  const menuItems = [
    { path: "/admin", icon: "fas fa-tachometer-alt", label: "الإحصائيات" },
    {
      path: "/admin/products",
      icon: "fas fa-box",
      label: "إدارة المنتجات",
      active: true,
    },
    { path: "/admin/users", icon: "fas fa-users", label: "إدارة المستخدمين" },
    {
      path: "/admin/categories",
      icon: "fas fa-tags",
      label: "إدارة التصنيفات",
    },
  ];

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
              <h4 className="mb-1">إدارة المنتجات</h4>
              <p className="text-muted mb-0">
                عرض {filteredProducts.length} من {products.length} منتج
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <i className="fas fa-plus me-2"></i>
              إضافة منتج جديد
            </button>
          </div>

          {/* أدوات التصفية والبحث */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">بحث</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ابحث باسم المنتج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">التصنيف</label>
                  <select
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="all">جميع التصنيفات</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">الحالة</label>
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="متوفر">متوفر</option>
                    <option value="غير متوفر">غير متوفر</option>
                  </select>
                </div>
                <div className="col-md-2 d-flex align-items-end">
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

          {/* جدول المنتجات */}
          <div className="card shadow">
            <div className="card-body">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">لا توجد منتجات</h5>
                  <p className="text-muted">
                    لم يتم العثور على منتجات تطابق معايير البحث
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    إضافة منتج جديد
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-dark">
                      <tr>
                        <th width="60">الصورة</th>
                        <th>اسم المنتج</th>
                        <th>السعر</th>
                        <th>التصنيف</th>
                        <th>الكمية</th>
                        <th>الحالة</th>
                        <th width="150">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={product.image || "/image/store.png"}
                              alt={product.name}
                              className="rounded"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.src = "/image/store.png";
                              }}
                            />
                          </td>
                          <td>
                            <div>
                              <strong>{product.name}</strong>
                              <br />
                              <small className="text-muted">
                                {product.description}
                              </small>
                            </div>
                          </td>
                          <td>
                            <strong>{product.price} $</strong>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {product.categoryName ||
                                getCategoryName(product.categoryId)}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {product.stockQuantity}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${
                                product.stockQuantity > 0 ? "success" : "danger"
                              }`}
                            >
                              {product.stockQuantity > 0
                                ? "متوفر"
                                : "غير متوفر"}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-warning"
                                onClick={() => openEditModal(product)}
                                title="تعديل"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => openDeleteModal(product)}
                                title="حذف"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
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

      {/* Modal إضافة منتج */}
      {showAddModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">إضافة منتج جديد</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={resetAddModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">اسم المنتج *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        placeholder="أدخل اسم المنتج"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">التصنيف *</label>
                      <select
                        className="form-select"
                        value={newProduct.categoryId}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            categoryId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">اختر التصنيف</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">السعر *</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          value={newProduct.price}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              price: e.target.value,
                            })
                          }
                          placeholder="0.00"
                          min="0.01"
                          step="0.01"
                          required
                        />
                        <span className="input-group-text">$</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">الكمية في المخزون *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newProduct.stockQuantity}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stockQuantity: e.target.value,
                          })
                        }
                        placeholder="0"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">صورة المنتج</label>

                      {/* خيار رفع الصورة من الجهاز */}
                      <div className="mb-2">
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleImageUpload}
                          id="productImageUpload"
                        />
                        <small className="text-muted d-block">
                          يمكنك رفع صورة من جهازك (JPG, PNG, GIF, WEBP) - الحجم
                          الأقصى: 5MB
                        </small>
                      </div>

                      {/* معاينة الصورة المرفوعة */}
                      {imagePreview && (
                        <div className="mt-2 text-center">
                          <img
                            src={imagePreview}
                            alt="معاينة الصورة"
                            className="img-thumbnail"
                            style={{ maxWidth: "150px", maxHeight: "150px" }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger mt-2"
                            onClick={handleRemoveImage}
                          >
                            <i className="fas fa-trash me-1"></i>
                            إزالة الصورة
                          </button>
                        </div>
                      )}

                      {/* حقل رابط الصورة */}
                      {useImageUrl && (
                        <div className="mt-2">
                          <label className="form-label">رابط الصورة</label>
                          <input
                            type="url"
                            className="form-control"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/product-image.png"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">وصف المنتج</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            description: e.target.value,
                          })
                        }
                        placeholder="أدخل وصف للمنتج..."
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetAddModal}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddProduct}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      جاري الإضافة...
                    </>
                  ) : (
                    "إضافة المنتج"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal تعديل منتج */}
      {showEditModal && selectedProduct && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">تعديل المنتج</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">اسم المنتج *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedProduct.name || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">التصنيف *</label>
                      <select
                        className="form-select"
                        value={selectedProduct.categoryId || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            categoryId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">اختر التصنيف</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">السعر *</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          value={selectedProduct.price || ""}
                          onChange={(e) =>
                            setSelectedProduct({
                              ...selectedProduct,
                              price: e.target.value,
                            })
                          }
                          min="0.01"
                          step="0.01"
                          required
                        />
                        <span className="input-group-text">$</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">الكمية في المخزون *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={selectedProduct.stockQuantity || 0}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            stockQuantity: e.target.value,
                          })
                        }
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">صورة المنتج</label>

                      {/* عرض الصورة الحالية */}
                      {selectedProduct.image &&
                        selectedProduct.image !== "/image/store.png" && (
                          <div className="mb-3">
                            <p className="text-muted">الصورة الحالية:</p>
                            <img
                              src={selectedProduct.image}
                              alt="صورة المنتج"
                              className="img-thumbnail mb-2"
                              style={{ maxWidth: "150px", maxHeight: "150px" }}
                              onError={(e) => {
                                e.target.src = "/image/store.png";
                              }}
                            />
                          </div>
                        )}

                      {/* رفع صورة جديدة */}
                      <div className="mb-2">
                        <label className="form-label">رفع صورة جديدة:</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleEditImageUpload}
                          id="editProductImageUpload"
                        />
                      </div>

                      {/* معاينة الصورة الجديدة */}
                      {editImagePreview && (
                        <div className="mt-2 text-center">
                          <img
                            src={editImagePreview}
                            alt="معاينة الصورة الجديدة"
                            className="img-thumbnail"
                            style={{ maxWidth: "150px", maxHeight: "150px" }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger mt-2"
                            onClick={handleRemoveEditImage}
                          >
                            <i className="fas fa-trash me-1"></i>
                            إزالة الصورة
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">وصف المنتج</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={selectedProduct.description || ""}
                        onChange={(e) =>
                          setSelectedProduct({
                            ...selectedProduct,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEditProduct}
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

      {/* Modal تأكيد الحذف */}
      {showDeleteModal && selectedProduct && (
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
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  هل أنت متأكد من أنك تريد حذف المنتج{" "}
                  <strong>"{selectedProduct.name}"</strong>؟
                </p>
                <p className="text-muted">هذا الإجراء لا يمكن التراجع عنه.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteProduct}
                  disabled={actionLoading}
                >
                  <i className="fas fa-trash me-2"></i>
                  {actionLoading ? "جاري الحذف..." : "حذف المنتج"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
