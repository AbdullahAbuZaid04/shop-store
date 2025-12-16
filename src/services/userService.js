import apiClient from "./apiConfig";

const userService = {
  // ========== دوال الملف الشخصي ==========

  // جلب ملف المستخدم الحالي - GET /User/profile
  async getProfile() {
    try {
      const response = await apiClient.get("/User/profile");
      const data = response.data;

      return this.formatUser(data);
    } catch (error) {
      throw error;
    }
  },

  // تحديث الملف الشخصي - PUT /User/profile
  async updateProfile(userData) {
    try {
      const apiUserData = {
        FirstName: userData.firstName || "",
        LastName: userData.lastName || "",
        PhoneNumber: userData.phoneNumber || "",
      };

      const response = await apiClient.put("/User/profile", apiUserData);
      const data = response.data;

      return this.formatUser(data);
    } catch (error) {
      throw error;
    }
  },

  // تغيير كلمة المرور - POST /User/change-password
  async changePassword(passwordData) {
    try {
      const apiPasswordData = {
        CurrentPassword: passwordData.currentPassword || "",
        NewPassword: passwordData.newPassword || "",
      };

      const response = await apiClient.post(
        "/User/change-password",
        apiPasswordData
      );
      const data = response.data;

      return data;
    } catch (error) {
      throw error;
    }
  },

  // ========== دوال الإدارة (للمسؤول) ==========

  // جلب جميع المستخدمين - GET /User/all
  async getAllUsers(page = 1, pageSize = 20) {
    try {
      const response = await apiClient.get(
        `/User/all?page=${page}&pageSize=${pageSize}`
      );
      const data = response.data;


      // البيانات تُرجع: { Users[], TotalCount, Page, PageSize, TotalPages }
      if (data.Users && Array.isArray(data.Users)) {
        return {
          users: data.Users.map((user) => this.formatUser(user)),
          totalCount: data.TotalCount || 0,
          page: data.Page || 1,
          pageSize: data.PageSize || 20,
          totalPages: data.TotalPages || 1,
        };
      }

      return {
        users: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      };
    } catch (error) {
      throw error;
    }
  },

  // ترقية مستخدم إلى مسؤول - POST /User/{userId}/upgrade-admin
  async upgradeToAdmin(userId) {
    try {
      const response = await apiClient.post(`/User/${userId}/upgrade-admin`);
      const data = response.data;

      return data;
    } catch (error) {
      throw error;
    }
  },

  // جلب مستخدم بواسطة ID - GET /User/{id} (افتراضي)
  async getUserById(id) {
    try {
      const response = await apiClient.get(`/User/${id}`);
      const data = response.data;

      return this.formatUser(data);
    } catch (error) {
      throw error;
    }
  },

  async updateUser(userData) {
    try {
      const apiUserData = {
        FirstName: userData.firstName || "",
        LastName: userData.lastName || "",
        PhoneNumber: userData.phoneNumber || "",
      };
      const response = await apiClient.put("/User/profile", apiUserData);
      const data = response.data;

      return this.formatUser(data);
    } catch (error) {
      throw error;
    }
  },

  async updateUserById(id, userData) {
    try {
      const apiUserData = {
        FirstName: userData.firstName || "",
        LastName: userData.lastName || "",
        PhoneNumber: userData.phoneNumber || "",
      };

      const response = await apiClient.put(`/User/${id}`, apiUserData);
      const data = response.data;

      return this.formatUser(data);
    } catch (error) {
      throw error;
    }
  },

  // حذف مستخدم - DELETE /User/{id} (افتراضي)
  async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/User/${id}`);
      const data = response.data;

      return data;
    } catch (error) {
      throw error;
    }
  },

  // ========== دوال المساعدة والتنسيق ==========

  // تنسيق بيانات المستخدم
  formatUser(user) {
    if (!user || typeof user !== "object") {
      return this.getDefaultUser();
    }

    // تحديد الدور من Roles array
    let role = "user";
    let isAdmin = false;

    if (user.Roles && Array.isArray(user.Roles)) {
      if (user.Roles.includes("Admin")) {
        role = "admin";
        isAdmin = true;
      } else if (user.Roles.includes("Moderator")) {
        role = "moderator";
      } else if (user.Roles.includes("Seller")) {
        role = "seller";
      }
    }

    return {
      // المعلومات الأساسية
      id: user.Id || user.id || user._id,
      email: user.Email || user.email || "",
      firstName: user.FirstName || user.firstName || "",
      lastName: user.LastName || user.lastName || "",
      fullName: `${user.FirstName || ""} ${user.LastName || ""}`.trim(),
      phoneNumber: user.PhoneNumber || user.phoneNumber || user.phone || "",

      // الصلاحيات والدور
      role: role,
      isAdmin: isAdmin,
      roles: user.Roles || [],
      isActive: user.EmailConfirmed !== false, // استخدام EmailConfirmed كحالة نشاط
      emailConfirmed: user.EmailConfirmed || false,

      // المعلومات الإضافية
      createdAt: user.CreatedDate || user.createdAt || user.createdDate,
      updatedAt: user.UpdatedDate || user.updatedAt || user.updatedDate,

      // إحصائيات (قد تكون من endpoints أخرى)
      ordersCount: user.OrdersCount || user.ordersCount || 0,
      totalSpent: user.TotalSpent || user.totalSpent || 0,
      lastLogin: user.LastLogin || user.lastLogin,

      // معلومات العناوين
      addresses: user.Addresses || user.addresses || [],
    };
  },

  // بيانات المستخدم الافتراضية
  getDefaultUser() {
    return {
      id: "",
      email: "",
      firstName: "",
      lastName: "",
      fullName: "مستخدم",
      phoneNumber: "",
      role: "user",
      isAdmin: false,
      roles: [],
      isActive: true,
      emailConfirmed: false,
      ordersCount: 0,
      totalSpent: 0,
    };
  },

  // تنسيق التاريخ
  formatDate(dateString) {
    if (!dateString) return "غير محدد";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  },

  // خيارات الأدوار
  getRoleOptions() {
    return [
      {
        value: "user",
        label: "👤 مستخدم",
        color: "secondary",
        icon: "fa-user",
      },
      { value: "admin", label: "👑 مسؤول", color: "danger", icon: "fa-crown" },
    ];
  },

  // الحصول على معلومات الدور
  getRoleInfo(role) {
    const roleOptions = this.getRoleOptions();
    return (
      roleOptions.find((r) => r.value === role) || {
        value: role,
        label: role,
        color: "secondary",
        icon: "fa-user",
      }
    );
  },

  // خيارات حالة المستخدم
  getStatusOptions() {
    return [
      {
        value: "active",
        label: "✅ نشط",
        color: "success",
        icon: "fa-check-circle",
      },
      {
        value: "inactive",
        label: "❌ غير نشط",
        color: "danger",
        icon: "fa-times-circle",
      },
      {
        value: "pending",
        label: "⏳ قيد المراجعة",
        color: "warning",
        icon: "fa-clock",
      },
      { value: "banned", label: "🚫 محظور", color: "dark", icon: "fa-ban" },
    ];
  },

  // حساب إحصائيات المستخدمين
  calculateUserStats(users) {
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      newUsersToday: 0,
      usersWithOrders: 0,
    };

    if (!Array.isArray(users) || users.length === 0) {
      return stats;
    }

    const today = new Date().toDateString();

    stats.totalUsers = users.length;

    users.forEach((user) => {
      // حساب المستخدمين النشطين
      if (user.isActive || user.emailConfirmed) {
        stats.activeUsers++;
      }

      // حساب المسؤولين
      if (user.isAdmin || user.role === "admin") {
        stats.adminUsers++;
      }

      // حساب المستخدمين الجدد اليوم
      if (user.createdAt && new Date(user.createdAt).toDateString() === today) {
        stats.newUsersToday++;
      }

      // حساب المستخدمين الذين لديهم طلبات
      if (user.ordersCount > 0) {
        stats.usersWithOrders++;
      }
    });

    return stats;
  },
};

export default userService;
