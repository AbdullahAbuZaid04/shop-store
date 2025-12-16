import apiClient from "./apiConfig";

const cartService = {
  // GET /api/Cart - حسب Swagger
  async getCart() {
    try {
      const response = await apiClient.get("/Cart");
      return response.data; // يرجع { Id, UserId, Items: [], TotalItems, TotalPrice }
    } catch (error) {
      throw error;
    }
  },

  // POST /api/Cart/items - حسب Swagger
  async addToCart(productId, quantity = 1) {
    try {
      const requestBody = {
        ProductId: parseInt(productId),
        Quantity: parseInt(quantity),
      };


      const response = await apiClient.post("/Cart/items", requestBody);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT /api/Cart/items/{productId} - حسب Swagger
  async updateCartItem(productId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(productId);
      }

      const requestBody = {
        ProductId: parseInt(productId),
        Quantity: parseInt(quantity),
      };


      const response = await apiClient.put(
        `/Cart/items/${productId}`,
        requestBody
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE /api/Cart/items/{productId} - حسب Swagger
  async removeFromCart(productId) {
    try {
      const response = await apiClient.delete(`/Cart/items/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE /api/Cart - حسب Swagger
  async clearCart() {
    try {
      const response = await apiClient.delete("/Cart");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // دالة مساعدة: الحصول على معرف السلة
  async getCartId() {
    try {
      const cart = await this.getCart();
      return cart?.Id || null;
    } catch (error) {
      return null;
    }
  },
};

export default cartService;
