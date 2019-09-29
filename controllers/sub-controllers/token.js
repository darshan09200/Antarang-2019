const crypto = require('crypto');

var message = "Fooled you :)";

var ciphers = [
    'aes-256-cbc',
    'aes-256-cfb',
    'aes-256-ctr',  
    'aes-256-ofb'
];

var hashes = ['md4', 'md5'];

var encrpyt = function (){
    
    var iv = crypto.randomBytes(16);
            
    var time = (new Date().getTime()); 

    var randomValue = {
        hash : time%2,
        cipher : time%4,
    }

    var hash = hashes[randomValue.hash];

    var key = crypto
        .createHash(hash)
        .update(message)
        .digest('hex');
        
    var currentCipher = ciphers[randomValue.cipher];
    var cipher = crypto.createCipheriv(currentCipher, key, iv);
    var token_enc = cipher.update(message, 'utf-8', 'hex');
    token_enc += cipher.final('hex');

    return {
        token : token_enc,
        key : key,
        iv : iv,
        cipher : time
    };
}

var decrpyt = function(token_enc, key, iv, cipher){

    var currentCipher = ciphers[cipher%4];
    var decipher = crypto.createDecipheriv(currentCipher, key, iv);
    var token_dec = decipher.update(token_enc, 'hex', 'utf-8');
    token_dec += decipher.final('utf-8');
    return token_dec;

}

var verification = function(cookie){
    if(!(JSON.stringify(cookie) === '{}')){
      
        if(( "init" in cookie ) && ( "uid" in cookie ) && ( "lock" in cookie ) && ( "index" in cookie ) && ( "fid" in cookie )){

            if( !( ( cookie.init == "" ) || ( cookie.uid == "" ) || ( cookie.lock == "" ) || ( cookie.index == "" )  || ( cookie.fid == "" ) ) ){
                var iv = Buffer.from(JSON.parse(cookie.init).data);
                token_dec = (decrpyt(cookie.uid, cookie.lock, iv, cookie.index))

                if(token_dec === message){
                    return true;
                }else{
                    return false;
                }                
            }else{
                return false;
            }
        }else{
            return false;
        }
    }else{
        return false;
    }
}

module.exports = { 
    encrypt : encrpyt, 
    decrpyt : decrpyt,
    message : message,
    verification: verification
};