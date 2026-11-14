$ErrorActionPreference = 'Stop'
if ($env:GITHUB_REF_NAME -ne 'iteration-4-development') { throw 'Iteration 4 staging is restricted to iteration-4-development' }
# Reuse the complete fail-closed integrity, Defender and signature stage.
& (Join-Path $PSScriptRoot 'stage-3c4.ps1')
$source = Join-Path $env:RUNNER_TEMP 'ASH_IRON_3C_WIN_X64'
$target = Join-Path $env:RUNNER_TEMP 'ASH_IRON_ITERATION_4_WIN_X64'
$security = Get-Content 'docs/security-check.json' -Raw | ConvertFrom-Json
if ($security.status -ne 'passed' -or $security.source_commit -ne $env:GITHUB_SHA) { throw 'Missing passed security result for this source commit' }
if (Test-Path $target) { Remove-Item $target -Recurse -Force }
Move-Item -LiteralPath $source -Destination $target
$encoding = [System.Text.UTF8Encoding]::new($false)
$metaPath = Join-Path $target 'BUILD_PROVENANCE.json'
$meta = Get-Content $metaPath -Raw | ConvertFrom-Json
$meta.iteration = '4.0 baseline - inherited gameplay, no new abilities'
$meta | Add-Member -NotePropertyName carried_risk -NotePropertyValue '3C.4 manual and visual acceptance pending' -Force
$meta | Add-Member -NotePropertyName roadmap -NotePropertyValue '4.0 -> 4A -> 4C -> 4B -> 4E -> final 4D' -Force
[System.IO.File]::WriteAllText($metaPath,($meta | ConvertTo-Json -Depth 6),$encoding)
$readme = "ASH / IRON - Iteration 4.0 baseline - Windows x64`nThis is the inherited gameplay baseline, not the new smoke dash or execution.`nExtract the complete artifact once and run ASH_IRON.exe. Keep all DLLs, locales and resources.`nESC pause/resume; F11 fullscreen; Alt+F4 or EXIT GAME closes.`nBUILD_PROVENANCE.json identifies the branch and source commit. Legacy internal version labels may still say 3B.1.`nSee ITERATION_4_PLAN.md and PENDING_ACCEPTANCE_3C.md. 3C.4 acceptance remains pending.`nVerification reports are in verification. SHA256SUMS.txt records final file hashes.`nNo project publisher signing, installer or updater. Do not disable OS security.`nCI and Defender checks do not certify visual quality, security completeness or user-hardware performance.`n"
[System.IO.File]::WriteAllText((Join-Path $target 'README.txt'),$readme,$encoding)
Copy-Item 'docs/ITERATION_4_PLAN.md' $target
Copy-Item 'docs/PENDING_ACCEPTANCE_3C.md' $target
$manifest = Join-Path $target 'SHA256SUMS.txt'
$lines = Get-ChildItem $target -Recurse -File | Where-Object { $_.FullName -ne $manifest } | Sort-Object FullName | ForEach-Object {
  $relative = [System.IO.Path]::GetRelativePath($target,$_.FullName).Replace('\','/')
  $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $relative"
}
[System.IO.File]::WriteAllText($manifest,(($lines -join "`n")+"`n"),$encoding)
