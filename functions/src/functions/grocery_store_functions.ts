import * as functions from "firebase-functions";
import {getUserType, UserType} from "../utils/user_utils";
import {changeVisitorCount, getVisitorCount} from "../utils/grocery_store_utils";

export const visitorIncreaseOrDecrease = functions.https.onCall(async (data, context) => {

    const userId = context?.auth?.uid;
    const grocery_storeId = data['grocery_storeId'];

    const addOrMinus = data['addOrMinus']; // 'add' or 'minus' string only
    const value = data['value'];

    //Guard against empty value
    if(!userId){
        return {
            status: 'Unable to read user id'
        };
    }
    if(!grocery_storeId){
        return {
            status: 'Unable to read grocery store id'
        };
    }
    if(!addOrMinus || addOrMinus != 'add' || addOrMinus != 'minus'){
        return {
            status: 'operator must be \'add\' or \'minus\''
        };
    }
    if(!value){
        return {
            status: 'Unable to read value'
        };
    }

    const userType = await getUserType(userId);

    switch (userType) {
        case UserType.Merchant:

            const visitorCount = await getVisitorCount(grocery_storeId);

            if(addOrMinus == 'add')await changeVisitorCount(grocery_storeId, visitorCount + value)
            else await changeVisitorCount(grocery_storeId, visitorCount - value)

            return {
                status: 'Success'
            }
        case UserType.User:
            return {
                status: 'Not allowed to modify visitor count unless user is a merchant'
            }
    }
});

