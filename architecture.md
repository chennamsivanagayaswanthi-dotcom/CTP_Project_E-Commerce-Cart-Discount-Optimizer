# System Architecture

## Layers

### Presentation Layer

Flask + HTML + CSS + JavaScript

Responsible for:

- displaying cart information
- displaying discount information
- showing optimization results

### Service Layer

CheckoutService

Responsible for:

- coordinating checkout
- connecting cart data with the optimizer

### Optimization Layer

DiscountOptimizer

Responsible for:

- eligibility filtering
- constraint checking
- subset dynamic programming
- finding optimal discount combination

### Model Layer

Product
Cart
Discount

Responsible for representing domain data.

## Flow

User
  |
  v
Web Interface
  |
  v
Flask API
  |
  v
CheckoutService
  |
  v
DiscountOptimizer
  |
  v
Dynamic Programming
  |
  v
OptimizationResult
  |
  v
Web Interface