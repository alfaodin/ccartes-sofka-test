Monorepo setup: backend + frontend with Docker support
Apps live under apps/backend (Express, port 3002) and apps/frontend (Angular 19).

## Install Dependencies

```bash
npm install
```

## Running locally

```bash
  npm run install:all        # install deps in both apps
```
```bash
  npm run backend:start      # starts the backend on :3002
```
```bash
  npm run frontend:dev       # starts Angular dev server on :4200
```

## RUN ALL THE APP USING DOCKER COMPOSE

```bash
docker compose up --build  # builds and starts both services
```
http://localhost:80        # frontend served by nginx
                           # nginx proxies /bp to the backend container
