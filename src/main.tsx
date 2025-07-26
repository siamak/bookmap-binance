import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/app";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/react";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<NuqsAdapter>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
				<App />
			</ThemeProvider>
		</NuqsAdapter>
	</StrictMode>
);
