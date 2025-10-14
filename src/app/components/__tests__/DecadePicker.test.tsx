import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DecadePicker from "../DecadePicker";

describe("DecadePicker", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería renderizar todas las décadas disponibles", () => {
    render(<DecadePicker value={1980} onChange={mockOnChange} />);

    expect(screen.getByText("1950s")).toBeInTheDocument();
    expect(screen.getByText("1960s")).toBeInTheDocument();
    expect(screen.getByText("1970s")).toBeInTheDocument();
    expect(screen.getByText("1980s")).toBeInTheDocument();
    expect(screen.getByText("1990s")).toBeInTheDocument();
    expect(screen.getByText("2000s")).toBeInTheDocument();
    expect(screen.getByText("2010s")).toBeInTheDocument();
  });

  it("debería marcar la década activa correctamente", () => {
    render(<DecadePicker value={1980} onChange={mockOnChange} />);

    const activeButton = screen.getByRole("button", { name: "1980s" });
    expect(activeButton).toHaveAttribute("aria-pressed", "true");
  });

  it("debería llamar onChange al hacer click en una década diferente", async () => {
    const user = userEvent.setup();
    render(<DecadePicker value={1980} onChange={mockOnChange} />);

    const ninetiesButton = screen.getByRole("button", { name: "1990s" });
    await user.click(ninetiesButton);

    expect(mockOnChange).toHaveBeenCalledWith(1990);
  });

  it("debería manejar la navegación por teclado", async () => {
    const user = userEvent.setup();
    render(<DecadePicker value={1980} onChange={mockOnChange} />);

    const seventiesButton = screen.getByRole("button", { name: "1970s" });

    // Focus en el botón y presionar Enter
    seventiesButton.focus();
    await user.keyboard("{Enter}");

    expect(mockOnChange).toHaveBeenCalledWith(1970);
  });

  it("debería manejar la navegación por teclado con Espacio", async () => {
    const user = userEvent.setup();
    render(<DecadePicker value={1980} onChange={mockOnChange} />);

    const sixtiesButton = screen.getByRole("button", { name: "1960s" });

    // Focus en el botón y presionar Espacio
    sixtiesButton.focus();
    await user.keyboard(" ");

    expect(mockOnChange).toHaveBeenCalledWith(1960);
  });

  it("debería actualizar el estado activo cuando cambia la prop value", () => {
    const { rerender } = render(
      <DecadePicker value={1980} onChange={mockOnChange} />
    );

    // Verificar que 1980s está activo
    let activeButton = screen.getByRole("button", { name: "1980s" });
    expect(activeButton).toHaveAttribute("aria-pressed", "true");

    // Cambiar a 1990s
    rerender(<DecadePicker value={1990} onChange={mockOnChange} />);

    // Verificar que 1990s está activo y 1980s no
    activeButton = screen.getByRole("button", { name: "1990s" });
    expect(activeButton).toHaveAttribute("aria-pressed", "true");

    const previousButton = screen.getByRole("button", { name: "1980s" });
    expect(previousButton).toHaveAttribute("aria-pressed", "false");
  });

  it.skip("debería tener accesibilidad correcta en todos los botones", () => {
    // TODO: Fix type="button" attribute in framer-motion mock. Steps: update test/setup.ts motion.button mock
    render(<DecadePicker value={1980} onChange={mockOnChange} />);

    const buttons = screen.getAllByRole("button");

    buttons.forEach((button) => {
      expect(button).toHaveAttribute("aria-pressed");
      expect(button).toHaveAttribute("type", "button");
    });
  });

  it("debería ser focusable con teclado", async () => {
    const user = userEvent.setup();
    render(<DecadePicker value={1980} onChange={mockOnChange} />);

    const firstButton = screen.getByRole("button", { name: "1950s" });

    // Tab para navegar
    await user.tab();
    expect(firstButton).toHaveFocus();

    // Tab para ir al siguiente
    await user.tab();
    const secondButton = screen.getByRole("button", { name: "1960s" });
    expect(secondButton).toHaveFocus();
  });

  it("debería manejar múltiples clicks en la misma década", async () => {
    const user = userEvent.setup();
    render(<DecadePicker value={1980} onChange={mockOnChange} />);

    const activeButton = screen.getByRole("button", { name: "1980s" });

    // Hacer click múltiples veces en la década activa
    await user.click(activeButton);
    await user.click(activeButton);
    await user.click(activeButton);

    // Debería llamar onChange cada vez
    expect(mockOnChange).toHaveBeenCalledTimes(3);
    expect(mockOnChange).toHaveBeenCalledWith(1980);
  });

  it("debería renderizar correctamente con diferentes valores iniciales", () => {
    const { rerender } = render(
      <DecadePicker value={1950} onChange={mockOnChange} />
    );
    expect(screen.getByRole("button", { name: "1950s" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    rerender(<DecadePicker value={2010} onChange={mockOnChange} />);
    expect(screen.getByRole("button", { name: "2010s" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
