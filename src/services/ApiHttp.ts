
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class clsApiHttp {
  private axiosInstance: AxiosInstance;
  public baseURL: string | undefined

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
    });
  }

  public async get<T>(url: string): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url);
      return response;
    } catch (error) {
      throw new Error(`GET request failed: ${error}`);
    }
  }

  public async post<T>(url: string, data: T): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data);
      return response;
    } catch (error) {
      throw new Error(`POST request failed: ${error}`);
    }
  }

  public async put<T>(url: string, data: T): Promise<AxiosResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data);
      return response;
    } catch (error) {
      throw new Error(`PUT request failed: ${error}`);
    }
  }
}

/*
// Ejemplo de uso:
const client = new HttpClient('https://api.example.com');

client.get('/endpoint')
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

client.post('/endpoint', { key: 'value' })
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

client.put('/endpoint', { key: 'updatedValue' })
  .then(response => console.log(response.data))
  .catch(error => console.error(error));
```*/
 