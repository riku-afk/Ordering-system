Ordering System — Project Context
1. Project Overview
We are building a small full-stack restaurant ordering system as a portfolio project.

The goal is NOT to build a production-scale food delivery platform. The goal is to create a relatively small but polished application that demonstrates good full-stack engineering practices and can be showcased in a developer portfolio.

The project should demonstrate:

Java and Spring Boot backend development
REST API design
PostgreSQL database design
JPA/Hibernate
Authentication and authorization
JWT-based security
React/Next.js frontend development
TypeScript
State management and server-state handling
Form validation
Transactional business logic
Automated testing
Docker-based local development
Clean architecture and separation of concerns
Good UI/UX
API documentation
The application represents a fictional restaurant where customers can browse products, manage a cart, place orders, and view their order history.

Administrators can manage products and process customer orders.

2. Important Development Philosophy
This is primarily a portfolio project.

Prefer:

Simple solutions over unnecessary complexity
Clean architecture over premature abstractions
Maintainability over cleverness
Explicit code over magic
A small number of well-implemented features over many incomplete features
Production-like practices where they provide educational value
Do NOT introduce unnecessary enterprise complexity.

Do not create microservices.

Do not create event-driven architecture unless there is a strong reason.

Do not add Redis, Kafka, Kubernetes, Elasticsearch, or other infrastructure unless explicitly requested.

The application should initially be a modular monolith.

3. Current Scope
The MVP consists of:

Customer Features
Register
Login
Browse products
View product details
Search products
Filter products by category
Add products to cart
Update cart quantities
Remove products from cart
Checkout
Place an order
View order history
View order details
Admin Features
Login
View dashboard
Create products
Edit products
Deactivate products
View orders
Update order status
4. Features Explicitly Out of Scope for MVP
Do NOT implement these unless explicitly requested:

Online payment processing
Real payment gateways
Delivery tracking
Maps
Driver management
Multiple restaurants
Restaurant/vendor accounts
Coupons
Loyalty points
Product reviews
Ratings
Recommendations
Real-time chat
Push notifications
Email notifications
Advanced inventory management
AI features
Microservices
Kubernetes
Complex analytics
These may be considered future enhancements after the MVP is complete.

5. Technology Stack
Backend
Use:

Java
Spring Boot
Spring Web
Spring Data JPA
Hibernate
Spring Security
JWT
PostgreSQL
Flyway
Bean Validation
JUnit
Mockito
OpenAPI/Swagger
Use Maven as the build tool.

Prefer current stable versions compatible with each other.

Before introducing a major dependency, consider whether it is actually necessary.

6. Frontend
Use:

Next.js
React
TypeScript
Tailwind CSS
TanStack Query
React Hook Form
Zod
The frontend should be responsive and modern.

Prefer server-side rendering/server components where they make sense in Next.js, but do not force server components when client-side interactivity is required.

Keep client components focused and avoid turning the entire application into a client-rendered application unnecessarily.

7. Architecture
The backend should be a modular monolith.

Recommended package structure:

backend/src/main/java/com/example/ordering/

auth/
user/
product/
category/
order/
security/
common/

Each domain should contain its own relevant:

entities
repositories
services
controllers
DTOs
validation
exceptions
Avoid putting all controllers, services, and repositories into global folders such as:

controller/
service/
repository/
entity/

Prefer feature/domain-oriented organization.

8. Backend Layer Responsibilities
Controller
Controllers should:

Handle HTTP requests
Validate request DTOs
Delegate business logic to services
Return appropriate HTTP responses
Controllers should NOT contain business logic.

Service
Services should:

Contain business logic
Coordinate repositories
Perform validation that depends on business rules
Manage transactions where appropriate
Repository
Repositories should:

Handle persistence
Use Spring Data JPA where appropriate
Avoid business logic
DTOs
Do not expose JPA entities directly through the REST API unless there is a very strong reason.

Use request/response DTOs.

For example:

CreateProductRequest
UpdateProductRequest
ProductResponse

9. Database Model
The initial database should contain these tables:

users
categories
products
orders
order_items

users
Fields:

id
name
email
password
role
created_at

Roles:

CUSTOMER
ADMIN

Email should be unique.

Passwords must never be stored in plaintext.

Passwords must be hashed using a secure password encoder.

categories
Fields:

id
name

Category names should be unique.

products
Fields:

id
category_id
name
description
price
image_url
available
created_at
updated_at

A product belongs to a category.

available determines whether customers can currently order the product.

For the MVP, deactivating a product is preferable to physically deleting products that may already appear in historical orders.

orders
Fields:

id
user_id
status
total_amount
created_at
updated_at

Order statuses:

PENDING
CONFIRMED
PREPARING
READY
COMPLETED
CANCELLED

order_items
Fields:

id
order_id
product_id
quantity
unit_price

unit_price represents the product price at the time the order was placed.

This is important.

If a product currently costs ₱200 but previously cost ₱180, an old order must still display the original ₱180 price.

Do not calculate historical order prices using the current product price.

10. Order Creation
Order creation is one of the most important business operations in the application.

It should be transactional.

Conceptually:

@Transactional
public Order createOrder(...) {
    // validate request

    // retrieve products

    // verify products are available

    // calculate prices

    // create order

    // create order items

    // calculate total

    // save order

    // return order
}

If order creation fails, the database should not contain a partially-created order.

Never trust prices supplied by the frontend.

The backend must retrieve the current product prices from the database and calculate the order total itself.

11. REST API
Initial API design:

Authentication
POST /api/auth/register
POST /api/auth/login

Products
GET    /api/products
GET    /api/products/{id}

POST   /api/products
PUT    /api/products/{id}
PATCH  /api/products/{id}/availability

Admin-only operations should require ADMIN authorization.

Categories
GET    /api/categories

POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}

Admin-only operations should require ADMIN authorization.

Orders
POST  /api/orders
GET   /api/orders
GET   /api/orders/{id}

PATCH /api/orders/{id}/status

Customers should only be able to access their own orders.

Admins can access orders across the system.

12. Product API Requirements
Product listing should eventually support:

GET /api/products?page=0&size=12

and optionally:

GET /api/products?search=burger
GET /api/products?category=1
GET /api/products?available=true

Do not over-engineer filtering initially.

Start with simple functionality and add pagination/search/filtering incrementally.

13. Authentication and Authorization
Use Spring Security.

Authentication should use JWT.

There are two roles:

CUSTOMER
ADMIN

Customers can:

Browse products
Manage their cart
Create orders
View their own orders
Admins can:

Manage products
Manage categories
View all orders
Update order statuses
View dashboard information
Never rely on frontend role checks for actual authorization.

The backend must enforce authorization.

Frontend checks are only for UI purposes.

14. Security Requirements
Never:

Store plaintext passwords
Trust frontend-provided prices
Trust frontend-provided user IDs for ownership
Allow users to access another customer's orders
Rely exclusively on frontend authorization
Commit secrets to Git
Use environment variables for configuration and secrets.

15. Cart
For the MVP, the cart can initially be managed on the frontend.

A database cart is NOT required initially.

The cart should contain enough information to represent:

productId
name
price
image
quantity

However, when checkout occurs, the backend must NOT trust the frontend's price.

The backend should:

Receive product IDs and quantities
Retrieve the products
Verify availability
Retrieve authoritative prices
Calculate the total
Create the order
16. Frontend Pages
Recommended pages:

/

Home page.

/products

Product listing.

/products/[id]

Product details.

/cart

Shopping cart.

/checkout

Checkout.

/orders

Customer order history.

/orders/[id]

Order details.

/login

Login.

/register

Registration.

Admin:

/admin
/admin/products
/admin/orders

17. Frontend UI Principles
The UI should feel like a real modern application.

Prioritize:

Clean typography
Good spacing
Responsive design
Clear hierarchy
Consistent buttons
Loading states
Error states
Empty states
Form validation
Toast notifications where appropriate
Confirmation dialogs for destructive actions
Mobile responsiveness
Do not spend excessive time on elaborate animations.

Good UX is more important than flashy effects.

18. State Management
Use TanStack Query for server state.

Do not unnecessarily duplicate API data in global state.

Use local/component state for UI state when possible.

The cart can use a lightweight client-side state solution or React state initially.

Avoid introducing Redux unless there is a concrete reason.

19. Error Handling
Backend errors should have a consistent structure.

For example:

{
  "status": 404,
  "message": "Product not found",
  "timestamp": "2026-09-04T15:30:00"
}

Use global exception handling with @RestControllerAdvice.

Handle common cases such as:

Resource not found
Invalid request
Validation failure
Unauthorized access
Forbidden access
Business rule violations
Do not expose stack traces or internal implementation details to clients.

20. Validation
Use Bean Validation on backend DTOs.

Examples:

@NotBlank
@Email
@NotNull
@Positive
@Size

Frontend forms should also validate using Zod.

Frontend validation improves UX.

Backend validation remains authoritative.

21. Testing Strategy
Do not try to achieve 100% test coverage.

Prioritize meaningful tests.

Important areas include:

Authentication
Registration succeeds
Duplicate email is rejected
Password is hashed
Login succeeds with correct credentials
Login fails with invalid credentials
Products
Product creation
Product retrieval
Product update
Product availability
Orders
Order creation
Order total calculation
Product availability validation
Invalid quantity handling
Historical price preservation
Customer cannot access another customer's order
Admin can access all orders
Invalid order status transitions if such rules are introduced
Use unit tests for business logic and integration tests for important API/database behavior.

22. Database Migrations
Use Flyway.

Do not rely on Hibernate's automatic schema generation for production-like environments.

Example:

V1__create_users.sql
V2__create_categories.sql
V3__create_products.sql
V4__create_orders.sql
V5__create_order_items.sql

Keep migrations versioned and immutable once committed.

23. Docker
The project should eventually support local development with Docker Compose.

At minimum:

PostgreSQL

should run through Docker Compose.

Eventually the project may support:

docker compose up

to start the development environment.

Do not prematurely containerize everything if doing so slows down initial development.

24. API Documentation
Use OpenAPI/Swagger.

API documentation should describe:

Endpoints
Request bodies
Response bodies
Authentication requirements
Error responses
Keep documentation synchronized with the actual API.

25. Git Practices
Use meaningful commits.

Examples:

feat: add product management API
feat: implement JWT authentication
feat: add shopping cart
feat: implement order creation
feat: add admin order management
test: add order service tests
fix: prevent ordering unavailable products
refactor: extract order pricing logic

Avoid giant commits containing unrelated changes.

26. Development Workflow
Work incrementally.

Before implementing a feature:

Understand the existing code.
Identify affected modules.
Check existing conventions.
Explain the proposed implementation briefly.
Implement the smallest sensible change.
Run relevant tests.
Fix failures.
Review the implementation for unnecessary complexity.
Do not rewrite unrelated code.

Do not introduce architectural changes without a reason.

27. Definition of Done
A feature is not considered complete simply because the code compiles.

Before considering a feature complete:

Backend compiles
Frontend compiles
Relevant tests pass
Validation exists
Error handling exists
Authorization is correct
API behavior is consistent
UI handles loading
UI handles errors
UI handles empty states where appropriate
No obvious security issues were introduced
No unnecessary dependencies were added
28. Portfolio Goal
This project should ultimately demonstrate that the developer can build a complete application rather than simply implement isolated CRUD endpoints.

The final portfolio should be able to demonstrate:

Frontend
    ↓
Next.js / React
    ↓
REST API
    ↓
Spring Boot
    ↓
Spring Security
    ↓
Business Logic
    ↓
JPA / Hibernate
    ↓
PostgreSQL

The application should have a polished customer experience and a functional admin dashboard.

The project should be easy for another developer to understand and run.

29. Future Enhancements
Only consider these after the MVP is stable:

Payment integration
Email notifications
Order notifications
Inventory tracking
Product reviews
Favorites
Discounts
Coupon codes
Advanced analytics
Real-time order updates using WebSockets
Order cancellation rules
Image upload
Cloud deployment
CI/CD pipeline
Future features should not compromise the simplicity of the initial architecture.