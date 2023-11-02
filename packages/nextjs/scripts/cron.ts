
import { getLeaderboard } from '../utils/leader-board/leaderboard';
import {} from 'dotenv/config' 

async function cron(){
  const tournaments = await endTournament()
}
cron();
  // Convertir el contenido a un objeto JSON

    // Escribir en el archivo
    //fs.writeFileSync(filePath, jsonData); 
async function endTournament() {
    try {
      const response = await fetch('http://localhost:3000/api/cron', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log('Error al escribir en el archivo JSON.', error);
    }
}

async function getTournaments() {
  try {
    const response = await fetch('http://localhost:3000/api/get_tournaments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error al escribir en el archivo JSON.', error);
  }
}
