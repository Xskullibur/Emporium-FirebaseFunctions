import * as admin from "firebase-admin";

export async function deletePoints(userId: string, cost: number): Promise<boolean>{
    const userRef = admin.firestore().doc(`users/${userId}`);
    const user = await userRef.get();
    const userData = user.data();

    if(user.exists){
        //Delete points
        if(userData){
            const point = userData['points'];
            const newPoint = point - cost;
            if(newPoint >= 0){
                //Enough points

                //Update the points
                await userRef.set({
                    'points': newPoint
                }, {
                    merge: true
                });

                return true;
            }else{
                //Not enough points
                return false;
            }
        }
    }
    return false;

}


export async function addPoints(userId: string, amount: number): Promise<boolean>{
    const userRef = admin.firestore().doc(`users/${userId}`);
    const user = await userRef.get();
    const userData = user.data();

    console.log(userData);
    if(user.exists){
        //Delete points
        if(userData){
            const point = userData['points'];
            const newPoint = point + amount;
            //Update the points
            await userRef.set({
                'points': newPoint
            });

            //Add to earned rewards
            const earnedRewardsRef = userRef.collection('earned_rewards');
            await earnedRewardsRef.add({
                'displayed': false,
                'earned_amount': amount,
                'earned_date': new Date()
            });

            return true;
        }
        return false;
    }
    return false;
}