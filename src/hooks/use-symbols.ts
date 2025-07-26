import { useEffect, useState } from "react";

export function useSymbols(quoteAsset = "USDT") {
	const [symbols, setSymbols] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);

		fetch("https://api.binance.com/api/v3/exchangeInfo")
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
				console.error("Error fetching symbols:", err);
				setError(err.message);
				setLoading(false);
			});
	}, [quoteAsset]);

	return { symbols, loading, error };
}
