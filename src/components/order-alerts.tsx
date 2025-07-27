import { motion, AnimatePresence } from "motion/react";
import { useAlertStore } from "@/stores/use-alert-store";
import { DataCard } from "@/components/ui/data-card";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function OrderAlerts() {
	const { alerts } = useAlertStore();

	return (
		<DataCard title="Alerts">
			<ScrollArea className="flex flex-col divide-y h-[110px]">
				<AnimatePresence>
					{alerts.map((alert) => (
						<motion.div
							key={alert.id}
							layout
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className={cn(
								"px-4 py-2 text-sm",
								alert.message.includes("Bid Wall") && "bg-green-500/20",
								alert.message.includes("Ask Wall") && "bg-red-500/20",
								alert.message.includes("Removed") && "bg-yellow-500/20"
							)}
						>
							{alert.message}
						</motion.div>
					))}
				</AnimatePresence>
			</ScrollArea>
		</DataCard>
	);
}
