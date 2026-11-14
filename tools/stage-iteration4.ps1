$ErrorActionPreference = 'Stop'
if ($env:GITHUB_REF_NAME -ne 'iteration-4-main-4a') { throw '4A staging is restricted to iteration-4-main-4a' }
& (Join-Path $PSScriptRoot 'stage-3c4.ps1')
$source = Join-Path $env:RUNNER_TEMP 'ASH_IRON_3C_WIN_X64'
$target = Join-Path $env:RUNNER_TEMP 'ASH_IRON_ITERATION_4_WIN_X64'
$security = Get-Content 'docs/security-check.json' -Raw | ConvertFrom-Json
$dash = Get-Content 'docs/dash-browser-check.json' -Raw | ConvertFrom-Json
if ($security.status -ne 'passed' -or $security.source_commit -ne $env:GITHUB_SHA) { throw 'Missing passed security result for this source commit' }
if ($dash.passed -ne $true -or $dash.sourceCommit -ne $env:GITHUB_SHA) { throw 'Missing passed 4A browser result for this source commit' }
if (Test-Path $target) { Remove-Item $target -Recurse -Force }
Move-Item -LiteralPath $source -Destination $target
$encoding = [System.Text.UTF8Encoding]::new($false)
$metaPath = Join-Path $target 'BUILD_PROVENANCE.json'
$meta = Get-Content $metaPath -Raw | ConvertFrom-Json
$meta.iteration = '4A continuous smoke-dash preview'
$meta | Add-Member -NotePropertyName carried_risk -NotePropertyValue '3C.4 manual and visual acceptance pending' -Force
$meta | Add-Member -NotePropertyName roadmap -NotePropertyValue '4.0 -> 4A -> 4C -> 4B -> 4E -> final 4D' -Force
[System.IO.File]::WriteAllText($metaPath,($meta | ConvertTo-Json -Depth 6),$encoding)
$readme = "ASH / IRON - Iteration 4A smoke-dash preview - Windows x64`nExtract once and run ASH_IRON.exe. Keep all DLLs, locales and resources.`nShift with a held WASD/arrow direction: smoke dash. No direction: no dash.`nESC pause/resume; F11 fullscreen; Alt+F4 or EXIT GAME closes.`n4B execution and 4C attack rework are not implemented in this preview.`nBUILD_PROVENANCE.json identifies the source. Legacy internal Electron metadata may say 3B.1.`nRead ITERATION_4A.md and PENDING_ACCEPTANCE_3C.md. Visual acceptance remains pending.`nReports: verification. Integrity: SHA256SUMS.txt. No project publisher signing, installer or updater.`nDo not disable OS security. CI and Defender are not a complete audit or user-hardware performance certification.`n"
[System.IO.File]::WriteAllText((Join-Path $target 'README.txt'),$readme,$encoding)
foreach ($file in @('ITERATION_4_PLAN.md','ITERATION_4A.md','PENDING_ACCEPTANCE_3C.md')) { Copy-Item (Join-Path 'docs' $file) $target }
foreach ($file in @('dash-browser-check.json','dash-dissolve.png','dash-travel.png','dash-reform.png')) { Copy-Item (Join-Path 'docs' $file) (Join-Path $target 'verification') }
$manifest = Join-Path $target 'SHA256SUMS.txt'
$lines = Get-ChildItem $target -Recurse -File | Where-Object { $_.FullName -ne $manifest } | Sort-Object FullName | ForEach-Object {
  $relative = [System.IO.Path]::GetRelativePath($target,$_.FullName).Replace('\','/')
  $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $relative"
}
[System.IO.File]::WriteAllText($manifest,(($lines -join "`n")+"`n"),$encoding)
