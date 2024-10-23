import { handleHttp } from "../utils/response.handle.js";

const checkSession = (req, res, next) => {
    try {
        const jwtRequest = req.headers.authorization || '';
        const jwt = jwtRequest?.split(' ').pop();
        const verifiedToken = jwt == 'estoesuntokenbearer';
        verifiedToken ? next() : handleHttp(res, 'FORBIDDEN', 'INVALID_SESSION');
    } catch (error) {
        handleHttp(res, 'FORBIDDEN', 'INVALID_SESSION');
    }
}

export { checkSession };