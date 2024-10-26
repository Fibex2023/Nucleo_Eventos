import { handleHttp } from "../utils/response.handle.js";
import { BaseService, TestApi } from "../services/file.service.js";

const getFiles = async (req:any, res:any) => {
    try {
        console.log("GET files 6");
        const response =  BaseService();
        handleHttp(res, 'SUCCESS','TODO OK')
    } catch (error) {
        handleHttp(res, 'SERVER_ERROR', 'ERROR_GET_QUESTIONS');
    }
}

const ListFilesC = async (req:any, res:any) => {
    try {
        console.log("GET files 16");
        const response = await TestApi('test');
        handleHttp(res, 'SUCCESS',response)
    } catch (error) {
        handleHttp(res, 'SERVER_ERROR', 'ERROR_GET_QUESTIONS');
    }
}



export { getFiles, ListFilesC };