# kaakazini
Kaakazini is a full-stack web platform built with React.js (frontend) and Django REST Framework (backend), that connects craftsmen to home owners and businesses to guarantee quality, cost effective and reliable services.

# Installation Guide

Backend (Django)

1. Clone the backend repo:
```bash
git clone https://github.com/JAY4T/kaakazini/backend.git
```

2. Navigate to the backend directory:
```bash
cd kaakazini/backend
```

3. Set up and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```
4. Install requirements:
```bash
pip install -r requirements.txt
``` 

5. Configure environment variables (optional):
- Use the structure presented in .env.example to create your .env file and replace the placeholders with actual variables

6. Run migrations and create superuser:
```bash
python3 manage.py migrate
python3 manage.py createsuperuser

```
7. Start development server:
```bash
python manage.py runserver
```

# Frontend (React)

1. Clone the frontend repo:
```bash
git clone https://github.com/JAY4T/kaakazini/frontend.git
```
2. Navigate to the frontend directory
```bash
cd kaakazini/frontend
```
3. Install dependencies:
```bash
npm install
```
4. Create .env file and add this:
```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api
```
5. Start frontend:
```bash
npm start
```
If you are using pnpm replace "npm start" with "pnpm start"

# Deployment (Production)

Provision a DigitalOcean droplet.

Install dependencies:


sudo apt update && sudo apt install python3-pip python3-venv nginx git

Clone backend, set up Gunicorn & collectstatic.

Build React:


npm run build

Configure Nginx to serve React & proxy API.