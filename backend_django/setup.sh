#!/bin/bash
set -e  # stop on first error

echo "Setting up NeoDermaScan Backend Environment (CPU-only)..."

# Create & activate venv
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install core backend dependencies
echo "Installing Django and REST framework..."
pip install Django==5.2.7 djangorestframework==3.16.1 djangorestframework_simplejwt==5.5.1
pip install django-cors-headers==4.9.0 django-environ==0.12.0 django-phonenumber-field==8.3.0

# Utility & network libraries
echo "Installing utility/network libraries..."
pip install aiohttp==3.13.1 aiohttp-retry==2.9.1 anyio==4.11.0 httpx==0.28.1 requests==2.32.5
pip install phonenumbers==9.0.16 cryptography==46.0.3 PyJWT==2.10.1

# ML / compute stack (CPU only)
echo "Installing PyTorch (CPU-only) and ML stack..."
pip install torch==2.9.0 torchvision==0.24.0 --extra-index-url https://download.pytorch.org/whl/cpu
pip install numpy==2.3.3 pillow==11.3.0 tqdm==4.67.1 timm==1.0.20 sympy==1.14.0

# Supabase + PostgreSQL
echo "Installing Supabase + PostgreSQL dependencies..."
pip install supabase==2.22.0 supabase-auth==2.22.0 supabase-functions==2.22.0 storage3==2.22.0 postgrest==2.22.0
pip install psycopg==3.2.11 psycopg-binary==3.2.11

# Misc + deployment
echo "Installing misc & deployment tools..."
pip install gunicorn==23.0.0 twilio==9.8.4
pip install pydantic==2.12.3 pydantic_core==2.41.4

# Verify installation
echo "Verifying installation..."
pip check || echo "Some optional dependency conflicts may exist (safe to ignore if minor)."
python -m django --version
python -c "import torch; print('Torch version:', torch.__version__, '| CUDA available:', torch.cuda.is_available())"

echo "Setup complete! Virtual env located at ./venv"
echo "Activate it anytime using: source venv/bin/activate"
