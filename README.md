# LOL unificado

## Qué hace
- `frontend`: Angular consumiendo la API.
- `backend`: Spring Boot + PostgreSQL.
- `scraper`: Puppeteer + Cheerio para poblar la base de datos.
- `docker-compose.yml`: levanta todo junto.

## Levantar el proyecto
```bash
docker compose up --build
```

## URLs
- Frontend: http://localhost:4200
- Backend: http://localhost:8080/api/custom/champions

## Flujo
1. Arranca PostgreSQL.
2. Arranca Spring Boot.
3. El scraper espera al backend, scrapea y hace POST masivo.
4. El frontend consume los campeones desde la API.
```
