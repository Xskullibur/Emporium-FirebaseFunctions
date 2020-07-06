import * as functions from "firebase-functions";

import { QueueStatus, updateQueue } from './../utils/queue_utils';

exports.joinQueue = functions.https.onCall(async (data, context) => {

    // Get Values
    const userId = context?.auth?.uid
    const queueId: string = data.queueId
    const storeId: string = data.storeId
    
    //Guard against empty value
    if(!userId){
        throw new functions.https.HttpsError("not-found" , "Could not find UserID")
    }
    if(!queueId){
        throw new functions.https.HttpsError("not-found" , "Could not find QueueID")
    }
    if(!storeId){
        throw new functions.https.HttpsError("not-found" , "Could not find StoreID")
    }

    // Update FireStore
    updateQueue(QueueStatus.InQueue, storeId, userId)
        .then(result => {
            return result
        })
        .catch(error => {
            throw new functions.https.HttpsError("aborted" , `Error while updating queue. ${error}`)
        })

})