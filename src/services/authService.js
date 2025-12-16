import apiClient from "./apiConfig";

const authService = {
  // ========== تسجيل الدخول ==========

  // تسجيل دخول عام - POST /Auth/login
  async login(email, password, rememberMe = false) {
    try {

      const loginData = {
        Email: email,
        Password: password,
        RememberMe: rememberMe,
      };


      const response = await apiClient.post("/Auth/login", loginData);
      const data = response.data;


      if (data && data.Token) {
        const token = data.Token;
        const isAdmin = data.Roles && data.Roles.includes("Admin");

        // حفظ البيانات في localStorage
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.Id || data.UserId,
            email: data.Email,
            firstName: data.FirstName,
            lastName: data.LastName,
            fullName: `${data.FirstName || ""} ${data.LastName || ""}`.trim(),
            phoneNumber: data.PhoneNumber,
            roles: data.Roles || [],
            isAdmin: isAdmin,
            emailConfirmed: data.EmailConfirmed || false,
            tokenValid: data.TokenValid || true,
            rememberMe: rememberMe,
          })
        );

        // إعداد التوكن في apiClient
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;



        // إرسال حدث لتحديث المكونات
        window.dispatchEvent(new Event("authChange"));

        return {
          success: true,
          token: token,
          user: {
            id: data.Id || data.UserId,
            email: data.Email,
            firstName: data.FirstName,
            lastName: data.LastName,
            fullName: `${data.FirstName || ""} ${data.LastName || ""}`.trim(),
            phoneNumber: data.PhoneNumber,
            roles: data.Roles || [],
            isAdmin: isAdmin,
            emailConfirmed: data.EmailConfirmed || false,
            tokenValid: data.TokenValid || true,
          },
          isAdmin: isAdmin,
          message: "تم تسجيل الدخول بنجاح",
        };
      } else {
        throw new Error("لم يتم استلام التوكن من الخادم");
      }
    } catch (error) {

      let errorMessage = "فشل تسجيل الدخول";

      if (error.response) {

        if (error.response.status === 400) {
          errorMessage = "بيانات الدخول غير صحيحة";
        } else if (error.response.status === 401) {
          errorMessage = "غير مصرح بالوصول";
        } else if (error.response.data?.Message) {
          errorMessage = error.response.data.Message;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
        error: error,
      };
    }
  },

  // تسجيل دخول خاص للمسؤولين
  async adminLogin(email, password) {
    const result = await this.login(email, password);

    if (!result.success) {
      return result;
    }

    if (result.user.isAdmin) {
      return result;
    } else {
      // إذا لم يكن مسؤولاً، نخرج
      this.logout();
      return {
        success: false,
        message: "هذا الحساب ليس لديه صلاحيات مسؤول",
      };
    }
  },

  // ========== التسجيل ==========

  // تسجيل مستخدم جديد - POST /Auth/register
  async register(userData) {
    try {
      const registerData = {
        Email: userData.email,
        Password: userData.password,
        FirstName: userData.firstName || "",
        LastName: userData.lastName || "",
        PhoneNumber: userData.phoneNumber || "",
      };


      // أرسل الطلب
      const response = await apiClient.post("/Auth/register", registerData);


      //  الحل الجديد: إذا كان status 200 أو 201، اعتبره ناجحاً
      if (response.status === 200 || response.status === 201) {

        return {
          success: true,
          data: response.data,
          message: "تم إنشاء الحساب بنجاح",
        };
      }

      // إذا وصلنا هنا، فالخادم لم يرجع status نجاح
      return {
        success: false,
        message: "لم يتم تأكيد النجاح من الخادم",
        data: response.data,
      };
    } catch (error) {

      // تحسين رسائل الخطأ
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب";

      if (error.response) {
      

        // إذا كان الرد يحتوي على بيانات
        if (error.response.data) {
          // جرب عدة أشكال لاستخراج الرسالة
          if (error.response.data.Message) {
            errorMessage = error.response.data.Message;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          }
        }
      } else if (error.request) {
        errorMessage = "لم يتم استقبال رد من الخادم";
      } else {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
        error: error,
      };
    }
  },

  // ========== جلب البيانات ==========

  // جلب بيانات المستخدم الحالي - GET /Auth/me
  async getCurrentUserData() {
    try {
      const response = await apiClient.get("/Auth/me");
      const data = response.data;


      const isAdmin = data.Roles && data.Roles.includes("Admin");

      // تحديث البيانات المحفوظة
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.Id,
          email: data.Email,
          firstName: data.FirstName,
          lastName: data.LastName,
          fullName: `${data.FirstName || ""} ${data.LastName || ""}`.trim(),
          phoneNumber: data.PhoneNumber,
          roles: data.Roles || [],
          isAdmin: isAdmin,
          emailConfirmed: data.EmailConfirmed || false,
          tokenValid: data.TokenValid || true,
        })
      );

      return {
        success: true,
        user: {
          id: data.Id,
          email: data.Email,
          firstName: data.FirstName,
          lastName: data.LastName,
          fullName: `${data.FirstName || ""} ${data.LastName || ""}`.trim(),
          phoneNumber: data.PhoneNumber,
          roles: data.Roles || [],
          isAdmin: isAdmin,
          emailConfirmed: data.EmailConfirmed || false,
          tokenValid: data.TokenValid || true,
        },
      };
    } catch (error) {

      // إذا كان الخطأ 401، قد يكون التوكن منتهياً
      if (error.response?.status === 401) {
        this.logout();
      }

      return {
        success: false,
        message: "فشل في جلب بيانات المستخدم",
        error: error,
      };
    }
  },

  // ========== دوال المصادقة ==========

  // تسجيل الخروج
  logout() {
    // تنظيف جميع البيانات
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    // إزالة التوكن من apiClient
    delete apiClient.defaults.headers.common["Authorization"];


    // إرسال حدث لتحديث المكونات
    window.dispatchEvent(new Event("authChange"));
  },

  // التحقق من حالة المصادقة
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return false;
    }

    try {
      const userData = JSON.parse(user);
      // التحقق من صلاحية التوكن إذا كانت المعلومات متاحة
      if (userData.tokenValid === false) {
        return false;
      }
    } catch (error) {
      return false;
    }

    return true;
  },

  // جلب التوكن الحالي
  getToken() {
    return localStorage.getItem("token");
  },

  // جلب بيانات المستخدم الحالي من localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  },

  // التحقق إذا كان المستخدم مسؤولاً
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.isAdmin;
  },

  // التحقق من صلاحية التوكن
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    const user = this.getCurrentUser();
    if (!user) return false;

    return user.tokenValid !== false;
  },

  // تجديد التوكن (إذا كان API يدعمه)
  async refreshToken() {
    try {
      const response = await apiClient.post("/Auth/refresh-token");
      const data = response.data;

      if (data && data.Token) {
        localStorage.setItem("token", data.Token);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  // ========== إدارة الحساب ==========

  // تغيير كلمة المرور - POST /User/change-password
  async changePassword(currentPassword, newPassword) {
    try {
      const passwordData = {
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
      };


      const response = await apiClient.post(
        "/User/change-password",
        passwordData
      );
      const data = response.data;


      return {
        success: true,
        message: data.Message || "تم تغيير كلمة المرور بنجاح",
      };
    } catch (error) {

      let errorMessage = "فشل في تغيير كلمة المرور";

      if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      }

      return {
        success: false,
        message: errorMessage,
        error: error,
      };
    }
  },

  // تحديث الملف الشخصي - PUT /User/profile
  async updateProfile(profileData) {
    try {
      const updateData = {
        FirstName: profileData.firstName || "",
        LastName: profileData.lastName || "",
        PhoneNumber: profileData.phoneNumber || "",
      };


      const response = await apiClient.put("/User/profile", updateData);
      const data = response.data;


      // تحديث البيانات المحفوظة
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          firstName: profileData.firstName || currentUser.firstName,
          lastName: profileData.lastName || currentUser.lastName,
          fullName: `${profileData.firstName || currentUser.firstName} ${
            profileData.lastName || currentUser.lastName
          }`.trim(),
          phoneNumber: profileData.phoneNumber || currentUser.phoneNumber,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));

        // إرسال حدث لتحديث المكونات
        window.dispatchEvent(new Event("authChange"));
      }

      return {
        success: true,
        message: "تم تحديث الملف الشخصي بنجاح",
        user: data,
      };
    } catch (error) {

      return {
        success: false,
        message: "فشل في تحديث الملف الشخصي",
        error: error,
      };
    }
  },

  // ========== دوال مساعدة ==========

  // التحقق من صلاحية الإدخال
  validateLoginInput(email, password) {
    const errors = [];

    if (!email || !email.includes("@")) {
      errors.push("البريد الإلكتروني غير صالح");
    }

    if (!password || password.length < 6) {
      errors.push("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    return errors;
  },

  // التحقق من صلاحية بيانات التسجيل
  validateRegisterInput(userData) {
    const errors = [];

    if (!userData.email || !userData.email.includes("@")) {
      errors.push("البريد الإلكتروني غير صالح");
    }

    if (!userData.password || userData.password.length < 6) {
      errors.push("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    if (userData.password !== userData.confirmPassword) {
      errors.push("كلمات المرور غير متطابقة");
    }

    if (!userData.firstName || userData.firstName.trim().length < 2) {
      errors.push("الاسم الأول يجب أن يكون حرفين على الأقل");
    }

    return errors;
  },

  // تهيئة التوكن عند تحميل التطبيق
  initializeAuth() {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (token && user) {

      // إضافة التوكن إلى apiClient
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // التحقق من صلاحية التوكن
      if (!this.isTokenValid()) {
        this.logout();
        return false;
      }

      return true;
    }

    return false;
  },
};

// تهيئة المصادقة عند تحميل الملف
authService.initializeAuth();

export default authService;
