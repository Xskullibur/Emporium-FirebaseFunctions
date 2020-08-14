import { QueueItem } from './../models/QueueItem';
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { QueueStatus } from './utils';

export async function getQueue(storeId: string): Promise<QueueItem[]> {
    const queueCollection = admin.firestore().collection(`emporium/globals/grocery_stores/${storeId}/queue/`)
    const documents = await queueCollection.get()

    if (documents.empty) {
        throw new functions.https.HttpsError("not-found" , "Queue empty")
    }
    else {

        const queueList: QueueItem[] = []

        documents.forEach(doc => {
            const data = doc.data()

            if (data !== undefined) {
                let queue = new QueueItem(doc.id, data['userId'], data['date'].toDate(), data['status'])
                queueList.push(queue)    
            }
        })

        queueList.sort((x, y) => y.date.getTime() - x.date.getTime())
        return queueList
    }
}

export async function getCurrentlyServing(storeId: string): Promise<String> {
    const storeRef = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}`)
    let document = await storeRef.get()

    if (document.exists) {
        let data = document.data()
        if (data !== undefined){

            if (data["currently_serving"] !== undefined) {
                return data["currently_serving"]
            }
            else {
                return "-"
            }

        }
        else {
            throw new functions.https.HttpsError("not-found" , "Could not find document data")
        }
    }
    else {
        throw new functions.https.HttpsError("not-found" , "Could not find store document")
    }

}

export async function addQueue(storeId: String, userId: String): Promise<string> {
    const storeRef = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}`)
    const queueCollection = storeRef.collection('queue')

    // Generate QueueId
    const newQueue = queueCollection.doc()

    // Add Queue Ref to User
    const userRef = admin.firestore().doc(`users/${userId}/`)
    await userRef.set({
        'queue': newQueue
    }, { merge: true }).catch((error) => {
        throw new functions.https.HttpsError("aborted" , `Error while adding queue reference ${error}`)
    })

    // Add Queue
    const queueId = await newQueue.set({
        'userId': userId,
        'date': new Date(),
        'status': QueueStatus.InQueue
    }, { merge: true }).then(() => {
        return newQueue.id
    }).catch((error) => {
        throw new functions.https.HttpsError("aborted" , `Error while updating queue. ${error}`)
    })

    return queueId
}

export async function updateQueue(storeId: string, queueId: string, status: QueueStatus) {
    
    const queue = admin.firestore().doc(`emporium/globals/grocery_stores/${storeId}/queue/${queueId}`)
    return await queue.set({
        "status": status
    }, {
        merge: true
    }).catch((error) => {
        console.error(`Error Updating Queue ${error}`)
    })

}