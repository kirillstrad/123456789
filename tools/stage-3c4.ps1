$ErrorActionPreference = 'Stop'
$encoding = [System.Text.UTF8Encoding]::new($false)
$source = Join-Path $env:GITHUB_WORKSPACE 'dist/ASH_IRON_3B_1_WIN_X64'
$target = Join-Path $env:RUNNER_TEMP 'ASH_IRON_3C_WIN_X64'
$result = [ordered]@{source_commit=$env:GITHUB_SHA;status='not_run';reason=$null;scan_exit_code=$null;signature=$null;publisher_signing_configured=$false;scanner=$null;definition_version=$null;definition_date=$null;scope='Packaged Windows application folder';limitations='Not an audit, publisher signature, or Chrome reputation guarantee'}
try {
  $smoke = Get-Content 'docs/desktop-check.json' -Raw | ConvertFrom-Json
  if ($smoke.passed -ne $true) { throw 'Desktop smoke failed' }
  foreach ($file in @('ASH_IRON.exe','resources/app/PLAY.html','resources/app/main.cjs','LICENSE','LICENSES.chromium.html')) {
    if (-not (Test-Path (Join-Path $source $file) -PathType Leaf)) { throw "Missing package file: $file" }
  }
  Start-Sleep -Seconds 2
  if (Test-Path $target) { Remove-Item $target -Recurse -Force }
  Copy-Item -LiteralPath $source -Destination $target -Recurse
  if (-not (Test-Path (Join-Path $target 'locales') -PathType Container)) { throw 'Missing locales' }
  if (-not (Get-ChildItem $target -Filter '*.dll' -File)) { throw 'Missing DLLs' }
  $hashes = @{}
  $files = @(Get-ChildItem $source -Recurse -File)
  foreach ($file in $files) {
    $relative = [System.IO.Path]::GetRelativePath($source,$file.FullName)
    $hash = (Get-FileHash $file.FullName -Algorithm SHA256).Hash
    if ($hash -ne (Get-FileHash (Join-Path $target $relative) -Algorithm SHA256).Hash) { throw "Copy mismatch: $relative" }
    $hashes[$relative]=$hash
  }
  $sig = Get-AuthenticodeSignature (Join-Path $target 'ASH_IRON.exe')
  $subject = $null
  if ($sig.SignerCertificate) { $subject=$sig.SignerCertificate.Subject }
  $result.signature=@{status=[string]$sig.Status;subject=$subject;note='Executable signature does not attest separately bundled application JavaScript; no project publisher signing configured'}
  if (-not (Get-Command Get-MpComputerStatus -ErrorAction SilentlyContinue)) { $result.status='unavailable';throw 'Defender status command unavailable' }
  $status=Get-MpComputerStatus
  if (-not $status.AMServiceEnabled -or -not $status.AntivirusEnabled) { $result.status='unavailable';throw 'Defender antivirus service unavailable; preview publication blocked' }
  $result.definition_version=$status.AntivirusSignatureVersion
  $result.definition_date=[string]$status.AntivirusSignatureLastUpdated
  $scanner = Get-ChildItem 'C:/ProgramData/Microsoft/Windows Defender/Platform/*/MpCmdRun.exe' -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -First 1
  $scannerPath = if ($scanner) { $scanner.FullName } else { Join-Path $env:ProgramFiles 'Windows Defender/MpCmdRun.exe' }
  if (-not (Test-Path $scannerPath)) { $result.status='unavailable';throw 'Defender scanner unavailable' }
  $result.scanner=$scannerPath
  $output = & $scannerPath -Scan -ScanType 3 -File $target -DisableRemediation 2>&1
  $code=$LASTEXITCODE
  [System.IO.File]::WriteAllText((Join-Path $env:GITHUB_WORKSPACE 'docs/security-scan.txt'),($output -join "`n"),$encoding)
  $result.scan_exit_code=$code
  if ($code -ne 0) { $result.status='scan_failed';throw "Defender returned $code; detection or scan error; see log" }
  if (@(Get-ChildItem $target -Recurse -File).Count -ne $files.Count) { throw 'Package file count changed during scan' }
  foreach ($relative in $hashes.Keys) { if ((Get-FileHash (Join-Path $target $relative) -Algorithm SHA256).Hash -ne $hashes[$relative]) { throw "Package changed during scan: $relative" } }
  $result.status='passed'
} catch {
  if ($result.status -eq 'not_run') { $result.status='error' }
  $result.reason=$_.Exception.Message
} finally {
  [System.IO.File]::WriteAllText((Join-Path $env:GITHUB_WORKSPACE 'docs/security-check.json'),($result | ConvertTo-Json -Depth 6),$encoding)
}
if ($result.status -ne 'passed') { throw "Publication blocked: $($result.status): $($result.reason)" }
$meta=[ordered]@{iteration='3C.4 stabilization candidate';source_commit=$env:GITHUB_SHA;source_branch=$env:GITHUB_REF_NAME;workflow_run=$env:GITHUB_RUN_ID;workflow_attempt=$env:GITHUB_RUN_ATTEMPT;electron='45.3.2';native_smoke_passed=$true;security_scan='passed';human_visual_acceptance='pending';user_hardware_performance='unverified';publisher_signing_configured=$false}
[System.IO.File]::WriteAllText((Join-Path $target 'BUILD_PROVENANCE.json'),($meta | ConvertTo-Json),$encoding)
[System.IO.File]::WriteAllText((Join-Path $target 'README.txt'),"ASH / IRON - 3C.4 stabilization candidate - Windows x64`nRun ASH_IRON.exe after extracting the complete folder once. Keep all DLLs, locales and resources.`nESC pause/resume; F11 fullscreen; Alt+F4 or EXIT GAME closes.`nBuild identity: BUILD_PROVENANCE.json. Checks: verification. Integrity: SHA256SUMS.txt.`nLegacy internal metadata may say 3B.1; provenance identifies this build.`nNo project publisher signing, installer or updater. Do not disable OS protection.`nCI and Defender checks are not visual acceptance, a security audit or user-hardware performance certification.`nElectron licenses and notices are retained. Read VISUAL_CHECK.md.`n",$encoding)
Copy-Item 'docs/ITERATION_3C_VISUAL_CHECK.md' (Join-Path $target 'VISUAL_CHECK.md')
$verification=Join-Path $target 'verification'
New-Item $verification -ItemType Directory | Out-Null
foreach ($file in @('unit-tests.tap','browser-check.json','browser-runtime-report.json','desktop-check.json','desktop-preview.png','typecheck.json','stability-check.json','stability-browser.json','security-check.json','security-scan.txt','ITERATION_3C_4.md')) {
  $path=Join-Path 'docs' $file
  if (Test-Path $path) { Copy-Item $path $verification }
}
$lines=Get-ChildItem $target -Recurse -File | Sort-Object FullName | ForEach-Object {
  $relative=[System.IO.Path]::GetRelativePath($target,$_.FullName).Replace('\','/')
  $hash=(Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $relative"
}
[System.IO.File]::WriteAllText((Join-Path $target 'SHA256SUMS.txt'),(($lines -join "`n")+"`n"),$encoding)
