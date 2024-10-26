import { Router } from "express";
const router = Router();
import { logMiddleware } from "../middleware/log.js";
import { checkSession } from "../middleware/session.js";

/**
 * [GET /files]
 */

// router.get('/files/data',logMiddleware,checkSession,getFiles)

router.get('/files/data/:namefile',logMiddleware,checkSession)

// router.get('/files/list',logMiddleware,checkSession,ListFilesC)


export { router };