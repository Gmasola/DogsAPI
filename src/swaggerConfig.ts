import swaggerJSDoc from 'swagger-jsdoc';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
const port = process.env.PORT;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Canile Virtuale API',
      version: '1.0.0',
      description: 'API per gestire l\'adozione e la custodia dei cani',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Server locale',
      },
    ],
    components: {
      schemas: {
        Dog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            breed: { type: 'string' },
            age: { type: 'number' },
            status: { type: 'string' }
          },
          required: ['name', 'breed', 'age']
        }
      },
      securitySchemes: { // Aggiungi questa sezione per definire lo schema di sicurezza
        bearerAuth: { // Nome dello schema di sicurezza
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT', // Specifica il formato del token, se necessario
        },
      },
    },
    security: [{ bearerAuth: [] }] // Specifica che l'autenticazione JWT è richiesta globalmente
  },
  apis: ['./routes.js'], // Specifica il percorso dei file contenenti le annotazioni Swagger
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
