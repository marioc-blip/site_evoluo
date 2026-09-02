import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type RevealProps = ComponentPropsWithoutRef<"div"> & {
  delay?: number;
};

export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      {...props}
      ref={ref}
      className={cn("scroll-reveal", isVisible && "is-visible", props.className)}
      style={{
        ...props.style,
        transitionDelay: isVisible ? `${delay}s` : "0s",
      }}
    >
      {children}
    </div>
  );
}
