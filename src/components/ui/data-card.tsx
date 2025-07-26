import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataCardProps {
	title?: string;
	titleClassName?: string;
	headers?: ReactNode;
	children: ReactNode;
	className?: string;
	height?: string;
}

export const DataCard = ({ title, titleClassName = "", headers, children, className = "" }: DataCardProps) => {
	return (
		<div className={cn("font-mono border rounded-md text-sm overflow-hidden", className)}>
			{title && (
				<div className="sticky top-0 bg-background/50 border-b z-20 backdrop-blur-sm py-2 px-4">
					<h3 className={`font-semibold ${titleClassName}`}>{title}</h3>
				</div>
			)}
			{headers && (
				<div className="sticky top-0 bg-background/50 border-b z-10 backdrop-blur-sm py-2 px-4">{headers}</div>
			)}
			{children}
		</div>
	);
};

DataCard.displayName = "DataCard";
