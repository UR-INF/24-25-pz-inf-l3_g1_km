Programowanie zespołowe laboratorium _**3**_ grupa _**1**_

# Dokumentacja projetu: **System do zarządzania zadaniami w hotelu**

## Zespoł projetowy:
- Krzysztof Motas (Lider) - ...
- Konrad Pluta (Członek) - ...
- Patryk Jarosiewicz (Członek) - ...
- Jakub Orczyk (Członek) - ...

## Opis aplikacji

## Cel projektu 
Aplikacja Hotel Task Manager to narzędzie do zarządzania zadaniami w hotelach, które usprawnia komunikację między pracownikami w zespole. System umożliwia delegowanie zadań, śledzenie ich postępu, automatyzację powiadomień oraz analizę wydajności personelu. Dzięki intuicyjnemu interfejsowi, pracownicy mogą na bieżąco otrzymywać i aktualizować informacje o swoich obowiązkach, co poprawia organizację pracy w hotelu.

## Zakres projektu

## Wymagania stawiane aplikacji

System powinien składać się z kilku niezależnych modułów, które pozwalają na elastyczne zarządzanie zadaniami i użytkownikami:

- **Moduł administracji użytkownikami (role)** – umożliwia nadawanie uprawnień i zarządzanie kontami pracowników oraz ich dostępem do poszczególnych funkcji.
- **Moduł raportów** – pozwala na analizę danych, generowanie statystyk dotyczących realizacji zadań oraz wydajności pracowników.
- **Moduł konfiguracji** – daje możliwość dostosowania ustawień systemu, m.in. automatycznych powiadomień itd.
- **Moduł zgłaszania usterek i zadań** – integracja z recepcją i personelem, pozwalająca na szybkie przesyłanie zgłoszeń i monitorowanie ich realizacji.
- **Moduł integracji z systemem rezerwacji hotelowej** – automatyczne przypisywanie zadań, np. sprzątania po wymeldowaniu gościa.

## Integracja z bazą danych

- System powinien być oparty na bazie danych, która pozwala na **szybki dostęp do informacji** o użytkownikach, zadaniach, zgłoszeniach i raportach.
- Powinien umożliwiać **przechowywanie historii zmian** w zadaniach i zgłoszeniach.

## Bezpieczeństwo i dostęp użytkowników

- System powinien posiadać **mechanizmy autoryzacji i uwierzytelniania użytkowników** (logowanie, resetowanie hasła).
- Dostęp do poszczególnych funkcji powinien być **ograniczony na podstawie ról**.
- Hasła użytkowników powinny być **szyfrowane**.

## Panele / zakładki systemu, które będą oferowały potrzebne funkcjonalności  

### **Panel pracownika**  
Moduł dostępny dla każdego użytkownika systemu, obejmujący:  
- **Logowanie i resetowanie hasła** – możliwość autoryzacji i odzyskiwania dostępu do konta.  
- **Zarządzanie kontem** – edycja danych użytkownika oraz ustawień konta.  
- **Odbieranie i realizacja zadań** – możliwość przeglądania i aktualizacji statusu przydzielonych obowiązków.  

### **Panel recepcjonisty**  
Interfejs wspomagający pracę recepcji hotelowej, zawierający:  
- **Zarządzanie rezerwacjami** – tworzenie, edytowanie i usuwanie rezerwacji pokoi.  
- **Obsługa zgłoszeń** – przyjmowanie i zarządzanie zgłoszeniami gości.  
- **Podgląd statusu zgłoszeń** – monitorowanie realizacji zgłoszeń przez personel.  

### **Panel konserwatora**  
Moduł przeznaczony dla działu technicznego, umożliwiający:  
- **Obsługę zgłoszeń usterek** – przeglądanie i aktualizowanie statusu napraw.  
- **Tworzenie i edycję zleceń** – zarządzanie pracami konserwacyjnymi w hotelu.  

### **Panel pokojówki**  
Interfejs dla personelu sprzątającego, obejmujący:  
- **Monitorowanie zgłoszeń dotyczących stanu pokoi** – przeglądanie zadań związanych z utrzymaniem czystości.  
- **Oznaczanie wykonanych obowiązków** – potwierdzanie zakończenia sprzątania pokoi.  
- **Tworzenie zgłoszeń** – raportowanie usterek i problemów w pokojach.  

### **Panel menadżera hotelu**  
Moduł umożliwiający:  
- **Zarządzanie pracownikami** – dodawanie, edytowanie i usuwanie kont użytkowników.  
- **Przeglądanie statystyk** – analiza wydajności personelu i obłożenia hotelu.  
- **Zarządzanie pokojami** – dodawanie, modyfikacja i usuwanie pokoi.  
- **Zarządzanie raportami** – generowanie i przeglądanie raportów dotyczących działalności hotelu.  
- **Podgląd faktur** – przeglądanie wystawionych dokumentów księgowych.  

### **Zakładka zarządzania rezerwacjami**  
Moduł obsługi rezerwacji, obejmujący:  
- **Tworzenie, edycję i usuwanie rezerwacji** – kompleksowe zarządzanie pobytami gości.  
- **Historia rezerwacji** – dostęp do archiwalnych danych rezerwacyjnych.  

### **Zakładka zgłoszeń**  
Sekcja systemu do obsługi zgłoszeń, umożliwiająca:  
- **Tworzenie zgłoszeń** – rejestrowanie nowych problemów i usterek.  
- **Modyfikacja i usuwanie zgłoszeń** – edycja oraz anulowanie zgłoszeń.  
- **Podgląd statusu zgłoszeń** – monitorowanie procesu realizacji.  

### **Zakładka zleceń**  
Moduł obsługujący zadania wewnętrzne, oferujący:  
- **Tworzenie, edycję i usuwanie zleceń** – zarządzanie przydzielonymi obowiązkami.  
- **Śledzenie statusu zadań** – monitorowanie postępów realizacji.  

### **Zakładka serwisowa**  
Sekcja systemu dotycząca prac serwisowych, obejmująca:  
- **Tworzenie zgłoszeń serwisowych** – rejestrowanie zapotrzebowania na naprawy.  
- **Modyfikacja i usuwanie zgłoszeń serwisowych** – aktualizacja i anulowanie zgłoszeń.  

### **Zakładka raportów**  
Panel przeznaczony do analizy danych, umożliwiający:  
- **Generowanie raportów** – tworzenie zestawień wydajnościowych i finansowych.  
- **Przeglądanie raportów historycznych** – dostęp do archiwalnych analiz.  
- **Eksport raportów** – zapisywanie raportów w formatach PDF / CSV.  

### **Zakładka faktur**  
Moduł do obsługi dokumentów księgowych, obejmujący:  
- **Podgląd faktur** – przeglądanie wystawionych faktur VAT.  
- **Historia faktur** – dostęp do archiwum dokumentów.  

### **Zakładka ustawień systemowych** 
Interfejs do konfiguracji aplikacji, umożliwiający:  
- **Zarządzanie powiadomieniami** – konfiguracja alertów systemowych.  

## Typy wymaganych dokumentów w projekcie oraz dostęp do nich 
- **Raporty** - system powinien umożliwiać generowanie raportów na podstawie danych dotyczących realizacji zadań, historii zgłoszeń oraz efektywności pracowników. Raporty powinny obejmować **różne zakresy czasowe** (dziennie, tygodniowo, miesięcznie). Musi być możliwe także **eksportowanie danych do formatów CSV/PDF**.
- **Faktury VAT** – system powinien umożliwiać także wystawianie faktur VAT dla gości hotelu w formacie PDF.

## Przepływ informacji w środowisku systemu
Przepływ informacji w środowisku systemu jest scentralizowany i oparty na bazie danych, co oznacza, że wszystkie operacje są wykonywane przez centralny serwer, który zarządza dostępem do danych. Klient wysyła żądania do backendu poprzez REST API, np. w celu pobrania, zapisania lub aktualizacji informacji. Backend przetwarza żądania, wykonuje operacje na bazie danych i zwraca odpowiedź w formacie JSON. Dzięki temu pracownicy hotelu mają na bieżąco dostęp do aktualnych informacji o zadaniach, ich statusie i priorytetach, niezależnie od stanowiska, urządzenia czy lokalizacji w obiekcie.

## Użytkownicy aplikacji i ich uprawnienia

### Pracownik
*Rola ogólna, po której dziedziczą wszystkie inne role w systemie. Każdy użytkownik systemu jest pracownikiem i posiada podstawowe uprawnienia. Nie jest to jawna rola, lecz bazowa, zapewniająca minimalne funkcjonalności dla wszystkich użytkowników aplikacji.*
- Logowanie oraz resetowanie hasła
- Zarządzanie własnym kontem użytkownika
- Odbieranie i realizacja zadań

### Recepcjonista
- Tworzenie i zarządzanie rezerwacjami pokoi
- Zarządzanie zgłoszeniami (tworzenie, modyfikowanie, usuwanie)

### Konserwator
- Monitorowanie i aktualizacja zgłoszeń technicznych

### Pokojówka
- Monitorowanie i aktualizacja zgłoszeń dotyczących stanu pokoi

### Manager hotelu
- Zarządzanie pracownikami (tworzenie, modyfikowanie i usuwanie kont pracowników)
- Przeglądanie statystyk dotyczących pracowników
- Zarządzanie pokojami (tworzenie, modyfikowanie, usuwanie pokoi)
- Zarządzanie raportami (tworzenie, generowanie, przeglądanie)
- Przeglądanie wystawionych faktur

## Interesariusze 

### Interesariusze wewnętrzni
- **Recepcjoniści** – zarządzają rezerwacjami pokoi oraz zgłoszeniami od gości, delegują zadania do odpowiednich działów oraz monitorują ich realizację.  
- **Konserwatorzy** – odpowiadają za wykonywanie i aktualizację statusu zadań związanych z naprawami i konserwacją w hotelu.  
- **Pokojówki** – realizują zadania związane z utrzymaniem czystości, przygotowaniem pokoi oraz zgłaszaniem ewentualnych usterek.  
- **Manager hotelu** – nadzoruje realizację zadań, analizuje statystyki dotyczące pracy zespołów i zarządza personelem.  

### Interesariusze zewnętrzni
- **Goście hotelowi** – mogą pośrednio rezerwować pokoje poprzez kontakt z recepcją (telefonicznie lub osobiście), a także zgłaszają usterki, które są przekazywane przez recepcję do systemu.
- **Właściciele hotelu** – analizują raporty dotyczące efektywności pracy i jakości usług.

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
