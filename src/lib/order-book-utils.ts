// Order book utility functions for finding nearest items and positions

export type OrderBookEntry = [price: number, quantity: number];

/**
 * Find the nearest order book entry to a specific price
 * @param orders Array of order book entries [price, quantity]
 * @param targetPrice The price to search for
 * @returns Object containing the nearest entry, its index, and distance from target
 */
export function findNearestOrder(
	orders: OrderBookEntry[],
	targetPrice: number
): { entry: OrderBookEntry; index: number; distance: number } | null {
	if (orders.length === 0) return null;

	let nearestIndex = 0;
	let minDistance = Math.abs(orders[0][0] - targetPrice);

	for (let i = 1; i < orders.length; i++) {
		const distance = Math.abs(orders[i][0] - targetPrice);
		if (distance < minDistance) {
			minDistance = distance;
			nearestIndex = i;
		}
	}

	return {
		entry: orders[nearestIndex],
		index: nearestIndex,
		distance: minDistance,
	};
}

/**
 * Calculate position as percentage (0-1) within the order book
 * @param orders Array of order book entries
 * @param targetPrice The price to find position for
 * @returns Position as a number between 0 and 1
 */
export function calculatePosition(orders: OrderBookEntry[], targetPrice: number): number {
	if (orders.length === 0) return 0;
	if (orders.length === 1) return 0.5;

	const nearest = findNearestOrder(orders, targetPrice);
	if (!nearest) return 0;

	// Calculate position as percentage of the list
	return nearest.index / (orders.length - 1);
}

/**
 * Get the price range (min/max) from order book entries
 * @param orders Array of order book entries
 * @returns Object with min and max prices
 */
export function getPriceRange(orders: OrderBookEntry[]): { min: number; max: number } | null {
	if (orders.length === 0) return null;

	const prices = orders.map(([price]) => price);
	return {
		min: Math.min(...prices),
		max: Math.max(...prices),
	};
}

/**
 * Main utility function to find nearest item and position
 * @param orders Array of order book entries
 * @param targetPrice The price to search for
 * @returns Object containing nearest entry, index, position, and price range
 */
export function findNearestItemAndPosition(
	orders: OrderBookEntry[],
	targetPrice: number
): {
	nearest: OrderBookEntry | null;
	index: number;
	position: number;
	priceRange: { min: number; max: number } | null;
} {
	const nearest = findNearestOrder(orders, targetPrice);
	const position = calculatePosition(orders, targetPrice);
	const priceRange = getPriceRange(orders);

	return {
		nearest: nearest?.entry || null,
		index: nearest?.index || 0,
		position,
		priceRange,
	};
}
