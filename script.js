// =========================================================
// GLOBAL APPLICATION STATE
// =========================================================

let products = [];

let discounts = [];

let cart = {};

let selectedCoupons = new Set();


// =========================================================
// APPLICATION START
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadProducts();

        await loadDiscounts();

        renderCart();

        updateCartCount();
    }
);


// =========================================================
// LOAD PRODUCTS
// =========================================================

async function loadProducts() {

    try {

        const response =
            await fetch("/api/products");

        if (!response.ok) {

            throw new Error(
                "Unable to load products."
            );
        }

        products =
            await response.json();

        renderProducts();

    } catch (error) {

        showProductError(
            error.message
        );
    }
}


// =========================================================
// LOAD DISCOUNTS
// =========================================================

async function loadDiscounts() {

    try {

        const response =
            await fetch("/api/discounts");

        if (!response.ok) {

            throw new Error(
                "Unable to load discounts."
            );
        }

        discounts =
            await response.json();

        renderCoupons();

    } catch (error) {

        document.getElementById(
            "couponGrid"
        ).innerHTML = `
            <p>
                Unable to load offers:
                ${escapeHtml(
                    error.message
                )}
            </p>
        `;
    }
}


// =========================================================
// RENDER PRODUCTS
// =========================================================

function renderProducts(
    filteredProducts = products
) {

    const productGrid =
        document.getElementById(
            "productGrid"
        );

    if (
        filteredProducts.length === 0
    ) {

        productGrid.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🔍
                </div>

                <h3>
                    No products found
                </h3>

                <p>
                    Try another search.
                </p>

            </div>
        `;

        return;
    }


    productGrid.innerHTML =
        filteredProducts
            .map(
                product => `

                    <article
                        class="product-card"
                    >

                        <div
                            class="product-image"
                        >
                            ${product.emoji}
                        </div>

                        <span
                            class="product-category"
                        >
                            ${escapeHtml(
                                product.category
                            )}
                        </span>

                        <h3>
                            ${escapeHtml(
                                product.name
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                product.description
                            )}
                        </p>

                        <div
                            class="product-bottom"
                        >

                            <span
                                class="product-price"
                            >
                                ${formatCurrency(
                                    product.price
                                )}
                            </span>

                            <button
                                class="add-button"
                                onclick="
                                    addToCart(
                                        ${product.product_id}
                                    )
                                "
                            >
                                + Add
                            </button>

                        </div>

                    </article>

                `
            )
            .join("");
}


// =========================================================
// SEARCH AND CATEGORY FILTER
// =========================================================

function filterProducts() {

    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase()
            .trim();


    const category =
        document.getElementById(
            "categoryFilter"
        ).value;


    const filteredProducts =
        products.filter(
            product => {

                const matchesSearch =
                    product.name
                        .toLowerCase()
                        .includes(search);


                const matchesCategory =
                    category === "All"
                    ||
                    product.category === category;


                return (
                    matchesSearch
                    &&
                    matchesCategory
                );
            }
        );


    renderProducts(
        filteredProducts
    );
}


// =========================================================
// ADD PRODUCT
// =========================================================

function addToCart(
    productId
) {

    if (!cart[productId]) {

        cart[productId] = 1;

    } else {

        cart[productId] += 1;
    }


    renderCart();

    updateCartCount();

    renderCoupons();

    showCartAnimation();
}


// =========================================================
// CHANGE QUANTITY
// =========================================================

function changeQuantity(
    productId,
    change
) {

    if (!cart[productId]) {
        return;
    }


    cart[productId] += change;


    if (
        cart[productId] <= 0
    ) {

        delete cart[productId];
    }


    renderCart();

    updateCartCount();

    renderCoupons();
}


// =========================================================
// REMOVE PRODUCT
// =========================================================

function removeFromCart(
    productId
) {

    delete cart[productId];

    renderCart();

    updateCartCount();

    renderCoupons();
}


// =========================================================
// GET CART TOTAL
// =========================================================

function getCartTotal() {

    return Object.entries(cart)
        .reduce(
            (
                total,
                [
                    productId,
                    quantity
                ]
            ) => {

                const product =
                    products.find(
                        item =>
                            item.product_id ===
                            Number(productId)
                    );


                if (!product) {
                    return total;
                }


                return (
                    total
                    +
                    product.price * quantity
                );
            },
            0
        );
}


// =========================================================
// GET CART CATEGORIES
// =========================================================

function getCartCategories() {

    const categories =
        new Set();


    Object.keys(cart).forEach(
        productId => {

            const product =
                products.find(
                    item =>
                        item.product_id ===
                        Number(productId)
                );


            if (product) {

                categories.add(
                    product.category
                );
            }
        }
    );


    return categories;
}


// =========================================================
// RENDER CART
// =========================================================

function renderCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );


    const total =
        getCartTotal();


    if (
        Object.keys(cart).length === 0
    ) {

        container.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some products to
                    start shopping.
                </p>

            </div>
        `;


        document.getElementById(
            "cartTotal"
        ).textContent =
            formatCurrency(0);

        return;
    }


    container.innerHTML =
        Object.entries(cart)
            .map(
                (
                    [
                        productId,
                        quantity
                    ]
                ) => {

                    const product =
                        products.find(
                            item =>
                                item.product_id ===
                                Number(productId)
                        );


                    if (!product) {
                        return "";
                    }


                    const itemTotal =
                        product.price *
                        quantity;


                    return `

                        <div
                            class="cart-item"
                        >

                            <div
                                class="cart-item-icon"
                            >
                                ${product.emoji}
                            </div>


                            <div
                                class="cart-item-info"
                            >

                                <h3>
                                    ${escapeHtml(
                                        product.name
                                    )}
                                </h3>

                                <span>
                                    ${escapeHtml(
                                        product.category
                                    )}

                                    •

                                    ${formatCurrency(
                                        product.price
                                    )}
                                </span>

                            </div>


                            <div
                                class="quantity-control"
                            >

                                <button
                                    onclick="
                                        changeQuantity(
                                            ${product.product_id},
                                            -1
                                        )
                                    "
                                >
                                    −
                                </button>


                                <strong>
                                    ${quantity}
                                </strong>


                                <button
                                    onclick="
                                        changeQuantity(
                                            ${product.product_id},
                                            1
                                        )
                                    "
                                >
                                    +
                                </button>

                            </div>


                            <div
                                class="cart-item-total"
                            >
                                ${formatCurrency(
                                    itemTotal
                                )}
                            </div>


                            <button
                                class="remove-item"
                                onclick="
                                    removeFromCart(
                                        ${product.product_id}
                                    )
                                "
                                title="Remove"
                            >
                                ✕
                            </button>

                        </div>
                    `;
                }
            )
            .join("");


    document.getElementById(
        "cartTotal"
    ).textContent =
        formatCurrency(total);
}


// =========================================================
// UPDATE CART BADGE
// =========================================================

function updateCartCount() {

    const count =
        Object.values(cart)
            .reduce(
                (
                    total,
                    quantity
                ) =>
                    total + quantity,
                0
            );


    document.getElementById(
        "cartCount"
    ).textContent = count;
}


// =========================================================
// RENDER COUPONS
// =========================================================

function renderCoupons() {

    const couponGrid =
        document.getElementById(
            "couponGrid"
        );


    if (!couponGrid) {
        return;
    }


    const cartTotal =
        getCartTotal();


    const categories =
        getCartCategories();


    couponGrid.innerHTML =
        discounts
            .map(
                discount => {

                    const eligible =
                        isCouponEligible(
                            discount,
                            cartTotal,
                            categories
                        );


                    const selected =
                        selectedCoupons.has(
                            discount.code
                        );


                    const categoryText =
                        discount
                            .eligible_categories
                            .length > 0
                            ? discount
                                .eligible_categories
                                .join(", ")
                            : "All products";


                    return `

                        <div
                            class="
                                coupon-card
                                ${selected
                                    ? "selected"
                                    : ""}
                                ${!eligible
                                    ? "disabled"
                                    : ""}
                            "
                            onclick="
                                toggleCoupon(
                                    '${discount.code}',
                                    ${eligible}
                                )
                            "
                        >

                            <div
                                class="coupon-top"
                            >

                                <span
                                    class="coupon-code"
                                >
                                    🏷️
                                    ${escapeHtml(
                                        discount.code
                                    )}
                                </span>


                                <span
                                    class="coupon-check"
                                >

                                    ${
                                        selected
                                            ? "✓"
                                            : ""
                                    }

                                </span>

                            </div>


                            <div
                                class="coupon-name"
                            >
                                ${escapeHtml(
                                    discount.name
                                )}
                            </div>


                            <div
                                class="
                                    coupon-description
                                "
                            >

                                ${
                                    discount.type ===
                                    "percentage"

                                        ? `Save ${
                                            discount.value
                                        }% on your order`

                                        : `Save ${
                                            formatCurrency(
                                                discount.value
                                            )
                                        } on your order`
                                }

                            </div>


                            <div
                                class="coupon-rules"
                            >

                                <span
                                    class="coupon-rule"
                                >
                                    Minimum:
                                    ${formatCurrency(
                                        discount
                                            .minimum_cart_value
                                    )}
                                </span>


                                ${
                                    discount.stackable

                                        ? `
                                            <span
                                                class="
                                                    coupon-rule
                                                    success
                                                "
                                            >
                                                ✓ Stackable
                                            </span>
                                        `

                                        : `
                                            <span
                                                class="
                                                    coupon-rule
                                                    warning
                                                "
                                            >
                                                ✕ Cannot combine
                                            </span>
                                        `
                                }


                                ${
                                    discount
                                        .eligible_categories
                                        .length > 0

                                        ? `
                                            <span
                                                class="
                                                    coupon-rule
                                                "
                                            >
                                                ${escapeHtml(
                                                    categoryText
                                                )}
                                            </span>
                                        `

                                        : ""
                                }


                                ${
                                    !eligible

                                        ? `
                                            <span
                                                class="
                                                    coupon-rule
                                                    warning
                                                "
                                            >
                                                Not eligible
                                            </span>
                                        `

                                        : ""
                                }

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


// =========================================================
// CHECK COUPON ELIGIBILITY
// =========================================================

function isCouponEligible(
    discount,
    cartTotal,
    categories
) {

    if (
        cartTotal <
        discount.minimum_cart_value
    ) {

        return false;
    }


    if (
        discount
            .eligible_categories
            .length === 0
    ) {

        return true;
    }


    return discount
        .eligible_categories
        .some(
            category =>
                categories.has(category)
        );
}


// =========================================================
// TOGGLE COUPON
// =========================================================

function toggleCoupon(
    code,
    eligible
) {

    if (!eligible) {
        return;
    }


    if (
        selectedCoupons.has(code)
    ) {

        selectedCoupons.delete(code);

    } else {

        selectedCoupons.add(code);
    }


    renderCoupons();
}


// =========================================================
// OPTIMIZE CART
// =========================================================

async function optimizeCart() {

    if (
        Object.keys(cart).length === 0
    ) {

        showResultError(
            "Please add at least one product to your cart."
        );

        return;
    }


    const productsPayload =
        Object.entries(cart)
            .map(
                (
                    [
                        productId,
                        quantity
                    ]
                ) => ({

                    product_id:
                        Number(productId),

                    quantity:
                        quantity
                })
            );


    const selectedDiscounts =
        Array.from(
            selectedCoupons
        );


    const resultSection =
        document.getElementById(
            "resultSection"
        );


    const resultContent =
        document.getElementById(
            "resultContent"
        );


    resultSection.scrollIntoView({
        behavior: "smooth"
    });


    resultContent.innerHTML = `

        <div
            class="result-placeholder"
        >

            <div>
                🧠
            </div>

            <h3>
                Finding your best deal...
            </h3>

            <p>
                Dynamic Programming is checking
                the valid discount combinations.
            </p>

        </div>
    `;


    try {

        const response =
            await fetch(
                "/api/optimize",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                products:
                                    productsPayload,

                                discounts:
                                    selectedDiscounts
                            }
                        )
                }
            );


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            const text =
                await response.text();

            throw new Error(
                "Server returned an unexpected response."
                +
                text.substring(
                    0,
                    150
                )
            );
        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Optimization failed."
            );
        }


        showResult(data);

    } catch (error) {

        showResultError(
            error.message
        );
    }
}


// =========================================================
// SHOW OPTIMIZATION RESULT
// =========================================================

function showResult(data) {

    const resultContent =
        document.getElementById(
            "resultContent"
        );


    let discountsHtml;


    if (
        data.selected_codes.length === 0
    ) {

        discountsHtml = `
            <p class="no-discount">
                No discount was selected.
            </p>
        `;

    } else {

        discountsHtml =
            data.selected_details
                .map(
                    discount => `

                        <div
                            class="discount-result"
                        >

                            <span>
                                ✓
                                ${escapeHtml(
                                    discount.code
                                )}
                            </span>

                            <strong>
                                ${escapeHtml(
                                    discount.name
                                )}
                            </strong>

                        </div>
                    `
                )
                .join("");
    }


    resultContent.innerHTML = `

        <div
            class="result-box"
        >

            <div
                class="result-main"
            >

                <small>
                    FINAL AMOUNT
                </small>

                <div
                    class="final-price"
                >
                    ${formatCurrency(
                        data.final_amount
                    )}
                </div>

                <div
                    class="savings"
                >

                    🎉 You saved
                    ${formatCurrency(
                        data.total_savings
                    )}

                </div>

                <br>

                <small>
                    Original cart:
                    ${formatCurrency(
                        data.cart_total
                    )}
                </small>

            </div>


            <div
                class="result-details"
            >

                <h3>
                    ✨ Best Discount Combination
                </h3>

                ${discountsHtml}

                <br>


                <div
                    class="discount-result"
                >

                    <span>
                        Cart Total
                    </span>

                    <strong>
                        ${formatCurrency(
                            data.cart_total
                        )}
                    </strong>

                </div>


                <div
                    class="discount-result"
                >

                    <span>
                        Total Savings
                    </span>

                    <strong>
                        ${formatCurrency(
                            data.total_savings
                        )}
                    </strong>

                </div>


                <div
                    class="discount-result"
                >

                    <span>
                        You Pay
                    </span>

                    <strong>
                        ${formatCurrency(
                            data.final_amount
                        )}
                    </strong>

                </div>

            </div>

        </div>
    `;
}


// =========================================================
// RESULT ERROR
// =========================================================

function showResultError(
    message
) {

    const resultContent =
        document.getElementById(
            "resultContent"
        );


    resultContent.innerHTML = `

        <div
            class="result-placeholder"
        >

            <div>
                ⚠️
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHtml(
                    message
                )}
            </p>

        </div>
    `;
}


// =========================================================
// PRODUCT ERROR
// =========================================================

function showProductError(
    message
) {

    document.getElementById(
        "productGrid"
    ).innerHTML = `

        <div
            class="empty-cart"
        >

            <div
                class="empty-cart-icon"
            >
                ⚠️
            </div>

            <h3>
                Unable to load products
            </h3>

            <p>
                ${escapeHtml(
                    message
                )}
            </p>

        </div>
    `;
}


// =========================================================
// NAVIGATION
// =========================================================

function scrollToProducts() {

    document
        .getElementById(
            "productsSection"
        )
        .scrollIntoView({
            behavior: "smooth"
        });
}


function scrollToCart() {

    document
        .getElementById(
            "cartSection"
        )
        .scrollIntoView({
            behavior: "smooth"
        });
}


function goToCoupons() {

    if (
        Object.keys(cart).length === 0
    ) {

        alert(
            "Please add at least one product first."
        );

        return;
    }


    renderCoupons();


    document
        .getElementById(
            "couponSection"
        )
        .scrollIntoView({
            behavior: "smooth"
        });
}


// =========================================================
// CART ANIMATION
// =========================================================

function showCartAnimation() {

    const button =
        document.querySelector(
            ".cart-button"
        );


    if (!button) {
        return;
    }


    button.animate(
        [
            {
                transform:
                    "scale(1)"
            },

            {
                transform:
                    "scale(1.08)"
            },

            {
                transform:
                    "scale(1)"
            }
        ],
        {
            duration: 300
        }
    );
}


// =========================================================
// CURRENCY
// =========================================================

function formatCurrency(
    value
) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",

            currency: "INR",

            maximumFractionDigits: 2
        }
    ).format(value);
}


// =========================================================
// HTML SAFETY
// =========================================================

function escapeHtml(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}