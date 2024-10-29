import dotenv from 'dotenv';


export interface Config {
    port: number;
    whitelist: string[];
    appname: string;
  }

export class GetEnv { 
         
    Init():Config[]  {
            dotenv.config();
            const ports = process.env.PORTS?.split(',') || [];
            const appnames = process.env.APP_NAMES?.split(',') || [];
            let PortInit: Config[] = [];
            ports.forEach((port, index) => {
                const whitelistEnv = process.env[`WHITELIST_${port}`];
                const whitelist = whitelistEnv ? whitelistEnv.split(',') : [];
                PortInit.push({
                    port: parseInt(port),
                    whitelist,
                    appname: appnames[index],
                });
            });
            return PortInit
    }
}