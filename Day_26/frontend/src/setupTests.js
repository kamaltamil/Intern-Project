import "@testing-library/jest-dom";

beforeAll(() => {
  // Create root element for components/tests that expect it.
  if (!document.getElementById("root")) {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }

  // Ant Design uses window.matchMedia.
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,

      addListener: jest.fn(),
      removeListener: jest.fn(),

      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),

      dispatchEvent: jest.fn(),
    })),
  });
});