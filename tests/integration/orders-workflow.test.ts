/**
 * === 🛒 Orders Workflow Database Tests - TDD First ===
 * Tests pour les RPC functions de workflow commandes
 * Pattern TDD : Tests AVANT implémentation functions
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Setup test database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('Orders Workflow Database Functions - TDD', () => {
  let testUserId: string;
  let testProductId: string;
  let testCartId: string;
  let testAddressId: string;

  beforeAll(async () => {
    // Setup test data
    console.log('🧪 Setting up test data for orders workflow...');
    
    // Create test user
    const { data: user, error: userError } = await supabase.auth.signUp({
      email: 'test-orders@herbisveritas.fr',
      password: 'password123',
    });
    
    if (!userError && user.user) {
      testUserId = user.user.id;
      
      // Create test product
      const { data: product } = await supabase
        .from('products')
        .insert({
          name: 'Crème Test',
          price: 29.99,
          stock_quantity: 10,
          is_active: true,
          slug: 'creme-test-orders',
          labels: ['BIO', 'NATUREL'],
          inci_list: ['Aqua', 'Glycerin'],
          image_url: 'https://example.com/test.jpg'
        })
        .select()
        .single();
        
      if (product) {
        testProductId = product.id;
      }
      
      // Create test address
      const { data: address } = await supabase
        .from('addresses')
        .insert({
          user_id: testUserId,
          street: '123 Test Street',
          city: 'Paris',
          postal_code: '75001',
          country: 'France',
          type: 'shipping'
        })
        .select()
        .single();
        
      if (address) {
        testAddressId = address.id;
      }
      
      // Create test cart
      const { data: cart } = await supabase
        .from('carts')
        .insert({
          user_id: testUserId,
          guest_id: null
        })
        .select()
        .single();
        
      if (cart) {
        testCartId = cart.id;
        
        // Add item to cart
        await supabase
          .from('cart_items')
          .insert({
            cart_id: testCartId,
            product_id: testProductId,
            quantity: 2
          });
      }
    }
  });

  beforeEach(async () => {
    // Clean slate for each test
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
  });

  describe('RPC: create_order_from_cart', () => {
    it('should create order with all items from user cart', async () => {
      // ARRANGE
      const cartItems = [
        { productId: testProductId, quantity: 2, price: 29.99 }
      ];
      
      // ACT
      const { data, error } = await supabase.rpc('create_order_from_cart', {
        p_user_id: testUserId,
        p_shipping_address_id: testAddressId,
        p_billing_address_id: testAddressId,
        p_payment_method: 'stripe'
      });

      // ASSERT
      expect(error).toBeNull();
      expect(data).toHaveProperty('order_id');
      expect(data).toHaveProperty('order_number');
      expect(data.total_amount).toBeGreaterThan(0);
      
      // Verify order created in database
      const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', data.order_id)
        .single();
        
      expect(order.status).toBe('pending_payment');
      expect(order.user_id).toBe(testUserId);
      expect(order.order_items).toHaveLength(1);
      expect(order.order_items[0].quantity).toBe(2);
    });

    it('should fail if cart is empty', async () => {
      // ARRANGE: Empty cart
      
      // ACT
      const { data, error } = await supabase.rpc('create_order_from_cart', {
        p_user_id: testUserId,
        p_shipping_address_id: testAddressId,
        p_billing_address_id: testAddressId,
        p_payment_method: 'stripe'
      });

      // ASSERT
      expect(error).not.toBeNull();
      expect(error!.message).toContain('Cart is empty');
    });

    it('should validate address ownership', async () => {
      // ARRANGE: Address belonging to different user
      const otherUserAddressId = 'other-user-address-id';
      
      // ACT
      const { data, error } = await supabase.rpc('create_order_from_cart', {
        p_user_id: testUserId,
        p_shipping_address_id: otherUserAddressId,
        p_billing_address_id: testAddressId,
        p_payment_method: 'stripe'
      });

      // ASSERT
      expect(error).not.toBeNull();
      expect(error!.message).toContain('Address not found or not owned');
    });

    it('should calculate correct totals with shipping fee', async () => {
      // ARRANGE
      const expectedSubtotal = 29.99 * 2; // 2 items à 29.99€
      const expectedShippingFee = 4.90;
      const expectedTotal = expectedSubtotal + expectedShippingFee;
      
      // ACT
      const { data, error } = await supabase.rpc('create_order_from_cart', {
        p_user_id: testUserId,
        p_shipping_address_id: testAddressId,
        p_billing_address_id: testAddressId,
        p_payment_method: 'stripe'
      });

      // ASSERT
      expect(error).toBeNull();
      expect(data.total_amount).toBeCloseTo(expectedTotal, 2);
      expect(data.shipping_fee).toBe(expectedShippingFee);
    });
  });

  describe('RPC: update_order_status', () => {
    let testOrderId: string;

    beforeEach(async () => {
      // Create test order
      const { data } = await supabase.rpc('create_order_from_cart', {
        p_user_id: testUserId,
        p_shipping_address_id: testAddressId,
        p_billing_address_id: testAddressId,
        p_payment_method: 'stripe'
      });
      testOrderId = data.order_id;
    });

    it('should update order status with valid transitions', async () => {
      // ARRANGE: Valid transition
      const newStatus = 'processing';
      
      // ACT
      const { data, error } = await supabase.rpc('update_order_status', {
        p_order_id: testOrderId,
        p_new_status: newStatus,
        p_tracking_number: null
      });

      // ASSERT
      expect(error).toBeNull();
      expect(data.success).toBe(true);
      
      // Verify in database
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', testOrderId)
        .single();
        
      expect(order.status).toBe(newStatus);
    });

    it('should reject invalid status transitions', async () => {
      // ARRANGE: Invalid transition (pending_payment -> delivered)
      const invalidStatus = 'delivered';
      
      // ACT
      const { data, error } = await supabase.rpc('update_order_status', {
        p_order_id: testOrderId,
        p_new_status: invalidStatus,
        p_tracking_number: null
      });

      // ASSERT
      expect(error).not.toBeNull();
      expect(error!.message).toContain('Invalid status transition');
    });

    it('should add tracking number when shipping', async () => {
      // ARRANGE: Valid transition to shipped
      await supabase.rpc('update_order_status', {
        p_order_id: testOrderId,
        p_new_status: 'processing',
        p_tracking_number: null
      });
      
      const trackingNumber = '1A23456789012';
      
      // ACT
      const { data, error } = await supabase.rpc('update_order_status', {
        p_order_id: testOrderId,
        p_new_status: 'shipped',
        p_tracking_number: trackingNumber
      });

      // ASSERT
      expect(error).toBeNull();
      
      // Verify tracking number saved
      const { data: order } = await supabase
        .from('orders')
        .select('tracking_number, tracking_url')
        .eq('id', testOrderId)
        .single();
        
      expect(order.tracking_number).toBe(trackingNumber);
      expect(order.tracking_url).toContain('colissimo.fr');
    });
  });

  describe('RPC: get_user_orders', () => {
    beforeEach(async () => {
      // Create test orders with different statuses
      await supabase.rpc('create_order_from_cart', {
        p_user_id: testUserId,
        p_shipping_address_id: testAddressId,
        p_billing_address_id: testAddressId,
        p_payment_method: 'stripe'
      });
    });

    it('should return user orders with pagination', async () => {
      // ACT
      const { data, error } = await supabase.rpc('get_user_orders', {
        p_user_id: testUserId,
        p_limit: 10,
        p_offset: 0
      });

      // ASSERT
      expect(error).toBeNull();
      expect(data).toHaveProperty('orders');
      expect(data).toHaveProperty('total_count');
      expect(data.orders).toBeInstanceOf(Array);
      expect(data.orders.length).toBeGreaterThan(0);
      
      // Verify order structure
      const order = data.orders[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('order_number');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('total_amount');
      expect(order).toHaveProperty('created_at');
      expect(order.user_id).toBe(testUserId);
    });

    it('should respect pagination limits', async () => {
      // ACT
      const { data, error } = await supabase.rpc('get_user_orders', {
        p_user_id: testUserId,
        p_limit: 1,
        p_offset: 0
      });

      // ASSERT
      expect(error).toBeNull();
      expect(data.orders).toHaveLength(1);
    });
  });

  describe('RPC: get_order_details', () => {
    let testOrderId: string;

    beforeEach(async () => {
      const { data } = await supabase.rpc('create_order_from_cart', {
        p_user_id: testUserId,
        p_shipping_address_id: testAddressId,
        p_billing_address_id: testAddressId,
        p_payment_method: 'stripe'
      });
      testOrderId = data.order_id;
    });

    it('should return complete order details with items', async () => {
      // ACT
      const { data, error } = await supabase.rpc('get_order_details', {
        p_order_id: testOrderId,
        p_user_id: testUserId
      });

      // ASSERT
      expect(error).toBeNull();
      expect(data).toHaveProperty('order');
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('shipping_address');
      expect(data).toHaveProperty('billing_address');
      
      // Verify order details
      expect(data.order.id).toBe(testOrderId);
      expect(data.items).toBeInstanceOf(Array);
      expect(data.items.length).toBeGreaterThan(0);
      
      // Verify item details
      const item = data.items[0];
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('price_at_purchase');
      expect(item).toHaveProperty('product_name_at_purchase');
    });

    it('should reject access to other user orders', async () => {
      // ARRANGE
      const otherUserId = 'other-user-id';
      
      // ACT
      const { data, error } = await supabase.rpc('get_order_details', {
        p_order_id: testOrderId,
        p_user_id: otherUserId
      });

      // ASSERT
      expect(error).not.toBeNull();
      expect(error!.message).toContain('Order not found or access denied');
    });
  });

  describe('Business Logic Validation', () => {
    it('should generate unique order numbers', async () => {
      // ACT: Create multiple orders
      const orders = await Promise.all([
        supabase.rpc('create_order_from_cart', {
          p_user_id: testUserId,
          p_shipping_address_id: testAddressId,
          p_billing_address_id: testAddressId,
          p_payment_method: 'stripe'
        }),
        supabase.rpc('create_order_from_cart', {
          p_user_id: testUserId,
          p_shipping_address_id: testAddressId,
          p_billing_address_id: testAddressId,
          p_payment_method: 'stripe'
        })
      ]);

      // ASSERT
      expect(orders[0].data.order_number).toBeDefined();
      expect(orders[1].data.order_number).toBeDefined();
      expect(orders[0].data.order_number).not.toBe(orders[1].data.order_number);
    });

    it('should validate product availability', async () => {
      // ARRANGE: Product with insufficient stock
      // TODO: Setup product with limited stock
      
      // ACT & ASSERT: Will be implemented with product stock validation
      expect(true).toBe(true); // Placeholder
    });
  });
});