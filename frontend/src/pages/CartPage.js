import React, { useState, useEffect } from 'react';

function CartPage() {
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || {};
    setCartItems(storedCart);
  }, []);

  const handleCheckout = () => {
    alert('Proceeding to checkout!');
    // Later you can redirect to payment page
  };

  const totalItems = Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Your Cart</h2>

      {totalItems > 0 ? (
        <>
          <ul className="list-group mb-4">
            {Object.entries(cartItems).map(([productName, quantity]) => (
              <li key={productName} className="list-group-item d-flex justify-content-between align-items-center">
                {productName}
                <span className="badge bg-primary rounded-pill">{quantity}</span>
              </li>
            ))}
          </ul>

          <div className="text-center">
            <button className="btn btn-success fw-bold" onClick={handleCheckout}>
              💳 Checkout
            </button>
          </div>
        </>
      ) : (
        <p className="text-center">Your cart is empty.</p>
      )}
    </div>
  );
}

export default CartPage;
