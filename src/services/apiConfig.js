import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://abdallahali2003-001-site1.anytempurl.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": "ar-SA",
  },
  timeout: 15000,
});

// interceptor لإضافة التوكن تلقائياً لجميع الطلبات
apiClient.interceptors.request.use(
  (config) => {
    // الحصول على التوكن من localStorage
    //  التعديل: استخدام token فقط (حسب authService.js الجديد)
    const token = localStorage.getItem("token");

    //  إزالة: adminToken, session_token (لم تعد تستخدم)

    // إذا كان هناك توكن، أضفه إلى رأس الطلب
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      //  إضافة: تسجيل بسيط للتشخيص
      if (process.env.NODE_ENV === "development") {
      }
    } else {
      //  إضافة: تسجيل عندما لا يوجد توكن (للطلبات العامة)
      if (
        process.env.NODE_ENV === "development" &&
        !config.url.includes("/login") &&
        !config.url.includes("/register")
      ) {
      }
    }

    //  تحسين: تسجيل تفاصيل الطلب
    if (process.env.NODE_ENV === "development" && config.data) {
      const logData = { ...config.data };

      // إخفاء كلمات المرور في الـ logs
      if (logData.password) logData.password = "***";
      if (logData.Password) logData.Password = "***";
      if (logData.CurrentPassword) logData.CurrentPassword = "***";
      if (logData.NewPassword) logData.NewPassword = "***";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor للتحكم بالأخطاء في الاستجابة
apiClient.interceptors.response.use(
  (response) => {
    //  تحسين: تسجيل الاستجابة الناجحة
    if (process.env.NODE_ENV === "development") {
      const logInfo = {
        status: response.status,
        url: response.config.url,
        method: response.config.method?.toUpperCase(),
      };

      // تسجيل بيانات معينة فقط
      if (response.data) {
        if (response.data.Token) {
          logInfo.hasToken = true;
          logInfo.tokenLength = response.data.Token.length;
        }
        if (response.data.Success !== undefined) {
          logInfo.success = response.data.Success;
        }
        if (response.data.Message) {
          logInfo.message = response.data.Message;
        }
      }
    }
    return response;
  },
  (error) => {
    //  تحسين: تسجيل الخطأ بشكل منظم
    const errorInfo = {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message:
        error.response?.data?.Message ||
        error.response?.data?.message ||
        error.message,
    };

    //  تحسين: معالجة أخطاء المصادقة
    if (error.response?.status === 401) {
      //  التحديث: تنظيف البيانات حسب authService.js الجديد
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      //  إضافة: إزالة التوكن من axios defaults
      delete apiClient.defaults.headers.common["Authorization"];

      //  تحسين: إرسال حدث لتحديث المكونات
      window.dispatchEvent(
        new CustomEvent("authStateChanged", {
          detail: { isLoggedIn: false },
        })
      );

      //  تحسين: التحقق من الصفحة الحالية
      const currentPath = window.location.pathname;
      const publicPaths = ["/login", "/register", "/", "/products"];
      const isPublicPath = publicPaths.some((path) =>
        currentPath.includes(path)
      );

      //  إضافة: تأخير إعادة التوجيه لمنع التوجيه المزدوج
      if (!isPublicPath) {
        setTimeout(() => {
          // تحقق مرة أخرى قبل التوجيه
          if (!localStorage.getItem("token")) {
            window.location.href = "/login";
          }
        }, 1000);
      }
    }

    //  معالجة أخطاء شائعة
    switch (error.response?.status) {
      case 400:
        // يمكن إضافة معالجة خاصة للأخطاء 400
        break;

      case 403:
        // إعادة توجيه إلى صفحة غير مصرح
        if (window.location.pathname.includes("/admin")) {
          setTimeout(() => {
            window.location.href = "/unauthorized";
          }, 1500);
        }
        break;

      case 404:
        break;

      case 500:
        // يمكن إظهار رسالة للمستخدم
        if (window.showToast) {
          window.showToast("حدث خطأ في الخادم، يرجى المحاولة لاحقاً", "error");
        }
        break;

      default:
        if (error.code === "ECONNABORTED") {
          if (window.showToast) {
            window.showToast(
              "انتهت مهلة الطلب، يرجى المحاولة مرة أخرى",
              "warning"
            );
          }
        }
    }

    return Promise.reject(error);
  }
);

//  إضافة: دالة لاختبار الاتصال بالـ API
apiClient.testConnection = async () => {
  try {
    const response = await apiClient.get("/");

    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

//  إضافة: دالة لاختبار endpoint معين
apiClient.testEndpoint = async (endpoint) => {
  try {
    const response = await apiClient.get(endpoint);
    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      message: error.message,
    };
  }
};

//  إضافة: دالة لتعيين التوكن (للمسؤول والمستخدم)
apiClient.setAuthToken = (token, userData = null) => {
  if (token) {
    localStorage.setItem("token", token);

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }

    // تحديث التوكن في axios
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return true;
  }
  return false;
};

//  إضافة: دالة للحصول على بيانات المصادقة الحالية
apiClient.getAuthInfo = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {}
  }

  return {
    hasToken: !!token,
    token: token ? `${token.substring(0, 20)}...` : null,
    user: user,
    isAdmin: user?.isAdmin || false,
  };
};

//  إضافة: دالة لتنظيف بيانات المصادقة
apiClient.clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("currentUser");

  delete apiClient.defaults.headers.common["Authorization"];

  // إرسال حدث
  window.dispatchEvent(new CustomEvent("authCleared"));

  return true;
};

//  إضافة: تهيئة التوكن عند تحميل الملف
const initAuth = () => {
  const token = localStorage.getItem("token");
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// تشغيل تهيئة المصادقة
initAuth();

export default apiClient;
