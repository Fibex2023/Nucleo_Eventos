
const logMiddleware = (req:any, res:any, next:any) => {
    console.log(`${req.method} ${req.path}`);
    next();
}

export { logMiddleware };