import pytest

from app.models.product import Product


def test_product_total_price():
    product = Product(
        product_id=101,
        name="Wireless Mouse",
        category="Electronics",
        price=1000,
        quantity=2,
    )

    assert product.total_price == 2000


def test_product_default_quantity():
    product = Product(
        product_id=101,
        name="Mouse",
        category="Electronics",
        price=1000,
    )

    assert product.quantity == 1


def test_negative_price_is_rejected():
    with pytest.raises(ValueError):
        Product(
            product_id=1,
            name="Invalid",
            category="Test",
            price=-100,
        )


def test_zero_quantity_is_rejected():
    with pytest.raises(ValueError):
        Product(
            product_id=1,
            name="Invalid",
            category="Test",
            price=100,
            quantity=0,
        )