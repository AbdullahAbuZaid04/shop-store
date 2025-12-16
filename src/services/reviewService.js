import apiClient from "./apiConfig";

const reviewService = {
  // ========== دالة جلب تقييمات منتج محدد ==========
  async getProductReviews(productId) {
    try {
      console.log(`📊 جلب تقييمات المنتج ${productId}`);

      const response = await apiClient.get(`/Reviews/product/${productId}`);

      if (!response || !response.data) {
        throw new Error("لا توجد استجابة من API");
      }

      const data = response.data;

      // التحقق من شكل البيانات
      let reviewsArray = [];
      if (data.Reviews && Array.isArray(data.Reviews)) {
        reviewsArray = data.Reviews;
      } else if (Array.isArray(data)) {
        reviewsArray = data;
      } else {
        console.warn("⚠️ شكل البيانات غير متوقع:", data);
        reviewsArray = [];
      }

      // تنسيق البيانات
      const formattedReviews = reviewsArray.map((review) =>
        this.formatReview(review)
      );
      console.log(
        `✅ تم جلب ${formattedReviews.length} تقييم للمنتج ${productId}`
      );

      return formattedReviews;
    } catch (error) {
      console.error(`❌ خطأ في getProductReviews(${productId}):`, error);
      // في حالة الخطأ، نرجع مصفوفة فارغة
      return [];
    }
  },

  // ========== دالة جلب إحصائيات تقييمات المنتج ==========
  async getProductReviewStats(productId) {
    try {
      console.log(`📈 جلب إحصائيات التقييمات للمنتج ${productId}`);

      const response = await apiClient.get(`/Reviews/product/${productId}`);

      if (!response || !response.data) {
        throw new Error("لا توجد استجابة من API");
      }

      const data = response.data;

      // تحويل RatingDistribution إلى كائن
      let ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      if (data.RatingDistribution && Array.isArray(data.RatingDistribution)) {
        data.RatingDistribution.forEach((item) => {
          ratingDistribution[item.Rating] = item.Count || 0;
        });
      }

      const stats = {
        totalReviews: data.TotalCount || 0,
        averageRating: data.AverageRating || 0,
        ratingDistribution: ratingDistribution,
        totalPages: data.TotalPages || 1,
        page: data.Page || 1,
      };

      console.log(`✅ إحصائيات التقييمات:`, stats);
      return stats;
    } catch (error) {
      console.error(`❌ خطأ في getProductReviewStats(${productId}):`, error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
  },

  // ========== دالة جلب تقييماتي ==========
  async getMyReviews() {
    try {
      console.log(`👤 جلب تقييماتي`);

      const response = await apiClient.get(`/Reviews/my`);

      if (!response || !response.data) {
        throw new Error("لا توجد استجابة من API");
      }

      const data = response.data;
      let reviewsArray = [];

      if (data.Reviews && Array.isArray(data.Reviews)) {
        reviewsArray = data.Reviews;
      } else if (Array.isArray(data)) {
        reviewsArray = data;
      }

      const formattedReviews = reviewsArray.map((review) =>
        this.formatReview(review)
      );
      console.log(`✅ تم جلب ${formattedReviews.length} من تقييماتي`);

      return formattedReviews;
    } catch (error) {
      console.error(`❌ خطأ في getMyReviews:`, error);
      return [];
    }
  },

  // ========== دالة جلب تقييمي لمنتج محدد ==========
  async getUserProductReview(productId) {
    try {
      console.log(`🔍 التحقق من تقييمي للمنتج ${productId}`);

      const myReviews = await this.getMyReviews();
      const myReview = myReviews.find(
        (review) => review.productId === parseInt(productId)
      );

      if (myReview) {
        console.log(`✅ وجدت تقييمي للمنتج ${productId}`);
      } else {
        console.log(`ℹ️ لم أقم بتقييم المنتج ${productId} بعد`);
      }

      return myReview || null;
    } catch (error) {
      console.error(`❌ خطأ في getUserProductReview(${productId}):`, error);
      return null;
    }
  },

  // ========== دالة إضافة تقييم جديد ==========
  async addReview(reviewData) {
    try {
      console.log("📤 إضافة تقييم جديد:", reviewData);

      // التحقق من البيانات المطلوبة
      if (!reviewData.productId || !reviewData.rating || !reviewData.body) {
        throw new Error("البيانات المطلوبة ناقصة (productId, rating, body)");
      }

      const apiReviewData = {
        ProductId: parseInt(reviewData.productId),
        Rating: parseInt(reviewData.rating),
        Title: reviewData.title?.trim() || "تقييم",
        Body: reviewData.body?.trim() || "",
      };

      console.log("📦 البيانات للإرسال:", apiReviewData);

      const response = await apiClient.post("/Reviews", apiReviewData);
      console.log("✅ استجابة إضافة التقييم:", response.data);

      return this.formatReview(response.data);
    } catch (error) {
      console.error("❌ خطأ في addReview:", error);
      if (error.response) {
        console.error("تفاصيل الخطأ:", error.response.data);
        throw new Error(error.response.data?.message || "فشل في إضافة التقييم");
      }
      throw error;
    }
  },

  // ========== دالة تحديث تقييم ==========
  async updateReview(reviewId, reviewData) {
    try {
      console.log(`🔄 تحديث التقييم ${reviewId}:`, reviewData);

      const apiReviewData = {
        Rating: parseInt(reviewData.rating) || 5,
        Title: reviewData.title?.trim() || "",
        Body: reviewData.body?.trim() || "",
      };

      console.log("📦 البيانات للإرسال:", apiReviewData);

      const response = await apiClient.put(
        `/Reviews/${reviewId}`,
        apiReviewData
      );
      console.log("✅ استجابة تحديث التقييم:", response.data);

      return this.formatReview(response.data);
    } catch (error) {
      console.error(`❌ خطأ في updateReview(${reviewId}):`, error);
      if (error.response) {
        console.error("تفاصيل الخطأ:", error.response.data);
        throw new Error(error.response.data?.message || "فشل في تحديث التقييم");
      }
      throw error;
    }
  },

  // ========== دالة حذف تقييم ==========
  async deleteReview(reviewId) {
    try {
      console.log(`🗑️ حذف التقييم ${reviewId}`);

      const response = await apiClient.delete(`/Reviews/${reviewId}`);
      console.log("✅ استجابة حذف التقييم:", response.data);

      return response.data;
    } catch (error) {
      console.error(`❌ خطأ في deleteReview(${reviewId}):`, error);
      throw error;
    }
  },

  // ========== دالة التصويت على تقييم ==========
  async voteReview(reviewId, isHelpful) {
    try {
      console.log(
        `👍👎 التصويت على التقييم ${reviewId}: ${
          isHelpful ? "مفيد" : "غير مفيد"
        }`
      );

      const endpoint = isHelpful
        ? `/Reviews/${reviewId}/helpful`
        : `/Reviews/${reviewId}/unhelpful`;
      const response = await apiClient.post(endpoint);
      console.log("✅ استجابة التصويت:", response.data);

      return response.data;
    } catch (error) {
      console.error(`❌ خطأ في voteReview(${reviewId}):`, error);
      throw error;
    }
  },

  // ========== دالة تنسيق التقييم للعرض ==========
  formatReview(apiReview) {
    try {
      return {
        id: apiReview.Id,
        productId: apiReview.ProductId,
        productName: apiReview.ProductName || "",
        userId: apiReview.UserId,
        userName: apiReview.UserName || "مستخدم",
        rating: apiReview.Rating || 0,
        title: apiReview.Title || "",
        body: apiReview.Body || "",
        comment: apiReview.Body || "", // للحفاظ على التوافق
        status: apiReview.Status || "Pending",
        isVerifiedPurchase: apiReview.IsVerifiedPurchase || false,
        helpfulVotes: apiReview.HelpfulVotes || 0,
        unhelpfulVotes: apiReview.UnhelpfulVotes || 0,
        reviewDate: apiReview.ReviewDate || apiReview.CreatedDate,
        createdDate: apiReview.CreatedDate,
        updatedDate: apiReview.UpdatedDate,
      };
    } catch (error) {
      console.error("❌ خطأ في formatReview:", error);
      return {
        id: apiReview.Id || 0,
        productId: apiReview.ProductId || 0,
        userName: "مستخدم",
        rating: 0,
        title: "",
        body: "",
        comment: "",
        status: "Pending",
        reviewDate: new Date().toISOString(),
      };
    }
  },

  // ========== دالة التحقق من إمكانية التقييم ==========
  async canReviewProduct(productId) {
    try {
      // 1. التحقق من وجود تقييم سابق
      const myReview = await this.getUserProductReview(productId);
      if (myReview) {
        return {
          canReview: false,
          reason: "لقد قمت بتقييم هذا المنتج مسبقاً",
          existingReview: myReview,
        };
      }

      // 2. التحقق من شراء المنتج (إذا كان API يدعم ذلك)
      // يمكن إضافة هذا الجزء لاحقاً

      return {
        canReview: true,
        reason: "يمكنك إضافة تقييم",
      };
    } catch (error) {
      console.error(`❌ خطأ في canReviewProduct(${productId}):`, error);
      return {
        canReview: false,
        reason: "حدث خطأ في التحقق",
      };
    }
  },

  // ========== دالة الحصول على تقييمات مميزة ==========
  async getFeaturedReviews(limit = 3) {
    try {
      // جلب تقييماتي واختيار الأحدث أو الأعلى تقييماً
      const myReviews = await this.getMyReviews();

      return myReviews
        .sort((a, b) => {
          // أولوية: تم التحقق منها، ثم التقييم العالي، ثم الأحدث
          if (a.isVerifiedPurchase !== b.isVerifiedPurchase) {
            return a.isVerifiedPurchase ? -1 : 1;
          }
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          return new Date(b.reviewDate) - new Date(a.reviewDate);
        })
        .slice(0, limit);
    } catch (error) {
      console.error("❌ خطأ في getFeaturedReviews:", error);
      return [];
    }
  },

  // ========== دالة مساعدة لاختبار الاتصال ==========
  async testConnection() {
    try {
      // محاولة جلب تقييماتي
      await this.getMyReviews();
      return {
        success: true,
        message: "الاتصال بخدمة التقييمات ناجح",
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

export default reviewService;
