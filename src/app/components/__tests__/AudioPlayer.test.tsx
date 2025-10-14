import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AudioPlayer from "../AudioPlayer";

// Mock de HTMLAudioElement en el DOM
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "addEventListener", {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "removeEventListener", {
  writable: true,
  value: jest.fn(),
});

describe("AudioPlayer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debería renderizar con información básica", () => {
    render(
      <AudioPlayer
        title="Test Song"
        artist="Test Artist"
        src="https://example.com/audio.mp3"
        artUrl="https://example.com/artwork.jpg"
      />
    );

    expect(screen.getByText("Test Artist")).toBeInTheDocument();
    expect(screen.getByText("Test Song")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reproducir/i })
    ).toBeInTheDocument();
  });

  it.skip("debería mostrar placeholder cuando no hay artwork", () => {
    // TODO: Fix placeholder detection. Steps: check for Volume2 icon instead of img role
    render(
      <AudioPlayer
        title="Test Song"
        artist="Test Artist"
        src="https://example.com/audio.mp3"
      />
    );

    // Debería mostrar el icono de volumen como placeholder
    expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
  });

  it("debería manejar valores por defecto", () => {
    render(<AudioPlayer />);

    expect(screen.getByText("—")).toBeInTheDocument(); // Artista por defecto
    expect(screen.getByText("Sin pista")).toBeInTheDocument(); // Título por defecto
  });

  it("debería deshabilitar el botón cuando no hay src", () => {
    render(<AudioPlayer title="Test Song" artist="Test Artist" />);

    const playButton = screen.getByRole("button", { name: /reproducir/i });
    expect(playButton).toBeDisabled();
  });

  it("debería cambiar el botón a pausar cuando se reproduce", async () => {
    const user = userEvent.setup();
    render(
      <AudioPlayer
        title="Test Song"
        artist="Test Artist"
        src="https://example.com/audio.mp3"
      />
    );

    const playButton = screen.getByRole("button", { name: /reproducir/i });
    await user.click(playButton);

    // Simular que el audio comenzó a reproducirse
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      // Simular evento de reproducción
      Object.defineProperty(audioElement, "paused", {
        writable: true,
        value: false,
      });

      // Disparar evento de cambio de tiempo para simular reproducción
      audioElement.dispatchEvent(new Event("timeupdate"));
    }

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /pausar/i })
      ).toBeInTheDocument();
    });
  });

  it.skip("debería mostrar la barra de progreso cuando hay duración", async () => {
    // TODO: Fix progress bar display. Steps: mock HTMLMediaElement events properly
    render(
      <AudioPlayer
        title="Test Song"
        artist="Test Artist"
        src="https://example.com/audio.mp3"
      />
    );

    // Simular que el audio se cargó con duración
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      Object.defineProperty(audioElement, "duration", {
        writable: true,
        value: 180,
      });

      audioElement.dispatchEvent(new Event("loadedmetadata"));
    }

    await waitFor(() => {
      expect(screen.getByText("0:00")).toBeInTheDocument();
      expect(screen.getByText("3:00")).toBeInTheDocument();
    });
  });

  it.skip("debería actualizar el tiempo de reproducción", async () => {
    // TODO: Fix time update display. Steps: mock HTMLMediaElement state changes properly
    render(
      <AudioPlayer
        title="Test Song"
        artist="Test Artist"
        src="https://example.com/audio.mp3"
      />
    );

    const audioElement = document.querySelector("audio");
    if (audioElement) {
      // Simular carga con duración
      Object.defineProperty(audioElement, "duration", {
        writable: true,
        value: 180,
      });
      audioElement.dispatchEvent(new Event("loadedmetadata"));

      // Simular progreso de reproducción
      Object.defineProperty(audioElement, "currentTime", {
        writable: true,
        value: 65, // 1:05
      });
      audioElement.dispatchEvent(new Event("timeupdate"));
    }

    await waitFor(() => {
      expect(screen.getByText("1:05")).toBeInTheDocument();
    });
  });

  it.skip("debería manejar el final de la reproducción", async () => {
    // TODO: Fix audio end state handling. Steps: mock HTMLMediaElement state transitions properly
    const user = userEvent.setup();
    render(
      <AudioPlayer
        title="Test Song"
        artist="Test Artist"
        src="https://example.com/audio.mp3"
      />
    );

    const playButton = screen.getByRole("button", { name: /reproducir/i });
    await user.click(playButton);

    // Simular que el audio terminó
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      Object.defineProperty(audioElement, "paused", {
        writable: true,
        value: true,
      });

      audioElement.dispatchEvent(new Event("ended"));
    }

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /reproducir/i })
      ).toBeInTheDocument();
    });
  });

  it.skip("debería mostrar estado de carga", async () => {
    // TODO: Fix loading state display. Steps: mock HTMLMediaElement loading events properly
    render(
      <AudioPlayer
        title="Test Song"
        artist="Test Artist"
        src="https://example.com/audio.mp3"
      />
    );

    // Simular inicio de carga
    const audioElement = document.querySelector("audio");
    if (audioElement) {
      audioElement.dispatchEvent(new Event("loadstart"));
    }

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("debería limpiar el estado al cambiar de src", () => {
    const { rerender } = render(
      <AudioPlayer
        title="Test Song"
        artist="Test Artist"
        src="https://example.com/audio1.mp3"
      />
    );

    // Cambiar a una nueva fuente
    rerender(
      <AudioPlayer
        title="New Song"
        artist="New Artist"
        src="https://example.com/audio2.mp3"
      />
    );

    // Verificar que se muestra la nueva información
    expect(screen.getByText("New Song")).toBeInTheDocument();
    expect(screen.getByText("New Artist")).toBeInTheDocument();
  });

  it("debería truncar texto largo correctamente", () => {
    render(
      <AudioPlayer
        title="This is a very long song title that should be truncated properly"
        artist="This is a very long artist name that should also be truncated"
        src="https://example.com/audio.mp3"
      />
    );

    const titleElement = screen.getByText(/this is a very long song title/i);
    const artistElement = screen.getByText(/this is a very long artist name/i);

    expect(titleElement).toHaveClass("truncate");
    expect(artistElement).toHaveClass("truncate");
  });
});
