import { useEffect, useCallback, useRef } from "react";
import { useAlertStore } from "@/stores/use-alert-store";
import { formatQuantity } from "@/lib/utils";
import type { DepthLevel } from "@/hooks/use-order-book-stream";

interface WallAlert {
	type: "wall" | "remove";
	message: string;
}

const WALL_THRESHOLD_MULTIPLIER = 3;
const WALL_GROWTH_MULTIPLIER = 3;

export function useWallDetection(bids: DepthLevel[], asks: DepthLevel[]) {
	const lastBidsRef = useRef<Map<string, number>>(new Map());
	const lastAsksRef = useRef<Map<string, number>>(new Map());

	const calculateAverageQuantity = useCallback((orders: DepthLevel[]): number => {
		if (orders.length === 0) return 0;
		const totalQuantity = orders.reduce((sum, [, qty]) => sum + qty, 0);
		return totalQuantity / orders.length;
	}, []);

	const createWallAlert = useCallback(
		(type: "wall" | "remove", side: "Bid" | "Ask", price: string, quantity?: number): WallAlert => {
			if (type === "wall" && quantity) {
				return {
					type: "wall",
					message: `🧱 ${side} Wall at ${price} (${formatQuantity(quantity).short})`,
				};
			}
			return {
				type: "remove",
				message: `❌ ${side} Wall Removed at ${price}`,
			};
		},
		[]
	);

	const detectWalls = useCallback(
		(orders: DepthLevel[], previousOrders: Map<string, number>, side: "Bid" | "Ask") => {
			const averageQuantity = calculateAverageQuantity(orders);
			const threshold = averageQuantity * WALL_THRESHOLD_MULTIPLIER;
			const alertStore = useAlertStore.getState();

			orders.forEach(([price, quantity]) => {
				const priceKey = price.toFixed(4);
				const previousQuantity = previousOrders.get(priceKey) ?? 0;

				const isNewWall = quantity > threshold && quantity > previousQuantity * WALL_GROWTH_MULTIPLIER;
				const isWallRemoved = previousQuantity > threshold && quantity === 0;

				if (isNewWall) {
					const alert = createWallAlert("wall", side, priceKey, quantity);
					alertStore.pushAlert(alert);
				}

				if (isWallRemoved) {
					const alert = createWallAlert("remove", side, priceKey);
					alertStore.pushAlert(alert);
				}

				previousOrders.set(priceKey, quantity);
			});
		},
		[calculateAverageQuantity, createWallAlert]
	);

	// Detect walls in bids
	useEffect(() => {
		detectWalls(bids, lastBidsRef.current, "Bid");
	}, [bids, detectWalls]);

	// Detect walls in asks
	useEffect(() => {
		detectWalls(asks, lastAsksRef.current, "Ask");
	}, [asks, detectWalls]);
}
