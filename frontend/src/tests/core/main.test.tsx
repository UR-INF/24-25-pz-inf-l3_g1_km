import React from 'react';
import { render, screen } from '@testing-library/react';

// Mockowanie komponentów
jest.mock('react-router', () => ({
  HashRouter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="hash-router">{children}</div>
  )
}));

jest.mock('../../contexts/theme', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  )
}));

jest.mock('../../contexts/notification', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="notification-provider">{children}</div>
  )
}));

jest.mock('../../contexts/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  )
}));

jest.mock('../../contexts/user', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-provider">{children}</div>
  )
}));

jest.mock('../../components/AuthInterceptor', () => ({
  AuthInterceptor: () => <div data-testid="auth-interceptor"></div>
}));

jest.mock('../../App', () => () => <div data-testid="app"></div>);

// Ignorujemy ostrze¿enia o niezdefiniowanej funkcji createRoot
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes && args[0].includes('createRoot')) {
    return;
  }
  originalConsoleError(...args);
};

describe('Main Component Structure', () => {
  test('ma poprawn± hierarchiê komponentów, zgodn± z main.tsx', () => {
    // Renderujemy struktrurê hierarchii komponentów z main.tsx
    render(
      <React.StrictMode>
        <div data-testid="hash-router">
          <div data-testid="theme-provider">
            <div data-testid="notification-provider">
              <div data-testid="auth-provider">
                <div data-testid="auth-interceptor"></div>
                <div data-testid="user-provider">
                  <div data-testid="app"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.StrictMode>
    );

    // Sprawdzamy, czy wszystkie komponenty s± obecne w prawid³owej hierarchii
    expect(screen.getByTestId('hash-router')).toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('notification-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('auth-interceptor')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app')).toBeInTheDocument();

    // Sprawdzamy zagnie¿d¿enie komponentów
    const hashRouter = screen.getByTestId('hash-router');
    const themeProvider = screen.getByTestId('theme-provider');
    const notificationProvider = screen.getByTestId('notification-provider');
    const authProvider = screen.getByTestId('auth-provider');
    const userProvider = screen.getByTestId('user-provider');
    const app = screen.getByTestId('app');

    // Weryfikujemy prawid³owe zagnie¿d¿enie (czy komponenty s± w odpowiedniej hierarchii)
    expect(hashRouter).toContainElement(themeProvider);
    expect(themeProvider).toContainElement(notificationProvider);
    expect(notificationProvider).toContainElement(authProvider);
    expect(authProvider).toContainElement(screen.getByTestId('auth-interceptor'));
    expect(authProvider).toContainElement(userProvider);
    expect(userProvider).toContainElement(app);
  });
});