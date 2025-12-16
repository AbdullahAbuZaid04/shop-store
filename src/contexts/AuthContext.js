import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  //  دالة لتحميل حالة المستخدم من localStorage و API
  const loadUserFromStorage = useCallback(async () => {
    try {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      const isValid = authService.isTokenValid();

      if (currentUser && token && isValid) {
        //  تحديث: التحقق من البيانات مع API
        try {
          const apiResult = await authService.getCurrentUserData();
          if (apiResult.success) {
            // استخدام البيانات المحدثة من API
            setUser(apiResult.user);
            localStorage.setItem("user", JSON.stringify(apiResult.user));
            setIsAuthenticated(true);
            return true;
          }
        } catch (apiError) {
          // استخدام البيانات المحلية إذا فشل API
          setUser(currentUser);
          setIsAuthenticated(true);

          return true;
        }
      } else {
        // إذا كان التوكن غير صالح، تنظيف البيانات
        if (token && !isValid) {
          authService.logout();
        }
        return false;
      }
    } catch (error) {
      return false;
    }
  }, []);

  //  دالة للتحقق من حالة المصادقة
  const checkAuthStatus = useCallback(async () => {
    if (authChecked) return; // منع التكرار

    try {
      setLoading(true);
      const loaded = await loadUserFromStorage();

      if (!loaded) {
        setUser(null);
        setIsAuthenticated(false);
      }

      setAuthChecked(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
    } finally {
      setLoading(false);
    }
  }, [loadUserFromStorage, authChecked]);

  //  تأثير للتحقق من حالة المصادقة عند التحميل
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  //  دالة تسجيل الدخول العامة - نظام واحد للجميع
  const login = async (email, password, rememberMe = false) => {
    try {
      setLoading(true);

      //  استخدام authService.login مع rememberMe
      const result = await authService.login(email, password, rememberMe);

      if (result.success) {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setIsAuthenticated(true);

        return {
          success: true,
          user: currentUser,
          isAdmin: result.isAdmin, // ⭐ مهم: تمرير isAdmin للـ Login.jsx
          message: result.message || "تم تسجيل الدخول بنجاح",
        };
      }

      return {
        success: false,
        message: result.message || "فشل تسجيل الدخول",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "حدث خطأ غير متوقع في تسجيل الدخول",
      };
    } finally {
      setLoading(false);
    }
  };

  //  إزالة دالة adminLogin تماماً - لم نعد نحتاجها
  // لأن نظام تسجيل الدخول أصبح واحداً للجميع

  //  دالة التسجيل
  const register = async (userData) => {
    try {
      setLoading(true);

      // ✅ استخدام authService.register الجديد
      const result = await authService.register(userData);

      if (result.success) {
        return {
          success: true,
          message: result.message || "تم إنشاء الحساب بنجاح",
          data: result.data,
        };
      }

      return {
        success: false,
        message: result.message || "فشل في إنشاء الحساب",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "حدث خطأ غير متوقع في التسجيل",
      };
    } finally {
      setLoading(false);
    }
  };

  //  دالة تسجيل الخروج
  const logout = useCallback(async () => {
    try {
      //  استخدام authService.logout
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(false);
    } catch (error) {}
  }, []);

  //  دالة للتحقق من صلاحيات Admin
  const isAdmin = useCallback(() => {
    return user && user.isAdmin === true;
  }, [user]);

  //  دالة للتحقق من صلاحيات محددة
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      if (isAdmin()) return true; // المسؤول لديه كل الصلاحيات
      return user.roles?.includes(permission) || false;
    },
    [user, isAdmin]
  );

  //  دالة للتحقق من ملكية المحتوى
  const isOwner = useCallback(
    (resourceUserId) => {
      if (!user) return false;
      if (isAdmin()) return true; // المسؤول يمكنه الوصول لكل شيء
      return user.id === resourceUserId;
    },
    [user, isAdmin]
  );

  //  تحديث الملف الشخصي
  const updateProfile = async (profileData) => {
    try {
      if (!user) {
        return { success: false, message: "يجب تسجيل الدخول أولاً" };
      }

      //  استخدام authService.updateProfile
      const result = await authService.updateProfile(profileData);

      if (result.success) {
        // تحديث state بالبيانات الجديدة
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);

        return {
          success: true,
          message: result.message || "تم تحديث الملف الشخصي بنجاح",
          user: updatedUser,
        };
      }

      return {
        success: false,
        message: result.message || "فشل في تحديث الملف الشخصي",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
      };
    }
  };

  //  تغيير كلمة المرور
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user) {
        return { success: false, message: "يجب تسجيل الدخول أولاً" };
      }

      //  استخدام authService.changePassword
      const result = await authService.changePassword(
        currentPassword,
        newPassword
      );

      if (result.success) {
        return {
          success: true,
          message: result.message || "تم تغيير كلمة المرور بنجاح",
        };
      }

      return {
        success: false,
        message: result.message || "فشل في تغيير كلمة المرور",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
      };
    }
  };

  //  إعادة تحميل بيانات المستخدم من API
  const reloadUserData = async () => {
    try {
      if (!isAuthenticated) return { success: false };

      setLoading(true);
      const result = await authService.getCurrentUserData();

      if (result.success) {
        setUser(result.user);
        return { success: true, user: result.user };
      }

      return { success: false, message: result.message };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // في AuthContext.js - عدل دالة updateUser
  const updateUser = useCallback((updatedData) => {
    // تحديث حالة المستخدم مع الحفاظ على isAdmin
    setUser((prevUser) => {
      const newUser = {
        ...prevUser,
        ...updatedData,
        //  تأكد من الحفاظ على isAdmin إذا لم يأتِ في updatedData
        isAdmin:
          updatedData.isAdmin !== undefined
            ? updatedData.isAdmin
            : prevUser?.isAdmin || false,
      };
      return newUser;
    });

    // تحديث localStorage أيضاً
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...storedUser,
        ...updatedData,
        //  تأكد من الحفاظ على isAdmin في localStorage
        isAdmin:
          updatedData.isAdmin !== undefined
            ? updatedData.isAdmin
            : storedUser?.isAdmin || false,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {}
  }, []);

  //  الاستماع لتغييرات المصادقة
  useEffect(() => {
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    const handleAuthStateChanged = (event) => {
      if (event.detail && event.detail.isLoggedIn === false) {
        logout();
      } else {
        checkAuthStatus();
      }
    };

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("authStateChanged", handleAuthStateChanged);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("authStateChanged", handleAuthStateChanged);
    };
  }, [checkAuthStatus, logout]);

  //  تحديث حالة المصادقة عند تغيير localStorage
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "token" || event.key === "user") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [checkAuthStatus]);

  const value = {
    user,
    isAuthenticated,
    loading,
    authChecked,
    isAdmin: isAdmin(),
    hasPermission,
    updateUser,
    isOwner,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    reloadUserData,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
