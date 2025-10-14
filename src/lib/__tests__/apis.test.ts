import axios from "axios";
import {
  artByDecade,
  searchRandomSongByDecade,
  wikipediaSummary,
} from "../apis";

// Mock de axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock de Math.random para tests deterministas
const mockMath = Object.create(global.Math);
global.Math = mockMath;

describe.skip("lib/apis", () => {
  // TODO: Fix source map error with ts-jest. Steps: simplify transform config or use babel-jest
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchRandomSongByDecade", () => {
    it("debería devolver una canción aleatoria para una década válida", async () => {
      // Mock de Math.random para controlar la selección
      mockMath.random = jest
        .fn()
        .mockReturnValueOnce(0.3) // año: 1980 + 3 = 1983
        .mockReturnValueOnce(0.2); // país: índice 2 = "AR"

      const mockResponse = {
        data: {
          results: [
            {
              trackName: "Test Song",
              artistName: "Test Artist",
              previewUrl: "https://example.com/preview.mp3",
              artworkUrl100: "https://example.com/artwork.jpg",
              collectionName: "Test Album",
              releaseDate: "1983-01-01T00:00:00Z",
              primaryGenreName: "Rock",
              trackViewUrl: "https://example.com/track",
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await searchRandomSongByDecade(1980);

      expect(result).toEqual({
        trackName: "Test Song",
        artistName: "Test Artist",
        previewUrl: "https://example.com/preview.mp3",
        artworkUrl100: "https://example.com/artwork.jpg",
        collectionName: "Test Album",
        releaseDate: "1983-01-01T00:00:00Z",
        primaryGenreName: "Rock",
        trackViewUrl: "https://example.com/track",
        year: 1983,
        country: "AR",
        query: "top hits 1983",
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("itunes.apple.com/search")
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("country=AR")
      );
    });

    it("debería devolver null cuando no hay resultados", async () => {
      mockMath.random = jest
        .fn()
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.1);

      mockedAxios.get.mockResolvedValue({ data: { results: [] } });

      const result = await searchRandomSongByDecade(1950);

      expect(result).toBeNull();
    });

    it("debería manejar errores de API graciosamente", async () => {
      mockMath.random = jest
        .fn()
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.1);

      mockedAxios.get.mockRejectedValue(new Error("API Error"));

      const result = await searchRandomSongByDecade(1980);

      expect(result).toBeNull();
    });
  });

  describe("wikipediaSummary", () => {
    it("debería devolver un resumen de Wikipedia para una década", async () => {
      const mockResponse = {
        data: {
          title: "Años 1980",
          extract: "Los años 1980 fueron una década de cambios...",
          content_urls: {
            desktop: {
              page: "https://es.wikipedia.org/wiki/A%C3%B1os_1980",
            },
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await wikipediaSummary("1980s");

      expect(result).toEqual({
        title: "Años 1980",
        extract: "Los años 1980 fueron una década de cambios...",
        url: "https://es.wikipedia.org/wiki/A%C3%B1os_1980",
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://es.wikipedia.org/api/rest_v1/page/summary/1980s"
      );
    });

    it("debería manejar URLs sin content_urls", async () => {
      const mockResponse = {
        data: {
          title: "Test Title",
          extract: "Test extract",
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await wikipediaSummary("test");

      expect(result).toEqual({
        title: "Test Title",
        extract: "Test extract",
        url: undefined,
      });
    });
  });

  describe("artByDecade", () => {
    it("debería devolver obras de arte filtradas por década", async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              title: "Test Artwork 1",
              artist_title: "Test Artist 1",
              date_display: "1985",
              date_start: 1985,
              date_end: 1985,
              image_id: "test-image-1",
              description: "Test description 1",
            },
            {
              id: 2,
              title: "Test Artwork 2",
              artist_title: "Test Artist 2",
              date_display: "1987",
              date_start: 1987,
              date_end: 1987,
              image_id: "test-image-2",
              description: "Test description 2",
            },
            // Obra fuera del rango (debería ser filtrada)
            {
              id: 3,
              title: "Old Artwork",
              artist_title: "Old Artist",
              date_display: "1975",
              date_start: 1975,
              date_end: 1975,
              image_id: "old-image",
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await artByDecade(1980);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: "Test Artwork 1",
        artist: "Test Artist 1",
        date: "1985",
        image:
          "https://www.artic.edu/iiif/2/test-image-1/full/843,/0/default.jpg",
        description: "Test description 1",
      });
      expect(result[1]).toEqual({
        id: 2,
        title: "Test Artwork 2",
        artist: "Test Artist 2",
        date: "1987",
        image:
          "https://www.artic.edu/iiif/2/test-image-2/full/843,/0/default.jpg",
        description: "Test description 2",
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("api.artic.edu/api/v1/artworks/search")
      );
    });

    it("debería limitar a 6 obras y eliminar duplicados", async () => {
      // Crear 8 obras con algunos duplicados
      const artworks = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        title: i < 4 ? "Same Title" : `Unique Title ${i}`,
        artist_title: i < 4 ? "Same Artist" : `Artist ${i}`,
        date_display: "1985",
        date_start: 1985,
        date_end: 1985,
        image_id: `image-${i}`,
      }));

      const mockResponse = {
        data: { data: artworks },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await artByDecade(1980);

      // Debería limitar a 6 y eliminar duplicados
      expect(result).toHaveLength(6);
      expect(result[0].title).toBe("Same Title"); // Solo el primer duplicado
    });

    it("debería manejar obras sin imagen", async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              title: "Artwork without image",
              artist_title: "Test Artist",
              date_display: "1985",
              date_start: 1985,
              date_end: 1985,
              image_id: null,
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await artByDecade(1980);

      expect(result).toHaveLength(0); // Debería filtrar obras sin imagen
    });
  });
});
