import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedTextCycleProps {
  words: string[];
  interval?: number;
  className?: string;
}

export default function AnimatedTextCycle({
  words,
  interval = 3000,
  className = "",
}: AnimatedTextCycleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState("auto");
  const measureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentWord = measureRef.current?.children[currentIndex];
    if (!currentWord) return;

    const newWidth = currentWord.getBoundingClientRect().width;
    setWidth(`${newWidth + 10}px`);
  }, [currentIndex]);

  useEffect(() => {
    if (words.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % words.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, words.length]);

  return (
    <>
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0"
        style={{ visibility: "hidden" }}
      >
        {words.map((word) => (
          <span key={word} className={className}>
            {word}
          </span>
        ))}
      </div>

      <motion.span
        className="relative inline-block align-baseline"
        animate={{
          width,
          transition: {
            type: "spring",
            stiffness: 150,
            damping: 15,
            mass: 1.2,
          },
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={words[currentIndex]}
            className={`inline-block ${className}`}
            initial={{ y: -18, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 18, opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            style={{ whiteSpace: "nowrap" }}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
}
