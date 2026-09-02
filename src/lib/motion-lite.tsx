import React from "react";

type MotionOnlyProps = {
  animate?: unknown;
  exit?: unknown;
  initial?: unknown;
  layoutId?: unknown;
  transition?: unknown;
  viewport?: unknown;
  whileHover?: unknown;
  whileInView?: unknown;
  whileTap?: unknown;
};

export type HTMLMotionProps<T extends keyof JSX.IntrinsicElements> = React.ComponentPropsWithoutRef<T> &
  MotionOnlyProps;

function makeMotion<Tag extends keyof JSX.IntrinsicElements>(tag: Tag) {
  return React.forwardRef<HTMLElement, HTMLMotionProps<Tag>>(function MotionLite(
    {
      animate: _animate,
      exit: _exit,
      initial: _initial,
      layoutId: _layoutId,
      transition: _transition,
      viewport: _viewport,
      whileHover: _whileHover,
      whileInView: _whileInView,
      whileTap: _whileTap,
      ...props
    },
    ref,
  ) {
    return React.createElement(tag, { ...props, ref });
  });
}

export const motion = {
  a: makeMotion("a"),
  button: makeMotion("button"),
  div: makeMotion("div"),
  h1: makeMotion("h1"),
  img: makeMotion("img"),
  p: makeMotion("p"),
  span: makeMotion("span"),
};

export function AnimatePresence({ children }: { children: React.ReactNode; mode?: string }) {
  return <>{children}</>;
}
