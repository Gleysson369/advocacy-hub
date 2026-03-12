FROM docker:24

WORKDIR /app

COPY . .

RUN docker compose up --build