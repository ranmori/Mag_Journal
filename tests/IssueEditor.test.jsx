import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "../src/Components/ThemeContext";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import * as geminiApi from "../src/services/geminiApi";

// Mock dependencies
let mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import IssueEditor from "../src/pages/IssueEditor";

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

vi.mock("../src/Components/Button", () => ({
  default: ({ children, onClick, disabled, className }) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../src/Components/AudioPage", () => ({
  default: ({ onTrackSelect, onTrackChange, initialTrack, className }) => (
    <div data-testid="audio-player" className={className}>
      Audio Player Mock
    </div>
  ),
}));

const renderIssueEditor = (initialRoute = "/issues/new") => {
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

describe("IssueEditor Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Mock console methods
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("renders the issue editor form", async () => {
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.getByText(/🎨 Choose Layout/i)).toBeInTheDocument();
      expect(screen.getByText(/📝 Basic Information/i)).toBeInTheDocument();
      expect(screen.getByText(/📖 Content Sections/i)).toBeInTheDocument();
      expect(screen.getByText(/🖼️ Illustrations/i)).toBeInTheDocument();
    }, 10000);

    it("renders all three layout options", async () => {
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/🎨 Choose Layout/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.getByText(/🌸 Anime/i)).toBeInTheDocument();
      expect(screen.getByText(/🕹️ Retro/i)).toBeInTheDocument();
      expect(screen.getByText(/👗 Fashion/i)).toBeInTheDocument();
    }, 10000);

    it("renders all form fields", async () => {
      renderIssueEditor();

      await waitFor(
        () => {
          expect(
            screen.getByPlaceholderText(/Enter issue title/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.getByPlaceholderText(/Enter subtitle/i)).toBeInTheDocument();
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
    }, 10000);
  });

  describe("Form Validation", () => {
    it("shows error when title is empty on save", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

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
    }, 10000);

    it("shows error when volume is empty on save", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

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
    }, 10000);

    it("shows error when volume is not a positive number", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

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
    }, 10000);

    it("shows error when issue number is empty on save", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

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
      await user.type(volumeInput, "1");

      const saveButtons = screen.getAllByText(/💾 Save Issue/i);
      await user.click(saveButtons[0]);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Issue number is required/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("shows error when no content sections are filled", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

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

  describe("Layout Selection", () => {
    it("changes layout when clicking layout button", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/🎨 Choose Layout/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const animeButton = screen.getByText(/🌸 Anime/i);
      await user.click(animeButton);

      expect(animeButton).toBeInTheDocument();
    }, 10000);
  });

  describe("Form Input", () => {
    it("updates title field when typing", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      await user.type(titleInput, "My Test Title");

      expect(titleInput).toHaveValue("My Test Title");
    }, 10000);

    it("updates subtitle field when typing", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const subtitleInput = screen.getByPlaceholderText(/Enter subtitle/i);
      await user.type(subtitleInput, "A Great Subtitle");

      expect(subtitleInput).toHaveValue("A Great Subtitle");
    }, 10000);

    it("updates volume field when typing", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const numberInputs = screen.getAllByPlaceholderText("1");
      const volumeInput = numberInputs[0];
      await user.type(volumeInput, "5");

      expect(volumeInput).toHaveValue(5);
    }, 10000);

    it("updates issue number field when typing", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const numberInputs = screen.getAllByPlaceholderText("1");
      const issueInput = numberInputs[1];
      await user.type(issueInput, "3");

      expect(issueInput).toHaveValue(3);
    }, 10000);

    it("updates foreword field when typing", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const forewordTextarea = screen.getByPlaceholderText(/Write the foreword/i);
      await user.type(forewordTextarea, "This is my foreword");

      expect(forewordTextarea).toHaveValue("This is my foreword");
    }, 10000);

    it("updates reflections field when typing", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const reflectionsTextarea = screen.getByPlaceholderText(/Your reflections/i);
      await user.type(reflectionsTextarea, "My reflections");

      expect(reflectionsTextarea).toHaveValue("My reflections");
    }, 10000);

    it("updates lessons field when typing", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const lessonsTextarea = screen.getByPlaceholderText(
        /Key lessons from this issue/i
      );
      await user.type(lessonsTextarea, "Important lessons");

      expect(lessonsTextarea).toHaveValue("Important lessons");
    }, 10000);
  });

  describe("AI Generation", () => {
    it("generates title using AI", async () => {
      const user = userEvent.setup();
      vi.mocked(geminiApi.generateTitle).mockResolvedValue("AI Generated Title");

      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const generateButtons = screen.getAllByText(/✨ AI Generate/i);
      const titleGenerateButton = generateButtons[0];

      await user.click(titleGenerateButton);

      await waitFor(
        () => {
          expect(geminiApi.generateTitle).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
          expect(titleInput).toHaveValue("AI Generated Title");
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("generates subtitle using AI with title context", async () => {
      const user = userEvent.setup();
      vi.mocked(geminiApi.generateSubtitle).mockResolvedValue("AI Generated Subtitle");

      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      await user.type(titleInput, "My Title");

      const generateButtons = screen.getAllByText(/✨ AI Generate/i);
      const subtitleGenerateButton = generateButtons[1];

      await user.click(subtitleGenerateButton);

      await waitFor(
        () => {
          expect(geminiApi.generateSubtitle).toHaveBeenCalledWith("My Title");
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          const subtitleInput = screen.getByPlaceholderText(/Enter subtitle/i);
          expect(subtitleInput).toHaveValue("AI Generated Subtitle");
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("shows error when generating subtitle without title", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const generateButtons = screen.getAllByText(/✨ AI Generate/i);
      const subtitleGenerateButton = generateButtons[1];

      await user.click(subtitleGenerateButton);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Please add a title first before generating a subtitle/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("generates foreword content using AI", async () => {
      const user = userEvent.setup();
      vi.mocked(geminiApi.generateContent).mockResolvedValue("AI Generated Foreword");

      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      await user.type(titleInput, "Test Title");

      const forewordLabels = screen.getAllByText(/Foreword/i);
      const forewordLabel = forewordLabels.find((el) => el.tagName === "LABEL");
      const forewordSection = forewordLabel.closest("div");
      const forewordGenerateButton = within(forewordSection).getByText(/✨ AI Generate/i);

      await user.click(forewordGenerateButton);

      await waitFor(
        () => {
          expect(geminiApi.generateContent).toHaveBeenCalledWith(
            expect.objectContaining({ type: "foreword" })
          );
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          const forewordTextarea = screen.getByPlaceholderText(/Write the foreword/i);
          expect(forewordTextarea).toHaveValue("AI Generated Foreword");
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("generates all sections using AI", async () => {
      const user = userEvent.setup();
      vi.mocked(geminiApi.generateAllSections).mockResolvedValue({
        foreword: "Generated Foreword",
        reflections: "Generated Reflections",
        lessons: "Generated Lessons",
      });

      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      await user.type(titleInput, "Test Title");

      const generateAllButton = screen.getByText(/✨ Generate All/i);
      await user.click(generateAllButton);

      await waitFor(
        () => {
          expect(geminiApi.generateAllSections).toHaveBeenCalled();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(screen.getByPlaceholderText(/Write the foreword/i)).toHaveValue(
            "Generated Foreword"
          );
          expect(screen.getByPlaceholderText(/Your reflections/i)).toHaveValue(
            "Generated Reflections"
          );
          expect(
            screen.getByPlaceholderText(/Key lessons from this issue/i)
          ).toHaveValue("Generated Lessons");
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("shows error when generating all sections without title", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const generateAllButton = screen.getByText(/✨ Generate All/i);
      await user.click(generateAllButton);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Please add a title first before generating content/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);
  });

  describe("Save Functionality", () => {
    it("successfully saves issue with valid data", async () => {
      const user = userEvent.setup();

      globalThis.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "123", title: "Test Title" }),
      });

      renderIssueEditor();

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
      const forewordTextarea = screen.getByPlaceholderText(/Write the foreword/i);

      await user.type(titleInput, "Test Title");
      await user.type(volumeInput, "1");
      await user.type(issueInput, "1");
      await user.type(forewordTextarea, "Test foreword content");

      const saveButtons = screen.getAllByText(/💾 Save Issue/i);
      await user.click(saveButtons[0]);

      await waitFor(
        () => {
          expect(globalThis.fetch).toHaveBeenCalledWith(
            "http://localhost:5000/api/issues",
            expect.objectContaining({
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: expect.stringContaining("Test Title"),
            })
          );
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(
            screen.getByText(/✅ Issue saved successfully!/i)
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith("/");
        },
        { timeout: 3000 }
      );
    }, 15000);

    it("shows error when save fails", async () => {
      const user = userEvent.setup();

      globalThis.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Save failed" }),
      });

      renderIssueEditor();

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
      const forewordTextarea = screen.getByPlaceholderText(/Write the foreword/i);

      await user.type(titleInput, "Test Title");
      await user.type(volumeInput, "1");
      await user.type(issueInput, "1");
      await user.type(forewordTextarea, "Test foreword");

      const saveButtons = screen.getAllByText(/💾 Save Issue/i);
      await user.click(saveButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText(/Save failed/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);
  });

  describe("Preview Functionality", () => {
    it("opens preview modal when clicking preview button", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      await user.type(titleInput, "Test Title");

      const previewButtons = screen.getAllByText(/👁️ Preview/i);
      await user.click(previewButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText(/📖 Live Preview/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("closes preview modal when clicking close button", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      await user.type(titleInput, "Test Title");

      const previewButtons = screen.getAllByText(/👁️ Preview/i);
      await user.click(previewButtons[0]);

      await waitFor(
        () => {
          expect(screen.getByText(/📖 Live Preview/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const closeButton = screen.getByText(/✕ Close/i);
      await user.click(closeButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/📖 Live Preview/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("disables preview button when title is empty", async () => {
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const previewButtons = screen.getAllByText(/👁️ Preview/i);
      expect(previewButtons[0]).toBeDisabled();
    }, 10000);
  });

  describe("Navigation", () => {
    it("navigates back when clicking back button", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const backButton = screen.getByText(/← Back/i);
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    }, 10000);

    it("navigates back when clicking cancel button", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const cancelButton = screen.getByText(/Cancel/i);
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    }, 10000);
  });

  describe("Content Stats", () => {
    it("displays correct word count", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const forewordTextarea = screen.getByPlaceholderText(/Write the foreword/i);
      await user.type(forewordTextarea, "one two three four five");

      await waitFor(
        () => {
          expect(screen.getByText(/Words: 5/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("displays correct section count", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const forewordTextarea = screen.getByPlaceholderText(/Write the foreword/i);
      const reflectionsTextarea = screen.getByPlaceholderText(/Your reflections/i);

      await user.type(forewordTextarea, "Foreword content");
      await user.type(reflectionsTextarea, "Reflections content");

      await waitFor(
        () => {
          expect(screen.getByText(/Sections: 2\/3/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);

    it("shows draft status when incomplete", async () => {
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(screen.getByText(/Draft/i)).toBeInTheDocument();
    }, 10000);

    it("shows ready status when complete", async () => {
      const user = userEvent.setup();
      renderIssueEditor();

      await waitFor(
        () => {
          expect(screen.getByText(/✍️Create/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      const titleInput = screen.getByPlaceholderText(/Enter issue title/i);
      const forewordTextarea = screen.getByPlaceholderText(/Write the foreword/i);

      await user.type(titleInput, "Test Title");
      await user.type(forewordTextarea, "Foreword content");

      await waitFor(
        () => {
          expect(screen.getByText(/Ready/i)).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    }, 10000);
  });

  describe("Loading Existing Issue", () => {
    it("loads existing issue data when id is provided", async () => {
      const mockIssue = {
        title: "Existing Title",
        subtitle: "Existing Subtitle",
        volume: "2",
        issueNumber:globalThis.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockIssue,
  });

  renderIssueEditor("/issues/123");

  await waitFor(
    () => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/issues/123"
      );
    },
    { timeout: 5000 }
  );

  await waitFor(
    () => {
      expect(screen.getByPlaceholderText(/Enter issue title/i)).toHaveValue(
        "Existing Title"
      );
      expect(screen.getByPlaceholderText(/Enter subtitle/i)).toHaveValue(
        "Existing Subtitle"
      );
    },
    { timeout: 5000 }
  );
}, 10000);

it("shows error when loading issue fails", async () => {
  globalThis.fetch.mockRejectedValueOnce(new Error("Failed to load"));

  renderIssueEditor("/issues/123");

  await waitFor(
    () => {
      expect(console.error).toHaveBeenCalled();
    },
    { timeout: 5000 }
  );
}, 10000);