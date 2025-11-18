🔹 Authentication APIs

POST /auth/signup → Register a new user (for students/customers).

POST /auth/login → Login, get JWT token.

POST /auth/logout → Logout.

(For owner, you can hardcode one admin account or give special role: "admin" in DB.)

🔹 Product APIs (for menu items)

GET /products → Get list of available items (students see this to order).

GET /products/:id → Get details of one product.

POST /products (admin only) → Add new product.

PUT /products/:id (admin only) → Update product details.

DELETE /products/:id (admin only) → Remove product.

🔹 Cart APIs (per user)

POST /cart → Add item to user’s cart.

{ "productId": 123, "quantity": 2 }


GET /cart → Get all items in user’s cart.

PUT /cart/:itemId → Update quantity.

DELETE /cart/:itemId → Remove an item from cart.

DELETE /cart/clear → Empty the cart.

🔹 Order APIs

POST /orders → Place order from cart.
(System copies cart items into an order and clears cart.)

GET /orders (user) → Get user’s own orders.

GET /orders/:id (user) → Get details of one order.

GET /admin/orders (admin) → See all orders from all users.

PUT /admin/orders/:id/accept → Accept order.

PUT /admin/orders/:id/reject → Reject order.

Order schema might look like:

{
  "orderId": 1,
  "userId": 101,
  "items": [
    { "productId": 123, "name": "Burger", "quantity": 2, "price": 50 }
  ],
  "totalAmount": 100,
  "status": "pending" // can be "pending", "accepted", "rejected"
}

🔹 Optional APIs

GET /profile → Get user profile.

PUT /profile → Update profile.

GET /analytics (admin only) → Total orders, sales, etc.

📌 Backend Tech Stack Suggestion

Node.js + Express.js (for APIs).

JWT Authentication (for login security).

MongoDB / MySQL (for storing users, products, orders).

👉 So in short:

Users → use auth, products, cart, and orders.

Admin/Owner → use products (CRUD) + admin/orders (accept/reject).