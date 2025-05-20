import { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { setupAuthInterceptor } from "../../services/setupAxiosAuth";

// Czyścimy cache modułu przed testami
beforeEach(() => {
  jest.resetModules();
});

describe("setupAxiosAuth", () => {
  // Po każdym teście musimy przywrócić oryginalną wartość flagi isInterceptorRegistered
  // Tworzymy zmienną do przechowywania referencji do modułu
  let setupAxiosAuthModule: any;

  beforeEach(() => {
    // Resetujemy flagi modułu poprzez reimport
    jest.resetModules();
    setupAxiosAuthModule = require("../../services/setupAxiosAuth");

    // Mockujemy console.warn
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("rejestruje interceptor odpowiedzi", async () => {
    // Przygotowujemy mock Axios
    const mockAxios: AxiosInstance = {
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as unknown as AxiosInstance;

    const mockOnUnauthorized = jest.fn();

    // Wywołujemy testowaną funkcję
    await setupAxiosAuthModule.setupAuthInterceptor(mockAxios, {
      onUnauthorized: mockOnUnauthorized,
    });

    // Sprawdzamy, czy interceptor został zarejestrowany
    expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
  });

  test("interceptor wywołuje onUnauthorized gdy status odpowiedzi to 401", async () => {
    // Przygotowujemy mock funkcji i interceptorów
    const mockOnUnauthorized = jest.fn();
    const consoleWarnSpy = jest.spyOn(console, "warn");

    // Przygotowujemy mocka axios z funkcją wywoływania interceptorów
    let errorInterceptor: any;

    const mockAxios: AxiosInstance = {
      interceptors: {
        response: {
          use: jest.fn((successFn, errorFn) => {
            // Zapisujemy funkcję error interceptora żebyśmy mogli ją wywołać
            errorInterceptor = errorFn;
          }),
        },
      },
    } as unknown as AxiosInstance;

    // Wywołujemy testowaną funkcję
    await setupAxiosAuthModule.setupAuthInterceptor(mockAxios, {
      onUnauthorized: mockOnUnauthorized,
    });

    // Sprawdzamy, czy interceptor został zarejestrowany
    expect(mockAxios.interceptors.response.use).toHaveBeenCalled();

    // Tworzymy przykładowy błąd z kodem 401
    const mockError = {
      response: {
        status: 401,
      },
    } as AxiosError;

    // Wywołujemy funkcję interceptora z błędem 401
    try {
      await errorInterceptor(mockError);
    } catch (e) {
      // Sprawdzamy, czy onUnauthorized został wywołany
      expect(mockOnUnauthorized).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith("401 - użytkownik niezautoryzowany");
    }
  });

  test("interceptor nie wywołuje onUnauthorized dla innych kodów błędów", async () => {
    // Przygotowujemy mock funkcji i interceptorów
    const mockOnUnauthorized = jest.fn();
    const consoleWarnSpy = jest.spyOn(console, "warn");

    // Przygotowujemy mocka axios z funkcją wywoływania interceptorów
    let errorInterceptor: any;

    const mockAxios: AxiosInstance = {
      interceptors: {
        response: {
          use: jest.fn((successFn, errorFn) => {
            // Zapisujemy funkcję error interceptora żebyśmy mogli ją wywołać
            errorInterceptor = errorFn;
          }),
        },
      },
    } as unknown as AxiosInstance;

    // Wywołujemy testowaną funkcję
    await setupAxiosAuthModule.setupAuthInterceptor(mockAxios, {
      onUnauthorized: mockOnUnauthorized,
    });

    // Sprawdzamy, czy interceptor został zarejestrowany
    expect(mockAxios.interceptors.response.use).toHaveBeenCalled();

    // Tworzymy przykładowy błąd z kodem 404
    const mockError = {
      response: {
        status: 404,
      },
    } as AxiosError;

    // Wywołujemy funkcję interceptora z błędem 404
    try {
      await errorInterceptor(mockError);
    } catch (e) {
      // Sprawdzamy, czy onUnauthorized NIE został wywołany
      expect(mockOnUnauthorized).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    }
  });

  test("nie rejestruje interceptora ponownie, jeśli już jest zarejestrowany", async () => {
    // Przygotowujemy mock Axios
    const mockAxios: AxiosInstance = {
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    } as unknown as AxiosInstance;

    const mockOnUnauthorized = jest.fn();

    // Wywołujemy testowaną funkcję
    await setupAxiosAuthModule.setupAuthInterceptor(mockAxios, {
      onUnauthorized: mockOnUnauthorized,
    });

    // Sprawdzamy, czy interceptor został zarejestrowany
    expect(mockAxios.interceptors.response.use).toHaveBeenCalledTimes(1);

    // Resetujemy mock
    jest.clearAllMocks();

    // Wywołujemy funkcję ponownie - nie powinno dojść do ponownej rejestracji
    await setupAxiosAuthModule.setupAuthInterceptor(mockAxios, {
      onUnauthorized: mockOnUnauthorized,
    });

    // Sprawdzamy, czy interceptor NIE został zarejestrowany ponownie
    expect(mockAxios.interceptors.response.use).not.toHaveBeenCalled();
  });
});
