class QueueService {

    queue: QueueItem[] = []

    constructor() {
        
    }

    getQueue() {
        return this.queue
    }

    joinQueue(item: QueueItem) {
        this.queue.push(item)
    }
 
}