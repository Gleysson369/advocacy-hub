import swaggerJSDoc from 'swagger-jsdoc'

export const swaggerOptions = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Advocacia API',
      version: '1.0.0',
      description: 'API documentation for the Sistema de Advocacia',
    },
    servers: [
      {
        url: 'http://localhost:3333/api',
        description: 'Development server',
      },
    ],
  },

  // 🚨 ESSE CARA É O MAIS IMPORTANTE
  apis: ['./src/**/*.routes.ts'], 
})