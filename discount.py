from dataclasses import dataclass, field
from enum import Enum


class DiscountType(Enum):
    """Supported discount calculation types."""

    PERCENTAGE = "percentage"
    FIXED = "fixed"


@dataclass(frozen=True)
class Discount:
    """
    Represents a coupon/discount and its business rules.
    """

    code: str
    name: str
    discount_type: DiscountType
    value: float

    minimum_cart_value: float = 0.0
    stackable: bool = True

    incompatible_with: frozenset[str] = field(
        default_factory=frozenset
    )

    eligible_categories: frozenset[str] | None = None

    maximum_savings: float | None = None

    priority: int = 0

    def __post_init__(self) -> None:
        if not self.code:
            raise ValueError("Discount code cannot be empty.")

        if self.value < 0:
            raise ValueError("Discount value cannot be negative.")

        if self.minimum_cart_value < 0:
            raise ValueError(
                "Minimum cart value cannot be negative."
            )

        if (
            self.discount_type == DiscountType.PERCENTAGE
            and self.value > 100
        ):
            raise ValueError(
                "Percentage discount cannot exceed 100%."
            )

        if (
            self.maximum_savings is not None
            and self.maximum_savings < 0
        ):
            raise ValueError(
                "Maximum savings cannot be negative."
            )

    def is_eligible(
        self,
        cart_total: float,
        categories: set[str] | None = None,
    ) -> bool:
        """Check whether the discount is applicable."""

        if cart_total < self.minimum_cart_value:
            return False

        if self.eligible_categories is None:
            return True

        if categories is None:
            return False

        return bool(
            self.eligible_categories.intersection(categories)
        )

    def calculate_savings(
            self,
            current_amount: float,
    ) -> float:
        """Calculate savings from the current cart amount."""

        if current_amount <= 0:
            return 0.0

        if current_amount < self.minimum_cart_value:
            return 0.0

        if self.discount_type == DiscountType.PERCENTAGE:
            savings = current_amount * (
                    self.value / 100
            )
        else:
            savings = self.value

        if self.maximum_savings is not None:
            savings = min(
                savings,
                self.maximum_savings,
            )

        return round(
            min(savings, current_amount),
            2,
        )

    def apply(self, current_amount: float) -> float:
        """Apply the discount and return the new amount."""

        savings = self.calculate_savings(current_amount)

        return round(
            current_amount - savings,
            2,
        )