import bcrypt from 'bcryptjs';

export const hash=(plainText,saltRound=parseInt(process.env.SALT_ROUND))=>{
    
    let hashValue =  bcrypt.hashSync(plainText,saltRound);
    return hashValue;
}

export const compare =(password,hashPassword)=>{
    const match = bcrypt.compareSync(password,hashPassword);
    return match;
}