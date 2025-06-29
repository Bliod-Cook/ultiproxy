#!/bin/bash

# UltiProxy Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Build and deploy development environment
deploy_dev() {
    print_status "Deploying UltiProxy in development mode..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start containers
    docker-compose up --build -d
    
    print_success "Development deployment completed!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:8080"
    print_status "Health Check: http://localhost:8080/health"
}

# Build and deploy production environment
deploy_prod() {
    print_status "Deploying UltiProxy in production mode..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml up --build -d
    
    print_success "Production deployment completed!"
    print_status "Frontend: http://localhost"
    print_status "Backend API: http://localhost:8080"
    print_status "Health Check: http://localhost:8080/health"
}

# Stop all containers
stop_all() {
    print_status "Stopping all UltiProxy containers..."
    
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    print_success "All containers stopped"
}

# Show container status
status() {
    print_status "UltiProxy Container Status:"
    echo ""
    
    # Check development containers
    if docker-compose ps | grep -q "ultiproxy"; then
        echo "Development Environment:"
        docker-compose ps
        echo ""
    fi
    
    # Check production containers
    if docker-compose -f docker-compose.prod.yml ps | grep -q "ultiproxy"; then
        echo "Production Environment:"
        docker-compose -f docker-compose.prod.yml ps
        echo ""
    fi
    
    # Show logs if containers are running
    if docker ps | grep -q "ultiproxy"; then
        print_status "Recent logs:"
        docker-compose logs --tail=10 2>/dev/null || docker-compose -f docker-compose.prod.yml logs --tail=10 2>/dev/null || true
    fi
}

# Show logs
logs() {
    if docker ps | grep -q "ultiproxy"; then
        print_status "Showing UltiProxy logs (Ctrl+C to exit):"
        docker-compose logs -f 2>/dev/null || docker-compose -f docker-compose.prod.yml logs -f 2>/dev/null || print_error "No running containers found"
    else
        print_error "No UltiProxy containers are running"
    fi
}

# Clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    
    # Stop containers
    stop_all
    
    # Remove images
    docker images | grep ultiproxy | awk '{print $3}' | xargs -r docker rmi -f
    
    # Remove unused volumes and networks
    docker volume prune -f
    docker network prune -f
    
    print_success "Cleanup completed"
}

# Show help
show_help() {
    echo "UltiProxy Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev      Deploy in development mode"
    echo "  prod     Deploy in production mode"
    echo "  stop     Stop all containers"
    echo "  status   Show container status"
    echo "  logs     Show container logs"
    echo "  cleanup  Clean up Docker resources"
    echo "  help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev     # Deploy development environment"
    echo "  $0 prod    # Deploy production environment"
    echo "  $0 status  # Check container status"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "dev")
            deploy_dev
            ;;
        "prod")
            deploy_prod
            ;;
        "stop")
            stop_all
            ;;
        "status")
            status
            ;;
        "logs")
            logs
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@"