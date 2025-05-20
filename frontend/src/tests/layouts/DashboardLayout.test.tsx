import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import DashboardLayout from '../../layouts/DashboardLayout';

// Mockowanie komponentów używanych w DashboardLayout
jest.mock('../../components/HeaderNav/HeaderNav', () => () => <div data-testid="header-nav">Header Nav</div>);
jest.mock('../../components/Titlebar', () => () => <div data-testid="titlebar">Titlebar</div>);

// Tworzymy zmienną do przechowywania funkcji onHeightChange
let footerHeightChangeFn: ((height: number) => void) | null = null;

// Mockowanie Footer
jest.mock('../../components/Footer', () => ({ onHeightChange }: { onHeightChange: (height: number) => void }) => {
  // Zapisujemy funkcję aby móc ją wywołać później
  footerHeightChangeFn = onHeightChange;
  return <div data-testid="footer">Footer</div>;
});

// Mockowanie react-router Outlet
jest.mock('react-router', () => ({
  Outlet: () => <div data-testid="outlet-content">Page content</div>,
}));

describe('DashboardLayout', () => {
  test('renderuje wszystkie komponenty układu strony', () => {
    render(<DashboardLayout />);

    // Sprawdzamy czy wszystkie komponenty są poprawnie renderowane
    expect(screen.getByTestId('titlebar')).toBeInTheDocument();
    expect(screen.getByTestId('header-nav')).toBeInTheDocument();
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  test('ma sticky header z odpowiednią klasą i z-indeksem', () => {
    render(<DashboardLayout />);

    const header = screen.getByTestId('titlebar').parentElement;
    expect(header).toHaveClass('sticky-top');
    expect(header).toHaveClass('z-3');
  });

  test('główna zawartość ma padding-bottom dostosowany do wysokości footera', async () => {
    render(<DashboardLayout />);

    // Wywołujemy funkcję zmiany wysokości footera po renderowaniu
    // Używamy act() aby poinformować React o zmianie stanu
    if (footerHeightChangeFn) {
      await act(async () => {
        footerHeightChangeFn(75); // Testowa wysokość footera
      });
    }

    // Szukamy kontenera zawartości
    const contentContainer = screen.getByTestId('outlet-content').parentElement;

    // Sprawdzamy czy ma odpowiednie klasy
    expect(contentContainer).toHaveClass('flex-grow-1');
    expect(contentContainer).toHaveClass('overflow-auto');

    // Używamy waitFor aby poczekać na zakończenie asynchronicznego renderowania
    await waitFor(() => {
      expect(contentContainer).toHaveStyle('padding-bottom: 75px');
    });
  });

  test('cały layout ma pełną wysokość viewport', () => {
    render(<DashboardLayout />);

    // Znajdujemy główny kontener (rodzic wszystkich elementów)
    const mainContainer = screen.getByTestId('titlebar').parentElement?.parentElement;

    // Sprawdzamy czy ma klasę vh-100 dla pełnej wysokości
    expect(mainContainer).toHaveClass('vh-100');
    expect(mainContainer).toHaveClass('d-flex');
    expect(mainContainer).toHaveClass('flex-column');
  });
});