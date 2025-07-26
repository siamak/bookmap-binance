import { useAlertStore } from "@/stores/use-alert-store";
import { useEffect, useState, useRef, useCallback } from "react";
import { formatQuantity } from "@/lib/utils";

export type DepthLevel = [number, number]; // [price, quantity]

interface OrderBook {
	bids: Map<number, number>;
	asks: Map<number, number>;
}

interface WallAlert {
	type: "wall" | "remove";
	message: string;
}

interface WebSocketData {
	b?: [string, string][]; // bids: [price, quantity]
	a?: [string, string][]; // asks: [price, quantity]
}

const WALL_THRESHOLD_MULTIPLIER = 3;
const WALL_GROWTH_MULTIPLIER = 2;

export function useOrderBookStream(symbol = "btcusdt", depthLimit = 20) {
	const [bids, setBids] = useState<DepthLevel[]>([]);
	const [asks, setAsks] = useState<DepthLevel[]>([]);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const orderBookRef = useRef<OrderBook>({
		bids: new Map(),
		asks: new Map(),
	});

	const lastBidsRef = useRef<Map<string, number>>(new Map());
	const lastAsksRef = useRef<Map<string, number>>(new Map());

	// Clear order book data when symbol changes
	useEffect(() => {
		setBids([]);
		setAsks([]);
		orderBookRef.current.bids.clear();
		orderBookRef.current.asks.clear();
		lastBidsRef.current.clear();
		lastAsksRef.current.clear();
	}, [symbol]);

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

	const processOrderBookUpdate = useCallback((data: WebSocketData) => {
		const { b: newBids, a: newAsks } = data;

		// Update bids
		newBids?.forEach(([priceStr, qtyStr]: [string, string]) => {
			const price = parseFloat(priceStr);
			const quantity = parseFloat(qtyStr);

			if (quantity === 0) {
				orderBookRef.current.bids.delete(price);
			} else {
				orderBookRef.current.bids.set(price, quantity);
			}
		});

		// Update asks
		newAsks?.forEach(([priceStr, qtyStr]: [string, string]) => {
			const price = parseFloat(priceStr);
			const quantity = parseFloat(qtyStr);

			if (quantity === 0) {
				orderBookRef.current.asks.delete(price);
			} else {
				orderBookRef.current.asks.set(price, quantity);
			}
		});
	}, []);

	const getSortedOrders = useCallback(
		(orders: Map<number, number>, isBids: boolean): DepthLevel[] => {
			return Array.from(orders.entries())
				.sort((a, b) => (isBids ? b[0] - a[0] : a[0] - b[0]))
				.slice(0, depthLimit);
		},
		[depthLimit]
	);

	const updateOrderBookState = useCallback(() => {
		const sortedBids = getSortedOrders(orderBookRef.current.bids, true);
		const sortedAsks = getSortedOrders(orderBookRef.current.asks, false);

		setBids(sortedBids);
		setAsks(sortedAsks);
	}, [getSortedOrders]);

	const connectWebSocket = useCallback(() => {
		// Close existing connection if any
		if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
			wsRef.current.close();
		}

		const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@depth`);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log(`Order book WebSocket connected for ${symbol}`);
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				processOrderBookUpdate(data);
				updateOrderBookState();
			} catch (error) {
				console.error("Error processing order book data:", error);
			}
		};

		ws.onerror = (error) => {
			console.error(`Order book WebSocket error for ${symbol}:`, error);
		};

		ws.onclose = (event) => {
			console.log(`Order book WebSocket closed for ${symbol}:`, event.code, event.reason);

			// Only attempt reconnection if it wasn't a manual close
			if (event.code !== 1000 && !event.wasClean) {
				console.log(`Attempting to reconnect order book stream for ${symbol} in 3 seconds...`);
				reconnectTimeoutRef.current = setTimeout(() => {
					connectWebSocket();
				}, 3000);
			}
		};

		return ws;
	}, [symbol, processOrderBookUpdate, updateOrderBookState]);

	// Detect walls in bids
	useEffect(() => {
		detectWalls(bids, lastBidsRef.current, "Bid");
	}, [bids, detectWalls]);

	// Detect walls in asks
	useEffect(() => {
		detectWalls(asks, lastAsksRef.current, "Ask");
	}, [asks, detectWalls]);

	// WebSocket connection and data handling
	useEffect(() => {
		const ws = connectWebSocket();

		return () => {
			// Clear any pending reconnection
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}

			// Close WebSocket if it's open
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.close(1000, "Component unmounting");
			}
		};
	}, [connectWebSocket]);

	return { bids, asks };
}
