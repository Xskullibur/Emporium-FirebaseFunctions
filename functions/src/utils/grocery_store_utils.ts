import * as admin from "firebase-admin";


export async function getGroceryStoreRef(groceryStoreId: string): Promise<admin.firestore.DocumentReference>{
    return admin.firestore().doc(`emporium/globals/grocery_stores/${groceryStoreId}`);
}

export async function changeVisitorCount(grocery_storeId: string, value: number): Promise<boolean>{
    //Change the visitor count
    const groceryRef = await getGroceryStoreRef(grocery_storeId);
    await groceryRef.set({
        current_visitor_count: value
    }, { merge: true });
    return true;
}

export async function getVisitorCount(grocery_storeId: string): Promise<number>{
    const groceryRef = await getGroceryStoreRef(grocery_storeId);

    const groceryData = (await groceryRef.get()).data();

    if(groceryData) {
        let visitorCount = 0;
        if (groceryData['current_visitor_count']){visitorCount = groceryData['current_visitor_count']}
        return visitorCount;
    }else{
        return 0;
    }
}

export async function getMaxVisitorCapacity(grocery_storeId: string): Promise<number>{
    const groceryRef = await getGroceryStoreRef(grocery_storeId);

    const groceryData = (await groceryRef.get()).data();

    if(groceryData) {
        let visitorCount = 0;
        if (groceryData['max_visitor_capacity']){visitorCount = groceryData['max_visitor_capacity']}
        return visitorCount;
    }else{
        return 0;
    }
}
