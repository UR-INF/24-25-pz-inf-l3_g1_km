param(
    [string]$AppDir,
    [string]$JarPath,
    [string]$MariaDbInstaller
)

function Prompt-YesNo($msg) {
    do {
        $resp = Read-Host "$msg (T/N)"
    } while ($resp -notmatch '^[TtNn]$')
    return $resp -match '^[Tt]$'
}

function Install-MariaDB {
    Write-Host "Instalacja MariaDB..."
    Start-Process msiexec.exe -ArgumentList "/i `"$MariaDbInstaller`" /qn" -Wait
    Start-Sleep -Seconds 5
}

function Configure-Properties {
    $dbName = Read-Host "Nazwa bazy danych"
    $dbUser = Read-Host "Użytkownik"
    $dbPass = Read-Host "Hasło"

    $shouldSeed = Prompt-YesNo "Czy zseedować bazę danych?"

    $props = @"
spring.datasource.url=jdbc:mariadb://localhost:3306/$dbName
spring.datasource.username=$dbUser
spring.datasource.password=$dbPass
spring.jpa.hibernate.ddl-auto=update
app.db.seed=$shouldSeed
"@

    $filePath = Join-Path (Split-Path $JarPath) "application.properties"
    $props | Out-File -Encoding UTF8 $filePath

    return @{
        ApiUrl = "http://localhost:8080"
        JarPath = $JarPath
    }
}

function Write-ConfigJson($apiUrl, $jarPath) {
    $config = @{
        API_URL = $apiUrl
        JAR_PATH = $jarPath
    }
    $configPath = Join-Path $env:APPDATA "Hotel Task Manager\config.json"
    $config | ConvertTo-Json | Out-File -Encoding UTF8 $configPath
}

# MAIN
if (Prompt-YesNo "Czy chcesz zainstalować backend lokalnie?") {
    Install-MariaDB
    $res = Configure-Properties
    Write-ConfigJson -apiUrl $res.ApiUrl -jarPath $res.JarPath
} else {
    $apiUrl = Read-Host "Podaj adres backendu (np. http://192.168.1.100:8080)"
    Write-ConfigJson -apiUrl $apiUrl -jarPath ""
}
