FROM docker:24

WORKDIR /app

COPY . .

CMD ["npm", "start"]
