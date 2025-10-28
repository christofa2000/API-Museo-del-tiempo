import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as apis from "../../lib/apis";
import Page from "../page";

// Mock de las APIs
jest.mock("../../lib/apis");
const mockedApis = apis as jest.Mocked<typeof apis>;

// Mock de decadeSummaries
jest.mock("../../lib/decadeSummaries", () => ({
  decadeSummaries: {
    1980: "Los años 1980 fueron una década de cambios...",
    1990: "Los años 1990 marcaron el fin de la Guerra Fría...",
  },
}));

const mockSong = {
  trackName: "Test Song",
  artistName: "Test Artist",
  previewUrl: "https://example.com/preview.mp3",
  artworkUrl100: "https://example.com/artwork.jpg",
  collectionName: "Test Album",
  releaseDate: "1985-01-01T00:00:00Z",
  primaryGenreName: "Rock",
  trackViewUrl: "https://example.com/track",
  year: 1985,
  country: "US",
  query: "top hits 1985",
};

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
];

describe.skip("Page Integration", () => {
  // TODO: Fix module resolution error. Steps: check jest moduleNameMapper or use relative imports
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock de las funciones de API
    mockedApis.searchRandomSongByDecade.mockResolvedValue(mockSong);
    mockedApis.artByDecade.mockResolvedValue(mockArtworks);
  });

  it("debería cargar y mostrar contenido inicial", async () => {
    render(<Page />);

    // Verificar que se muestra el título principal
    expect(screen.getByText("Museo del Tiempo")).toBeInTheDocument();

    // Verificar que se muestran las cards de décadas
    expect(screen.getByText("1940")).toBeInTheDocument();
    expect(screen.getByText("1950")).toBeInTheDocument();

    // Esperar a que se cargue el contenido
    await waitFor(() => {
      expect(
        screen.getByText("Canción aleatoria de los 1980s")
      ).toBeInTheDocument();
    });

    // Verificar que se cargó la canción
    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(screen.getByText("Test Artist")).toBeInTheDocument();

    // Verificar que se cargó el contexto histórico
    expect(screen.getByText("Contexto histórico")).toBeInTheDocument();
    expect(
      screen.getByText("Los años 1980 fueron una década de cambios...")
    ).toBeInTheDocument();

    // Verificar que se cargaron las obras de arte
    expect(screen.getByText("Obras icónicas")).toBeInTheDocument();
    expect(screen.getByText("Test Artwork 1")).toBeInTheDocument();
    expect(screen.getByText("Test Artwork 2")).toBeInTheDocument();
  });

  it("debería cambiar de década y actualizar el contenido", async () => {
    const user = userEvent.setup();
    render(<Page />);

    // Esperar a que se cargue el contenido inicial
    await waitFor(() => {
      expect(screen.getByText("Test Song")).toBeInTheDocument();
    });

    // Cambiar a los 1990s - buscar la card con el año 1990
    const ninetiesCard = screen.getByText("1990").closest("div")?.parentElement;
    if (ninetiesCard) {
      await user.click(ninetiesCard);
    }

    // Verificar que se actualiza el título de la sección
    await waitFor(() => {
      expect(
        screen.getByText("Canción aleatoria de los 1990s")
      ).toBeInTheDocument();
    });

    // Verificar que se llamaron las APIs con la nueva década
    expect(mockedApis.searchRandomSongByDecade).toHaveBeenCalledWith(1990);
    expect(mockedApis.artByDecade).toHaveBeenCalledWith(1990);
  });

  it("debería mostrar estado de carga durante la transición", async () => {
    const user = userEvent.setup();

    // Mock de API lenta
    mockedApis.searchRandomSongByDecade.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockSong), 100))
    );

    render(<Page />);

    // Cambiar de década
    const ninetiesCard = screen.getByText("1990").closest("div")?.parentElement;
    if (ninetiesCard) {
      await user.click(ninetiesCard);
    }

    // Verificar que se muestra el estado de carga
    expect(
      screen.getByText("Cargando contenido de los 1990s...")
    ).toBeInTheDocument();
  });

  it("debería manejar errores de API graciosamente", async () => {
    // Mock de API que falla
    mockedApis.searchRandomSongByDecade.mockRejectedValue(
      new Error("API Error")
    );
    mockedApis.artByDecade.mockResolvedValue([]);

    render(<Page />);

    // Esperar a que se complete la carga (aunque falle)
    await waitFor(() => {
      expect(
        screen.getByText("No se encontró una canción para esta década.")
      ).toBeInTheDocument();
    });

    // Verificar que las obras se cargan normalmente
    expect(screen.getByText("Test Artwork 1")).toBeInTheDocument();
  });

  it("debería permitir cambiar de canción con el botón de reroll", async () => {
    const user = userEvent.setup();
    render(<Page />);

    // Esperar a que se cargue el contenido inicial
    await waitFor(() => {
      expect(screen.getByText("Test Song")).toBeInTheDocument();
    });

    // Hacer click en el botón de otra canción
    const rerollButton = screen.getByRole("button", { name: /otra canción/i });
    await user.click(rerollButton);

    // Verificar que se llama la API nuevamente
    expect(mockedApis.searchRandomSongByDecade).toHaveBeenCalledTimes(2);
  });

  it("debería mostrar información adicional de la canción", async () => {
    render(<Page />);

    // Esperar a que se cargue el contenido
    await waitFor(() => {
      expect(screen.getByText("Test Song")).toBeInTheDocument();
    });

    // Verificar que se muestra la información adicional
    expect(screen.getByText("País: US")).toBeInTheDocument();
    expect(screen.getByText("Año: 1985")).toBeInTheDocument();
    expect(screen.getByText("Género: Rock")).toBeInTheDocument();
  });

  it("debería manejar canciones sin información adicional", async () => {
    const songWithoutExtras = {
      ...mockSong,
      country: undefined,
      year: undefined,
      primaryGenreName: undefined,
    };

    mockedApis.searchRandomSongByDecade.mockResolvedValue(songWithoutExtras);

    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Test Song")).toBeInTheDocument();
    });

    // Verificar que no se muestra información adicional
    expect(screen.queryByText("País:")).not.toBeInTheDocument();
    expect(screen.queryByText("Año:")).not.toBeInTheDocument();
    expect(screen.queryByText("Género:")).not.toBeInTheDocument();
  });

  it("debería mostrar el contador de obras correctamente", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Mostrando 2 obras")).toBeInTheDocument();
    });
  });

  it("debería permitir interacción con el ArtworkGrid", async () => {
    const user = userEvent.setup();
    render(<Page />);

    // Esperar a que se carguen las obras
    await waitFor(() => {
      expect(screen.getByText("Test Artwork 1")).toBeInTheDocument();
    });

    // Hacer click en una obra para abrir el modal
    const artworkButton = screen.getByRole("button", {
      name: /ver en grande: test artwork 1/i,
    });
    await user.click(artworkButton);

    // Verificar que se abre el modal
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Verificar que se muestra la información de la obra en el modal
    expect(screen.getByText("Test Artwork 1")).toBeInTheDocument();
    expect(screen.getByText("Test Artist 1")).toBeInTheDocument();
  });
});
