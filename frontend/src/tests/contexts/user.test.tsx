import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { UserProvider, useUser, RoleName } from '../../contexts/user';
import { api } from '../../services/api';

// Mockujemy moduł api
jest.mock('../../services/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

// Mockujemy localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Przykładowe dane użytkownika do testów
const mockUserData = {
  id: 123,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan.kowalski@example.com',
  phoneNumber: '+48123456789',
  role: {
    id: 2,
    name: RoleName.MANAGER
  },
  avatarFilename: 'avatar.jpg',
  avatarUrl: 'http://example.com/avatar.jpg',
  notificationsEnabled: true
};

// Komponent testowy używający kontekstu
const TestComponent = ({ onRender }: { onRender: (data: any) => void }) => {
  const userContext = useUser();
  onRender(userContext);
  return (
    <div>
      <div data-testid="loading">{userContext.loading ? 'true' : 'false'}</div>
      <div data-testid="error">{userContext.error || 'null'}</div>
      {userContext.user && (
        <>
          <div data-testid="user-id">{userContext.userId}</div>
          <div data-testid="user-name">{userContext.userFirstName} {userContext.userLastName}</div>
          <div data-testid="user-email">{userContext.userEmail}</div>
          <div data-testid="user-role">{userContext.userRoleName}</div>
        </>
      )}
      <button data-testid="fetch-user" onClick={userContext.fetchUser}>
        Odśwież dane użytkownika
      </button>
    </div>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('początkowo ustawia loading=true', () => {
    const handleRender = jest.fn();

    render(
      <UserProvider>
        <TestComponent onRender={handleRender} />
      </UserProvider>
    );

    // Sprawdzamy pierwsze wywołanie - powinno mieć loading=true
    expect(handleRender).toHaveBeenCalledWith(
      expect.objectContaining({
        loading: true,
        user: null,
        error: null
      })
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
  });

  test('nie pobiera danych użytkownika gdy nie ma tokenu', async () => {
    const handleRender = jest.fn();

    render(
      <UserProvider>
        <TestComponent onRender={handleRender} />
      </UserProvider>
    );

    // Sprawdzamy czy getItem zostało wywołane dla tokenu
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');

    // Przesuwamy czas do przodu o 1000ms (czas opóźnienia)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Sprawdzamy czy api.get nie zostało wywołane
    expect(api.get).not.toHaveBeenCalled();

    // Po timeoucie loading powinien być false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  test('pobiera dane użytkownika gdy jest token', async () => {
    // Ustawiamy token w localStorage
    localStorageMock.setItem('token', 'test-token');

    // Mockujemy odpowiedź z API
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockUserData });

    const handleRender = jest.fn();

    render(
      <UserProvider>
        <TestComponent onRender={handleRender} />
      </UserProvider>
    );

    // Sprawdzamy czy getItem zostało wywołane dla tokenu
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');

    // Przesuwamy czas do przodu o 1000ms (czas opóźnienia)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Czekamy na zakończenie asynchronicznych operacji
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/employees/me');
    });

    // Po pobraniu danych loading powinien być false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Sprawdzamy czy dane użytkownika są poprawnie wyświetlane
    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Jan Kowalski');
      expect(screen.getByTestId('user-email')).toHaveTextContent('jan.kowalski@example.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('MANAGER');
    });
  });

  test('obsługuje błędy podczas pobierania danych użytkownika', async () => {
    // Ustawiamy token w localStorage
    localStorageMock.setItem('token', 'test-token');

    // Mockujemy błąd z API
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    const handleRender = jest.fn();

    render(
      <UserProvider>
        <TestComponent onRender={handleRender} />
      </UserProvider>
    );

    // Przesuwamy czas do przodu o 1000ms (czas opóźnienia)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Czekamy na zakończenie asynchronicznych operacji
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/employees/me');
    });

    // Po błędzie loading powinien być false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Sprawdzamy czy błąd jest poprawnie wyświetlany
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Nie udało się pobrać danych użytkownika.');
    });

    // User powinien być null
    expect(handleRender).toHaveBeenCalledWith(
      expect.objectContaining({
        user: null,
        error: 'Nie udało się pobrać danych użytkownika.'
      })
    );
  });

  test('pozwala na ręczne odświeżenie danych użytkownika', async () => {
    // Ustawiamy token w localStorage
    localStorageMock.setItem('token', 'test-token');

    // Mockujemy pierwsze wywołanie API z błędem
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('API error'));

    const handleRender = jest.fn();

    render(
      <UserProvider>
        <TestComponent onRender={handleRender} />
      </UserProvider>
    );

    // Przesuwamy czas do przodu
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Czekamy na zakończenie pierwszego wywołania API (zakończonego błędem)
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('error')).toHaveTextContent('Nie udało się pobrać danych użytkownika.');
    });

    // Mockujemy drugie wywołanie API z sukcesem
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockUserData });

    // Klikamy przycisk odświeżenia
    act(() => {
      screen.getByTestId('fetch-user').click();
    });

    // Sprawdzamy czy API zostało wywołane drugi raz
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
    });

    // Sprawdzamy czy dane zostały zaktualizowane
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('null');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Jan Kowalski');
    });
  });
});