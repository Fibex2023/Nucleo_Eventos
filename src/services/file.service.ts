import fetch from "node-fetch";

export const BaseService = () => {
  try {
    

  } catch (error) {
   
  }
}

/*
* Example
* { files:[ 'test1.csv', 'test2.csv']}
*/
//Fetch
export const TestApi = (file:any) => {
  return new Promise((resolve) => {
    if (file && 'files' in file && file.files.length > 0) {
      try {
        fetchData(file).then((Data) => {
          resolve(Data);
        });
      } catch (error:any) {
        console.error(error);
        throw new Error(error);
      }

    } else {
      resolve('Debe proporcionar datos para proporcionar tu solicitud');
    }

  })
}

//Busco los datos y espero a que termine con todos los archivos
const fetchData = async (files:any) => {
  try {
    let Data:any = [];
    const promises = files.files.map(async (csv:any) => {
      const resp = await fetch('http://xxxxxx' + csv, {
        headers: { Authorization: 'Bearer xxxx' }
      });

      if (resp.ok) {
        const json = await resp.text();
        return json
      }
    });

    // Esperar a que todas las promesas se resuelvan
    await Promise.all(promises);
    return Data
  } catch (error:any) {
    throw new Error(error);
  }
};