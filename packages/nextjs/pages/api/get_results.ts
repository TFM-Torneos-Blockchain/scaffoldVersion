import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Obtener la ruta del archivo JSON
    const filePath = path.join(process.cwd(), 'data', 'results.json');

    // Leer el contenido del archivo JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Convertir el contenido a un objeto JSON
    const tournaments = JSON.parse(fileContent);
    // Enviar la respuesta con los datos obtenidos del archivo JSON
    res.status(200).json(tournaments);
  } catch (error) {
    console.error('Error al leer el archivo JSON:', error);
    res.status(500).json({ message: 'Error al leer el archivo JSON.' + error });
  }
}
