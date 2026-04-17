import { render, screen, waitFor } from "@testing-library/react";
import { LeftSidebar } from "./left-sidebar";
import { useStudioStore } from "@/lib/store";
import { defaultConfig } from "@/lib/store/defaults";

describe("LeftSidebar", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    useStudioStore.setState({
      config: JSON.parse(JSON.stringify(defaultConfig)),
      agentStep: "idle",
      agentPlan: null,
      loadedSkills: [],
      appliedSummary: null,
      visionUrl: "",
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("switches to analytic-only mode when the startup AI handshake fails", async () => {
    global.fetch = jest.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/api/skills")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ skills: [{ name: "planner", content: "test" }] }),
        } as Response);
      }

      if (url.includes("/api/ai-status")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ available: false, reason: "handshake failed" }),
        } as Response);
      }

      return Promise.reject(new Error(`Unexpected fetch: ${url}`));
    }) as typeof fetch;

    render(<LeftSidebar />);

    expect(await screen.findByTestId("ai-fallback-notice")).toHaveTextContent(
      /analytic/i,
    );

    await waitFor(() => {
      expect(screen.getByTestId("input-mode-wizard")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    expect(screen.getByTestId("simulate-button")).toBeDisabled();
    expect(screen.getByTestId("simulate-button")).toHaveTextContent(
      /AI unavailable/i,
    );
  });
});
