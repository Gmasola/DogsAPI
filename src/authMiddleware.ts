// src/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware per autenticare le richieste utilizzando token JWT
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Leggi il token JWT dall'intestazione 'Authorization'
  const token = req.headers['authorization']?.split(' ')[1];

  if (token) {
    // Verifica il token utilizzando la chiave segreta
    jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, decoded) => {
      if (err) {
        // Se il token non è valido, restituisci un errore di autenticazione
        return res.status(401).json({ message: 'Token non valido' });
      } else {
        // Se il token è valido, aggiungi i dettagli dell'utente alla richiesta e procedi alla route successiva
        req.body.user = decoded;
        next();
      }
    });
  } else {
    // Se il token non è fornito, restituisci un errore di autenticazione
    res.status(401).json({ message: 'Token non fornito' });
  }
};
