import "@testing-library/jest-dom";
import React from "react";

// Mock de next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
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
    div: ({ children, ...props }: any) =>
      React.createElement("div", props, children),
    button: ({ children, ...props }: any) =>
      React.createElement("button", props, children),
    span: ({ children, ...props }: any) =>
      React.createElement("span", props, children),
    li: ({ children, ...props }: any) =>
      React.createElement("li", props, children),
    section: ({ children, ...props }: any) =>
      React.createElement("section", props, children),
    header: ({ children, ...props }: any) =>
      React.createElement("header", props, children),
  },
  AnimatePresence: ({ children }: any) => children,
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

// Cleanup después de cada test
afterEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
});
