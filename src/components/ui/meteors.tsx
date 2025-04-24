import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface MeteorDatum {
  key: string;
  xFactor: number;
  delay: string;
  duration: string;
}

export const Meteors = React.memo(
  ({
    number = 20,
    className,
  }: {
    number?: number;
    className?: string;
  }) => {
    // 1) Screen‐width only for computing `left`, but you can
    //    avoid state entirely by using CSS % instead.
    const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
    useEffect(() => {
      let id: number;
      const handler = () => {
        // debounce so you don’t flood renders
        window.clearTimeout(id);
        id = window.setTimeout(() => setScreenWidth(window.innerWidth), 150);
      };
      window.addEventListener("resize", handler);
      return () => {
        window.removeEventListener("resize", handler);
        window.clearTimeout(id);
      };
    }, []);

    // 2) Generate meteor data ONCE when `number` changes
    const meteorData: MeteorDatum[] = useMemo(
      () =>
        Array.from({ length: number }, (_, idx) => ({
          key: `meteor-${idx}`,
          xFactor: idx / number, // or Math.random()
          delay: `${(Math.random() * 5).toFixed(2)}s`,
          duration: `${(Math.random() * 15 + 5).toFixed(2)}s`,
        })),
      [number]
    );

    // 3) Stable Motion variants
    const containerVariants = useRef({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    }).current;

    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5 }}
      >
        {meteorData.map(({ key, xFactor, delay, duration }) => {
          // compute left once per render based on debounced screenWidth
          const left = screenWidth
            ? xFactor * (screenWidth - 50)
            : xFactor * 100 + "%";

          return (
            <span
              key={key}
              className={cn(
                "animate-meteor-effect absolute h-0.5 w-0.5 rotate-[45deg] rounded-full",
                "bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
                "before:absolute before:top-1/2 before:h-[1px] before:w-[50px]",
                "before:-translate-y-[50%] before:bg-gradient-to-r",
                "before:from-[#64748b] before:to-transparent",
                className
              )}
              style={{
                top: "-40px",
                left: `${left}px`,
                animationDelay: delay,
                animationDuration: duration,
              }}
            />
          );
        })}
      </motion.div>
    );
  }
);

Meteors.displayName = "Meteors";
