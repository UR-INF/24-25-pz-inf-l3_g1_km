import axios from "axios";
import { api, createAxiosInstance, resetAxiosInstance, API_URL } from "../../services/api";

// Ustaw zmienną środowiskową dla testów
process.env.NODE_ENV = "test";

// Mockowanie axios
jest.mock("axios", () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn((callback) => {
          // Zapisz funkcję interceptora do testowania
          mockInterceptor = callback;
        }),
      },
    },
  })),
}));

// Zmienna do przechowywania funkcji interceptora
let mockInterceptor: ((config: any) => any) | null = null;
let originalLocalStorage: Storage;
let originalWindow: any;
// Zapisz oryginalne metody console
let originalConsoleLog: typeof console.log;
let originalConsoleWarn: typeof console.warn;

describe("API Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAxiosInstance();

    // Zapisz oryginalne obiekty
    originalLocalStorage = window.localStorage;
    originalWindow = { ...window };
    originalConsoleLog = console.log;
    originalConsoleWarn = console.warn;

    // Mockujemy console.log i console.warn aby wyciszyć logi podczas testów
    console.log = jest.fn();
    console.warn = jest.fn();

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    // Mock elektronAPI
    window.electronAPI = {
      getConfig: jest.fn().mockResolvedValue({ API_URL: "http://test-api.com" }),
      setConfig: jest.fn().mockResolvedValue(true),
    };

    // Reset interceptora
    mockInterceptor = null;
  });

  afterEach(() => {
    // Przywróć oryginalne obiekty
    Object.defineProperty(window, "localStorage", { value: originalLocalStorage });
    window.electronAPI = originalWindow.electronAPI;

    // Przywróć oryginalne metody console
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  });

  test("createAxiosInstance tworzy instancję axios z poprawną konfiguracją", async () => {
    await createAxiosInstance();

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://test-api.com/api",
    });
  });

  test("createAxiosInstance pobiera URL z electronAPI jeśli jest dostępne", async () => {
    // Już mockowane w beforeEach
    await createAxiosInstance();

    expect(window.electronAPI!.getConfig).toHaveBeenCalled();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://test-api.com/api",
    });
  });

  test("createAxiosInstance używa domyślnego URL jeśli electronAPI nie jest dostępne", async () => {
    // Usuń elektronu API
    window.electronAPI = undefined;

    await createAxiosInstance();

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: `${API_URL}/api`,
    });
  });

  test("createAxiosInstance używa domyślnego URL jeśli getConfig zwraca błąd", async () => {
    // Zmień mock na zwracający błąd
    window.electronAPI!.getConfig = jest.fn().mockRejectedValue(new Error("Test error"));

    await createAxiosInstance();

    expect(window.electronAPI!.getConfig).toHaveBeenCalled();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: `${API_URL}/api`,
    });
  });

  test("createAxiosInstance używa domyślnego URL jeśli getConfig zwraca pusty obiekt", async () => {
    window.electronAPI!.getConfig = jest.fn().mockResolvedValue({});

    await createAxiosInstance();

    expect(window.electronAPI!.getConfig).toHaveBeenCalled();
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: `${API_URL}/api`,
    });
  });

  test("resetAxiosInstance poprawnie resetuje instancję axios", async () => {
    // Najpierw utwórz instancję
    await createAxiosInstance();
    expect(axios.create).toHaveBeenCalledTimes(1);

    // Zresetuj instancję
    resetAxiosInstance();

    // Utwórz ponownie
    await createAxiosInstance();
    expect(axios.create).toHaveBeenCalledTimes(2);
  });

  test("interceptor dodaje token do nagłówków dla prywatnych tras", async () => {
    const token = "test-token";
    (window.localStorage.getItem as jest.Mock).mockReturnValue(token);

    await createAxiosInstance();

    // Sprawdź, czy interceptor został zarejestrowany
    expect(mockInterceptor).not.toBeNull();

    // Przetestuj interceptor na prywatnej trasie
    const config = { url: "/employees/me" };
    const modifiedConfig = mockInterceptor!(config);

    expect(modifiedConfig).toMatchObject({
      url: "/employees/me",
      headers: { Authorization: `Bearer ${token}` },
    });
  });

  test("interceptor nie dodaje tokenu do publicznych tras z /auth/", async () => {
    const token = "test-token";
    (window.localStorage.getItem as jest.Mock).mockReturnValue(token);

    await createAxiosInstance();

    // Przetestuj interceptor na publicznej trasie
    const config = { url: "/auth/login" };
    const modifiedConfig = mockInterceptor!(config);

    expect(modifiedConfig).toMatchObject({
      url: "/auth/login",
    });
    expect(modifiedConfig.headers?.Authorization).toBeUndefined();
  });

  test("interceptor nie dodaje tokenu jeśli nie jest dostępny", async () => {
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    await createAxiosInstance();

    const config = { url: "/employees/me" };
    const modifiedConfig = mockInterceptor!(config);

    expect(modifiedConfig).toMatchObject({
      url: "/employees/me",
    });
    expect(modifiedConfig.headers?.Authorization).toBeUndefined();
  });

  test("api.get wywołuje axios.get z poprawnymi parametrami", async () => {
    const getMock = jest.fn().mockResolvedValue({ data: "test-data" });
    (axios.create as jest.Mock).mockReturnValue({
      get: getMock,
      interceptors: {
        request: { use: jest.fn() },
      },
    });

    const result = await api.get("/test", { page: 1 }, { timeout: 1000 });

    expect(getMock).toHaveBeenCalledWith("/test", {
      params: { page: 1 },
      timeout: 1000,
    });
  });

  test("api.post wywołuje axios.post z poprawnymi parametrami", async () => {
    const postMock = jest.fn().mockResolvedValue({ data: "test-data" });
    (axios.create as jest.Mock).mockReturnValue({
      post: postMock,
      interceptors: {
        request: { use: jest.fn() },
      },
    });

    const requestData = { name: "Test" };
    const result = await api.post("/test", requestData, { timeout: 1000 });

    expect(postMock).toHaveBeenCalledWith("/test", requestData, { timeout: 1000 });
  });

  test("api.put wywołuje axios.put z poprawnymi parametrami", async () => {
    const putMock = jest.fn().mockResolvedValue({ data: "test-data" });
    (axios.create as jest.Mock).mockReturnValue({
      put: putMock,
      interceptors: {
        request: { use: jest.fn() },
      },
    });

    const requestData = { name: "Test" };
    const result = await api.put("/test/1", requestData, { timeout: 1000 });

    expect(putMock).toHaveBeenCalledWith("/test/1", requestData, { timeout: 1000 });
  });

  test("api.delete wywołuje axios.delete z poprawnymi parametrami", async () => {
    const deleteMock = jest.fn().mockResolvedValue({ data: "test-data" });
    (axios.create as jest.Mock).mockReturnValue({
      delete: deleteMock,
      interceptors: {
        request: { use: jest.fn() },
      },
    });

    const result = await api.delete("/test/1", { timeout: 1000 });

    expect(deleteMock).toHaveBeenCalledWith("/test/1", { timeout: 1000 });
  });
});
