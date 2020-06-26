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
        if (userData && userData['type'] == 'merchant'){
            return UserType.Merchant;
        }else{
            return UserType.User;
        }
    }
    return UserType.User;
}
