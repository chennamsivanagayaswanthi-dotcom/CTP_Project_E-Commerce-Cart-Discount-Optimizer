from dataclasses import dataclass, field

from app.models.product import Product


@dataclass
class Cart:
    """Represents a customer's shopping cart."""

    items: list[Product] = field(default_factory=list)

    def add_product(self, product: Product) -> None:
        """Add a product to the cart."""
        self.items.append(product)

    def remove_product(self, product_id: int) -> None:
        """Remove a product using its ID."""
        self.items = [
            item
            for item in self.items
            if item.product_id != product_id
        ]

    @property
    def total_price(self) -> float:
        """Calculate the total cart value."""
        return round(
            sum(item.total_price for item in self.items),
            2,
        )

    def categories(self) -> set[str]:
        """Return all product categories in the cart."""
        return {item.category for item in self.items}

    def is_empty(self) -> bool:
        """Return True if the cart has no products."""
        return not self.items