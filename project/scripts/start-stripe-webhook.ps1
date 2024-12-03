# Load environment variables from .env file
Get-Content .env | ForEach-Object {
    $name, $value = $_.split('=')
    if ($name -and $value) {
        Set-Item -Path "env:$name" -Value $value
    }
}

Write-Host "Starting Stripe webhook listener..."
.\stripe-cli\stripe.exe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook --api-key $env:STRIPE_SECRET_KEY --skip-verify
