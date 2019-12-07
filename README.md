# draw draw ink
express it with emojis

## Development

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

## Test Image
* `npm run image:build`
* `npm run image:start`
* to start a command line on running container `npm run image:bash`

## Deploy

1. Ensure that `docker` is available on the command line
  * if `docker` install is needed, will also need to create new private repo creds (hub.docker.com) and register these with the local `docker` cli
2. Commit all changes
3. `npm run publish:test|patch|minor|major`
  * This will build, tag, and publish the latest image.
  * Take note of the new image tag name. e.g. The tag from the following output is `v2.0.3-10`.
  ```
  v2.0.3-10: digest: sha256:44587ec99bc610dbfc1019da6b486c110eea8275f01eb40176e67187c36c0092 size: 952
  ```
4. Verify image has been promoted to [Docker Hub](https://hub.docker.com/repository/registry-1.docker.io/deanslamajr/draw-draw-ink/tags)

5. Perform k8s rollout via instructions in `deployment` repo