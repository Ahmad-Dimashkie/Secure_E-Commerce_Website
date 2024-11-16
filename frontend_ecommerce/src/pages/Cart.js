// Cart.js
import React, { useState } from 'react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Product 1', price: 100, quantity: 1 },
    { id: 2, name: 'Product 2', price: 150, quantity: 2 },
  ]);

  const handleQuantityChange = (id, change) => {
    setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: item.quantity + change } : item));
  };

  return (
    <div>
      <h1>Your Cart</h1>
      <ul>
        {cartItems.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price} x {item.quantity}
            <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
            <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
          </li>
        ))}
      </ul>
      <h2>Total: ${cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)}</h2>
      <button>Proceed to Checkout</button>
    </div>
  );
};

export default Cart;
