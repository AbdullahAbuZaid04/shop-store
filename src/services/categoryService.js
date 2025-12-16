import apiClient from "./apiConfig";

const categoryService = {
  // ========== دالة جلب جميع التصنيفات ==========
  async getCategories() {
    try {
      const response = await apiClient.get("/Category");

      if (!response || !response.data) {
        throw new Error("لا توجد استجابة من API");
      }

      const categoriesData = response.data;

      if (!Array.isArray(categoriesData)) {
        throw new Error("شكل البيانات غير متوقع من API");
      }

      // تنسيق البيانات للاستخدام في التطبيق
      const formattedCategories = categoriesData.map((category) =>
        this.formatCategory(category)
      );

      return formattedCategories;
    } catch (error) {
      console.error("❌ خطأ في getCategories:", error);
      throw error;
    }
  },

  // ========== دالة جلب تصنيف محدد ==========
  async getCategoryById(id) {
    try {
      const response = await apiClient.get(`/Category/${id}`);
      return this.formatCategory(response.data);
    } catch (error) {
      console.error(`❌ خطأ في getCategoryById(${id}):`, error);
      throw error;
    }
  },

  // ========== دالة إنشاء تصنيف جديد ==========
  async createCategory(categoryData) {
    try {
      console.log("📤 إنشاء تصنيف جديد:", categoryData);

      const apiCategoryData = this.formatToApiCategory(categoryData);
      console.log("📦 البيانات للإرسال:", apiCategoryData);

      const response = await apiClient.post("/Category", apiCategoryData);
      console.log("✅ استجابة إنشاء التصنيف:", response.data);

      return this.formatCategory(response.data);
    } catch (error) {
      console.error("❌ خطأ في createCategory:", error);
      if (error.response) {
        console.error("تفاصيل الخطأ:", error.response.data);
        throw new Error(error.response.data?.message || "فشل في إنشاء التصنيف");
      }
      throw error;
    }
  },

  // ========== دالة تحديث تصنيف ==========
  async updateCategory(id, categoryData) {
    try {
      console.log(`🔄 تحديث التصنيف ${id}:`, categoryData);

      const apiCategoryData = this.formatToApiCategory(categoryData);
      console.log("📦 البيانات للإرسال:", apiCategoryData);

      const response = await apiClient.put(`/Category/${id}`, apiCategoryData);
      console.log("✅ استجابة تحديث التصنيف:", response.data);

      return this.formatCategory(response.data);
    } catch (error) {
      console.error(`❌ خطأ في updateCategory(${id}):`, error);
      if (error.response) {
        console.error("تفاصيل الخطأ:", error.response.data);
        throw new Error(error.response.data?.message || "فشل في تحديث التصنيف");
      }
      throw error;
    }
  },

  // ========== دالة حذف تصنيف ==========
  async deleteCategory(id) {
    try {
      console.log(`🗑️ حذف التصنيف ${id}`);

      const response = await apiClient.delete(`/Category/${id}`);
      console.log("✅ استجابة حذف التصنيف:", response.data);

      return response.data;
    } catch (error) {
      console.error(`❌ خطأ في deleteCategory(${id}):`, error);

      // تحقق إذا كان الخطأ بسبب وجود منتجات مرتبطة
      if (error.response && error.response.status === 400) {
        throw new Error("لا يمكن حذف التصنيف لأنه يحتوي على منتجات مرتبطة");
      }

      throw error;
    }
  },

  // ========== دالة البحث عن تصنيفات ==========
  async searchCategories(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === "") {
        return this.getCategories();
      }

      // إذا كان الـ API يدعم البحث، استخدمه
      // وإلا قم بالبحث محلياً
      const categories = await this.getCategories();
      const searchLower = searchTerm.toLowerCase().trim();

      return categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchLower) ||
          (category.description &&
            category.description.toLowerCase().includes(searchLower))
      );
    } catch (err) {
      console.error("❌ خطأ في البحث:", err);
      return [];
    }
  },

  // ========== دالة تنسيق التصنيف للعرض ==========
  formatCategory(apiCategory) {
    try {
      return {
        id: apiCategory.Id,
        name: apiCategory.Name || "",
        description: apiCategory.Description || "",
        productCount: apiCategory.ProductCount || 0,
        createdDate: apiCategory.CreatedDate,
        updatedDate: apiCategory.UpdatedDate,
      };
    } catch (error) {
      console.error("❌ خطأ في formatCategory:", error);
      return {
        id: apiCategory.Id || 0,
        name: apiCategory.Name || apiCategory.name || "تصنيف غير معروف",
        description: "",
        productCount: 0,
        createdDate: new Date().toISOString(),
        updatedDate: null,
      };
    }
  },

  // ========== دالة تنسيق التصنيف للإرسال للAPI ==========
  formatToApiCategory(categoryData) {
    console.log("🔧 تنسيق بيانات التصنيف للAPI:", categoryData);

    // التحقق من البيانات الأساسية
    if (!categoryData.name || !categoryData.name.trim()) {
      throw new Error("اسم التصنيف مطلوب");
    }

    const apiData = {
      Name: categoryData.name.trim(),
      Description: categoryData.description?.trim() || "",
    };

    console.log("✅ البيانات النهائية للإرسال:", apiData);
    return apiData;
  },

  // ========== دالة التحقق من إمكانية حذف التصنيف ==========
  async canDeleteCategory(id) {
    try {
      const category = await this.getCategoryById(id);
      return {
        canDelete: category.productCount === 0,
        productCount: category.productCount,
        message:
          category.productCount > 0
            ? `لا يمكن حذف التصنيف لأنه يحتوي على ${category.productCount} منتج`
            : "يمكن حذف التصنيف",
      };
    } catch (error) {
      console.error("❌ خطأ في التحقق من إمكانية الحذف:", error);
      return {
        canDelete: false,
        productCount: 0,
        message: "فشل في التحقق من إمكانية الحذف",
      };
    }
  },

  // ========== دالة الحصول على إحصائيات التصنيفات ==========
  async getStatistics() {
    try {
      const categories = await this.getCategories();

      return {
        totalCategories: categories.length,
        totalProducts: categories.reduce(
          (sum, cat) => sum + cat.productCount,
          0
        ),
        categoriesWithProducts: categories.filter((cat) => cat.productCount > 0)
          .length,
        emptyCategories: categories.filter((cat) => cat.productCount === 0)
          .length,
        lastUpdated: categories
          .filter((cat) => cat.updatedDate)
          .sort((a, b) => new Date(b.updatedDate) - new Date(a.updatedDate))[0]
          ?.updatedDate,
      };
    } catch (error) {
      console.error("❌ خطأ في جلب الإحصائيات:", error);
      return {
        totalCategories: 0,
        totalProducts: 0,
        categoriesWithProducts: 0,
        emptyCategories: 0,
        lastUpdated: null,
      };
    }
  },

  // ========== دالة مساعدة لاختبار الاتصال ==========
  async testConnection() {
    try {
      const response = await apiClient.get("/Category");
      return {
        success: true,
        message: "الاتصال بالـ API ناجح",
        count: response.data?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  },
};

export default categoryService;
