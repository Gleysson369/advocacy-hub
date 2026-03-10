import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "accent";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 shadow-card transition-all duration-200 hover:shadow-elevated",
        variant === "accent"
          ? "bg-gradient-navy text-primary-foreground"
          : "bg-card"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              variant === "accent"
                ? "text-primary-foreground/80"
                : "text-muted-foreground"
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-serif font-bold mt-2">{value}</p>
          {subtitle && (
            <p
              className={cn(
                "text-sm mt-1",
                variant === "accent"
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "text-sm mt-2 font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% este mês
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            variant === "accent" ? "bg-accent/20" : "bg-secondary"
          )}
        >
          <Icon
            className={cn(
              "w-6 h-6",
              variant === "accent" ? "text-accent" : "text-primary"
            )}
          />
        </div>
      </div>
    </div>
  );
}
