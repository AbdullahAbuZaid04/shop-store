import apiClient from "./apiConfig";

const productService = {
  // ========== دالة جلب جميع المنتجات ==========
  async getAllProducts() {
    try {
      const response = await apiClient.get("/Products");

      if (!response || !response.data) {
        throw new Error("لا توجد استجابة من API");
      }

      const data = response.data;

      let productsArray = [];

      // بناءً على استجابة الـ API، البيانات تأتي في Products
      if (data.Products && Array.isArray(data.Products)) {
        productsArray = data.Products;
      } else if (Array.isArray(data)) {
        productsArray = data;
      } else {
        throw new Error("شكل البيانات غير متوقع من API");
      }

      if (productsArray.length === 0) {
        return [];
      }

      const formattedProducts = await Promise.all(
        productsArray.map((product) => this.formatProduct(product))
      );

      return formattedProducts;
    } catch (error) {
      console.error("❌ خطأ في getAllProducts:", error);
      throw error;
    }
  },

  // ========== دالة جلب منتج محدد ==========
  async getProductById(id) {
    try {
      const response = await apiClient.get(`/Products/${id}`);
      return await this.formatProduct(response.data);
    } catch (error) {
      console.error(`❌ خطأ في getProductById(${id}):`, error);
      throw error;
    }
  },

  // ========== دالة إنشاء منتج جديد ==========
  async createProduct(productData) {
    try {
      console.log("📤 إنشاء منتج جديد:", productData);

      // استخدام FormData للصورة
      const formData = new FormData();

      // إضافة البيانات النصية
      formData.append("Name", productData.name?.trim() || "");
      formData.append("Description", productData.description?.trim() || "");
      formData.append("Price", parseFloat(productData.price) || 0);
      formData.append(
        "StockQuantity",
        parseInt(productData.stockQuantity) || 0
      );
      formData.append("CategoryId", parseInt(productData.categoryId) || 0);
      formData.append(
        "IsActive",
        productData.isActive !== undefined ? productData.isActive : true
      );
      formData.append(
        "IsFeatured",
        productData.isFeatured !== undefined ? productData.isFeatured : false
      );

      // إذا كان هناك ملف صورة، أضفه
      if (productData.imageFile && productData.imageFile instanceof File) {
        formData.append("ImageFile", productData.imageFile);
      }
      // إذا كان هناك رابط صورة (من حقل رابط الصورة)
      else if (productData.imageUrl && productData.imageUrl.trim() !== "") {
        formData.append("ImageUrl", productData.imageUrl.trim());
      }

      console.log("📦 البيانات للإرسال:", Object.fromEntries(formData));

      const response = await apiClient.post("/Products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ استجابة إنشاء المنتج:", response.data);
      return await this.formatProduct(response.data);
    } catch (error) {
      console.error("❌ خطأ في createProduct:", error);
      if (error.response) {
        console.error("تفاصيل الخطأ:", error.response.data);
        throw new Error(error.response.data?.message || "فشل في إنشاء المنتج");
      }
      throw error;
    }
  },

  // ========== دالة تحديث منتج ==========
  async updateProduct(id, productData) {
    try {
      console.log(`🔄 تحديث المنتج ${id}:`, productData);

      // استخدام FormData للتحديث أيضًا (لأن PUT يتوقع multipart/form-data)
      const formData = new FormData();

      // إضافة البيانات النصية
      formData.append("Name", productData.name?.trim() || "");
      formData.append("Description", productData.description?.trim() || "");
      formData.append("Price", parseFloat(productData.price) || 0);
      formData.append(
        "StockQuantity",
        parseInt(productData.stockQuantity) || 0
      );
      formData.append("CategoryId", parseInt(productData.categoryId) || 0);
      formData.append(
        "IsActive",
        productData.isActive !== undefined ? productData.isActive : true
      );
      formData.append(
        "IsFeatured",
        productData.isFeatured !== undefined ? productData.isFeatured : false
      );

      // إذا كان هناك ملف صورة جديد، أضفه
      if (productData.imageFile && productData.imageFile instanceof File) {
        formData.append("ImageFile", productData.imageFile);
      }
      // إذا كان هناك رابط صورة
      else if (productData.imageUrl && productData.imageUrl.trim() !== "") {
        formData.append("ImageUrl", productData.imageUrl.trim());
      }
      // إذا كان المستخدم أزال الصورة، أرسل قيمة فارغة
      else if (productData.removeImage) {
        formData.append("ImageUrl", ""); // إرسال سلسلة فارغة لحذف الصورة
      }

      console.log("📦 البيانات للإرسال:", Object.fromEntries(formData));

      const response = await apiClient.put(`/Products/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ استجابة تحديث المنتج:", response.data);
      return await this.formatProduct(response.data);
    } catch (error) {
      console.error(`❌ خطأ في updateProduct(${id}):`, error);
      if (error.response) {
        console.error("تفاصيل الخطأ:", error.response.data);
        throw new Error(error.response.data?.message || "فشل في تحديث المنتج");
      }
      throw error;
    }
  },

  // ========== دالة حذف منتج ==========
  async deleteProduct(id) {
    try {
      const response = await apiClient.delete(`/Products/${id}`);
      console.log(`✅ تم حذف المنتج ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ خطأ في deleteProduct(${id}):`, error);
      throw error;
    }
  },

  // ========== دالة رفع صورة للمنتج ==========
  async uploadProductImage(id, imageFile) {
    try {
      console.log(`📤 رفع صورة للمنتج ${id}:`, imageFile);

      if (!imageFile) {
        throw new Error("يجب تقديم ملف صورة");
      }

      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await apiClient.post(
        `/Products/${id}/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ استجابة رفع الصورة:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ خطأ في uploadProductImage(${id}):`, error);
      throw error;
    }
  },

  // ========== دالة حذف صورة المنتج ==========
  async deleteProductImage(id) {
    try {
      console.log(`🗑️ حذف صورة المنتج ${id}`);

      const response = await apiClient.delete(`/Products/${id}/image`);
      console.log("✅ استجابة حذف الصورة:", response.data);

      return response.data;
    } catch (error) {
      console.error(`❌ خطأ في deleteProductImage(${id}):`, error);
      throw error;
    }
  },

  // ========== دالة تنسيق المنتج للعرض ==========
  async formatProduct(apiProduct) {
    try {
      // استخدام ImageUrl أو ProductImagePath للصورة
      let imageUrl = "/image/store.png";

      if (apiProduct.ImageUrl) {
        imageUrl = apiProduct.ImageUrl;
      } else if (apiProduct.ProductImagePath) {
        imageUrl = apiProduct.ProductImagePath;
      }

      return {
        id: apiProduct.Id,
        name: apiProduct.Name || "",
        description: apiProduct.Description || "لا يوجد وصف",
        price: apiProduct.Price || 0,
        stockQuantity: apiProduct.StockQuantity || 0,
        image: imageUrl,
        categoryId: apiProduct.CategoryId || 0,
        categoryName: apiProduct.CategoryName || "عام",
        isActive:
          apiProduct.IsActive !== undefined ? apiProduct.IsActive : true,
        isFeatured: apiProduct.IsFeatured || false,
        averageRating: apiProduct.AverageRating,
        totalReviews: apiProduct.TotalReviews || 0,
        createdDate: apiProduct.CreatedDate,
        updatedDate: apiProduct.UpdatedDate,
        hasImage: !!(apiProduct.ImageUrl || apiProduct.ProductImagePath),
      };
    } catch (error) {
      console.error("❌ خطأ في formatProduct:", error);
      // إرجاع بيانات افتراضية في حالة الخطأ
      return {
        id: apiProduct.Id || 0,
        name: apiProduct.Name || apiProduct.name || "منتج غير معروف",
        description: "لا يوجد وصف",
        price: 0,
        stockQuantity: 0,
        image: "/image/store.png",
        categoryId: 0,
        categoryName: "عام",
        isActive: true,
        isFeatured: false,
        hasImage: false,
      };
    }
  },

  // ========== دالة تنسيق المنتج للإرسال للAPI ==========
  formatToApiProduct(productData) {
    console.log("🔧 تنسيق بيانات المنتج للAPI:", productData);

    const apiData = {
      Name: productData.name?.trim() || "",
      Description: productData.description?.trim() || "",
      Price: parseFloat(productData.price) || 0,
      StockQuantity: parseInt(productData.stockQuantity) || 0,
      CategoryId: parseInt(productData.categoryId) || 0,
      IsActive:
        productData.isActive !== undefined ? productData.isActive : true,
      IsFeatured:
        productData.isFeatured !== undefined ? productData.isFeatured : false,
    };

    // التعامل مع الصورة
    if (productData.image && productData.image !== "/image/store.png") {
      if (
        productData.image.startsWith("http") ||
        productData.image.startsWith("/")
      ) {
        apiData.ImageUrl = productData.image;
      }
    }

    console.log("✅ البيانات النهائية للإرسال:", apiData);
    return apiData;
  },

  // ========== دالة البحث عن منتجات ==========
  async searchProducts(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === "") {
        return this.getAllProducts();
      }

      const response = await apiClient.get(
        `/Products/search?term=${encodeURIComponent(searchTerm.trim())}`
      );

      const searchData = response.data?.Products || response.data || [];

      if (Array.isArray(searchData)) {
        const formattedProducts = await Promise.all(
          searchData.map((product) => this.formatProduct(product))
        );
        return formattedProducts;
      }
      return [];
    } catch (err) {
      console.error("❌ خطأ في البحث:", err);
      return [];
    }
  },

  // ========== دالة مساعدة للحصول على اسم التصنيف ==========
  async getCategoryName(categoryId) {
    try {
      if (!categoryId || categoryId === 0) return "عام";

      const response = await apiClient.get("/Categories");
      const categoriesData = response.data;

      if (Array.isArray(categoriesData)) {
        const category = categoriesData.find((cat) => cat.Id === categoryId);
        return category ? category.Name : "عام";
      }
      return "عام";
    } catch (err) {
      console.error("❌ خطأ في جلب اسم التصنيف:", err);
      return "عام";
    }
  },

  // ========== دالة مساعدة لاختبار الاتصال ==========
  async testConnection() {
    try {
      const response = await apiClient.get("/Products");
      return {
        success: true,
        message: "الاتصال بالـ API ناجح",
        count: response.data?.Products?.length || 0,
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

export default productService;
