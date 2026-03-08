import { describe, expect, it, jest } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToggleSwitch } from "./ToggleSwitch.tsx";

describe("ToggleSwitch", () => {
  it("renders with checked state", () => {
    render(
      <ToggleSwitch checked={true} onChange={jest.fn()} label="Show errors" />,
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("renders with unchecked state", () => {
    render(
      <ToggleSwitch checked={false} onChange={jest.fn()} label="Show errors" />,
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange when clicked", async () => {
    const onChange = jest.fn();
    render(
      <ToggleSwitch checked={true} onChange={onChange} label="Show errors" />,
    );

    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("renders the label text", () => {
    render(
      <ToggleSwitch
        checked={false}
        onChange={jest.fn()}
        label="Show placement errors"
      />,
    );

    expect(screen.getByText("Show placement errors")).toBeInTheDocument();
  });
});
