# Dynamic Programming Algorithm

## Problem

Given a shopping cart and a set of applicable discounts, find the valid
combination of discounts that minimizes the final payable amount.

## Computational Thinking

### Decomposition

1. Calculate cart total.
2. Identify eligible discounts.
3. Check discount constraints.
4. Generate valid combinations.
5. Calculate final amount.
6. Select the minimum payable amount.

## State Representation

Each subset of discounts is represented using a bitmask.

For n discounts there are:

2^n

possible subsets.

Example for 3 discounts:

000 -> no discount
001 -> discount 1
010 -> discount 2
011 -> discounts 1 and 2
100 -> discount 3
101 -> discounts 1 and 3
110 -> discounts 2 and 3
111 -> all discounts

## Dynamic Programming

The DP table stores the minimum payable amount for every valid subset.

dp[mask] = minimum payable amount for that subset.

The algorithm evaluates transitions by adding one discount at a time.

## Constraints

The algorithm checks:

- minimum cart value
- stackable discounts
- incompatible discounts
- category restrictions
- discount priority

## Complexity

For n eligible discounts:

Time:
O(n^2 * 2^n)

Space:
O(2^n)

The approach is appropriate when the number of available coupons is
relatively small, which is common for a checkout optimization problem.