# kaakazini
Kaakazini is a full-stack web platform built with React.js (frontend) and Django REST Framework (backend), that connects craftsmen to home owners and businesses to guarantee quality, cost effective and reliable services.

# Installation Guide

Backend (Django)

Clone the backend repo:


git clone https://github.com/JAY4T/kaakazini/backend.git

cd kaakazini/backend
Set up virtual environment:


python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

Configure environment variables (optional):

Run migrations and create superuser:


python manage.py migrate

python manage.py createsuperuser

Start development server:


python manage.py runserver

# Frontend (React)

Clone the frontend repo:


git clone https://github.com/JAY4T/kaakazini/frontend.git

cd kaakazini/frontend

Install dependencies:


npm install

Create .env file:


REACT_APP_API_BASE_URL=http://localhost:8000/api

Start frontend:


npm start

# Deployment (Production)

Provision a DigitalOcean droplet.

Install dependencies:


sudo apt update && sudo apt install python3-pip python3-venv nginx git

Clone backend, set up Gunicorn & collectstatic.

Build React:


npm run build

Configure Nginx to serve React & proxy API.