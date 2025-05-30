use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use std::time::SystemTime;
use egui::Margin;


use eframe::{egui, App, CreationContext, Frame};
use which::which;
use winreg::enums::*;
use winreg::RegKey;

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
    db_user: String,
    db_pass: String,
    java_installed: bool,
    backend_installed: bool,
    frontend_launched: bool,
    status: String,
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
        let timestamp = SystemTime::now();
        let entry = format!("[{:?}] {}\n", timestamp, message);
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
                            ui.set_max_width(400.0); // maksymalna szerokość
                            ui.heading("Instalator środowiska aplikacji Hotel Task Manager");
                            ui.add_space(20.0);

                            match self.step {
                                0 => {
                                    ui.label("Czy chcesz zainstalować backend lokalnie?");
                                    ui.horizontal(|ui| {
                                        ui.radio_value(
                                            &mut self.backend_choice,
                                            BackendOption::Local,
                                            "Tak",
                                        );
                                        ui.radio_value(
                                            &mut self.backend_choice,
                                            BackendOption::Remote,
                                            "Nie",
                                        );
                                    });

                                    ui.add_space(10.0);
                                    ui.horizontal(|ui| {
                                        if ui.button("Dalej").clicked() {
                                            match self.backend_choice {
                                                BackendOption::Local => self.step = 1,
                                                BackendOption::Remote => self.step = 10,
                                                BackendOption::Undecided => {
                                                    self.status =
                                                        "Wybierz jedną z opcji.".to_string();
                                                }
                                            }
                                        }
                                    });
                                }

                                1 => {
                                    ui.label(
                                        "Czy chcesz połączyć backend z zewnętrzną bazą danych?",
                                    );
                                    ui.checkbox(&mut self.use_external_db, "Tak");

                                    if self.use_external_db {
                                        ui.label("Dane logowania do bazy:");
                                        ui.add(
                                            egui::TextEdit::singleline(&mut self.db_host)
                                                .hint_text("Host"),
                                        );
                                        ui.add(
                                            egui::TextEdit::singleline(&mut self.db_user)
                                                .hint_text("Użytkownik"),
                                        );
                                        ui.add(
                                            egui::TextEdit::singleline(&mut self.db_pass)
                                                .hint_text("Hasło"),
                                        );
                                    }

                                    ui.add_space(10.0);
                                    ui.horizontal(|ui| {
                                        if ui.button("Wstecz").clicked() {
                                            self.back();
                                        }
                                        if ui.button("Dalej").clicked() {
                                            if !self.use_external_db {
                                                self.step += 1;
                                            } else {
                                                self.step = 3;
                                            }
                                        }
                                    });
                                }

                                2 => {
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
                                    self.step += 1;
                                }

                                3 => {
                                    ui.label("Sprawdzanie obecności Java 21...");
                                    self.java_installed = is_java21_installed();
                                    if self.java_installed {
                                        self.status = "Java 21 została wykryta.".to_string();
                                        self.log("Java 21 detected.");
                                    } else {
                                        self.status = "Trwa instalacja OpenJDK 21...".to_string();
                                        self.log("Launching OpenJDK installer...");
                                        let _ = Command::new("msiexec")
                                            .args(["/i", "resources/openjdk.msi", "/quiet"])
                                            .spawn();
                                        self.status
                                            .push_str(" JAVA_HOME musi być ustawione ręcznie.");
                                    }
                                    self.step += 1;
                                }

                                4 => {
                                    ui.label("Instalowanie backendu...");
                                    let backend_dir = PathBuf::from("C:/Hotel Task Manager Environment/backend");
                                    fs::create_dir_all(&backend_dir).unwrap();
                                    fs::copy(
                                        "resources/backend.jar",
                                        backend_dir.join("backend.jar"),
                                    )
                                    .unwrap();
                                    self.backend_installed = true;
                                    self.status = "Backend został skopiowany do C:/Hotel Task Manager Environment/backend."
                                        .to_string();
                                    self.log("Backend copied to C:/Hotel Task Manager Environment/backend.");
                                    self.step = 5;
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
                                            if self.external_api_url.trim().is_empty()
                                                || self.external_api_port.trim().is_empty()
                                            {
                                                self.status =
                                                    "Podaj poprawny adres i port.".to_string();
                                            } else {
                                                self.log(&format!(
                                                    "Ustawiono zdalny backend: {}:{}",
                                                    self.external_api_url, self.external_api_port
                                                ));
                                                self.step = 5;
                                            }
                                        }
                                    });
                                }

                                5 => {
                                    ui.label("Czy chcesz uruchomić instalator frontendu?");
                                    ui.horizontal(|ui| { 
                                        if ui.button("Tak").clicked() {
                                            let exe_path = std::env::current_dir()
                                                .unwrap()
                                                .parent()
                                                .unwrap()
                                                .join("resources")
                                                .join("frontend.exe");

                                            let _ = Command::new(exe_path).spawn();

                                            self.frontend_launched = true;
                                            self.status =
                                                "Frontend został uruchomiony.".to_string();
                                            self.log("Frontend launched.");
                                            self.step = 6;
                                        }
                                        if ui.button("Nie").clicked() {
                                            self.step = 6;
                                        }
                                    });
                                }

                                _ => {
                                    ui.heading("Instalacja zakończona");
                                    ui.label(&self.status);
                                }
                            }

                            ui.add_space(20.0);
                            if !self.status.is_empty() {
                                ui.label(format!("Status: {}", self.status));
                            }
                        });
                    });
                });
            });
    }
}

fn is_mariadb_installed() -> bool {
    which("mysqld").is_ok()
}

fn is_java21_installed() -> bool {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    if let Ok(java_key) = hkcu.open_subkey("SOFTWARE\\JavaSoft\\Java Development Kit\\21") {
        return java_key.get_value::<String, _>("JavaHome").is_ok();
    }
    false
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
