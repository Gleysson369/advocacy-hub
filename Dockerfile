FROM node:20

WORKDIR /app
COPY . .

# Instala e builda o Front
WORKDIR /app/frontEnd
RUN npm install
RUN npm run build

# Instala o Back
WORKDIR /app/backEnd
RUN npm install

EXPOSE 3000

# O seu BackEnd precisa estar configurado para "servir" a pasta do Front
CMD ["npm", "start"]
