import time
from concurrent.futures import ProcessPoolExecutor

from app.models.discount import Discount
from app.models.discount import DiscountType

from app.optimizer.dp_optimizer import (
    DiscountOptimizer,
)


def create_discounts(
    count: int,
) -> list[Discount]:
    """Create discounts for benchmarking."""

    discounts = []

    for index in range(count):
        discounts.append(
            Discount(
                code=f"TEST{index}",
                name=f"Test Discount {index}",
                discount_type=(
                    DiscountType.PERCENTAGE
                    if index % 2 == 0
                    else DiscountType.FIXED
                ),
                value=(
                    5
                    if index % 2 == 0
                    else 100
                ),
                minimum_cart_value=1000,
            )
        )

    return discounts


def run_single_benchmark(
    discount_count: int,
) -> float:
    """Measure one optimization run."""

    discounts = create_discounts(
        discount_count
    )

    optimizer = DiscountOptimizer(
        discounts
    )

    start = time.perf_counter()

    optimizer.optimize(50000)

    return time.perf_counter() - start


def run_parallel_benchmark(
    discount_count: int,
    runs: int = 4,
) -> list[float]:
    """
    Run independent CPU-bound benchmark jobs
    using multiple processes.
    """

    with ProcessPoolExecutor() as executor:
        results = list(
            executor.map(
                run_single_benchmark,
                [discount_count] * runs,
            )
        )

    return results


if __name__ == "__main__":

    for count in [4, 6, 8, 10]:

        elapsed = run_single_benchmark(
            count
        )

        print(
            f"{count} discounts: "
            f"{elapsed:.6f} seconds"
        )

    print("\nParallel benchmark:")

    results = run_parallel_benchmark(8)

    for index, elapsed in enumerate(
        results,
        start=1,
    ):
        print(
            f"Run {index}: "
            f"{elapsed:.6f} seconds"
        )