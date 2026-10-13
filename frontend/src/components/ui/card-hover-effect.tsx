import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn";

export const HoverEffect = ({
  items,
  className,
  onItemClick,
}: {
  items: {
    id: number | string;
    title: string;
    description: string;
    badge?: string;
    price?: string;
    category?: string;
    active?: boolean;
    raw?: any;
  }[];
  className?: string;
  onItemClick?: (item: any) => void;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-2 gap-3",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group block p-2 h-full w-full cursor-pointer"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => onItemClick && onItemClick(item.raw || item)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-indigo-500/[0.15] block rounded-2xl -z-10"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.1 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="rounded-xl h-full w-full p-4 overflow-hidden bg-slate-900/80 border border-slate-800 group-hover:border-indigo-500/50 relative z-20 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {item.badge}
                </span>
                {item.category && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {item.category}
                  </span>
                )}
              </div>
              <h4 className="text-slate-100 font-bold text-sm tracking-wide">
                {item.title}
              </h4>
              <p className="mt-1 text-slate-400 tracking-wide leading-relaxed text-xs">
                {item.description}
              </p>
            </div>
            {item.price && (
              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-emerald-400 font-extrabold text-sm">
                  {item.price}
                </span>
                <span className="text-[11px] font-semibold text-indigo-400 group-hover:text-indigo-300">
                  Adicionar +
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
