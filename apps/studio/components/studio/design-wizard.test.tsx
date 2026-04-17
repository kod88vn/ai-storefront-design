import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DesignWizard } from "./design-wizard";

describe("DesignWizard", () => {
  const selections = [
    "Fashion & Apparel",
    "Luxury & High-end",
    "Dark & Moody",
    "Editorial & Refined",
    "Luxury shoppers",
    "Brand storytelling",
    "Editorial storytelling",
    "Spacious premium",
    "Collections + editorial curation",
  ];

  it("offers a direct analytic baseline action at the final step", async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    const onApplyBaseline = jest.fn();

    render(
      <DesignWizard onComplete={onComplete} onApplyBaseline={onApplyBaseline} />,
    );

    for (const label of selections) {
      await user.click(screen.getByRole("button", { name: label }));
      await user.click(screen.getByTestId("wizard-next"));
    }

    await user.click(screen.getByTestId("wizard-apply-baseline"));

    expect(onApplyBaseline).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("hides the AI prompt action in analytic-only mode", async () => {
    const user = userEvent.setup();

    render(
      <DesignWizard
        onComplete={jest.fn()}
        onApplyBaseline={jest.fn()}
        allowAiPrompt={false}
      />,
    );

    for (const label of selections) {
      await user.click(screen.getByRole("button", { name: label }));
      await user.click(screen.getByTestId("wizard-next"));
    }

    expect(screen.getByTestId("wizard-apply-baseline")).toBeInTheDocument();
    expect(screen.queryByTestId("wizard-use-ai-prompt")).not.toBeInTheDocument();
  });
});
