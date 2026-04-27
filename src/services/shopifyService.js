import * as ShopifyBuy from 'shopify-buy';

// Shopify configuration from the provided file
const SHOPIFY_CONFIG = {
  domain: 'e403a2-d5',
  storefrontAccessToken: '245c6ea30fd3092802c5bdc72bfe32e3',
  country: 'US',
  language: 'EN'
};

// Initialize Shopify client
let client;
try {
  client = ShopifyBuy.default.buildClient({
    domain: SHOPIFY_CONFIG.domain + '.myshopify.com',
    storefrontAccessToken: SHOPIFY_CONFIG.storefrontAccessToken
  });
  console.log('Shopify client initialized with domain:', SHOPIFY_CONFIG.domain + '.myshopify.com');
} catch (error) {
  console.error('Failed to initialize Shopify client:', error);
}

// Shopify API Service
class ShopifyService {
  constructor() {
    this.client = client;
    this.checkout = null;
  }

  // Fetch all products from Shopify
  async fetchProducts(limit = 250) {
    try {
      console.log('ShopifyService: Fetching products from Shopify...');
      const products = await this.client.product.fetchAll(limit);
      console.log('ShopifyService: Raw products from Shopify:', products);
      
      // Also fetch collections to get better categorization
      const collections = await this.fetchCollections();
      console.log('ShopifyService: Fetched collections:', collections);
      
      // Map products with their collections
      const productsWithCollections = products.map(product => {
        const productCollections = collections
          .filter(collection => 
            collection.products.some(p => p.id === product.id)
          )
          .map(collection => ({
            id: collection.id,
            title: collection.title,
            handle: collection.handle
          }));
        
        return {
          ...product,
          collections: productCollections
        };
      });
      
      const transformed = this.transformProducts(productsWithCollections);
      console.log('ShopifyService: Transformed products with collections:', transformed);
      return transformed;
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
      return [];
    }
  }

  // Fetch single product by handle
  async fetchProductByHandle(handle) {
    try {
      const product = await this.client.product.fetchByHandle(handle);
      return this.transformProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Fetch product by ID
  async fetchProductById(id) {
    try {
      const product = await this.client.product.fetch(id);
      return this.transformProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Transform Shopify product to match your existing product structure
  transformProduct(shopifyProduct) {
    if (!shopifyProduct) return null;

    // Use productType as the category (this is the standard Shopify field for product categories)
    const productType = shopifyProduct.productType || '';
    const vendor = shopifyProduct.vendor || '';
    const tags = shopifyProduct.tags || [];
    const collections = shopifyProduct.collections || [];

    return {
      id: shopifyProduct.id,
      shopifyId: shopifyProduct.id,
      name: shopifyProduct.title,
      description: shopifyProduct.description,
      price: shopifyProduct.variants[0]?.price.amount || '0',
      compareAtPrice: shopifyProduct.variants[0]?.compareAtPrice?.amount || null,
      imageUrl: shopifyProduct.images[0]?.src || '',
      images: shopifyProduct.images.map(img => img.src),
      category: productType || 'Uncategorized',
      type: productType,
      vendor: vendor,
      tags: tags,
      collections: collections,
      variants: shopifyProduct.variants.map(variant => ({
        id: variant.id,
        title: variant.title,
        price: variant.price.amount,
        compareAtPrice: variant.compareAtPrice?.amount || null,
        available: variant.available,
        imageUrl: variant.image?.src || '',
        selectedOptions: variant.selectedOptions,
        sku: variant.sku,
        weight: variant.weight,
        weightUnit: variant.weightUnit
      })),
      options: shopifyProduct.options.map(option => ({
        id: option.id,
        name: option.name,
        values: option.values.map(value => value.value)
      })),
      available: shopifyProduct.availableForSale,
      handle: shopifyProduct.handle,
      source: 'shopify',
      createdAt: shopifyProduct.createdAt,
      updatedAt: shopifyProduct.updatedAt,
      publishedAt: shopifyProduct.publishedAt,
      onlineStoreUrl: shopifyProduct.onlineStoreUrl,
      metafields: shopifyProduct.metafields || []
    };
  }

  // Transform multiple products
  transformProducts(shopifyProducts) {
    return shopifyProducts.map(product => this.transformProduct(product));
  }

  // Create or fetch checkout
  async createCheckout() {
    try {
      // Check if we have a stored checkout ID
      const checkoutId = localStorage.getItem('shopify_checkout_id');
      
      if (checkoutId) {
        // Try to fetch existing checkout
        try {
          this.checkout = await this.client.checkout.fetch(checkoutId);
          
          // If checkout is completed, create a new one
          if (this.checkout.completedAt) {
            this.checkout = await this.client.checkout.create();
            localStorage.setItem('shopify_checkout_id', this.checkout.id);
          }
        } catch (error) {
          // If fetch fails, create new checkout
          this.checkout = await this.client.checkout.create();
          localStorage.setItem('shopify_checkout_id', this.checkout.id);
        }
      } else {
        // Create new checkout
        this.checkout = await this.client.checkout.create();
        localStorage.setItem('shopify_checkout_id', this.checkout.id);
      }
      
      return this.checkout;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  }

  // Add items to cart
  async addToCart(variantId, quantity = 1) {
    try {
      if (!this.checkout) {
        await this.createCheckout();
      }

      const lineItemsToAdd = [{
        variantId: variantId,
        quantity: parseInt(quantity)
      }];

      this.checkout = await this.client.checkout.addLineItems(
        this.checkout.id,
        lineItemsToAdd
      );

      return this.checkout;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(lineItemId, quantity) {
    try {
      if (!this.checkout) {
        await this.createCheckout();
      }

      const lineItemsToUpdate = [{
        id: lineItemId,
        quantity: parseInt(quantity)
      }];

      this.checkout = await this.client.checkout.updateLineItems(
        this.checkout.id,
        lineItemsToUpdate
      );

      return this.checkout;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(lineItemId) {
    try {
      if (!this.checkout) {
        await this.createCheckout();
      }

      this.checkout = await this.client.checkout.removeLineItems(
        this.checkout.id,
        [lineItemId]
      );

      return this.checkout;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Get checkout/cart
  async getCheckout() {
    try {
      if (!this.checkout) {
        await this.createCheckout();
      }
      return this.checkout;
    } catch (error) {
      console.error('Error getting checkout:', error);
      throw error;
    }
  }

  // Clear cart
  async clearCart() {
    try {
      // Create a new checkout to clear the cart
      this.checkout = await this.client.checkout.create();
      localStorage.setItem('shopify_checkout_id', this.checkout.id);
      return this.checkout;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Apply discount code
  async applyDiscount(discountCode) {
    try {
      if (!this.checkout) {
        await this.createCheckout();
      }

      this.checkout = await this.client.checkout.addDiscount(
        this.checkout.id,
        discountCode
      );

      return this.checkout;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }

  // Remove discount
  async removeDiscount() {
    try {
      if (!this.checkout) {
        await this.createCheckout();
      }

      this.checkout = await this.client.checkout.removeDiscount(this.checkout.id);
      return this.checkout;
    } catch (error) {
      console.error('Error removing discount:', error);
      throw error;
    }
  }

  // Get checkout URL for Shopify checkout
  getCheckoutUrl() {
    return this.checkout?.webUrl || null;
  }

  // Fetch collections
  async fetchCollections(limit = 250) {
    try {
      const collections = await this.client.collection.fetchAllWithProducts(limit);
      return collections.map(collection => ({
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
        description: collection.description,
        image: collection.image?.src || '',
        products: collection.products.map(p => ({ id: p.id }))
      }));
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  }

  // Search products
  async searchProducts(query) {
    try {
      const products = await this.client.product.fetchQuery({
        query: `title:*${query}* OR product_type:*${query}*`,
        sortBy: 'RELEVANCE'
      });
      return this.transformProducts(products);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}

// Export singleton instance
export default new ShopifyService();