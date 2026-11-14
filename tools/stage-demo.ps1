$ErrorActionPreference = 'Stop'
if ($env:GITHUB_REF_NAME -ne 'main') { throw 'Demo publication is restricted to main' }
$demo = Get-Content 'docs/demo-browser-check.json' -Raw | ConvertFrom-Json
$dash = Get-Content 'docs/dash-browser-check.json' -Raw | ConvertFrom-Json
foreach ($report in @($demo,$dash)) { if ($report.passed -ne $true -or $report.sourceCommit -ne $env:GITHUB_SHA) { throw 'Missing source-matched passing demo/dash browser report' } }
& (Join-Path $PSScriptRoot 'stage-3c4.ps1')
$security = Get-Content 'docs/security-check.json' -Raw | ConvertFrom-Json
if ($security.status -ne 'passed' -or $security.source_commit -ne $env:GITHUB_SHA) { throw 'Security gate did not pass for this commit' }
$source = Join-Path $env:RUNNER_TEMP 'ASH_IRON_3C_WIN_X64'
$target = Join-Path $env:RUNNER_TEMP 'ASH_IRON_DEMO_WIN_X64'
if (Test-Path $target) { Remove-Item $target -Recurse -Force }
Move-Item -LiteralPath $source -Destination $target
$encoding = [System.Text.UTF8Encoding]::new($false)
$metaPath = Join-Path $target 'BUILD_PROVENANCE.json'
$meta = Get-Content $metaPath -Raw | ConvertFrom-Json
$meta.iteration = '4BC playable demo with 4A dash'
$meta | Add-Member -NotePropertyName demo_browser_passed -NotePropertyValue $true -Force
$meta | Add-Member -NotePropertyName carried_risk -NotePropertyValue '3C.4 and human visual acceptance pending; single enemy room' -Force
[System.IO.File]::WriteAllText($metaPath,($meta | ConvertTo-Json -Depth 6),$encoding)
Copy-Item 'docs/DEMO_MAIN.md' (Join-Path $target 'DEMO_MAIN.md')
foreach ($file in @('demo-browser-check.json','dash-browser-check.json','demo-LLL.png','demo-LLH.png','demo-HH.png','demo-execution-pin.png','demo-execution-fire.png','demo-execution-charred.png')) { Copy-Item (Join-Path 'docs' $file) (Join-Path $target 'verification') }
$readme = "ASH / IRON - 4BC Demo from main - Windows x64`nExtract the complete artifact once and run ASH_IRON.exe. Keep all DLLs, locales and resources.`nWASD/arrows move; LMB light / RMB heavy; chains LLL, LLH, HH; Shift with direction dashes; E sparks.`nR executes a nearby weakened enemy marked by a fiery halo. Lamp is life. F6 camera / F7 shake / F8 blood.`nESC pause/resume; F11 fullscreen; EXIT GAME or Alt+F4 closes.`nBuild source: BUILD_PROVENANCE.json. Reports: verification. Read DEMO_MAIN.md.`nOne enemy in this room. Visual acceptance and 3C.4 remain pending. CI is not artistic approval.`nNo installer/updater or project publisher signature. Do not disable OS security.`nLegacy Electron folder/metadata may say 3B.1; provenance and app report identify this demo.`n"
[System.IO.File]::WriteAllText((Join-Path $target 'README.txt'),$readme,$encoding)
$manifest = Join-Path $target 'SHA256SUMS.txt'
$lines = Get-ChildItem $target -Recurse -File | Where-Object { $_.FullName -ne $manifest } | Sort-Object FullName | ForEach-Object {
  $relative = [System.IO.Path]::GetRelativePath($target,$_.FullName).Replace('\','/')
  "$((Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant())  $relative"
}
[System.IO.File]::WriteAllText($manifest,(($lines -join "`n")+"`n"),$encoding)
$web = Join-Path $env:RUNNER_TEMP 'ASH_IRON_DEMO_WEB'
if (Test-Path $web) { Remove-Item $web -Recurse -Force }
New-Item $web -ItemType Directory | Out-Null
Copy-Item 'PLAY.html' $web
Copy-Item 'BUILD_INFO.json' $web
Copy-Item 'docs/DEMO_MAIN.md' $web
Copy-Item 'docs/demo-browser-check.json' $web
Copy-Item $metaPath $web
$hash = (Get-FileHash (Join-Path $web 'PLAY.html') -Algorithm SHA256).Hash.ToLowerInvariant()
[System.IO.File]::WriteAllText((Join-Path $web 'SHA256SUMS.txt'),"$hash  PLAY.html`n",$encoding)
