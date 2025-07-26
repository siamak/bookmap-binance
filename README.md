# OrderFlow

A real-time cryptocurrency order book and trade visualization app built with React, TypeScript, and Vite.

## Project Overview

OrderFlow provides a live, interactive view of cryptocurrency market activity. It visualizes the order book (bids and asks), recent trades, and detects significant order book events ("walls") for selected trading pairs. The app is designed for speed, clarity, and ease of use, leveraging modern React and Vite tooling.

## Features

-   **Symbol Selector:** Search and select from all active Binance trading pairs (default quote asset: USDT).
-   **Order Heatmap:** Visualizes the current order book depth for bids and asks, highlighting large "walls" and their appearance/disappearance.
-   **Trade Feed:** Displays a real-time, virtualized list of recent trades for the selected symbol, including price, quantity, and time.
-   **Order Alerts:** Notifies users of significant order book events, such as the appearance or removal of large bid/ask walls.
-   **Book Counter:** Real-time pressure analysis with configurable calculation methods (weighted, depth, combined).
-   **Performance Optimization:** Automatically pauses heavy processing when the tab becomes inactive to save CPU and battery. Uses a centralized store for efficient state management.
-   **Theme Toggle:** Switch between light and dark mode.

## Data Sources

-   **Symbols:** Fetched from the [Binance Exchange Info API](https://api.binance.com/api/v3/exchangeInfo), filtered for active trading pairs with the selected quote asset.
-   **Order Book:** Real-time updates via Binance WebSocket streams (e.g., `wss://stream.binance.com:9443/ws/<symbol>@depth`).
-   **Trades:** Real-time trade data via Binance WebSocket streams (e.g., `wss://stream.binance.com:9443/ws/<symbol>@trade`).

## Getting Started

1. **Install dependencies:**

    ```sh
    pnpm install
    # or
    npm install
    # or
    yarn install
    ```

2. **Start the development server:**

    ```sh
    pnpm dev
    # or
    npm run dev
    # or
    yarn dev
    ```

3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Scripts

-   `dev` – Start the Vite development server
-   `build` – Type-check and build the app for production
-   `preview` – Preview the production build locally
-   `lint` – Run ESLint on the codebase

## License

MIT License

Copyright (c) 2024 Siamak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
