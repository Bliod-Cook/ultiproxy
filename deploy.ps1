# UltiProxy Deployment Script for Windows PowerShell
param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod", "stop", "status", "logs", "cleanup", "help")]
    [string]$Command = "help"
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    White = "White"
}

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

# Check if Docker is installed
function Test-Docker {
    try {
        $null = Get-Command docker -ErrorAction Stop
        $null = Get-Command docker-compose -ErrorAction Stop
        Write-Success "Docker and Docker Compose are installed"
        return $true
    }
    catch {
        Write-Error "Docker or Docker Compose is not installed. Please install Docker Desktop first."
        return $false
    }
}

# Build and deploy development environment
function Deploy-Dev {
    Write-Status "Deploying UltiProxy in development mode..."
    
    # Stop existing containers
    try {
        docker-compose down 2>$null
    }
    catch {
        # Ignore errors if no containers are running
    }
    
    # Build and start containers
    docker-compose up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Development deployment completed!"
        Write-Status "Frontend: http://localhost"
        Write-Status "Backend API: http://localhost:8080"
        Write-Status "Health Check: http://localhost:8080/health"
    }
    else {
        Write-Error "Deployment failed. Check Docker logs for details."
    }
}

# Build and deploy production environment
function Deploy-Prod {
    Write-Status "Deploying UltiProxy in production mode..."
    
    # Stop existing containers
    try {
        docker-compose -f docker-compose.prod.yml down 2>$null
    }
    catch {
        # Ignore errors if no containers are running
    }
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Production deployment completed!"
        Write-Status "Frontend: http://localhost"
        Write-Status "Backend API: http://localhost:8080"
        Write-Status "Health Check: http://localhost:8080/health"
    }
    else {
        Write-Error "Deployment failed. Check Docker logs for details."
    }
}

# Stop all containers
function Stop-All {
    Write-Status "Stopping all UltiProxy containers..."
    
    try {
        docker-compose down 2>$null
    }
    catch {
        # Ignore errors
    }
    
    try {
        docker-compose -f docker-compose.prod.yml down 2>$null
    }
    catch {
        # Ignore errors
    }
    
    Write-Success "All containers stopped"
}

# Show container status
function Show-Status {
    Write-Status "UltiProxy Container Status:"
    Write-Host ""
    
    # Check development containers
    $devContainers = docker-compose ps 2>$null
    if ($devContainers -match "ultiproxy") {
        Write-Host "Development Environment:" -ForegroundColor $Colors.Yellow
        docker-compose ps
        Write-Host ""
    }
    
    # Check production containers
    $prodContainers = docker-compose -f docker-compose.prod.yml ps 2>$null
    if ($prodContainers -match "ultiproxy") {
        Write-Host "Production Environment:" -ForegroundColor $Colors.Yellow
        docker-compose -f docker-compose.prod.yml ps
        Write-Host ""
    }
    
    # Show logs if containers are running
    $runningContainers = docker ps | Select-String "ultiproxy"
    if ($runningContainers) {
        Write-Status "Recent logs:"
        try {
            docker-compose logs --tail=10 2>$null
        }
        catch {
            try {
                docker-compose -f docker-compose.prod.yml logs --tail=10 2>$null
            }
            catch {
                # Ignore errors
            }
        }
    }
}

# Show logs
function Show-Logs {
    $runningContainers = docker ps | Select-String "ultiproxy"
    if ($runningContainers) {
        Write-Status "Showing UltiProxy logs (Ctrl+C to exit):"
        try {
            docker-compose logs -f 2>$null
        }
        catch {
            try {
                docker-compose -f docker-compose.prod.yml logs -f 2>$null
            }
            catch {
                Write-Error "No running containers found"
            }
        }
    }
    else {
        Write-Error "No UltiProxy containers are running"
    }
}

# Clean up Docker resources
function Invoke-Cleanup {
    Write-Status "Cleaning up Docker resources..."
    
    # Stop containers
    Stop-All
    
    # Remove images
    $images = docker images | Select-String "ultiproxy"
    if ($images) {
        $imageIds = $images | ForEach-Object { ($_ -split '\s+')[2] }
        docker rmi -f $imageIds
    }
    
    # Remove unused volumes and networks
    docker volume prune -f
    docker network prune -f
    
    Write-Success "Cleanup completed"
}

# Show help
function Show-Help {
    Write-Host "UltiProxy Deployment Script for Windows" -ForegroundColor $Colors.Blue
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [COMMAND]" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor $Colors.Yellow
    Write-Host "  dev      Deploy in development mode"
    Write-Host "  prod     Deploy in production mode"
    Write-Host "  stop     Stop all containers"
    Write-Host "  status   Show container status"
    Write-Host "  logs     Show container logs"
    Write-Host "  cleanup  Clean up Docker resources"
    Write-Host "  help     Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Colors.Yellow
    Write-Host "  .\deploy.ps1 dev     # Deploy development environment"
    Write-Host "  .\deploy.ps1 prod    # Deploy production environment"
    Write-Host "  .\deploy.ps1 status  # Check container status"
}

# Main script logic
function Main {
    if (-not (Test-Docker)) {
        exit 1
    }
    
    switch ($Command) {
        "dev" { Deploy-Dev }
        "prod" { Deploy-Prod }
        "stop" { Stop-All }
        "status" { Show-Status }
        "logs" { Show-Logs }
        "cleanup" { Invoke-Cleanup }
        default { Show-Help }
    }
}

# Run main function
Main