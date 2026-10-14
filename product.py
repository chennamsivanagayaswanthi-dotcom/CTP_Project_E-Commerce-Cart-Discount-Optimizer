from dataclasses import dataclass


@dataclass(frozen=True)
class Product:
    """Represents a product in the shopping cart."""

    product_id: int
    name: str
    category: str
    price: float
    quantity: int = 1

    def __post_init__(self) -> None:
        if self.price < 0:
            raise ValueError("Product price cannot be negative.")

        if self.quantity <= 0:
            raise ValueError("Product quantity must be greater than zero.")

    @property
    def total_price(self) -> float:
        """Return the total price for this product."""
        return round(self.price * self.quantity, 2)