from app.models.discount import (
    Discount,
    DiscountType,
)
from app.optimizer.dp_optimizer import (
    DiscountOptimizer,
)


def test_get_eligible_discounts():
    discounts = [
        Discount(
            code="SAVE10",
            name="10% Off",
            discount_type=DiscountType.PERCENTAGE,
            value=10,
            minimum_cart_value=5000,
        ),
        Discount(
            code="FLAT5000",
            name="₹5000 Off",
            discount_type=DiscountType.FIXED,
            value=5000,
            minimum_cart_value=50000,
        ),
    ]

    optimizer = DiscountOptimizer(discounts)

    eligible = optimizer.get_eligible_discounts(
        60000
    )

    assert len(eligible) == 2


def test_ineligible_discount_is_removed():
    discounts = [
        Discount(
            code="SAVE10",
            name="10% Off",
            discount_type=DiscountType.PERCENTAGE,
            value=10,
            minimum_cart_value=5000,
        ),
        Discount(
            code="FLAT5000",
            name="₹5000 Off",
            discount_type=DiscountType.FIXED,
            value=5000,
            minimum_cart_value=50000,
        ),
    ]

    optimizer = DiscountOptimizer(discounts)

    eligible = optimizer.get_eligible_discounts(
        7000
    )

    assert len(eligible) == 1
    assert eligible[0].code == "SAVE10"


def test_optimizer_finds_best_combination():
    discounts = [
        Discount(
            code="SAVE10",
            name="10% Off",
            discount_type=DiscountType.PERCENTAGE,
            value=10,
            minimum_cart_value=5000,
            priority=1,
        ),
        Discount(
            code="FLAT2000",
            name="₹2000 Off",
            discount_type=DiscountType.FIXED,
            value=2000,
            minimum_cart_value=10000,
            priority=2,
        ),
    ]

    optimizer = DiscountOptimizer(discounts)

    result = optimizer.optimize(20000)

    assert result.total_savings == 4000
    assert result.final_amount == 16000


def test_optimizer_returns_selected_codes():
    discounts = [
        Discount(
            code="SAVE10",
            name="10% Off",
            discount_type=DiscountType.PERCENTAGE,
            value=10,
            minimum_cart_value=5000,
            priority=1,
        ),
        Discount(
            code="FLAT2000",
            name="₹2000 Off",
            discount_type=DiscountType.FIXED,
            value=2000,
            minimum_cart_value=10000,
            priority=2,
        ),
    ]

    optimizer = DiscountOptimizer(discounts)

    result = optimizer.optimize(20000)

    assert "SAVE10" in result.selected_codes
    assert "FLAT2000" in result.selected_codes


def test_non_stackable_discount():
    discounts = [
        Discount(
            code="SAVE10",
            name="10% Off",
            discount_type=DiscountType.PERCENTAGE,
            value=10,
            minimum_cart_value=5000,
        ),
        Discount(
            code="FLAT5000",
            name="₹5000 Off",
            discount_type=DiscountType.FIXED,
            value=5000,
            minimum_cart_value=50000,
            stackable=False,
        ),
    ]

    optimizer = DiscountOptimizer(discounts)

    result = optimizer.optimize(60000)

    assert not (
        "SAVE10" in result.selected_codes
        and "FLAT5000" in result.selected_codes
    )


def test_incompatible_discounts():
    save10 = Discount(
        code="SAVE10",
        name="10% Off",
        discount_type=DiscountType.PERCENTAGE,
        value=10,
        incompatible_with=frozenset(
            {"FLAT5000"}
        ),
    )

    flat5000 = Discount(
        code="FLAT5000",
        name="₹5000 Off",
        discount_type=DiscountType.FIXED,
        value=5000,
        incompatible_with=frozenset(
            {"SAVE10"}
        ),
    )

    optimizer = DiscountOptimizer(
        [save10, flat5000]
    )

    result = optimizer.optimize(60000)

    assert not (
        "SAVE10" in result.selected_codes
        and "FLAT5000" in result.selected_codes
    )


def test_no_eligible_discount():
    discount = Discount(
        code="SAVE10",
        name="10% Off",
        discount_type=DiscountType.PERCENTAGE,
        value=10,
        minimum_cart_value=10000,
    )

    optimizer = DiscountOptimizer(
        [discount]
    )

    result = optimizer.optimize(5000)

    assert result.selected_codes == []
    assert result.total_savings == 0
    assert result.final_amount == 5000


def test_category_specific_discount():
    discount = Discount(
        code="ELEC15",
        name="Electronics 15%",
        discount_type=DiscountType.PERCENTAGE,
        value=15,
        eligible_categories=frozenset(
            {"Electronics"}
        ),
    )

    optimizer = DiscountOptimizer(
        [discount]
    )

    result = optimizer.optimize(
        10000,
        {"Electronics"},
    )

    assert result.selected_codes == [
        "ELEC15"
    ]
    assert result.total_savings == 1500