#![windows_subsystem = "windows"]

use eframe::{ egui, App, CreationContext, Frame };
use egui::Margin;
use serde::{ Deserialize, Serialize };
use std::fs::{ self, OpenOptions };
use std::io::Write;
use std::process::Command;
use which::which;
use chrono::Local;
use mysql::{ OptsBuilder, Pool };
use std::{ path::Path, path::PathBuf };
use rust_embed::RustEmbed;
use egui::RichText;
use mysql::prelude::Queryable;
use image::GenericImageView;
use std::sync::Arc;
use egui::IconData;
use base64::engine::general_purpose;
use base64::Engine;

/// Punkt wejścia aplikacji instalatora Hotel Task Manager.
///
/// - Ładuje ikonę aplikacji (jeśli dostępna),
/// - Tworzy opcje uruchomienia (`NativeOptions`) z centrowaniem i ikoną,
/// - Uruchamia aplikację `eframe` z `InstallerApp`.
///
/// Zwraca `eframe::Result<()>`.
fn main() -> eframe::Result<()> {
    let icon_opt = load_icon();

    let mut viewport = egui::ViewportBuilder::default();

    if let Some(icon) = icon_opt {
        viewport = viewport.with_icon(Arc::new(icon));
    }

    let native_options = eframe::NativeOptions {
        centered: true,
        viewport,
        ..Default::default()
    };

    eframe::run_native(
        "Instalator Hotel Task Manager",
        native_options,
        Box::new(|cc| Box::new(InstallerApp::new(cc)))
    )
}

/// Osadzone zasoby binarne z folderu `resources/`.
///
/// Umożliwia dostęp do plików (np. ikon, instalatorów, CSS) w trakcie działania programu,
/// nawet po spakowaniu binarki.
#[derive(RustEmbed)]
#[folder = "resources/"]
struct Assets;

/// Opcja wyboru backendu w instalatorze.
///
/// Określa, czy backend ma być uruchomiony lokalnie, zdalnie, czy jeszcze nie wybrano.
#[derive(Default, PartialEq)]
enum BackendOption {
    #[default]
    Undecided,
    Local,
    Remote,
}

/// Stan aplikacji instalacyjnej sterujący przepływem kreatora.
///
/// Przechowuje dane wejściowe użytkownika, aktualny krok oraz stan systemu.
#[derive(PartialEq)]
struct InstallerApp {
    step: usize,
    backend_choice: BackendOption,
    external_api_url: String,
    external_api_port: String,
    use_existing_db: bool,
    db_host: String,
    db_name: String,
    db_user: String,
    db_pass: String,
    java_installed: bool,
    backend_installed: bool,
    status: String,
    seed_database: bool,
    just_entered_step_2: bool,
}

impl Default for InstallerApp {
    fn default() -> Self {
        Self {
            step: 0,
            backend_choice: BackendOption::Undecided,
            external_api_url: String::new(),
            external_api_port: String::new(),
            use_existing_db: false,
            db_host: String::new(),
            db_name: String::new(),
            db_user: String::new(),
            db_pass: String::new(),
            java_installed: false,
            backend_installed: false,
            status: String::new(),
            seed_database: false,
            just_entered_step_2: true,
        }
    }
}

/// Reprezentuje konfigurację frontendu aplikacji.
///
/// Dane są serializowane do pliku `config.json` i wykorzystywane
/// przy uruchamianiu backendu z poziomu aplikacji.
#[derive(Deserialize, Serialize)]
struct FrontendConfig {
    #[serde(rename = "API_HOST")]
    api_host: String,

    #[serde(rename = "JAR_PATH")]
    jar_path: String,

    #[serde(rename = "BACKEND_PORT")]
    backend_port: u16,

    #[serde(rename = "DB_HOST", skip_serializing_if = "Option::is_none")]
    db_host: Option<String>,

    #[serde(rename = "DB_NAME", skip_serializing_if = "Option::is_none")]
    db_name: Option<String>,

    #[serde(rename = "DB_USER", skip_serializing_if = "Option::is_none")]
    db_user: Option<String>,

    #[serde(rename = "DB_PASS", skip_serializing_if = "Option::is_none")]
    db_pass: Option<String>,

    #[serde(rename = "SEED_DB", skip_serializing_if = "Option::is_none")]
    seed_db: Option<bool>,
}

impl InstallerApp {
    fn new(_cc: &CreationContext<'_>) -> Self {
        Self::default()
    }

    fn back(&mut self) {
        if self.step > 0 {
            self.step -= 1;
        }
    }

    fn log(&self, message: &str) {
        let log_path = PathBuf::from("installer.log");
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(log_path)
            .expect("Unable to open log file");

        let now = Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
        let entry = format!("[{}] {}\n", now, message);

        let _ = file.write_all(entry.as_bytes());
    }
}

impl App for InstallerApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut Frame) {
        egui::CentralPanel::default().show(ctx, |ui| {
            egui::Frame
                ::none()
                .fill(ctx.style().visuals.panel_fill)
                .inner_margin(Margin::same(20.0))
                .show(ui, |ui| {
                    egui::ScrollArea::vertical().show(ui, |ui| {
                        ui.vertical(|ui| {
                            ui.set_max_width(500.0);

                            match self.step {
                                0 => {
                                    ui.label(
                                        RichText::new(
                                            "Witaj w instalatorze środowiska aplikacji Hotel Task Manager!"
                                        ).strong()
                                    );

                                    ui.label(
                                        "Niektóre operacje (instalacja Javy, MariaDB, ustawienia systemowe) mogą wymagać uruchomienia instalatora z uprawnieniami administratora."
                                    );
                                    ui.label(
                                        "Jeśli uruchomiłeś ten instalator bez praw administratora, zamknij go teraz i uruchom ponownie jako administrator."
                                    );
                                    ui.add_space(20.0);

                                    ui.label("Czy chcesz zainstalować backend lokalnie?");
                                    ui.horizontal(|ui| {
                                        ui.radio_value(
                                            &mut self.backend_choice,
                                            BackendOption::Local,
                                            "Tak"
                                        );
                                        ui.radio_value(
                                            &mut self.backend_choice,
                                            BackendOption::Remote,
                                            "Nie"
                                        );
                                    });

                                    if ui.button("Dalej").clicked() {
                                        match self.backend_choice {
                                            BackendOption::Local => {
                                                self.step = 1;
                                            }
                                            BackendOption::Remote => {
                                                self.step = 10;
                                            }
                                            BackendOption::Undecided => {
                                                self.status = "Wybierz jedną z opcji.".to_string();
                                            }
                                        }
                                    }
                                }

                                1 => {
                                    ui.label(
                                        "Czy chcesz połączyć się z istniejącą bazą danych, czy utworzyć nową lokalnie?"
                                    );
                                    ui.horizontal(|ui| {
                                        ui.radio_value(
                                            &mut self.use_existing_db,
                                            false,
                                            "Utwórz nową lokalną bazę danych"
                                        );
                                        ui.radio_value(
                                            &mut self.use_existing_db,
                                            true,
                                            "Połącz z istniejącą bazą danych"
                                        );
                                    });

                                    ui.add_space(10.0);
                                    ui.checkbox(
                                        &mut self.seed_database,
                                        "Czy chcesz stworzyć strukturę bazy danych oraz zapełnić bazę przykładowymi danymi przy pierwszym uruchomieniu aplikacji?"
                                    );

                                    let mut can_proceed = true;

                                    if self.use_existing_db {
                                        ui.label("Dane logowania do bazy:");
                                        ui.add(
                                            egui::TextEdit
                                                ::singleline(&mut self.db_host)
                                                .hint_text("Host")
                                        );
                                        ui.add(
                                            egui::TextEdit
                                                ::singleline(&mut self.db_name)
                                                .hint_text("Nazwa bazy danych")
                                        );
                                        ui.add(
                                            egui::TextEdit
                                                ::singleline(&mut self.db_user)
                                                .hint_text("Użytkownik")
                                        );
                                        ui.add(
                                            egui::TextEdit
                                                ::singleline(&mut self.db_pass)
                                                .hint_text("Hasło")
                                        );

                                        let missing_fields =
                                            self.db_host.trim().is_empty() ||
                                            self.db_name.trim().is_empty() ||
                                            self.db_user.trim().is_empty();

                                        can_proceed = !missing_fields;

                                        ui.add_space(10.0);
                                        if ui.button("Przetestuj połączenie").clicked() {
                                            if missing_fields {
                                                self.status =
                                                    "Podaj host, nazwę bazy i użytkownika.".to_string();
                                            } else {
                                                match
                                                    test_db_connection(
                                                        self.db_host.trim(),
                                                        self.db_name.trim(),
                                                        self.db_user.trim(),
                                                        self.db_pass.trim()
                                                    )
                                                {
                                                    Ok(_) => {
                                                        self.status =
                                                            "Połączenie z bazą danych jest OK!".to_string();
                                                    }
                                                    Err(e) => {
                                                        self.status =
                                                            format!("Błąd połączenia: {}", e);
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    ui.add_space(10.0);
                                    ui.horizontal(|ui| {
                                        if ui.button("Wstecz").clicked() {
                                            self.back();
                                        }

                                        let mut dalej = egui::Button::new("Dalej");
                                        if self.use_existing_db && !can_proceed {
                                            dalej = dalej.sense(egui::Sense::hover()); // tylko hover, brak kliknięcia
                                        }

                                        if
                                            ui
                                                .add_enabled(
                                                    can_proceed || !self.use_existing_db,
                                                    dalej
                                                )
                                                .clicked()
                                        {
                                            self.step = if self.use_existing_db { 3 } else { 2 };
                                        }
                                    });
                                }

                                2 => {
                                    ui.label("Instalacja i konfiguracja bazy danych MariaDB:");

                                    if self.just_entered_step_2 {
                                        if is_mariadb_installed() {
                                            self.status =
                                                "MariaDB jest już zainstalowane.".to_string();
                                            self.log("MariaDB already installed.");
                                        } else {
                                            self.status = "Trwa instalacja MariaDB...".to_string();
                                            self.log("Launching MariaDB installer...");

                                            let temp_dir = Path::new(
                                                "C:/Hotel Task Manager Environment/tmp"
                                            );
                                            if let Err(e) = fs::create_dir_all(temp_dir) {
                                                self.status =
                                                    format!("Nie udało się utworzyć katalogu tymczasowego: {}", e);
                                                self.log(&self.status);
                                                return;
                                            }

                                            let msi_path = temp_dir.join("mariadb.msi");

                                            match write_embedded_file("mariadb.msi", &msi_path) {
                                                Err(e) => {
                                                    self.status =
                                                        format!("Nie znaleziono pliku instalatora MariaDB: {}", e);
                                                    self.log(&self.status);
                                                    return;
                                                }
                                                Ok(_) => {
                                                    let result = Command::new("msiexec")
                                                        .args([
                                                            "/i",
                                                            msi_path.to_str().unwrap(),
                                                            "/quiet",
                                                        ])
                                                        .spawn()
                                                        .and_then(|mut child| child.wait());

                                                    match result {
                                                        Ok(status) if status.success() => {
                                                            self.status.push_str(
                                                                " Instalacja zakończona."
                                                            );
                                                            self.log(
                                                                "MariaDB installer zakończony poprawnie."
                                                            );
                                                        }
                                                        Ok(status) => {
                                                            self.status.push_str(
                                                                &format!(
                                                                    " Instalator zakończył się z kodem: {:?}",
                                                                    status.code()
                                                                )
                                                            );
                                                            self.log(
                                                                &format!(
                                                                    "Instalator zakończony z kodem: {:?}",
                                                                    status.code()
                                                                )
                                                            );
                                                        }
                                                        Err(e) => {
                                                            self.status.push_str(
                                                                &format!(" Błąd uruchamiania instalatora: {}", e)
                                                            );
                                                            self.log(&self.status);
                                                            return;
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        self.db_host = "localhost".to_string();
                                        self.db_user = "root".to_string();
                                        self.db_pass = "".to_string();
                                        self.just_entered_step_2 = false;
                                    }

                                    ui.add_space(10.0);
                                    ui.label("Podaj hasło administratora bazy danych (root):");

                                    ui.add(
                                        egui::TextEdit
                                            ::singleline(&mut self.db_pass)
                                            .password(true)
                                            .hint_text("Hasło")
                                    );

                                    ui.add_space(10.0);
                                    ui.label("Podaj nazwę bazy danych:");

                                    ui.add(
                                        egui::TextEdit
                                            ::singleline(&mut self.db_name)
                                            .hint_text("Nazwa bazy danych, np. hoteltaskmanager")
                                    );

                                    ui.add_space(10.0);

                                    let can_create = !self.db_name.trim().is_empty();

                                    if
                                        ui
                                            .add_enabled(
                                                can_create,
                                                egui::Button::new("Utwórz bazę danych")
                                            )
                                            .clicked()
                                    {
                                        match
                                            create_database(
                                                "localhost",
                                                &self.db_pass,
                                                &self.db_name
                                            )
                                        {
                                            Ok(_) => {
                                                self.status =
                                                    "Baza danych została utworzona.".to_string();
                                                self.log("Baza danych utworzona poprawnie.");
                                                std::thread::sleep(
                                                    std::time::Duration::from_secs(1)
                                                );
                                                self.step += 1;
                                            }
                                            Err(e) => {
                                                self.status =
                                                    format!("Błąd tworzenia bazy danych: {}", e);
                                                self.log(&self.status);
                                            }
                                        }
                                    }
                                }

                                3 => {
                                    ui.label("Sprawdzanie obecności Java 21+...");

                                    let java_home_opt = detect_java_home();
                                    self.java_installed = java_home_opt.is_some();

                                    if self.java_installed {
                                        self.status = "Java 21+ została wykryta.".to_string();
                                        self.log("Java >= 21 detected via PATH");

                                        let java_home = java_home_opt.unwrap();

                                        let env_home = std::env
                                            ::var("JAVA_HOME")
                                            .unwrap_or_default();
                                        if env_home.trim().is_empty() || !env_home.contains("Java") {
                                            match set_java_home(&java_home) {
                                                Ok(_) => {
                                                    self.status.push_str("\nUstawiono JAVA_HOME");
                                                    self.log(
                                                        &format!("JAVA_HOME ustawione na: {}", java_home)
                                                    );
                                                }
                                                Err(e) => {
                                                    self.status.push_str(
                                                        &format!("\nNie udało się ustawić JAVA_HOME: {}", e)
                                                    );
                                                    self.log(&format!("Błąd JAVA_HOME: {}", e));
                                                }
                                            }
                                        } else {
                                            self.status.push_str("\nJAVA_HOME już ustawione.");
                                        }
                                    } else {
                                        self.status = "Trwa instalacja OpenJDK 21...".to_string();
                                        self.log("Launching OpenJDK installer...");

                                        let temp_dir = Path::new(
                                            "C:/Hotel Task Manager Environment/tmp"
                                        );
                                        if let Err(e) = fs::create_dir_all(temp_dir) {
                                            self.status.push_str(
                                                &format!(" Nie udało się utworzyć katalogu tymczasowego: {}", e)
                                            );
                                            self.log(&self.status);
                                            return;
                                        }

                                        let msi_path = temp_dir.join("openjdk.msi");

                                        match write_embedded_file("openjdk.msi", &msi_path) {
                                            Err(e) => {
                                                self.status.push_str(
                                                    &format!(" Nie znaleziono pliku instalatora: {}", e)
                                                );
                                                self.log(&self.status);
                                                return;
                                            }
                                            Ok(_) => {
                                                let result = Command::new("msiexec")
                                                    .args([
                                                        "/i",
                                                        msi_path.to_str().unwrap(),
                                                        "/quiet",
                                                    ])
                                                    .spawn()
                                                    .and_then(|mut child| child.wait());

                                                match result {
                                                    Ok(status) if status.success() => {
                                                        self.status.push_str(
                                                            " Instalacja zakończona. Sprawdzam ponownie..."
                                                        );
                                                        self.log(
                                                            "OpenJDK installer zakończony poprawnie."
                                                        );

                                                        std::thread::sleep(
                                                            std::time::Duration::from_secs(3)
                                                        );

                                                        let java_home_opt = detect_java_home();
                                                        self.java_installed =
                                                            java_home_opt.is_some();

                                                        if let Some(java_home) = java_home_opt {
                                                            self.status.push_str(
                                                                " Java została poprawnie zainstalowana"
                                                            );
                                                            match set_java_home(&java_home) {
                                                                Ok(_) =>
                                                                    self.status.push_str(
                                                                        "\nJAVA_HOME ustawione."
                                                                    ),
                                                                Err(e) =>
                                                                    self.status.push_str(
                                                                        &format!("\nBłąd JAVA_HOME: {}", e)
                                                                    ),
                                                            }
                                                        } else {
                                                            self.status.push_str(
                                                                "Java nadal niewykryta."
                                                            );
                                                            self.log(
                                                                "Java nadal niewykryta po instalacji."
                                                            );
                                                        }
                                                    }
                                                    Ok(status) => {
                                                        self.status.push_str(
                                                            &format!(
                                                                " Instalator zakończył się, kod: {:?}",
                                                                status.code()
                                                            )
                                                        );
                                                        self.log(
                                                            &format!(
                                                                "Installer zakończony z kodem: {:?}",
                                                                status.code()
                                                            )
                                                        );
                                                    }
                                                    Err(e) => {
                                                        self.status.push_str(
                                                            &format!(" Błąd uruchomienia instalatora: {}", e)
                                                        );
                                                        self.log(
                                                            &format!("Błąd uruchamiania msiexec: {}", e)
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    std::thread::sleep(std::time::Duration::from_secs(1));
                                    self.step += 1;
                                }

                                4 => {
                                    self.log("Instalowanie backendu...");

                                    ui.label("Instalowanie backendu...");

                                    let backend_dir = PathBuf::from(
                                        "C:/Hotel Task Manager Environment/backend"
                                    );

                                    if let Err(e) = fs::create_dir_all(&backend_dir) {
                                        self.status =
                                            format!("Nie udało się utworzyć katalogu backendu: {}", e);
                                        self.log(&self.status);
                                        return;
                                    }

                                    let jar_dest = backend_dir.join("backend.jar");

                                    match write_embedded_file("backend.jar", &jar_dest) {
                                        Ok(_) => {
                                            self.backend_installed = true;
                                            self.status = format!(
                                                "Kopiowanie backendu do: {}",
                                                jar_dest.display()
                                            );
                                            self.log("Backend copied successfully.");
                                            std::thread::sleep(std::time::Duration::from_secs(1));
                                            self.step = 5;
                                        }
                                        Err(e) => {
                                            self.status =
                                                format!("Błąd kopiowania backendu: {}", e);
                                            self.log(&self.status);
                                            return;
                                        }
                                    }
                                }

                                5 => {
                                    ui.label("Czy frontend został już zainstalowany?");

                                    ui.horizontal(|ui| {
                                        if ui.button("Nie - zainstaluj teraz").clicked() {
                                            let dest_dir = Path::new(
                                                "C:/Hotel Task Manager Environment/tmp"
                                            );
                                            if let Err(e) = fs::create_dir_all(dest_dir) {
                                                self.status =
                                                    format!("Błąd tworzenia katalogu tymczasowego: {}", e);
                                                self.log(&self.status);
                                                return;
                                            }

                                            let exe_path = dest_dir.join("frontend.exe");

                                            match write_embedded_file("frontend.exe", &exe_path) {
                                                Ok(_) => {
                                                    match Command::new(&exe_path).spawn() {
                                                        Ok(_) => {
                                                            self.status =
                                                                "Instalator frontendu został uruchomiony.\n\n\
                                                                Nie kontynuuj instalacji, dopóki nie zakończysz instalacji frontendu.\n\
                                                                W przeciwnym razie konfiguracja nie powiedzie się.".to_string();
                                                            self.log(
                                                                "Frontend installer launched."
                                                            );
                                                        }
                                                        Err(e) => {
                                                            self.status =
                                                                format!("Błąd uruchamiania instalatora frontendu: {}", e);
                                                            self.log(&self.status);
                                                        }
                                                    }
                                                }
                                                Err(e) => {
                                                    self.status =
                                                        format!("Nie znaleziono zasobu frontend.exe: {}", e);
                                                    self.log(&self.status);
                                                }
                                            }
                                        }

                                        if
                                            ui
                                                .button(
                                                    "Frontend już zainstalowany - przejdź dalej"
                                                )
                                                .clicked()
                                        {
                                            self.step = 6;
                                        }
                                    });
                                }

                                6 => {
                                    ui.label("Aktualizowanie konfiguracji frontendu...");

                                    // self.log(
                                    //     &format!(
                                    //         "Przypisano db_host = {}, db_user = {}, db_pass = '{}'",
                                    //         self.db_host,
                                    //         self.db_user,
                                    //         self.db_pass
                                    //     )
                                    // );

                                    let (db_host, db_name, db_user, db_pass) = if
                                        self.backend_choice == BackendOption::Local
                                    {
                                        (
                                            Some(self.db_host.trim()),
                                            Some(self.db_name.trim()),
                                            Some(self.db_user.trim()),
                                            Some(self.db_pass.trim()),
                                        )
                                    } else {
                                        (None, None, None, None)
                                    };

                                    let (api_url, api_port, jar_path) = if
                                        self.backend_choice == BackendOption::Local
                                    {
                                        (
                                            "http://localhost",
                                            "8080",
                                            "C:/Hotel Task Manager Environment/backend/backend.jar",
                                        )
                                    } else {
                                        (
                                            self.external_api_url.trim(),
                                            self.external_api_port.trim(),
                                            "",
                                        )
                                    };

                                    let result = update_frontend_config(
                                        api_url,
                                        api_port,
                                        jar_path,
                                        db_host,
                                        db_name,
                                        db_user,
                                        db_pass,
                                        Some(self.seed_database)
                                    );

                                    match result {
                                        Ok(_) => {
                                            self.status =
                                                "Zaktualizowano konfigurację frontendu.".to_string();
                                            self.log(&self.status);
                                            self.step = 7;
                                        }
                                        Err(e) => {
                                            self.status =
                                                format!("Błąd aktualizacji config frontendu: {}", e);
                                            self.log(&self.status);
                                        }
                                    }
                                }

                                7 => {
                                    ui.heading("Instalacja zakończona");
                                    ui.label(
                                        "Środowisko backendowe oraz konfiguracja frontendu zostały zakończone."
                                    );
                                    ui.label(&self.status);
                                }

                                10 => {
                                    ui.label("Podaj dane do zewnętrznego backendu:");

                                    ui.add(
                                        egui::TextEdit
                                            ::singleline(&mut self.external_api_url)
                                            .hint_text("Adres, np. http://localhost")
                                    );
                                    ui.add(
                                        egui::TextEdit
                                            ::singleline(&mut self.external_api_port)
                                            .hint_text("Port, np. 8080")
                                    );

                                    if ui.button("Sprawdź połączenie").clicked() {
                                        let result = check_spring_health(
                                            self.external_api_url.trim(),
                                            self.external_api_port.trim()
                                        );
                                        match result {
                                            Ok(msg) => {
                                                self.status = msg.clone();
                                                self.log(&format!("Połączenie OK: {}", msg));
                                            }
                                            Err(err) => {
                                                self.status = format!("Błąd: {}", err);
                                                self.log(&format!("Błąd połączenia: {}", err));
                                            }
                                        }
                                    }

                                    ui.add_space(10.0);
                                    ui.horizontal(|ui| {
                                        if ui.button("Wstecz").clicked() {
                                            self.step = 0;
                                        }
                                        if ui.button("Dalej").clicked() {
                                            self.step = 5;
                                        }
                                    });
                                }

                                _ => {}
                            }

                            if !self.status.is_empty() {
                                ui.add_space(10.0);
                                ui.label(format!("Status: {}", self.status));
                            }
                        });
                    });
                });
        });
    }
}

/// Ładuje osadzoną ikonę aplikacji z pliku PNG przy użyciu `RustEmbed`.
///
/// Ikona jest używana do ustawienia ikonki okna aplikacji w `eframe::NativeOptions`.
///
/// # Zwraca
/// - `Some(IconData)` jeśli udało się poprawnie wczytać i sparsować obraz
/// - `None`, jeśli zasób nie istnieje lub wystąpił błąd przy dekodowaniu
fn load_icon() -> Option<IconData> {
    let asset = Assets::get("icon.png")?;
    let img = image::load_from_memory(&asset.data).ok()?;
    let (width, height) = img.dimensions();
    let rgba = img.into_rgba8().into_raw();
    Some(IconData { rgba, width, height })
}

/// Tworzy nową bazę danych przy użyciu konta root.
///
/// # Argumenty
/// - `host`: adres serwera (np. "localhost")
/// - `root_pass`: hasło użytkownika root
/// - `db_name`: nazwa bazy danych do utworzenia
///
/// # Zwraca
/// - `Ok(())` jeśli operacja się powiodła
/// - `Err(String)` jeśli wystąpił błąd połączenia lub zapytania SQL
fn create_database(host: &str, root_pass: &str, db_name: &str) -> Result<(), String> {
    let builder = OptsBuilder::new()
        .ip_or_hostname(Some(host))
        .user(Some("root"))
        .pass(Some(root_pass));

    let pool = Pool::new(builder).map_err(|e| format!("Błąd połączenia: {}", e))?;
    let mut conn = pool.get_conn().map_err(|e| format!("Błąd sesji: {}", e))?;

    conn
        .query_drop(format!("CREATE DATABASE IF NOT EXISTS `{}`", db_name))
        .map_err(|e| format!("Błąd SQL: {}", e))?;

    Ok(())
}

/// Zapisuje osadzony plik do wskazanej ścieżki na dysku.
///
/// # Argumenty
/// - `file_name`: nazwa pliku w katalogu zasobów (np. "backend.jar")
/// - `dest`: pełna ścieżka do pliku na dysku
///
/// # Zwraca
/// - `Ok(())` jeśli udało się zapisać
/// - `Err(String)` w razie błędu
fn write_embedded_file(file_name: &str, dest: &Path) -> Result<(), String> {
    match Assets::get(file_name) {
        Some(file) => {
            fs::write(dest, &file.data).map_err(|e|
                format!("Błąd zapisu pliku {}: {}", dest.display(), e)
            )
        }
        None => Err(format!("Zasób {} nie został znaleziony", file_name)),
    }
}

/// Sprawdza, czy `mysqld` (MariaDB/MySQL Server) jest dostępny w systemowym PATH.
///
/// # Zwraca
/// - `true` jeśli polecenie `mysqld` jest wykrywalne (czyli MariaDB/MySQL jest zainstalowane)
/// - `false` w przeciwnym razie
fn is_mariadb_installed() -> bool {
    which("mysqld").is_ok()
}

/// Próbuje nawiązać połączenie z bazą danych MySQL/MariaDB.
///
/// Tworzy konfigurację klienta na podstawie podanych danych
/// i próbuje otworzyć jedno połączenie z serwerem.
///
/// # Argumenty
/// - `host`: adres serwera bazy danych (np. `"localhost"` lub `"127.0.0.1"`)
/// - `db`: nazwa bazy danych
/// - `user`: nazwa użytkownika
/// - `pass`: hasło użytkownika
///
/// # Zwraca
/// - `Ok(())` jeśli połączenie się powiodło
/// - `Err(String)` z opisem błędu w przeciwnym razie
fn test_db_connection(host: &str, db: &str, user: &str, pass: &str) -> Result<(), String> {
    let builder = OptsBuilder::new()
        .ip_or_hostname(Some(host))
        .db_name(Some(db))
        .user(Some(user))
        .pass(Some(pass));

    Pool::new(builder)
        .and_then(|pool| pool.get_conn())
        .map(|_| ())
        .map_err(|e| format!("Błąd połączenia z bazą: {}", e))
}

/// Wykrywa zainstalowaną Javę (wersja 21 lub wyższa) i zwraca ścieżkę do katalogu `JAVA_HOME`.
///
/// Uruchamia `java --version` i analizuje wynik w poszukiwaniu numeru wersji.
/// Jeśli wykryta wersja to co najmniej `21`, zwraca ścieżkę o dwa poziomy wyżej
/// względem binarki `java.exe`, jako potencjalny `JAVA_HOME`.
///
/// # Zwraca
/// - `Some(String)` ze ścieżką, jeśli Java 21+ została wykryta i lokalizacja jest poprawna
/// - `None` jeśli Java nie została znaleziona lub wersja jest niższa niż 21
fn detect_java_home() -> Option<String> {
    if let Ok(path) = which::which("java") {
        if let Ok(output) = Command::new(&path).arg("--version").output() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            let combined = format!("{}{}", stderr, stdout);

            for line in combined.lines() {
                if line.contains("version") || line.contains("openjdk") {
                    let words: Vec<&str> = line.split_whitespace().collect();

                    for word in words {
                        let clean = word.trim_matches(|c| (c == '"' || c == '\''));

                        if let Some(ver_str) = clean.split('.').next() {
                            if let Ok(major) = ver_str.parse::<u32>() {
                                if major >= 21 {
                                    // Znaleziono javę >= 21
                                    let java_bin = path.to_string_lossy().to_string();
                                    return std::path::Path
                                        ::new(&java_bin)
                                        .parent()
                                        .and_then(|p| p.parent())
                                        .map(|p| p.to_string_lossy().to_string());
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    None
}

/// Ustawia zmienną środowiskową `JAVA_HOME` w rejestrze systemowym Windows.
///
/// Wymaga uprawnień administratora.
///
/// # Argumenty
/// * `java_home` - ścieżka do folderu JDK, np. `C:\\Program Files\\Java\\jdk-21`
///
/// # Zwraca
/// `Ok(())` jeśli udało się ustawić, `Err(String)` w przeciwnym razie.
#[cfg(target_os = "windows")]
fn set_java_home(java_home: &str) -> Result<(), String> {
    use winreg::enums::*;
    use winreg::RegKey;

    let system_env = RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey_with_flags(
            "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
            KEY_WRITE
        )
        .map_err(|e| format!("Błąd otwierania rejestru: {}", e))?;

    system_env
        .set_value("JAVA_HOME", &java_home)
        .map_err(|e| format!("Błąd ustawiania JAVA_HOME: {}", e))
}

/// Sprawdza, czy backend Spring Boot działa pod podanym adresem.
///
/// Wysyła żądanie GET na `/actuator/health` i oczekuje odpowiedzi JSON
/// zawierającej `"status": "UP"`. Zwraca `Ok` przy sukcesie lub `Err` z opisem błędu.
fn check_spring_health(url: &str, port: &str) -> Result<String, String> {
    let full_url = format!("{url}:{port}/actuator/health");
    let response = reqwest::blocking::get(&full_url);
    match response {
        Ok(resp) => {
            if resp.status().is_success() {
                match resp.json::<serde_json::Value>() {
                    Ok(json) => {
                        if json["status"] == "UP" {
                            Ok("Połączenie OK - status UP".to_string())
                        } else {
                            Err(format!("Status: {}", json["status"]))
                        }
                    }
                    Err(_) => Err("Niepoprawna odpowiedź JSON".to_string()),
                }
            } else {
                Err(format!("HTTP status: {}", resp.status()))
            }
        }
        Err(e) => Err(format!("Błąd połączenia: {}", e)),
    }
}

/// Zwraca ścieżkę do pliku `config.json` używanego przez frontend.
///
/// Plik znajduje się w katalogu konfiguracyjnym użytkownika,
/// np. `C:\\Users\\nazwa_użytkownika\\AppData\\Roaming\\Hotel Task Manager\\config.json`
///
/// Zwraca `Some(PathBuf)` jeśli katalog konfiguracyjny jest dostępny, w przeciwnym razie `None`.
fn get_frontend_config_path() -> Option<PathBuf> {
    dirs::config_dir().map(|path| path.join("Hotel Task Manager").join("config.json"))
}

/// Usuwa jeśli istnieje, a następnie tworzy plik `config.json` używany przez frontend aplikacji.
///
///
/// # Argumenty
/// - `host`: adres API (np. `"http://localhost"`)
/// - `port`: numer portu jako tekst (np. `"8080"`)
/// - `jar_path`: ścieżka do pliku `backend.jar`
/// - `db_host`, `db_name`, `db_user`, `db_pass`: opcjonalne dane do połączenia z bazą danych
///
/// # Zwraca
/// - `Ok(())` przy powodzeniu
/// - `Err(String)` jeśli wystąpi błąd odczytu, zapisu lub przetwarzania JSON
fn update_frontend_config(
    host: &str,
    port: &str,
    jar_path: &str,
    db_host: Option<&str>,
    db_name: Option<&str>,
    db_user: Option<&str>,
    db_pass: Option<&str>,
    seed_db: Option<bool>
) -> Result<(), String> {
    let config_path = get_frontend_config_path().ok_or(
        "Nie można znaleźć ścieżki do pliku konfiguracyjnego."
    )?;

    // println!("Ścieżka do pliku konfiguracyjnego: {:?}", config_path);

    if let Some(parent_dir) = config_path.parent() {
        if !parent_dir.exists() {
            println!("Tworzę folder: {:?}", parent_dir);
            std::fs
                ::create_dir_all(parent_dir)
                .map_err(|e| format!("Błąd tworzenia folderu: {}", e))?;
        }
    } else {
        return Err("Nie można ustalić folderu nadrzędnego dla config.json.".to_string());
    }

    if config_path.exists() {
        std::fs
            ::remove_file(&config_path)
            .map_err(|e| format!("Nie udało się usunąć starego config.json: {}", e))?;
    }

    let port_num: u16 = port.parse().map_err(|_| "Niepoprawny numer portu".to_string())?;

    let config = FrontendConfig {
        api_host: host.to_string(),
        backend_port: port_num,
        jar_path: jar_path.to_string(),
        db_host: db_host.map(|s| s.to_string()),
        db_name: db_name.map(|s| s.to_string()),
        db_user: db_user.map(|s| s.to_string()),
        db_pass: db_pass.map(|s| general_purpose::STANDARD.encode(s)),
        seed_db,
    };

    let updated_json = serde_json
        ::to_string_pretty(&config)
        .map_err(|e| format!("Błąd serializacji: {}", e))?;

    std::fs::write(&config_path, updated_json).map_err(|e| format!("Błąd zapisu pliku: {}", e))?;

    Ok(())
}
