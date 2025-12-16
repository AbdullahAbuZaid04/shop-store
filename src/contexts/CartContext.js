import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import cartService from "../services/cartService";

const CartContext = createContext();

const CART_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_CART_DATA: "SET_CART_DATA",
  ADD_ITEM_LOCAL: "ADD_ITEM_LOCAL",
  UPDATE_ITEM_LOCAL: "UPDATE_ITEM_LOCAL",
  REMOVE_ITEM_LOCAL: "REMOVE_ITEM_LOCAL",
  CLEAR_CART: "CLEAR_CART",
};

// مفاتيح التخزين المحلي
const LOCAL_STORAGE_KEYS = {
  CART_ITEMS: "cart_items_data",
  CART_TOTAL: "cart_total_items",
};

const initialState = {
  cartData: {
    Id: null,
    UserId: null,
    Items: [],
    TotalItems: 0,
    TotalPrice: 0,
    Status: "Active",
    CreatedDate: null,
    UpdatedDate: null,
  },
  localItems: [],
  loading: false,
  error: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null };

    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case CART_ACTIONS.SET_CART_DATA:
      return {
        ...state,
        cartData: action.payload.cartData,
        localItems: action.payload.localItems || state.localItems,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_ITEM_LOCAL:
      const { product, quantity } = action.payload;

      const existingItemIndex = state.localItems.findIndex(
        (item) => item.ProductId === product.id
      );

      let updatedLocalItems;
      if (existingItemIndex >= 0) {
        // تحديث الكمية
        updatedLocalItems = [...state.localItems];
        updatedLocalItems[existingItemIndex] = {
          ...updatedLocalItems[existingItemIndex],
          Quantity: updatedLocalItems[existingItemIndex].Quantity + quantity,
        };
      } else {
        // إضافة منتج جديد
        updatedLocalItems = [
          ...state.localItems,
          {
            ProductId: product.id,
            CategorytName: product.categoryName,
            Quantity: quantity,
            Price: product.price || 0,
            Name: product.name || `Product ${product.id}`,
            Image: product.imageUrl || product.image,
          },
        ];
      }

      return {
        ...state,
        localItems: updatedLocalItems,
        loading: false,
        error: null,
      };

    case CART_ACTIONS.UPDATE_ITEM_LOCAL:
      const { productId, newQuantity } = action.payload;
      const updatedItems = state.localItems
        .map((item) =>
          item.ProductId === productId
            ? { ...item, Quantity: newQuantity }
            : item
        )
        .filter((item) => item.Quantity > 0); // إزالة العناصر بكمية 0

      return {
        ...state,
        localItems: updatedItems,
        loading: false,
      };

    case CART_ACTIONS.REMOVE_ITEM_LOCAL:
      const filteredItems = state.localItems.filter(
        (item) => item.ProductId !== action.payload
      );

      return {
        ...state,
        localItems: filteredItems,
        loading: false,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialState,
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // تحميل العناصر من التخزين المحلي
  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedItems = localStorage.getItem(LOCAL_STORAGE_KEYS.CART_ITEMS);
      if (savedItems) {
        const items = JSON.parse(savedItems);
        return items;
      }
    } catch (error) {}
    return [];
  }, []);

  // حفظ العناصر إلى التخزين المحلي
  const saveToLocalStorage = useCallback((items) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CART_ITEMS,
        JSON.stringify(items)
      );
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CART_TOTAL,
        items.reduce((total, item) => total + (item.Quantity || 0), 0)
      );
    } catch (error) {}
  }, []);

  // الحصول على بيانات المستخدم
  const getUserData = useCallback(() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }, []);

  // تحميل سلة المستخدم
  const loadUserCart = useCallback(async () => {
    const user = getUserData();
    if (!user) {
      const localItems = loadFromLocalStorage();
      dispatch({
        type: CART_ACTIONS.SET_CART_DATA,
        payload: {
          cartData: initialState.cartData,
          localItems: localItems,
        },
      });
      return;
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      // 1. جلب بيانات السلة من API
      const cartData = await cartService.getCart();

      // 2. تحميل العناصر المحلية
      const localItems = loadFromLocalStorage();

      // 3. دمج البيانات: استخدم العناصر المحلية لأن API يرجع Items: []
      const mergedCartData = {
        ...cartData,
        Items: localItems,
        TotalItems: localItems.reduce(
          (total, item) => total + (item.Quantity || 0),
          0
        ),
        TotalPrice: localItems.reduce(
          (total, item) => total + (item.Price || 0) * (item.Quantity || 0),
          0
        ),
      };

      dispatch({
        type: CART_ACTIONS.SET_CART_DATA,
        payload: {
          cartData: mergedCartData,
          localItems: localItems,
        },
      });
    } catch (error) {
      // في حالة الخطأ، استخدم العناصر المحلية
      const localItems = loadFromLocalStorage();
      dispatch({
        type: CART_ACTIONS.SET_CART_DATA,
        payload: {
          cartData: initialState.cartData,
          localItems: localItems,
        },
      });
    }
  }, [getUserData, loadFromLocalStorage]);

  // إضافة منتج إلى السلة
  const addToCart = async (product, quantity = 1) => {
    const user = getUserData();
    if (!user) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      // 1. إرسال إلى API
      await cartService.addToCart(product.id, quantity);

      // 2. تحديث محلي
      dispatch({
        type: CART_ACTIONS.ADD_ITEM_LOCAL,
        payload: { product, quantity },
      });

      // 3. حفظ محلياً
      const updatedItems = [...state.localItems];
      const existingIndex = updatedItems.findIndex(
        (item) => item.ProductId === product.id
      );

      if (existingIndex >= 0) {
        updatedItems[existingIndex].Quantity += quantity;
      } else {
        updatedItems.push({
          ProductId: product.id,
          productId: product.id,
          Quantity: quantity,
          Price: product.price || 0,
          Name: product.name || `Product ${product.id}`,
          Image: product.imageUrl || product.image,
        });
      }

      saveToLocalStorage(updatedItems);

      // 4. تحديث إجمالي السلة
      const totalItems = updatedItems.reduce(
        (total, item) => total + (item.Quantity || 0),
        0
      );
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.CART_TOTAL,
        totalItems.toString()
      );
    } catch (error) {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // تحديث كمية المنتج
  const updateQuantity = async (productId, newQuantity) => {
    const user = getUserData();
    if (!user) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    if (newQuantity < 1) {
      return removeFromCart(productId);
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      // 1. تحديث في API
      await cartService.updateCartItem(productId, newQuantity);

      // 2. تحديث محلي
      dispatch({
        type: CART_ACTIONS.UPDATE_ITEM_LOCAL,
        payload: { productId, newQuantity },
      });

      // 3. حفظ محلياً
      const updatedItems = state.localItems
        .map((item) =>
          item.ProductId === productId
            ? { ...item, Quantity: newQuantity }
            : item
        )
        .filter((item) => item.Quantity > 0);

      saveToLocalStorage(updatedItems);
    } catch (error) {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // حذف منتج من السلة
  const removeFromCart = async (productId) => {
    const user = getUserData();
    if (!user) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      // 1. حذف من API
      await cartService.removeFromCart(productId);

      // 2. حذف محلي
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM_LOCAL,
        payload: productId,
      });

      // 3. حفظ محلياً
      const updatedItems = state.localItems.filter(
        (item) => item.ProductId !== productId
      );
      saveToLocalStorage(updatedItems);
    } catch (error) {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // تفريغ السلة
  const clearCart = async () => {
    const user = getUserData();
    if (!user) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }

    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });

    try {
      // 1. تفريغ في API
      await cartService.clearCart();

      // 2. تفريغ محلي
      dispatch({ type: CART_ACTIONS.CLEAR_CART });

      // 3. مسح التخزين المحلي
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CART_ITEMS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CART_TOTAL);
    } catch (error) {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // دوال مساعدة
  const getCartTotal = () => {
    return state.localItems.reduce(
      (total, item) => total + (item.Price || 0) * (item.Quantity || 0),
      0
    );
  };

  const getCartItemsCount = () => {
    return state.localItems.reduce(
      (count, item) => count + (item.Quantity || 0),
      0
    );
  };

  const getItemQuantity = (productId) => {
    const item = state.localItems.find((item) => item.ProductId === productId);
    return item ? item.Quantity : 0;
  };

  const isInCart = (productId) => {
    return state.localItems.some((item) => item.ProductId === productId);
  };

  // في CartContext.js - أضف هذه الدالة
  const clearCartLocally = useCallback(() => {
    // مسح التخزين المحلي فقط (بدون API call)
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CART_ITEMS);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.CART_TOTAL);

      dispatch({ type: CART_ACTIONS.CLEAR_CART });

      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const value = {
    // البيانات
    cart: {
      ...state.cartData,
      items: state.localItems,
    },
    items: state.localItems,
    loading: state.loading,
    error: state.error,

    // الدوال
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart: loadUserCart,
    clearCartLocally,

    // دوال مساعدة
    getCartTotal,
    getCartItemsCount,
    getItemQuantity,
    isInCart,

    // معلومات إضافية
    totalItems: getCartItemsCount(),
    totalPrice: getCartTotal(),
    isEmpty: state.localItems.length === 0,
    isAuthenticated: !!getUserData(),
  };

  useEffect(() => {
    loadUserCart();
  }, []);

  // حفظ التغييرات تلقائياً
  useEffect(() => {
    if (state.localItems.length > 0) {
      saveToLocalStorage(state.localItems);
    }
  }, [state.localItems, saveToLocalStorage]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
