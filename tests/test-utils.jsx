import { render } from "@testing-library/react";
import { ThemeProvider } from "../src/Components/ThemeContext";
import { BrowserRouter } from "react-router-dom";

// Mock matchMedia so ThemeProvider will not crash
beforeAll(() => {
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  };
});

// Mock document.documentElement for setting attributes
Object.defineProperty(document, "documentElement", {
  value: document.createElement("html"),
});

export function renderWithProviders(ui) {
  return render(
    <ThemeProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </ThemeProvider>
  );
}
