import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "../src/Components/ThemeContext";

let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import IssueEditor from "../src/pages/IssueEditor";

vi.mock("../src/Components/Button", () => ({
  default: ({ children, onClick, disabled, className }) => (
    <button className={className} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("../src/Components/AudioPlayer", () => ({
  default: ({ onTrackSelect, onTrackChange, initialTrack, className }) => (
    <div data-testid="audio-player" className={className}>
      Audio Player Mock
    </div>
  ),
}));

// Mock the geminiApi module
vi.mock("../src/services/geminiApi", () => ({
  generateTitle: vi.fn(() => Promise.resolve("Generated Title")),
  generateSubtitle: vi.fn(() => Promise.resolve("Generated Subtitle")),
  generateContent: vi.fn(() => Promise.resolve("Generated Content")),
  generateAllSections: vi.fn(() =>
    Promise.resolve({
      foreword: "Generated Foreword",
      reflections: "Generated Reflections",
      lessons: "Generated Lessons",
    })
  ),
}));

const renderIssue = (initialRoute = "/issues/new") => {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/issues/new" element={<IssueEditor />} />
          <Route path="/issues/:id" element={<IssueEditor />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe("issueEditor component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock fetch using globalThis
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("rendering", () => {
    it("renders the issue editor form", async () => {
      renderIssue();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      expect(screen.getByText(/🎨 Choose Layout/i)).toBeInTheDocument();
      expect(screen.getByText(/📝 Basic Information/i)).toBeInTheDocument();
      expect(screen.getByText(/📖 Content Sections/i)).toBeInTheDocument();
      expect(screen.getByText(/🖼️ Illustrations/i)).toBeInTheDocument();
    });

    it("renders all three layout options", async () => {
      renderIssue();

      // Wait for the component to fully render
      await waitFor(
        () => {
          expect(screen.getByText(/🎨 Choose Layout/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Debug: see what's in the document
      screen.debug();
      // Now check for layout options
      const animeButton = screen.getByRole("button", { name: /🌸 Anime/i });
      const retroButton = screen.getByRole("button", { name: /🕹️ Retro/i });
      const fashionButton = screen.getByRole("button", { name: /👗 Fashion/i });

      expect(animeButton).toBeInTheDocument();
      expect(retroButton).toBeInTheDocument();
      expect(fashionButton).toBeInTheDocument();
    });

    it("renders all form fields", async () => {
      renderIssue();

      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/Enter issue title/i)
          ).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      expect(
        screen.getByPlaceholderText(/Enter subtitle/i)
      ).toBeInTheDocument();

      // Use getByText for labels that aren't properly associated with inputs
      expect(screen.getByText(/Volume \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Issue # \*/i)).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText(/Write the foreword/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Your reflections/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Key lessons from this issue/i)
      ).toBeInTheDocument();
    });
  });
  describe("Form Validation", () => {
    it("shows error when title is empty", async () => {
      const user = userEvent.setup();
      renderIssue();
      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const saveButtons = screen.getAllByText(/💾 Save Issue/i);
      await user.click(saveButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
    it("shows error when volume is empty on save", async () => {
      const user = userEvent.setup();
      renderIssue();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      await user.type(titleInput, "Test Title");

      const saveButtons = screen.getAllByText(/💾 Save Issue/i);
      await user.click(saveButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText(/Volume is required/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });
    it("shows error when volume is not a positive number", async () => {
      const user = userEvent.setup();
      renderIssue();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      const volumeInputs = screen.getAllByPlaceholderText("1");
      const volumeInput = volumeInputs[0];

      await user.type(titleInput, "Test Title");
      await user.clear(volumeInput);
      await user.type(volumeInput, "-1");

      const saveButtons = screen.getAllByText(/💾 Save Issue/i);
      await user.click(saveButtons[0]);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Volume must be a positive number/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
      it("shows error when no content sections are filled", async () => {
        const user = userEvent.setup();
        renderIssue();

        await waitFor(
          () => {
            expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
        const numberInputs = screen.getAllByPlaceholderText("1");
        const volumeInput = numberInputs[0];
        const issueInput = numberInputs[1];

        await user.type(titleInput, "Test Title");
        await user.type(volumeInput, "1");
        await user.type(issueInput, "1");

        const saveButtons = screen.getAllByText(/💾 Save Issue/i);
        await user.click(saveButtons[0]);

        await waitFor(
          () => {
            expect(
              screen.getByText(/At least one content section is required/i)
            ).toBeInTheDocument();
          },
          { timeout: 5000 }
        );
      }, 10000);
    });
  });
});
