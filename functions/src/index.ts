import { QueueService } from './services/QueueService';
import * as admin from 'firebase-admin';

import * as serviceAccountJson from "./emporium-e8b60-firebase-adminsdk-57ks4-8f074cc632.json";
import { Global } from './functions/global';

declare var global: Global
global.queueService = new QueueService()

const serviceAccount = serviceAccountJson as admin.ServiceAccount;

if(serviceAccount){
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://emporium-e8b60.firebaseio.com"
    });
}


//Firebase functions
export * from './functions/grocery_store_functions';
export * from './functions/voucher_functions';
export * from './functions/queue_functions'