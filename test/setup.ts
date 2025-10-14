import "@testing-library/jest-dom";
import React from "react";

// Mock de next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return React.createElement("img", props);
  },
}));

// Mock de next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock de framer-motion para evitar timers en tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      whileHover,
      whileTap,
      layoutId,
      initial,
      animate,
      transition,
      ...props
    }: {
      children?: React.ReactNode;
      whileHover?: unknown;
      whileTap?: unknown;
      layoutId?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      [key: string]: unknown;
    }) => React.createElement("div", props, children),
    button: ({
      children,
      whileHover,
      whileTap,
      layoutId,
      initial,
      animate,
      transition,
      ...props
    }: {
      children?: React.ReactNode;
      whileHover?: unknown;
      whileTap?: unknown;
      layoutId?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      [key: string]: unknown;
    }) => React.createElement("button", props, children),
    span: ({
      children,
      whileHover,
      whileTap,
      layoutId,
      initial,
      animate,
      transition,
      ...props
    }: {
      children?: React.ReactNode;
      whileHover?: unknown;
      whileTap?: unknown;
      layoutId?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      [key: string]: unknown;
    }) => React.createElement("span", props, children),
    li: ({
      children,
      whileHover,
      whileTap,
      layoutId,
      initial,
      animate,
      transition,
      ...props
    }: {
      children?: React.ReactNode;
      whileHover?: unknown;
      whileTap?: unknown;
      layoutId?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      [key: string]: unknown;
    }) => React.createElement("li", props, children),
    section: ({
      children,
      whileHover,
      whileTap,
      layoutId,
      initial,
      animate,
      transition,
      ...props
    }: {
      children?: React.ReactNode;
      whileHover?: unknown;
      whileTap?: unknown;
      layoutId?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      [key: string]: unknown;
    }) => React.createElement("section", props, children),
    header: ({
      children,
      whileHover,
      whileTap,
      layoutId,
      initial,
      animate,
      transition,
      ...props
    }: {
      children?: React.ReactNode;
      whileHover?: unknown;
      whileTap?: unknown;
      layoutId?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      [key: string]: unknown;
    }) => React.createElement("header", props, children),
  },
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
}));

// Mock de fetch global
global.fetch = jest.fn();

// Mock de Math.random para tests deterministas
const mockMath = Object.create(global.Math);
global.Math = mockMath;

// Mock de requestAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(cb, 0);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de HTMLMediaElement para audio
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: jest.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  writable: true,
  value: jest.fn(),
});

// Mock de AudioContext para compatibilidad con Safari
Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createGain: jest.fn(),
    createOscillator: jest.fn(),
    createAnalyser: jest.fn(),
    state: "running",
    resume: jest.fn().mockResolvedValue(undefined),
    suspend: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  })),
});

// Mock de webkitAudioContext para Safari
Object.defineProperty(window, "webkitAudioContext", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createGain: jest.fn(),
    createOscillator: jest.fn(),
    createAnalyser: jest.fn(),
    state: "running",
    resume: jest.fn().mockResolvedValue(undefined),
    suspend: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  })),
});

// Cleanup después de cada test
afterEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
});
