from app.models.cart import Cart
from app.models.discount import (
    Discount,
    DiscountType,
)
from app.models.product import Product
from app.services.checkout_service import (
    CheckoutService,
)


def test_checkout_service():
    cart = Cart()

    cart.add_product(
        Product(
            product_id=1,
            name="Laptop",
            category="Electronics",
            price=10000,
        )
    )

    discounts = [
        Discount(
            code="SAVE10",
            name="10% Off",
            discount_type=DiscountType.PERCENTAGE,
            value=10,
        )
    ]

    service = CheckoutService(
        discounts
    )

    result = service.checkout(cart)

    assert result.cart_total == 10000
    assert result.total_savings == 1000
    assert result.final_amount == 9000
    assert result.selected_codes == [
        "SAVE10"
    ]