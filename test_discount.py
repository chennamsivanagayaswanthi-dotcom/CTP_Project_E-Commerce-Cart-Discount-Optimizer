import pytest

from app.models.discount import (
    Discount,
    DiscountType,
)


def test_percentage_discount():
    discount = Discount(
        code="SAVE10",
        name="10% Off",
        discount_type=DiscountType.PERCENTAGE,
        value=10,
        minimum_cart_value=5000,
    )

    assert discount.is_eligible(10000)
    assert discount.calculate_savings(10000) == 1000


def test_fixed_discount():
    discount = Discount(
        code="FLAT1000",
        name="₹1000 Off",
        discount_type=DiscountType.FIXED,
        value=1000,
        minimum_cart_value=5000,
    )

    assert discount.calculate_savings(10000) == 1000


def test_discount_not_eligible():
    discount = Discount(
        code="SAVE10",
        name="10% Off",
        discount_type=DiscountType.PERCENTAGE,
        value=10,
        minimum_cart_value=5000,
    )

    assert not discount.is_eligible(3000)
    assert discount.calculate_savings(3000) == 0


def test_maximum_savings():
    discount = Discount(
        code="SAVE50",
        name="50% Off",
        discount_type=DiscountType.PERCENTAGE,
        value=50,
        maximum_savings=1000,
    )

    assert discount.calculate_savings(10000) == 1000


def test_category_restriction():
    discount = Discount(
        code="ELEC15",
        name="Electronics 15%",
        discount_type=DiscountType.PERCENTAGE,
        value=15,
        eligible_categories=frozenset(
            {"Electronics"}
        ),
    )

    assert discount.is_eligible(
        10000,
        {"Electronics"},
    )

    assert not discount.is_eligible(
        10000,
        {"Fashion"},
    )


def test_invalid_percentage():
    with pytest.raises(ValueError):
        Discount(
            code="INVALID",
            name="Invalid",
            discount_type=DiscountType.PERCENTAGE,
            value=150,
        )