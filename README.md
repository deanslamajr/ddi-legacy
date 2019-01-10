express it with emojis

## Local Setup

### Set Env Vars

#### app
```bash
cp .env_example .env
```

Fill in appropriate values for each key in `.env`

#### DB
```bash
cp config/config_example.json config/config.json
```

Fill in appropriate DB info in `config/config.json`

### Run DB migrations

Make sure Docker and Docker-Compose are installed locally and then start docker-compose from the project root:
```bash
docker-compose up
```

Next, run the migrations:
```bash
npm run migrate -- --env development
```