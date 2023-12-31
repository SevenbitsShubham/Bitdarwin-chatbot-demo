import Api from './Api';


export function formatDateToDdMmYy() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0'); // Get day and pad with leading zero if needed
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Get month (0-11) and add 1, then pad with leading zero if needed
    const year = String(today.getFullYear()).slice(-2); // Get the last two digits of the year
  
    return `${day}-${month}-${year}`;
  }

export const handleUserRegistration = async(walletAddress) =>{
    try{
        await Api.post('/user/checkRegistration',{walletAddress})
    }
    catch(error){
        console.log(error)
        alert(error.message)
    }
}

export const generateRandomString = async() =>{
    var arr = new Uint8Array(30 / 2)
    window.crypto.getRandomValues(arr)
    return Array.from(arr, dec2hex).join('')
}

function dec2hex (dec) {
    return dec.toString(16).padStart(2, "0")
  }