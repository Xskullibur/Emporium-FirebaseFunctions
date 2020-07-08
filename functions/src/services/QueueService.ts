export class QueueService {

    storeDict: { [id: string]: QueueItem[]} = {}
    queue: QueueItem[] = []

    constructor() {
        
    }

    queueLength(storeId: string) {
        return this.storeDict[storeId].length
    }

    clearQueue() {
        this.storeDict = {}
    }

    getQueue(storeId: string) {
        return this.storeDict[storeId]
    }

    joinQueue(item: QueueItem) {
        this.storeDict[item.storeId].push(item)
    }
 
    popQueue(storeId: string) {
        return this.storeDict[storeId].pop()
    }

}