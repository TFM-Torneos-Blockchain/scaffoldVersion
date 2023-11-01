import fs from 'fs';
import path from 'path';

export default function handler(req: any, res: any) {
  const filePath = path.join(process.cwd(), 'data', 'tournaments.json');
  console.log('Ruta del archivo:', filePath);
  const data: {id: number, name: string, amount: any, numParticipants: any} = req.body;


  try {
    const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let elements : any = [];
    if(fileContent){
        elements = fileContent;
    }
    const elementIndex = elements.findIndex((element: any) => element.id === data.id);

    if (elementIndex !== -1) {
      // Si el id ya está registrado, añadir al array registrations
     if( !elements[elementIndex].registrations.filter((element: any) => element.name === data.name) ){
         elements[elementIndex].registrations.push({ name: data.name, amount: data.amount, date: data.date });
     }
    } else {
      // Si el id no está registrado, añadir un nuevo objeto con el id y el primer registro
      elements.push({ id: data.id, registrations: [{ name: data.name, amount: data.amount, date: data.date }] });
    }

    console.log('Elementos actualizados:', elements);

    // Convertir el objeto a una cadena JSON
    const jsonData = JSON.stringify(elements, null, 2);

    // Escribir en el archivo
    fs.writeFileSync(filePath, jsonData);

    console.log('Archivo JSON escrito correctamente.');

    // Leer el archivo para verificar que los datos se han escrito correctamente
    const fileContentAfter = fs.readFileSync(filePath, 'utf-8');
    console.log('Contenido del archivo:', fileContentAfter);

    res.status(200).json({ message: 'Archivo JSON escrito correctamente.' });
  } catch (error) {
    console.error('Error al escribir en el archivo JSON:', error);
    res.status(500).json({ message: 'Error al escribir en el archivo JSON.' });
  }
}
