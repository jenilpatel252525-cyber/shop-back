import React, { useEffect, useState } from 'react';
import api from '../api/api.jsx';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const navigate = useNavigate();

  const fetchCartItems = async (cartId) => {
    try {
      const res = await api.get(
        `/cart-items/?cart_id=${cartId}`
      );

      setItems(res.data);

      const qtyMap = {};

      res.data.forEach((item) => {
        qtyMap[item.id] = item.quantity;
      });

      setQuantities(qtyMap);
    } catch (err) {
      console.error(
        'Error fetching cart items:',
        err
      );
    }
  };

  const fetchCart = async () => {
    try {
      const res = await api.get('/user-cart/');

      setCart(res.data);

      await fetchCartItems(res.data.id);
    } catch (err) {
      if (err.response?.status === 403) {
        alert(
          'You must be logged in to view the cart.'
        );
        navigate('/login');
      } else {
        console.error(
          'Failed to fetch cart:',
          err
        );
      }
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);

      const res = await api.get('/orders/');

      setOrders(res.data);
    } catch (err) {
      console.error(
        'Failed to fetch orders:',
        err
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateQuantity = async (
    itemId,
    quantity
  ) => {
    try {
      await api.patch(
        `/cart-items/${itemId}/`,
        {
          quantity,
        }
      );

      setQuantities((prev) => ({
        ...prev,
        [itemId]: quantity,
      }));
    } catch (err) {
      console.error(
        'Failed to update quantity:',
        err
      );
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(
        `/cart-items/${itemId}/`
      );

      await fetchCartItems(cart.id);
    } catch (err) {
      console.error(
        'Failed to remove item:',
        err
      );
    }
  };

  const placeOrder = async () => {
    if (items.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    try {
      const addressRes = await api.get(
        'shipping-addresses/'
      );

      if (addressRes.data.length === 0) {
        alert(
          'Please add your address before placing an order.'
        );
        navigate('/address');
        return;
      }

      await api.post('/place-order/');

      alert(
        'Order placed successfully!'
      );

      await fetchCart();
      await fetchOrders();
    } catch (err) {
      console.error(
        'Failed to place order:',
        err
      );

      alert('Failed to place order.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await fetchCart();
      await fetchOrders();

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Loading your cart...</p>
      </div>
    );
  }

  const totalAmount = items.reduce(
    (sum, item) => {
      const qty =
        quantities[item.id] ||
        item.quantity;

      return (
        sum +
        item.product.price * qty
      );
    },
    0
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        Your Cart
      </h2>

      {items.length === 0 ? (
        <div className="alert alert-info">
          Your cart is empty.
        </div>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Subtotal (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => {
                const quantity =
                  quantities[item.id] ||
                  item.quantity;

                return (
                  <tr key={item.id}>
                    <td>
                      {item.product.name}
                    </td>

                    <td>
                      ₹
                      {
                        item.product.price
                      }
                    </td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        max={
                          item.product
                            .stock
                        }
                        value={quantity}
                        className="form-control"
                        style={{
                          width:
                            '90px',
                        }}
                        onChange={(
                          e
                        ) => {
                          const value =
                            parseInt(
                              e.target
                                .value
                            );

                          if (
                            !isNaN(
                              value
                            ) &&
                            value >=
                              1 &&
                            value <=
                              item
                                .product
                                .stock
                          ) {
                            setQuantities(
                              (
                                prev
                              ) => ({
                                ...prev,
                                [item.id]:
                                  value,
                              })
                            );
                          }
                        }}
                        onBlur={() => {
                          const newQty =
                            quantities[
                              item.id
                            ];

                          if (
                            newQty !==
                            item.quantity
                          ) {
                            updateQuantity(
                              item.id,
                              newQty
                            );
                          }
                        }}
                      />
                    </td>

                    <td>
                      ₹
                      {(
                        item
                          .product
                          .price *
                        quantity
                      ).toFixed(2)}
                    </td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}

              <tr>
                <td
                  colSpan="3"
                  className="text-end fw-bold"
                >
                  Total:
                </td>

                <td
                  colSpan="2"
                  className="fw-bold"
                >
                  ₹
                  {totalAmount.toFixed(
                    2
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div>please check your address before placing order.</div>

          <button
            className="btn btn-primary m-2"
            onClick={()=>navigate("/address")}
          >
            Edit address
          </button>

          <button
            className="btn btn-primary m-2"
            onClick={placeOrder}
          >
            Place Order
          </button>
        </>
      )}

      <hr className="my-5" />

      <h2 className="mb-3">
        My Orders
      </h2>

      {ordersLoading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="alert alert-secondary">
          You have no orders.
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total Amount (₹)</th>
              <th>Ordered At</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>

                <td>
                  <span
                    className={`badge ${
                      order.status ===
                      'Delivered'
                        ? 'bg-success'
                        : order.status ===
                          'Cancelled'
                        ? 'bg-danger'
                        : 'bg-warning text-dark'
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td>
                  ₹
                  {
                    order.total_amount
                  }
                </td>

                <td>
                  {new Date(
                    order.ordered_at
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}