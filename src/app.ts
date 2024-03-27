//src/app.ts
import express from 'express';
import { json } from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';
import { connectDB } from './db';
import dogRoutes from './routes';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(dogRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error starting server:', error);
  });
