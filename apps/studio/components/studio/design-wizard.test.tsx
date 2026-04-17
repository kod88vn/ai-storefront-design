import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DesignWizard } from "./design-wizard";

describe("DesignWizard", () => {
  it("offers a direct analytic baseline action at the final step", async () => {
    const user = userEvent.setup();
    const onComplete = jest.fn();
    const onApplyBaseline = jest.fn();

    render(
      <DesignWizard onComplete={onComplete} onApplyBaseline={onApplyBaseline} />,
    );

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

    for (const label of selections) {
      await user.click(screen.getByRole("button", { name: label }));
      await user.click(screen.getByTestId("wizard-next"));
    }

    await user.click(screen.getByTestId("wizard-apply-baseline"));

    expect(onApplyBaseline).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
