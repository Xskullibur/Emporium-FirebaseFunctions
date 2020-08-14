import * as admin from "firebase-admin";

export enum UserType {
    User = 0,
    Merchant
}


export async function getUserType(userId: string): Promise<UserType>  {
    const userRef = admin.firestore().doc(`users/${userId}`);
    const user = await userRef.get();
    const userData = user.data();

    if(user.exists) {
        if (userData && userData['type'] === 'merchant'){
            return UserType.Merchant;
        }else{
            return UserType.User;
        }
    }
    return UserType.User;
}

export async function createUser(userId: string): Promise<boolean> {
    const userRef = admin.firestore().doc(`users/${userId}`);
    const user = await userRef.get();

    if(!user.exists) {
        //Create user
        await userRef.set({
            type: 'user',
            points: 0
        });
        return true;
    }
    return false;
}