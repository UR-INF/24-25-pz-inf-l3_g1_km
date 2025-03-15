Programowanie zespołowe laboratorium _**3**_ grupa _**1**_

# Dokumentacja projetu: **System do zarządzania zadaniami w hotelu**

## Zespoł projetowy:
- Krzysztof Motas (Lider) - ...
- Konrad Pluta - ...
- Patryk Jarosiewicz - ...
- Jakub Orczyk - ...

## Opis aplikacji

## Cel projektu 
Aplikacja Hotel Task Manager to narzędzie do zarządzania zadaniami w hotelach, które usprawnia komunikację między pracownikami w zespole. System umożliwia delegowanie zadań, śledzenie ich postępu, automatyzację powiadomień oraz analizę wydajności personelu. Dzięki intuicyjnemu interfejsowi, pracownicy mogą na bieżąco otrzymywać i aktualizować informacje o swoich obowiązkach, co poprawia organizację pracy w hotelu.

## Zakres projektu

## Wymagania stawiane aplikacji

System powinien składać się z kilku niezależnych modułów, które pozwalają na elastyczne zarządzanie zadaniami i użytkownikami:

- **Moduł administracji użytkownikami (role)** – umożliwia nadawanie uprawnień i zarządzanie kontami pracowników oraz ich dostępem do poszczególnych funkcji.
- **Moduł raportów** – pozwala na analizę danych, generowanie statystyk dotyczących realizacji zadań oraz wydajności pracowników.
- **Moduł konfiguracji** – daje możliwość dostosowania ustawień systemu, m.in. automatycznych powiadomień, harmonogramów, priorytetów zadań.
- **Moduł zgłaszania usterek i zadań** – integracja z recepcją i personelem, pozwalająca na szybkie przesyłanie zgłoszeń i monitorowanie ich realizacji.
- **Moduł integracji z systemem rezerwacji hotelowej** – automatyczne przypisywanie zadań, np. sprzątania po wymeldowaniu gościa.

## Generowanie raportów oraz faktur VAT

- **Generowanie raportów** - system powinien umożliwiać generowanie raportów na podstawie danych dotyczących realizacji zadań, historii zgłoszeń oraz efektywności pracowników. Raporty powinny obejmować **różne zakresy czasowe** (dziennie, tygodniowo, miesięcznie). Musi być możliwe także **eksportowanie danych do formatów CSV/PDF**.
- **Generowanie faktur VAT** – system powinien umożliwiać także wystawianie faktur VAT dla gości hotelu w formacie PDF.

## Integracja z bazą danych

- System powinien być oparty na bazie danych, która pozwala na **szybki dostęp do informacji** o użytkownikach, zadaniach, zgłoszeniach i raportach.
- Powinien umożliwiać **przechowywanie historii zmian** w zadaniach i zgłoszeniach.

## Bezpieczeństwo i dostęp użytkowników

- System powinien posiadać **mechanizmy autoryzacji i uwierzytelniania użytkowników** (logowanie, resetowanie hasła).
- Dostęp do poszczególnych funkcji powinien być **ograniczony na podstawie ról**.
- Hasła użytkowników powinny być **szyfrowane**.

## Panele / zakładki systemu, które będą oferowały potrzebne funkcjonalności 
- Panel administratora 
  - Główne narzędzie administratorów systemu umożliwiające wykonanie wszystkich czynności potrzebnych do zarządzania systemem np. dodawanie, edycja, usuwanie użytkowników, tworzenie i modyfikacja grup, zarządzanie innymi administratorami. 
- Panel innego użytkownika 
  - Funkcjonalność 1
  - ... kolejna funkcjonalność
...
- Zakładka raportów 
  - Generowanie raportów
- Zakładka ustawień 
...

## Typy wymaganych dokumentów w projekcie oraz dostęp do nich 
- Raporty PDF 
  - rodzaje raportów
- Inne dokumenty:
  - ...

## Przepływ informacji w środowisku systemu
Przepływ informacji w środowisku systemu jest scentralizowany i oparty na bazie danych, co oznacza, że wszystkie operacje są wykonywane przez centralny serwer, który zarządza dostępem do danych. Klient wysyła żądania do backendu poprzez REST API, np. w celu pobrania, zapisania lub aktualizacji informacji. Backend przetwarza żądania, wykonuje operacje na bazie danych i zwraca odpowiedź w formacie JSON. Dzięki temu pracownicy hotelu mają na bieżąco dostęp do aktualnych informacji o zadaniach, ich statusie i priorytetach, niezależnie od stanowiska, urządzenia czy lokalizacji w obiekcie.

## Użytkownicy aplikacji i ich uprawnienia 
- Administrator 
  - uprawnienie 1 
  - uprawnienie 2
  - ...
- Kierownik 
  - uprawnienie 1 
  - uprawnienie 2
  - ...
- Użytkownik
  - uprawnienie 1 
  - uprawnienie 2
  - ...

## Interesariusze 
- Interesariusze wewnętrzni 
  - ...
- Interesariusze zewnętrzni 
  - ...

## Diagramy UML
- ###### [Diagram przypadków użycia]
![Diagram przypadków użycia](uml/useCaseDiagram.png)
- ###### [Diagramy aktywności]
#### Logowanie
![Diagram aktywności - Logowanie](uml/activityDiagram_login.png)
#### Tworzenie zamówień
![Diagram aktywności - Tworzenie zamówień](uml/activityDiagram_orderCreating.png)
#### Zarządzanie zadaniami
![Diagram aktywności - Zarządzanie zadaniami](uml/activityDiagram_orderManagement.png)
#### Resetowanie hasła
![Diagram aktywności - Resetowanie hasła](uml/activityDiagram_passwordReset.png)
#### Zgłaszanie poprawek zadań
![Diagram aktywności - Zgłaszanie poprawek zadań](uml/activityDiagram_submittingCorrections.png)
#### Zarządzanie zgłoszeniami
![Diagram aktywności - Zarządzanie zgłoszeniami](uml/activityDiagram_ticketManagement.png)
#### Zarządzanie pracownikami
![Diagram aktywności - Zarządzanie pracownikami](uml/activityDiagram_workersManagement.png)
- ###### [Diagramy sekwencji]
#### Logowanie
![Diagram sekwencji - Logowanie](uml/sequenceDiagram_login.png)
### Dodawanie pracownika
![Diagram sekwencji - Dodawanie pracownika](uml/sequenceDiagram_addEmployee.png)
### Dodawanie uwag do zadania
![Diagram sekwencji - Dodawanie uwag do zadania](uml/sequenceDiagram_addReportToTask.png)
### Edytowanie pracownika
![Diagram sekwencji - Edytowanie pracownika](uml/sequenceDiagram_editEmployee.png)
### Usuwanie zgłoszenia
![Diagram sekwencji - Usuwanie zgłoszenia](uml/sequenceDiagram_deleteReport.png)
### Usuwanie pracownika
![Diagram sekwencji - Usuwanie pracownika](uml/sequenceDiagram_removeEmployee.png)
### Przeglądanie statystyk zespołu
![Diagram sekwencji - Przeglądanie statystyk zespołu](uml/sequenceDiagram_searchStatistics.png)
- ###### [Diagram klas]
  Wstawić rys. diagramu UML

## Baza danych
###### Diagram ERD

###### Skrypt do utworzenia struktury bazy danych

###### Opis bazy danych

## Wykorzystane technologie 
- Język Java 17
  - JavaFX
  - ...
- Baza danych MySQL
- Inne z opisem

## Pliki instalacyjne wraz z opisem instalacji i konfiguracji wraz pierwszego uruchomienia
