import fs from 'fs'
import path from 'path';
import { getLeaderboard } from '~~/utils/leader-board/leaderboard';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
    request: NextApiRequest,
    response: NextApiResponse,
) {
    
    

     const filePath = path.join(process.cwd().replace('\scripts',''), 'data', 'tournaments.json');

    // Leer el contenido del archivo JSON
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Convertir el contenido a un objeto JSON
    const tournaments = JSON.parse(fileContent);
    tournaments.filter((tournament: { end_date: string, finished: boolean, id: string, registrations: any[] }) => new Date(tournament.end_date) < new Date(Date.now()) && tournament.finished === false).forEach((tournament: { id: string, registrations: any[], finished: boolean }, i: number) => {
        
        getLeaderboard(BigInt(tournament.id), tournament.registrations);
        tournaments[i].finished = true;

    });
    
    // Convertir el objeto a una cadena JSON
    const jsonData = JSON.stringify(tournaments, null, 2); 

    // Escribir en el archivo
    //fs.writeFileSync(filePath, jsonData);
    response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
    });
}