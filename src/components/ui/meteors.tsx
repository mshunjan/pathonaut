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
    const [screenWidth, setScreenWidth] = useState<number | null>(null);

    useEffect(() => {
      // Ensure this runs only on the client
      const updateScreenWidth = () => setScreenWidth(window.innerWidth);

      updateScreenWidth(); // Set initial screen width
      window.addEventListener("resize", updateScreenWidth);

      return () => {
        window.removeEventListener("resize", updateScreenWidth);
      };
    }, []);

    const meteorData: MeteorDatum[] = useMemo(
      () =>
        Array.from({ length: number }, (_, idx) => ({
          key: `meteor-${idx}`,
          xFactor: idx / number,
          delay: `${(Math.random() * 5).toFixed(2)}s`,
          duration: `${(Math.random() * 15 + 5).toFixed(2)}s`,
        })),
      [number]
    );

    const containerVariants = useRef({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    }).current;

    if (screenWidth === null) {
      // Render nothing until the screen width is available
      return null;
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.5 }}
      >
        {meteorData.map(({ key, xFactor, delay, duration }) => {
          const left = screenWidth
            ? xFactor * (screenWidth - 50)
            : `${xFactor * 100}%`;

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
