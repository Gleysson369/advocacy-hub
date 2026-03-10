import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Sistema de Advocacia API',
    version: '1.0.0',
    description: 'API documentation for the Sistema de Advocacia application',
  },
  servers: [
    {
      url: 'http://localhost:3333/api', // Adjust if your API runs on a different port or path
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/**/*.ts'], // Path to the API docs, assuming they are in JSDoc format in your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;