import * as functions from "firebase-functions";

import { addQueue, updateQueue, updateCurrentlyServing, QueueStatus, getCurrentlyServing } from './../utils/queue_utils';
import { Global } from './global';

declare var global: Global
var queueService = global.queueService

exports.queueInfo = functions.https.onCall(async (data, context) => {

    // Get Values
    const storeId: string = data["storeId"]

    // Queue Length
    let queueLength = await queueService.queueLength(storeId)

    // Currently Serving
    let currentlyServing = await getCurrentlyServing(storeId)

    return {
        "queueLength": `${queueLength}`,
        "currentlyServing": currentlyServing
    }

})

exports.popQueue = functions.https.onCall(async (data, context) => {

    // Get Values
    const queueId: string = data["queueId"]
    const storeId: string = data["storeId"]
        
    //Guard against empty value
    if(!queueId){
        throw new functions.https.HttpsError("not-found" , "Could not find QueueID")
    }
    if(!storeId){
        throw new functions.https.HttpsError("not-found" , "Could not find StoreID")
    }

    
    updateQueue(storeId, queueId, QueueStatus.InStore)
    updateCurrentlyServing(storeId, queueId)
    
    // Pop from server queue
    return await queueService.popQueue(storeId)

})


exports.joinQueue = functions.https.onCall(async (data, context) => {

    // Get Values
    const userId = context?.auth?.uid
    const storeId: string = data.storeId

    //Guard against empty value
    if(!userId){
        throw new functions.https.HttpsError("not-found" , "Could not find UserID")
    }
    if(!storeId){
        throw new functions.https.HttpsError("not-found" , "Could not find StoreID")
    }

    // Update FireStore
    let userQueueId = await addQueue(storeId, userId)

    return {
        "queueId": userQueueId,
    }

})