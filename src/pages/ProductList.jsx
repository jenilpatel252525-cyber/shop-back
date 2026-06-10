import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import api from '../api/api.jsx';

export default function ProductList() {
  const { user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  // Fetch cart and cart items
  const fetchCart = async () => {
    try {
      const cartRes = await api.get('user-cart/');

      setCartId(cartRes.data.id);

      const itemsRes = await api.get(
        `cart-items/?cart=${cartRes.data.id}`
      );

      console.log(itemsRes);
      

      setCartItems(itemsRes.data);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  };

  // Fetch categories
  useEffect(() => {
    api
      .get('categories/')
      .then((res) => setCategories(res.data))
      .catch((err) =>
        console.error('Failed to load categories', err)
      );
  }, []);

  // Fetch products
  useEffect(() => {
    let url = 'products/?';

    if (searchTerm) {
      url += `search=${encodeURIComponent(searchTerm)}&`;
    }

    if (category) {
      url += `category=${category}&`;
    }

    api
      .get(url)
      .then((res) => setProducts(res.data))
      .catch((err) =>
        console.error('Failed to load products', err)
      );
  }, [searchTerm, category]);

  // Fetch cart on page load
  useEffect(() => {
    fetchCart();
  }, []);

  const getCartItem = (productId) => {
    return cartItems.find(
      (item) => item.product.id === productId
    );
  };

  const isInCart = (productId) => {
    return cartItems.some(
      (item) => item.product.id === productId
    );
  };

  const handleAddToCart = async (productId) => {
    try {
      if (isInCart(productId)) {
        alert('Item already in cart');
        return;
      }

      await api.post('cart-items/', {
        cart: cartId,
        product_id: productId,
        quantity: 1,
      });

      await fetchCart();

      alert('Item added to cart!');
    } catch (err) {
      console.error(
        'Error adding item:',
        err.response?.data || err.message
      );

      alert('Failed to add item');
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const cartItem = getCartItem(productId);

      if (!cartItem) return;

      await api.delete(
        `cart-items/${cartItem.id}/`
      );

      await fetchCart();

      alert('Item removed from cart!');
    } catch (err) {
      console.error(
        'Error removing item:',
        err.response?.data || err.message
      );

      alert('Failed to remove item');
    }
  };

  return (
    <div className="container my-4">
      <h2>Products</h2>

      {user && (
        <p>
          Welcome, User {user.user_id}
        </p>
      )}

      {/* Search & Category Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="">
              All Categories
            </option>

            {categories.map((cat) => (
              <option
                key={cat.id}
                value={cat.id}
              >
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="alert alert-info">
        Add products to your cart.
        Quantity can be adjusted later from
        the cart page.
      </div>

      {/* Product Grid */}
      <div className="row">
        {products.length > 0 ? (
          products.map((p) => {
            const productInCart =
              isInCart(p.id);

            return (
              <div
                className="col-md-4"
                key={p.id}
              >
                <div className="card mb-4 shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">
                      {p.name}
                    </h5>

                    <p className="card-text">
                      {p.description}
                    </p>

                    <p>
                      <strong>
                        ₹{p.price}
                      </strong>
                    </p>

                    <p>
                      Available Stock:{' '}
                      {p.stock}
                    </p>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary"
                        disabled={
                          p.stock === 0 ||
                          productInCart
                        }
                        onClick={() =>
                          handleAddToCart(
                            p.id
                          )
                        }
                      >
                        {p.stock === 0
                          ? 'Out of Stock'
                          : productInCart
                          ? 'Already In Cart'
                          : 'Add To Cart'}
                      </button>

                      <button
                        className="btn btn-danger"
                        disabled={
                          !productInCart
                        }
                        onClick={() =>
                          handleRemoveFromCart(
                            p.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <p>No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}