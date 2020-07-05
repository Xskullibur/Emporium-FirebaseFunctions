class QueueService {

    storeDict: { [id: string]: QueueItem[]} = {}
    queue: QueueItem[] = []

    constructor() {
        
    }

    getQueue() {
        return this.queue
    }

    joinQueue(item: QueueItem) {
        this.storeDict[item.storeId].push(item)
    }
 
}