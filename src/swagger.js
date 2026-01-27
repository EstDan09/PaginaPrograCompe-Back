const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Página de Programación Competitiva API',
    version: '1.0.0',
    description: 'Backend API for competitive programming platform',
    contact: {
      name: 'Development Team',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication. Include in Authorization header as: Bearer <token>',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Groups',
      description: 'Study group management',
    },
    {
      name: 'Challenges',
      description: 'Challenge and problem endpoints',
    },
    {
      name: 'Exercises',
      description: 'Exercise management',
    },
    {
      name: 'Following',
      description: 'Student following relationships',
    },
    {
      name: 'Direct Messages',
      description: 'Direct messaging between users',
    },
    {
      name: 'Statistics',
      description: 'User statistics and analytics',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, './routes/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
