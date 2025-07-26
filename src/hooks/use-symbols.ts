import { useEffect, useState, useRef } from "react";

export function useSymbols(quoteAsset = "USDT") {
	const [symbols, setSymbols] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);

		// Abort previous request if it exists
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Create new abort controller for this request
		abortControllerRef.current = new AbortController();

		fetch("https://api.binance.com/api/v3/exchangeInfo", {
			signal: abortControllerRef.current.signal,
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				if (!data.symbols || !Array.isArray(data.symbols)) {
					throw new Error("Invalid response format");
				}

				const filtered = data.symbols
					.filter(
						(s: { quoteAsset: string; status: string }) =>
							s.quoteAsset === quoteAsset && s.status === "TRADING"
					)
					.map((s: { symbol: string }) => s.symbol.toLowerCase())
					.sort(); // Sort alphabetically for better UX

				setSymbols(filtered);
				setLoading(false);
			})
			.catch((err) => {
				// Don't set error if request was aborted
				if (err.name === "AbortError") {
					return;
				}
				console.error("Error fetching symbols:", err);
				setError(err.message);
				setLoading(false);
			});

		// Cleanup function
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [quoteAsset]);

	return { symbols, loading, error };
}
