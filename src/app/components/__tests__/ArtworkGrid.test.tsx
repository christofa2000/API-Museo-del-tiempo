import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ArtworkGrid from "../ArtworkGrid";

// Mock de Math.random para tests deterministas
const mockMath = Object.create(global.Math);
global.Math = mockMath;

const mockArtworks = [
  {
    id: 1,
    title: "Test Artwork 1",
    artist: "Test Artist 1",
    date: "1985",
    image: "https://example.com/image1.jpg",
    description: "Test description 1",
  },
  {
    id: 2,
    title: "Test Artwork 2",
    artist: "Test Artist 2",
    date: "1987",
    image: "https://example.com/image2.jpg",
    description: "Test description 2",
  },
  {
    id: 3,
    title: "Test Artwork 3",
    artist: "Test Artist 3",
    date: "1989",
    image: "https://example.com/image3.jpg",
  },
];

describe.skip("ArtworkGrid", () => {
  // TODO: Fix memory leak causing Jest crash. Steps: simplify framer-motion mocks or reduce test complexity
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Math.random para controlar el sampleo
    mockMath.random = jest.fn().mockReturnValue(0.5);
  });

  it("debería renderizar las obras de arte", () => {
    render(<ArtworkGrid items={mockArtworks} />);

    expect(screen.getByText("Mostrando 3 obras")).toBeInTheDocument();
    expect(screen.getByText("Test Artwork 1")).toBeInTheDocument();
    expect(screen.getByText("Test Artwork 2")).toBeInTheDocument();
    expect(screen.getByText("Test Artwork 3")).toBeInTheDocument();
  });

  it("debería mostrar el botón de mezcla aleatoria", () => {
    render(<ArtworkGrid items={mockArtworks} />);

    const shuffleButton = screen.getByRole("button", { name: /otras obras/i });
    expect(shuffleButton).toBeInTheDocument();
    expect(shuffleButton).toHaveTextContent("🎲 Otras obras");
  });

  it("debería abrir el modal al hacer click en una obra", async () => {
    const user = userEvent.setup();
    render(<ArtworkGrid items={mockArtworks} />);

    const artworkButton = screen.getByRole("button", {
      name: /ver en grande: test artwork 1/i,
    });
    await user.click(artworkButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Artwork 1")).toBeInTheDocument();
    expect(screen.getByText("Test Artist 1")).toBeInTheDocument();
    expect(screen.getByText("1985")).toBeInTheDocument();
  });

  it("debería cerrar el modal al hacer click en el botón de cerrar", async () => {
    const user = userEvent.setup();
    render(<ArtworkGrid items={mockArtworks} />);

    // Abrir modal
    const artworkButton = screen.getByRole("button", {
      name: /ver en grande: test artwork 1/i,
    });
    await user.click(artworkButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Cerrar modal
    const closeButton = screen.getByRole("button", { name: /cerrar/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("debería cerrar el modal al presionar Escape", async () => {
    const user = userEvent.setup();
    render(<ArtworkGrid items={mockArtworks} />);

    // Abrir modal
    const artworkButton = screen.getByRole("button", {
      name: /ver en grande: test artwork 1/i,
    });
    await user.click(artworkButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Presionar Escape
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("debería navegar entre obras con las flechas", async () => {
    const user = userEvent.setup();
    render(<ArtworkGrid items={mockArtworks} />);

    // Abrir modal con la primera obra
    const artworkButton = screen.getByRole("button", {
      name: /ver en grande: test artwork 1/i,
    });
    await user.click(artworkButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Verificar que se muestran las flechas
    const nextButton = screen.getByRole("button", { name: /siguiente/i });
    const prevButton = screen.getByRole("button", { name: /anterior/i });
    expect(nextButton).toBeInTheDocument();
    expect(prevButton).toBeInTheDocument();

    // Navegar a la siguiente obra
    await user.click(nextButton);
    expect(screen.getByText("Test Artwork 2")).toBeInTheDocument();

    // Navegar a la anterior
    await user.click(prevButton);
    expect(screen.getByText("Test Artwork 1")).toBeInTheDocument();
  });

  it("debería navegar con las flechas del teclado", async () => {
    const user = userEvent.setup();
    render(<ArtworkGrid items={mockArtworks} />);

    // Abrir modal
    const artworkButton = screen.getByRole("button", {
      name: /ver en grande: test artwork 1/i,
    });
    await user.click(artworkButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Navegar con flecha derecha
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("Test Artwork 2")).toBeInTheDocument();

    // Navegar con flecha izquierda
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByText("Test Artwork 1")).toBeInTheDocument();
  });

  it("debería remezclar las obras al hacer click en el botón de mezcla", async () => {
    const user = userEvent.setup();
    render(<ArtworkGrid items={mockArtworks} />);

    // Mock Math.random para simular una nueva selección
    mockMath.random = jest
      .fn()
      .mockReturnValueOnce(0.1) // Para el primer sampleo
      .mockReturnValueOnce(0.2) // Para el segundo sampleo
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.4)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.6)
      .mockReturnValueOnce(0.7); // Para el reshuffle

    const shuffleButton = screen.getByRole("button", { name: /otras obras/i });
    await user.click(shuffleButton);

    // Verificar que se actualiza el contador
    await waitFor(() => {
      expect(screen.getByText(/mostrando \d+ obras/)).toBeInTheDocument();
    });
  });

  it("debería mostrar la descripción en el modal si está disponible", async () => {
    const user = userEvent.setup();
    render(<ArtworkGrid items={mockArtworks} />);

    // Abrir modal con la primera obra (tiene descripción)
    const artworkButton = screen.getByRole("button", {
      name: /ver en grande: test artwork 1/i,
    });
    await user.click(artworkButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    expect(screen.getByText("Test description 1")).toBeInTheDocument();
  });

  it("debería manejar obras sin artista", () => {
    const artworksWithoutArtist = [
      {
        id: 1,
        title: "Test Artwork",
        artist: null,
        date: "1985",
        image: "https://example.com/image1.jpg",
      },
    ];

    render(<ArtworkGrid items={artworksWithoutArtist} />);

    expect(screen.getByText("Artista desconocido")).toBeInTheDocument();
  });

  it("debería limitar el número de obras mostradas según maxItems", () => {
    render(<ArtworkGrid items={mockArtworks} maxItems={2} />);

    expect(screen.getByText("Mostrando 2 obras (de 3)")).toBeInTheDocument();
  });
});
