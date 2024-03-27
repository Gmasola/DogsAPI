// src/routes.ts
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import Dog from './model';
import { authenticate } from './authMiddleware';
import { getCachedData, cacheData, purgeCache, purgeCacheByStatus } from './cache';
import * as dotenv from 'dotenv';

dotenv.config({path: '../.env'});

const router = Router();

/**
 * @swagger
 * /dogs:
 *   get:
 *     summary: Ottiene l'elenco dei cani disponibili
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Elenco dei cani disponibili
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Dog'
 */
router.get('/dogs', authenticate, async (req: Request, res: Response) => {
  try {
    const cachedDogs = getCachedData('dogs');
    if (cachedDogs) {
      return res.json(cachedDogs);
    } else {
      const dogs = await Dog.find({ status: 'available' });
      cacheData('dogs', dogs);
      res.json(dogs);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
/**
 * @swagger
 * /dog/new:
 *   post:
 *     summary: Aggiunge un nuovo cane con stato disponibile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Cane aggiunto con successo con stato disponibile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: Dati mancanti nel corpo della richiesta
 */
router.post('/dog/new', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, breed, age } = req.body;

    if (!name || !breed || !age) {
      return res.status(400).json({ message: "Dati mancanti" });
    }

    const newDog = new Dog({
      name,
      breed,
      age,
      status: 'available'
    });

    await newDog.save();

    purgeCache('statistics');

    const cachedDogs = getCachedData('dogs');
    if (cachedDogs) {
      cachedDogs.push(newDog);
      cacheData('dogs', cachedDogs);
    } else {
      cacheData('dogs', [newDog]);
    }

    res.json({ message: "Nuovo cane aggiunto con stato disponibile" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /dog/{id}:
 *   get:
 *     summary: Ottiene i dettagli di un singolo cane
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cane da recuperare
 *     responses:
 *       '200':
 *         description: Dettagli del cane richiesto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Dog'
 *       '404':
 *         description: Cane non trovato
 */


router.get('/dog/:id', authenticate,  async (req: Request, res: Response) => {
  try {
    const dog = await Dog.findById(req.params.id);
    res.json(dog);
  } catch (error:any) {
    res.status(500).json({ message: error.message });
  }
});



/**
 * @swagger
 * /statistics:
 *   get:
 *     summary: Ottiene le statistiche sugli stati dei cani
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Statistiche sugli stati dei cani
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   count:
 *                     type: integer
 */
router.get('/statistics', authenticate, async (req, res) => {
  try {
    const cachedStatics = getCachedData('statistics');
    if (cachedStatics) {
      return res.json(cachedStatics);
    } else {
      const result = await Dog.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);
      cacheData('statistics', result);
      res.json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel conteggio dei cani.' });
  }
});

/**
 * @swagger
 * /dog/adopt/{id}:
 *   get:
 *     summary: Adotta un cane specificato
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cane da adottare
 *     responses:
 *       '200':
 *         description: Cane adottato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 dog:
 *                   $ref: '#/components/schemas/Dog'
 *       '404':
 *         description: Cane non trovato o già adottato
 */
router.get('/dog/adopt/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const dog = await Dog.findOne({ _id: req.params.id, status: 'available' });

    if (!dog) {
      return res.status(404).json({ message: 'Cane non trovato' });
    }

    dog.status = 'adopted';
    dog.adoptionDate = new Date();
    await dog.save();

    
    purgeCache('dogs');
    purgeCache('statistics');

    res.json({ message: 'Cane adottato!!!', dog });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /dog/custody/in:
 *   post:
 *     summary: Aggiunge un nuovo cane in custodia
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: number
 *     responses:
 *       '200':
 *         description: Cane aggiunto con successo in custodia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: Dati mancanti nel corpo della richiesta
 */
router.post('/dog/custody/in', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, breed, age } = req.body;

    if (!name || !breed || !age) {
      return res.status(400).json({ message: "Dati mancanti" });
    }

    const newDog = new Dog({
      name,
      breed,
      age,
      status: 'in-custody'
    });

    await newDog.save();

    purgeCache('dogs');
    purgeCache('statistics');

    res.json({ message: "Nuovo cane in custodia " });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /dog/custody/out/{id}:
 *   delete:
 *     summary: Rimuove un cane dalla custodia
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cane da rimuovere dalla custodia
 *     responses:
 *       '200':
 *         description: Cane rimosso dalla custodia con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Cane non trovato o non in custodia
 */
router.delete('/dog/custody/out/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const dog = await Dog.findOneAndDelete({ _id: req.params.id, status: 'in-custody' });
    if (!dog) {
      return res.status(404).json({ message: 'Cane non trovato' });
    }

    purgeCacheByStatus('in-custody');
    purgeCache('statistics');

    res.json({ message: 'Cane rimosso dalla custodia con successo', dog });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Effettua l'accesso all'applicazione
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Accesso riuscito. Restituisce un token JWT per l'autenticazione.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT per l'autenticazione.
 *       '401':
 *         description: Credenziali non valide. L'accesso non è consentito.
 */
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Verifica se le credenziali corrispondono a quelle presenti nel file .env
  if (username === process.env.USER && password === process.env.PASSWORD) {
    // Se le credenziali sono valide, genera un token JWT
    const token = jwt.sign({ username }, process.env.JWT_SECRET_KEY!, { expiresIn: '1h' });
    res.json({ token });
  } else {
    // Se le credenziali non sono valide, ritorna un errore
    res.status(401).json({ message: 'Credenziali non valide' });
  }
});
export default router;
