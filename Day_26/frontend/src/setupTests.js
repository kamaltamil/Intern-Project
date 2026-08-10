import "@testing-library/jest-dom";

beforeAll(() => {
  if (!document.getElementById("root")) {
    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }
});