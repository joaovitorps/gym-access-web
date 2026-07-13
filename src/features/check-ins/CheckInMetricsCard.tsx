import { Card } from "@/components/ui/Card";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface CheckInMetricsCardProps {
  total: number;
}

export function CheckInMetricsCard({ total }: CheckInMetricsCardProps) {
  const count = useMotionValue(0);
  const spring = useSpring(count, { duration: 1500 });
  const display = useTransform(spring, (value) => Math.round(value));

  useEffect(() => {
    count.set(total);
  }, [count, total]);

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/10" />
      <p className="text-sm font-medium text-text-secondary">Total check-ins</p>
      <motion.p className="mt-2 font-mono text-5xl font-bold text-text-primary">
        {display}
      </motion.p>
    </Card>
  );
}
