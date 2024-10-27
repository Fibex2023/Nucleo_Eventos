import * as fs from 'fs';

export class JSONBuffer {
  private filePath: string;
  public buffer: any[];

  constructor(filePath: string) {
    this.filePath = filePath;
    // Crea el archivo si no existe
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
    this.buffer = this.readBuffer();
  }

  // Método para agregar información al buffer
  addData(data: any): void {
    this.buffer.push(data);
    this.writeBuffer(this.buffer);
  }

  // Método para entregar y borrar información del buffer
  retrieveData(): any[] {
    const data = [...this.buffer];
    this.clearBuffer();
    return data;
  }

  // Método para borrar un solo registro del buffer
  deleteData(criteria: (item: any) => boolean): void {
    this.buffer = this.buffer.filter(item => !criteria(item));
    this.writeBuffer(this.buffer);
  }

  // Método para leer el contenido del buffer
  private readBuffer(): any[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data);
  }

  // Método para escribir el buffer en el archivo
  private writeBuffer(buffer: any[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(buffer, null, 2));
  }

  // Método para borrar el contenido del buffer
  private clearBuffer(): void {
    this.buffer = [];
    this.writeBuffer(this.buffer);
  }

  // Método para buscar un elemento por id
  public async findDataById(id: any): Promise<any | null> {
    const item = await this.buffer.find((element: any) => element.id === id.cedula);
    return item || null;
  }

  // Método para mostrar todo el buffer
  public getAllData(): any[] {
    return this.buffer;
  }
}

// Ejemplo de uso
const buffer = new JSONBuffer('buffer.json');

// Agregar datos al buffer
buffer.addData({ id: 1, message: 'Hola mundo' });
buffer.addData({ id: 2, message: 'Otro mensaje' });

// Mostrar todo el buffer
const allData = buffer.getAllData();
console.log(allData); // [{ id: 1, message: 'Hola mundo' }, { id: 2, message: 'Otro mensaje' }]
