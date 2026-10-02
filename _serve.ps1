param([int]$Port = 4173)

$root = $PSScriptRoot
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()
Write-Output "Serving $root on http://127.0.0.1:$Port/"

$types = @{
  ".html"  = "text/html; charset=utf-8"
  ".css"   = "text/css; charset=utf-8"
  ".js"    = "application/javascript; charset=utf-8"
  ".mjs"   = "application/javascript; charset=utf-8"
  ".json"  = "application/json"
  ".txt"   = "text/plain; charset=utf-8"
  ".md"    = "text/plain; charset=utf-8"
  ".svg"   = "image/svg+xml"
  ".ico"   = "image/x-icon"
  ".png"   = "image/png"
  ".jpg"   = "image/jpeg"
  ".jpeg"  = "image/jpeg"
  ".gif"   = "image/gif"
  ".webp"  = "image/webp"
  ".avif"  = "image/avif"
  ".woff"  = "font/woff"
  ".woff2" = "font/woff2"
  ".mp4"   = "video/mp4"
  ".webm"  = "video/webm"
  ".stl"   = "model/stl"
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $response = $context.Response
  try {
    $path = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath)
    $local = Join-Path $root ($path.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar))
    if (Test-Path $local -PathType Container) {
      # Redirect /sites/foo to /sites/foo/ so relative links resolve
      if (-not $path.EndsWith("/")) {
        $response.StatusCode = 301
        $response.RedirectLocation = "$path/"
        continue
      }
      $local = Join-Path $local "index.html"
    }
    if (Test-Path $local -PathType Leaf) {
      $bytes = [IO.File]::ReadAllBytes($local)
      $ext = [IO.Path]::GetExtension($local).ToLowerInvariant()
      $response.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" })
      $response.StatusCode = 200
    } else {
      $bytes = [Text.Encoding]::UTF8.GetBytes("Not found")
      $response.ContentType = "text/plain; charset=utf-8"
      $response.StatusCode = 404
    }
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch {
    Write-Warning $_
  } finally {
    $response.Close()
  }
}
