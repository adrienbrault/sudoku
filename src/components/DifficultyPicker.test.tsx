import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DifficultyPicker } from "./DifficultyPicker.tsx";

describe("DifficultyPicker", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders difficulty options", () => {
    render(<DifficultyPicker onSelect={jest.fn()} onBack={jest.fn()} />);

    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Expert")).toBeInTheDocument();
  });

  it("calls onSelect with difficulty and standard assist level by default", async () => {
    const onSelect = jest.fn();
    render(<DifficultyPicker onSelect={onSelect} onBack={jest.fn()} />);

    await userEvent.click(screen.getByText("Medium"));
    expect(onSelect).toHaveBeenCalledWith("medium", "standard");
  });

  it("shows assist level picker defaulting to standard", () => {
    render(<DifficultyPicker onSelect={jest.fn()} onBack={jest.fn()} />);

    expect(
      screen.getByRole("radiogroup", { name: /assistance/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /standard/i })).toBeChecked();
  });

  it("calls onSelect with selected assist level", async () => {
    const onSelect = jest.fn();
    render(<DifficultyPicker onSelect={onSelect} onBack={jest.fn()} />);

    await userEvent.click(screen.getByRole("radio", { name: /paper/i }));
    await userEvent.click(screen.getByText("Easy"));
    expect(onSelect).toHaveBeenCalledWith("easy", "paper");
  });
});
