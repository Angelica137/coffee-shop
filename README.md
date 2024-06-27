# Coffee Shop Full Stack

## Full Stack Nano - IAM Final Project

## Introduction
This project is a full stack drink menu application, with a Flask-based backend API and an Ionic/Angular frontend. It includes authentication and role-based access control (RBAC) using Auth0.

The application:

1. Display graphics representing the ratios of ingredients in each drink.
2. Allow public users to view drink names and graphics.
3. Allow the shop baristas to see the recipe information.
4. Allow the shop managers to create new drinks and edit existing drinks.

## Getting started

### Backend

#### Prerequisites
- Python 3.7 or later
- pip
- Virtual environment (recommended)

#### Installation
1. Navigate to the `/backend` directory.
2. Create and activate a virtual environment:

```bash
Python -m venv env
source env/bin/activate  # on Windows, use `env\Scripts\activate`
```

3. Install the required packages
```bash
pip install -r requirements.txt
```

4. Set up environment variables - Create a `.env` file in the `/backend` directory with the following contents:
```bash
DATABASE_URL=sqlite:///./database.db
AUTH0_DOMAIN=your_auth0_domain
API_AUDIENCE=your_api_audience
```

#### Running the server
Run the Flask application
```bash
export FLASK_APP=src/api.py
flask run
```

### Frontend

#### Prerequisites
- Node.js and npm
- Ionic CLI

#### Installation
1. Navigate to the `/frontend` directory.
2. Install dependencies:
```bash
npm install
```

Because of old dependencies you might need to run
```bash
npm install --legacy-peer-deps
```

3. Update the `environment.ts` file in `src/environments/` with your Auth0 configuration.

#### Running the application
1. Start the Ionic application:
```bash
ionic serve
```

Because of old dependencies you might need to run
```bash
NODE_OPTIONS=--openssl-legacy-provider ionic serve
```

## API Endpoints

- GET `/drinks`: Retrieve all drinks (short form)
- GET `/drinks-detail`: Retrieve all drinks (detailed form)
- POST `/drinks`: Create a new drink
- PATCH `/drinks/<id>`: Update an existing drink
- DELETE `/drinks/<id>`: Delete a drink

## Authentication

This application uses Auth0 for authentication and authorization. Ensure you have set up your Auth0 application and API, and update the configuration in both the frontend and backend accordingly.

## Roles and Permissions

- Barista
- can `get:drinks-detail`
- Manager
- can perform all actions

## Database

The application uses SQLite as the database. The database file is created automatically when you run the Flask application for the first time.
