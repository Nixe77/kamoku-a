# Static file server. Root is derived from the script's own folder
# via $PSScriptRoot so no non-ASCII path literal is embedded (avoids
# encoding/mojibake issues when this file is read by PowerShell 5.1).
$root = $PSScriptRoot
$port = 8766
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "serving on http://localhost:$port"
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $path = [System.Uri]::UnescapeDataString($ctx.Request.Url.LocalPath).TrimStart('/')
    if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }
    $file = Join-Path $root $path
    if (Test-Path $file -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      switch ($ext) {
        '.html' { $ct = 'text/html; charset=utf-8' }
        '.js'   { $ct = 'text/javascript; charset=utf-8' }
        '.json' { $ct = 'application/json; charset=utf-8' }
        '.css'  { $ct = 'text/css; charset=utf-8' }
        default { $ct = 'application/octet-stream' }
      }
      $ctx.Response.ContentType = $ct
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
    $ctx.Response.Close()
  } catch { }
}
