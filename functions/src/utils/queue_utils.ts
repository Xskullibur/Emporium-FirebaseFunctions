import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export enum QueueStatus {
    InQueue = "In Queue",
    InStore = "In Store",
    Completed = "Completed"
}

export async function getCurrentlyServing(storeId: string): Promise<String> {
    const storeRef = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}`)
    let document = await storeRef.get()

    if (document.exists) {
        let data = document.data()
        if (data !== undefined){
            return data["currently_serving"]
        }
        else {
            return "-"
        }
    }
    else {
        throw new functions.https.HttpsError("not-found" , "Could not find store document")
    }

}

export async function updateCurrentlyServing(storeId: string, queueId: string): Promise<Boolean> {
    
    const storeRef = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}`)
    return storeRef.set({
        'currently_serving': queueId
    }, {merge: true})
    .then(() => {
        return true
    })
    .catch((error) => {
        return false
    })

}

export async function addQueue(storeId: String, userId: String): Promise<string> {
    const storeRef = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}`)
    const queueCollection = storeRef.collection('queue')

    let newQueue = queueCollection.doc()
    let queueId = await newQueue.set({
        'status': QueueStatus.InStore,
        'userId': userId
    }).then(() => {
        return newQueue.id
    }).catch((error) => {
        throw new functions.https.HttpsError("aborted" , `Error while updating queue. ${error}`)
    })

    return queueId
}

export async function updateQueue(storeId: string, queueId: string, status: QueueStatus): Promise<Boolean> {
    
    const queue = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}/queue/${queueId}`)
    return await queue.update({
        "status": status
    }).then(() => {
        return true
    }).catch((error) => {
        return false
    })

}