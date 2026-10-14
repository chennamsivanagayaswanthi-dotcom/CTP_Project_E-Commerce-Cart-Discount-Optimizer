from app.models.cart import Cart
from app.models.product import Product


def test_add_product_to_cart():
    cart = Cart()

    product = Product(
        product_id=101,
        name="Wireless Mouse",
        category="Electronics",
        price=1000,
        quantity=2,
    )

    cart.add_product(product)

    assert len(cart.items) == 1
    assert cart.total_price == 2000


def test_cart_with_multiple_products():
    cart = Cart()

    laptop = Product(
        product_id=1,
        name="Laptop",
        category="Electronics",
        price=60000,
    )

    mouse = Product(
        product_id=2,
        name="Mouse",
        category="Electronics",
        price=2000,
        quantity=2,
    )

    cart.add_product(laptop)
    cart.add_product(mouse)

    assert cart.total_price == 64000


def test_remove_product():
    cart = Cart()

    product = Product(
        product_id=1,
        name="Laptop",
        category="Electronics",
        price=60000,
    )

    cart.add_product(product)

    cart.remove_product(1)

    assert cart.is_empty()


def test_cart_categories():
    cart = Cart()

    cart.add_product(
        Product(
            product_id=1,
            name="Laptop",
            category="Electronics",
            price=60000,
        )
    )

    cart.add_product(
        Product(
            product_id=2,
            name="Shoes",
            category="Fashion",
            price=3000,
        )
    )

    assert cart.categories() == {
        "Electronics",
        "Fashion",
    }