use eframe::{egui, App, CreationContext, Frame};
use egui::Margin;
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::process::Command;
use which::which;
use chrono::Local;
use mysql::{OptsBuilder, Pool};
use std::path::{Path, PathBuf};

fn main() -> eframe::Result<()> {
    let native_options = eframe::NativeOptions::default();
    eframe::run_native(
        "Instalator Hotel Task Manager",
        native_options,
        Box::new(|cc| Box::new(InstallerApp::new(cc))),
    )
}

#[derive(Default, PartialEq)]
enum BackendOption {
    #[default]
    Undecided,
    Local,
    Remote,
}

#[derive(Default)]
struct InstallerApp {
    step: usize,
    backend_choice: BackendOption,
    external_api_url: String,
    external_api_port: String,
    use_external_db: bool,
    db_host: String,
    db_name: String,
    db_user: String,
    db_pass: String,
    java_installed: bool,
    backend_installed: bool,
    status: String,
}

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
            egui::Frame::none()
                .fill(ctx.style().visuals.panel_fill)
                .inner_margin(Margin::same(20.0))
                .show(ui, |ui| {
                    egui::ScrollArea::vertical().show(ui, |ui| {
                        ui.vertical_centered(|ui| {
                            ui.set_max_width(400.0);
                            ui.heading("Instalator środowiska aplikacji Hotel Task Manager");
                            ui.add_space(20.0);

                            match self.step {
                                0 => {
                                    ui.label("Czy chcesz zainstalować backend lokalnie?");
                                    ui.horizontal(|ui| {
                                        ui.radio_value(&mut self.backend_choice, BackendOption::Local, "Tak");
                                        ui.radio_value(&mut self.backend_choice, BackendOption::Remote, "Nie");
                                    });
                                    if ui.button("Dalej").clicked() {
                                        match self.backend_choice {
                                            BackendOption::Local => self.step = 1,
                                            BackendOption::Remote => self.step = 10,
                                            BackendOption::Undecided => {
                                                self.status = "Wybierz jedną z opcji.".to_string();
                                            }
                                        }
                                    }
                                }

                                1 => {
                                    ui.label("Czy chcesz połączyć backend z zewnętrzną bazą danych?");
                                    ui.checkbox(&mut self.use_external_db, "Tak");

                                    if self.use_external_db {
                                        ui.label("Dane logowania do bazy:");
                                        ui.add(
                                            egui::TextEdit::singleline(&mut self.db_host)
                                                .hint_text("Host"),
                                        );

                                        ui.add(
                                            egui::TextEdit::singleline(&mut self.db_name)
                                            .hint_text("Nazwa bazy danych, np. hoteltaskmanager"),
                                        );

                                        ui.add(
                                            egui::TextEdit::singleline(&mut self.db_user)
                                                .hint_text("Użytkownik"),
                                        );
                                        ui.add(
                                            egui::TextEdit::singleline(&mut self.db_pass)
                                                .hint_text("Hasło"),
                                        );

                                        ui.add_space(10.0);
                                        if ui.button("Przetestuj połączenie").clicked() {
                                            if self.db_host.trim().is_empty()
                                                || self.db_name.trim().is_empty()
                                                || self.db_user.trim().is_empty()
                                            {
                                                self.status = "Podaj host, nazwę bazy i użytkownika.".to_string();
                                            } else {
                                                match test_db_connection(
                                                    self.db_host.trim(),
                                                    self.db_name.trim(),
                                                    self.db_user.trim(),
                                                    self.db_pass.trim(),
                                                ) {
                                                    Ok(_) => self.status = "Połączenie z bazą danych jest OK!".to_string(),
                                                    Err(e) => self.status = format!("Błąd połączenia: {}", e),
                                                }
                                            }
                                        }
                                    }

                                    ui.add_space(10.0);
                                    ui.horizontal(|ui| {
                                        if ui.button("Wstecz").clicked() {
                                            self.back();
                                        }
                                        if ui.button("Dalej").clicked() {
                                            self.step = if self.use_external_db { 3 } else { 2 };
                                        }
                                    });
                                }

                                2 => { // nic nieruszone
                                    ui.label("Sprawdzanie obecności MariaDB...");
                                    if is_mariadb_installed() {
                                        self.status = "MariaDB jest już zainstalowane.".to_string();
                                        self.log("MariaDB already installed.");
                                    } else {
                                        self.status = "Trwa instalacja MariaDB...".to_string();
                                        self.log("Launching MariaDB installer...");
                                        let _ = Command::new("msiexec")
                                            .args(["/i", "resources/mariadb.msi", "/quiet"])
                                            .spawn();
                                    }
                                    // std::thread::sleep(std::time::Duration::from_secs(1));
                                    self.step += 1;
                                }

                                3 => {
                                    ui.label("Sprawdzanie obecności Java 21+...");

                                    let java_home_opt = detect_java_home();
                                    self.java_installed = java_home_opt.is_some();

                                    if self.java_installed {
                                        self.status = "Java 21+ została wykryta.".to_string();
                                        self.log("Java >= 21 detected via PATH");

                                        let java_home = java_home_opt.unwrap();

                                        let env_home = std::env::var("JAVA_HOME").unwrap_or_default();
                                        if env_home.trim().is_empty() || !env_home.contains("Java") {
                                            match set_java_home(&java_home) {
                                                Ok(_) => {
                                                    self.status.push_str("\nUstawiono JAVA_HOME");
                                                    self.log(&format!("JAVA_HOME ustawione na: {}", java_home));
                                                }
                                                Err(e) => {
                                                    self.status.push_str(&format!("\nNie udało się ustawić JAVA_HOME: {}", e));
                                                    self.log(&format!("Błąd JAVA_HOME: {}", e));
                                                }
                                            }
                                        } else {
                                            self.status.push_str("\nJAVA_HOME już ustawione.");
                                        }
                                    } else {
                                        self.status = "Trwa instalacja OpenJDK 21...".to_string();
                                        self.log("Launching OpenJDK installer...");

                                        let msi_path = get_resource_path("openjdk.msi");

                                        if !msi_path.exists() {
                                            self.status.push_str(&format!(" Nie znaleziono pliku instalatora: {}", msi_path.display()));
                                            self.log(&self.status);
                                        } else {
                                            let result = Command::new("msiexec")
                                                .args(["/i", msi_path.to_str().unwrap(), "/quiet"])
                                                .spawn()
                                                .and_then(|mut child| child.wait());

                                            match result {
                                                Ok(status) if status.success() => {
                                                    self.status.push_str(" Instalacja zakończona. Sprawdzam ponownie...");
                                                    self.log("OpenJDK installer zakończony poprawnie.");

                                                    std::thread::sleep(std::time::Duration::from_secs(3));

                                                    let java_home_opt = detect_java_home();
                                                    self.java_installed = java_home_opt.is_some();

                                                    if let Some(java_home) = java_home_opt {
                                                        self.status.push_str(" Java została poprawnie zainstalowana 🎉");
                                                        match set_java_home(&java_home) {
                                                            Ok(_) => self.status.push_str("\nJAVA_HOME ustawione."),
                                                            Err(e) => self.status.push_str(&format!("\nBłąd JAVA_HOME: {}", e)),
                                                        }
                                                    } else {
                                                        self.status.push_str("Java nadal niewykryta.");
                                                        self.log("Java nadal niewykryta po instalacji.");
                                                    }
                                                }
                                                Ok(status) => {
                                                    self.status.push_str(&format!(" Instalator zakończył się, kod: {:?}", status.code()));
                                                    self.log(&format!("Installer zakończony z kodem: {:?}", status.code()));
                                                }
                                                Err(e) => {
                                                    self.status.push_str(&format!(" Błąd uruchomienia instalatora: {}", e));
                                                    self.log(&format!("Błąd uruchamiania msiexec: {}", e));
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

                                    let backend_dir = PathBuf::from("C:/Hotel Task Manager Environment/backend");

                                    if let Err(e) = fs::create_dir_all(&backend_dir) {
                                        self.status = format!("Nie udało się utworzyć katalogu backendu: {}", e);
                                        self.log(&self.status);
                                        return;
                                    }

                                    let jar_source = get_resource_path("backend.jar");
                                    if !jar_source.exists() {
                                        self.status = format!("Nie znaleziono pliku backend.jar: {}", jar_source.display());
                                        self.log(&self.status);
                                        return;
                                    }

                                    let jar_dest = backend_dir.join("backend.jar");

                                    if let Err(e) = fs::copy(&jar_source, &jar_dest) {
                                        self.status = format!("Błąd kopiowania backendu: {}", e);
                                        self.log(&self.status);
                                        return;
                                    }

                                    self.backend_installed = true;
                                    self.status = format!("Backend został skopiowany do: {}", jar_dest.display());
                                    self.log("Backend copied successfully.");
                                    std::thread::sleep(std::time::Duration::from_secs(1));
                                    self.step = 5;
                                }

                                5 => {
                                    ui.label("Czy frontend został już zainstalowany?");

                                    ui.horizontal(|ui| {
                                        if ui.button("Nie - zainstaluj teraz").clicked() {
                                            let exe_path = get_resource_path("frontend.exe");

                                            if !exe_path.exists() {
                                                self.status = format!("Nie znaleziono instalatora frontendu: {}", exe_path.display());
                                                self.log(&self.status);
                                            } else {
                                                match Command::new(&exe_path).spawn() {
                                                    Ok(_) => {
                                                        self.status = "Instalator frontendu został uruchomiony.\n\
                                                            \n\
                                                            Nie kontynuuj instalacji, dopóki nie zakończysz instalacji frontendu.\n\
                                                            W przeciwnym razie konfiguracja nie powiedzie się."
                                                            .to_string();
                                                        self.log("Frontend installer launched.");
                                                    }
                                                    Err(e) => {
                                                        self.status = format!("Błąd uruchamiania instalatora frontendu: {}", e);
                                                        self.log(&self.status);
                                                    }
                                                }
                                            }
                                        }

                                        if ui.button("Frontend już zainstalowany - przejdź dalej").clicked() {
                                            self.step = 6;
                                        }
                                    });
                                }

                                6 => {
                                    ui.label("Aktualizowanie konfiguracji frontendu...");

                                    let (db_host, db_name, db_user, db_pass) = if self.use_external_db {
                                        (
                                            Some(self.db_host.trim()),
                                            Some(self.db_name.trim()),
                                            Some(self.db_user.trim()),
                                            Some(self.db_pass.trim()),
                                        )
                                    } else {
                                        (None, None, None, None)
                                    };

                                    let (api_url, api_port, jar_path) = if self.backend_choice == BackendOption::Local {
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
                                    );

                                    match result {
                                        Ok(_) => {
                                            self.status = "Zaktualizowano konfigurację frontendu.".to_string();
                                            self.log(&self.status);
                                            self.step = 7;
                                        }
                                        Err(e) => {
                                            self.status = format!("Błąd aktualizacji config frontendu: {}", e);
                                            self.log(&self.status);
                                        }
                                    }
                                }


                                7 => {
                                    ui.heading("Instalacja zakończona");
                                    ui.label("Środowisko backendowe oraz konfiguracja frontendu zostały zakończone.");
                                    ui.label(&self.status);
                                }

                                10 => {
                                    ui.label("Podaj dane do zewnętrznego backendu:");
                                    
                                    ui.add(
                                        egui::TextEdit::singleline(&mut self.external_api_url)
                                            .hint_text("Adres, np. http://localhost"),
                                    );
                                    ui.add(
                                        egui::TextEdit::singleline(&mut self.external_api_port)
                                            .hint_text("Port, np. 8080"),
                                    );

                                    if ui.button("Sprawdź połączenie").clicked() {
                                        let result = check_spring_health(
                                            self.external_api_url.trim(),
                                            self.external_api_port.trim(),
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
                                            self.back();
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

fn get_resource_path(file: &str) -> PathBuf {
    let exe_path = std::env::current_exe().unwrap_or_else(|_| PathBuf::from("."));

    // 4 poziomy wyżej: debug -> target -> installer -> installer -> project root
    let project_root = exe_path
        .parent()
        .and_then(|p| p.parent()) // target
        .and_then(|p| p.parent()) // installer
        .and_then(|p| p.parent()) // installer/
        .unwrap_or_else(|| Path::new("."));

    project_root.join("resources").join(file)
}

fn is_mariadb_installed() -> bool {
    which("mysqld").is_ok()
}

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

fn detect_java_home() -> Option<String> {
    if let Ok(path) = which::which("java") {
        if let Ok(output) = Command::new(&path).arg("--version").output() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            let combined = format!("{}{}", stderr, stdout);

            if let Some(line) = combined.lines().find(|l| l.contains("openjdk")) {
                if let Some(version_str) = line.split_whitespace().nth(1) {
                    if let Ok(major) = version_str.split('.').next().unwrap_or("").parse::<u32>() {
                        if major >= 21 {
                            let java_bin = path.to_string_lossy().to_string();
                            if let Some(java_home) = std::path::Path::new(&java_bin)
                                .parent()
                                .and_then(|p| p.parent())
                            {
                                return Some(java_home.to_string_lossy().to_string());
                            }
                        }
                    }
                }
            }
        }
    }
    None
}

#[cfg(target_os = "windows")]
fn set_java_home(java_home: &str) -> Result<(), String> {
    use winreg::enums::*;
    use winreg::RegKey;

    let system_env = RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey_with_flags(
            "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
            KEY_WRITE,
        )
        .map_err(|e| format!("Błąd otwierania rejestru: {}", e))?;

    system_env
        .set_value("JAVA_HOME", &java_home)
        .map_err(|e| format!("Błąd ustawiania JAVA_HOME: {}", e))
}

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

fn get_frontend_config_path() -> Option<PathBuf> {
    dirs::config_dir().map(|path| path.join("Hotel Task Manager").join("config.json"))
}

fn update_frontend_config(
    host: &str,
    port: &str,
    jar_path: &str,
    db_host: Option<&str>,
    db_name: Option<&str>,
    db_user: Option<&str>,
    db_pass: Option<&str>,
) -> Result<(), String> {
    let config_path = get_frontend_config_path()
        .ok_or("Nie można znaleźć ścieżki do pliku konfiguracyjnego.")?;

    // println!("Ścieżka do pliku konfiguracyjnego: {:?}", config_path);

    if let Some(parent_dir) = config_path.parent() {
        if !parent_dir.exists() {
            println!("Tworzę folder: {:?}", parent_dir);
            std::fs::create_dir_all(parent_dir)
                .map_err(|e| format!("Błąd tworzenia folderu: {}", e))?;
        }
    } else {
        return Err("Nie można ustalić folderu nadrzędnego dla config.json.".to_string());
    }

    let port_num: u16 = port
        .parse()
        .map_err(|_| "Niepoprawny numer portu".to_string())?;

    let config = if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| format!("Błąd odczytu pliku: {}", e))?;

        if content.trim().is_empty() {
            FrontendConfig {
                api_host: host.to_string(),
                backend_port: port_num,
                jar_path: jar_path.to_string(),
                db_host: db_host.map(|s| s.to_string()),
                db_name: db_name.map(|s| s.to_string()),
                db_user: db_user.map(|s| s.to_string()),
                db_pass: db_pass.map(|s| s.to_string()),
            }
        } else {
            let mut parsed: FrontendConfig = serde_json::from_str(&content)
                .map_err(|e| format!("Błąd parsowania JSON: {}", e))?;

            parsed.api_host = host.to_string();
            parsed.backend_port = port_num;
            parsed.jar_path = jar_path.to_string();
            parsed.db_host = db_host.map(|s| s.to_string());
            parsed.db_name = db_name.map(|s| s.to_string());
            parsed.db_user = db_user.map(|s| s.to_string());
            parsed.db_pass = db_pass.map(|s| s.to_string());

            parsed
        }
    } else {
        FrontendConfig {
            api_host: host.to_string(),
            backend_port: port_num,
            jar_path: jar_path.to_string(),
            db_host: db_host.map(|s| s.to_string()),
            db_name: db_name.map(|s| s.to_string()),
            db_user: db_user.map(|s| s.to_string()),
            db_pass: db_pass.map(|s| s.to_string()),
        }
    };

    let updated_json = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Błąd serializacji: {}", e))?;

    std::fs::write(&config_path, updated_json)
        .map_err(|e| format!("Błąd zapisu pliku: {}", e))?;

    Ok(())
}
