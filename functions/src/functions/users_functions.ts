import * as functions from "firebase-functions";

import {createUser} from "../utils/user_utils";
import {addPoints} from "../utils/voucher_utils";


//Create the user document if it does not exist, called when the user login or register
export const createUserIfNotExist =  functions.https.onCall(async (data, context) => {
    const userId = context?.auth?.uid;

    //Guard
    if(!userId){
        return {
            status: "Unable to read user id!"
        };
    }

    //Create user
    const isNewUser = await createUser(userId);

    if(isNewUser){
        //Add free points for new users
        await addPoints(userId, 250)

        return {
            status: "User Created"
        };
    }
    return {
      status: "Success"
    };
});