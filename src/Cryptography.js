const MAX_CHARACTERS = 24;
const CC_START = 30;
const CC_NULL = 30;
const CC_NL = 31;

export default class Cryptography {

    #frequencyRangeNullMax;
    #frequencyRangeNullMin;
    #c;
    #d;
    #so;

    /**
     * @param seed user password to encode text
     */
    constructor(seed="1234", frequencyMin=3, frequencyMax=12) {
        if (seed.length <= 1) seed += "  ";
        this.#c = initializeC(seed);
        this.#d = initializeD(this.#c, seed.length);
        this.#so = initializeSO(this.#c, seed.length);
        if(frequencyMax < 0) frequencyMax *= -1;
        if(frequencyMin < 0) frequencyMax *= -1;
        if(frequencyMax >= frequencyMin) {
            this.#frequencyRangeNullMax = frequencyMax;
            this.#frequencyRangeNullMin = frequencyMin;
        } else {
            this.#frequencyRangeNullMax = frequencyMin;
            this.#frequencyRangeNullMin = frequencyMax;
        }
        if(this.#frequencyRangeNullMax == 0) this.#frequencyRangeNullMax = 1;
    }

    encrypt(text) {
        let tryies = 5;
        while (tryies > 0) try {
            let textEncrypted = undefined;
            if (typeof text == 'string') {
                if (text.length == 0) text = " ";
                const ecfmin = this.#frequencyRangeNullMin;
                const ecfmax = this.#frequencyRangeNullMax;
                const ccLimit = getMaxCharInText(text);
                textEncrypted = [ccLimit]
                let r = randomInt(ecfmin, ecfmax)
                let chr = 0;
                let iteration = 1;
                while(chr < text.length) {
                    if(r >= ecfmax) {
                        textEncrypted.push(encryptChar(text.substring(chr,chr+1), Number(iteration), Number(ccLimit), false, this.#c, this.#d, this.#so));
                        r = randomInt(ecfmin, ecfmax);
                        chr++;
                    } else {
                        textEncrypted.push(encryptChar(text.substring(chr,chr+1), Number(iteration), Number(ccLimit), true, this.#c, this.#d, this.#so));
                        r++;
                    }
                    iteration++;
                }
            }
            return _encrypt(textEncrypted);   
        } catch(e) { tryies--; }
        console.error("index out of bounds exception...")
        throw { error: "An error in 'encryptChar' has been ocurred" }
    }
    
    decrypt(textEncrypted) {
        let text = "";
        if (typeof textEncrypted == 'string' && textEncrypted.length > 0) {
            const encrypted = _decrypt(textEncrypted);
            const ccLimit = Number(encrypted[0]);
            let i = 1;
            while(i < encrypted.length) {
                text += 
                    decryptCharAndParse(Number(encrypted[i]), i, ccLimit, 
                        this.#c, this.#d, this.#so);
                i++;
            }
        }
        return text;
    }
    
}

function initializeC(p) {
    if(p.length > MAX_CHARACTERS) p = p.substring(0,MAX_CHARACTERS+1);
    let c = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // 24 zeros
    for(let i = 0; i < MAX_CHARACTERS; i++) {
        let tmp;
        if(i < p.length) {
            tmp = octal((p.substring(i,(i+1)).toString()).charCodeAt(0));
        } else try {
            tmp = octal(c[i-p.length]);
        } catch(exception) {
            tmp = octal(p.length);
        }
        c[i] = tmp;
    }
    return c;
}

function initializeD(c, pLength) {
    let d = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; // 24 zeros
    let tmp = 0;
    let l = pLength; if(pLength == 0) l = MAX_CHARACTERS;
    for(let x = 0; x < MAX_CHARACTERS; x++) {
        tmp = x;
        try {
            switch(x) {
                case 0: { tmp =  int((l-1)); break; }
                case 1: { tmp =  int((l+1)); break; }
                case 2: { tmp =  int(((l+13)/l)); break; }
                case 3: { tmp =  int((c[5]/(l*l+int(l/2)))); break; }
                case 4: { tmp =  int(d[2]+d[3]); break; }
                case 5: { tmp =  int(d[6]-d[1]); break; }
                case 6: { tmp =  int(c[23]/d[0]); break; }
                case 7: { tmp =  int(c[21]-c[12]); break; }
                case 8: { tmp =  int(c[10]*l/c[2]); break; }
                case 9: { tmp =  int(l-c[17]+d[10]); break; }
                case 10:{ tmp =  int(d[4]*l); break; }
                case 11:{ tmp =  int(l+5+d[7]); break; }
                case 12:{ tmp =  int(c[2]-c[6]+d[4]); break; }
                case 13:{ tmp =  int(d[8]-c[7]); break; }
                case 14:{ tmp =  int(c[15]-c[16]); break; }
                case 15:{ tmp =  int(d[5]-d[16]); break; }
                case 16:{ tmp =  int(c[20]/l); break; }
                case 17:{ tmp =  int(d[18]/d[16]); break; }
                case 18:{ tmp =  int(d[13]*d[19]/d[16]); break; }
                case 19:{ tmp =  int(d[17]+l+(d[19]*d[0])); break; }
                case 20:{ tmp =  int(c[7]/l); break; }
                case 21:{ tmp =  int(c[15]/d[22]); break; }
                case 22:{ tmp =  int(c[11]+l-int(d[14]/c[6])); break; }
                case 23:{ tmp =  int(d[1]/c[3])+l; break; }
                default:{ tmp += int( d[(x-8)]*c[x-4]/pLength); break; }
            }
        } catch(exception) { tmp = pLength; }
        if(isNaN(tmp) || !isFinite(tmp)) tmp = pLength;
        if(tmp == 0) tmp = octal((pLength+x));
        if(tmp < 0) tmp*=-1;
        d[x] = tmp;
    }
    return d;
}

function initializeSO(c, pLength) {
    let so = 1;
    for(let i = 0; i < pLength; i++) {
        so += (octal(c[i])*(i+11));
    }
    return so;
}

function octal(n) {
    let oct = int(n.toString(8))
    return oct;
}

function parseCryptoCharToString(l) {
    if(l == CC_NL) return "\n";
    else if(l == CC_NULL) return "";
    let tmp = ""; 
    tmp += String.fromCharCode(l);
    return tmp;
}

function decryptChar(cryptoChar, iteration, ccLimit, c, d, so) {
    const iter = Number(iteration);
    const ccLim = Number(ccLimit);
    const x = Number(int((iter%c.length)));
    const y = Number(int(int(iter/c.length)%c.length));
    const z = Number(int(int(iter/c.length)/c.length));
    const soi = Number(int(((so+iter)*(z+ccLim))*c[x]/d[y]));
    if(soi < 0) soi *= -1;
    let integer = Number(int((int((soi)*c[y]/d[x]) + Number(cryptoChar)) % ccLim));
    if(integer < CC_START) integer = int(integer*(ccLim-CC_START)/CC_START)+CC_START;
    return int(integer);
}

const randomInt = (min = 0, max = 10) => Math.floor(Math.random() * max) + min;
const int = (aNumber) => Math.floor(aNumber);

function getMaxCharInText(text) { // int
    let maxChar = 0;
    try {
        if (text.length > 0) {
            for (let i = 0; i < text.length; i++) {
                let l = Number(text.charCodeAt(i));
                if(l > maxChar) maxChar = l;
            }
        }
    } catch(exception) { maxChar = 255; }
    if(maxChar < CC_START) maxChar = 255;
    maxChar += randomInt(0, MAX_CHARACTERS) + CC_START;
    return Number(maxChar);
}

function parseCharToCryptoChar(charr) {
    let crch = 63;// ?
    if(charr === "") crch = CC_NULL;
    else if(charr === "\n") crch = CC_NL;
    else if(charr.length == 1) {
        try {
            let ch = charr.charCodeAt(0);
            crch = int(ch);
        } catch(exception) { }
    }
    return Number(crch);
}

function decryptCharAndParse(cryptoChar, iteration, ccLimit, c, d, so) {
    let _cryptoChar = decryptChar(cryptoChar, iteration, ccLimit, c, d, so);
    return parseCryptoCharToString(_cryptoChar);
}

function encryptChar(character, iteration, ccLimit, falseEncrypt, c, d, so) {
    let crypto = -1;
    if(character.length == 1) {
        const iter = Number(iteration);
        const ccLim = Number(ccLimit);
        const x = Number(int((iter%c.length)));
        const y = Number(int(int(iter/c.length)%c.length));
        const z = Number(int(int(iter/c.length)/c.length));
        const soi = Number(int(((Number(so)+iter)*(z+ccLim))*c[x]/d[y]));
        if(soi < 0) soi *= -1;
        let tmp = 0;
        let cryptoChar = parseCharToCryptoChar(character);
        while(!falseEncrypt && tmp != cryptoChar || falseEncrypt && tmp != CC_NULL) {
            crypto++;
            let integer = int((soi)*c[y]/d[x] + crypto) % ccLim;
            if(integer < CC_START) integer = int(integer*(ccLim-CC_START)/CC_START)+CC_START;
            tmp = int(integer);
            if (crypto > ccLimit) {
                console.warn("index out of bounds exception, retrying...")
                throw { error: "index out of bounds" }
            }
        }
    }
    return crypto;
}

function _dictionary(ccLimit, randomCase=true) {
    const dictionary = []
    for (let cc = 0; cc < (ccLimit+1); cc++) {
        const fix = () => randomCase === true && randomInt(1, 2) == 1 ? 97 : 65;
        let l = ""
        if (ccLimit < 676) l = String.fromCharCode(Math.floor(cc / 26) + fix()) + String.fromCharCode(cc % 26 + fix());
        else l = String.fromCharCode(Math.floor(cc / (26 * 26)) + fix()) + String.fromCharCode((Math.floor(cc / 26) % 26) + fix()) + String.fromCharCode((cc % 26) + fix());
        dictionary.push(l)
    }
    return dictionary
}

function _encrypt(encrypted) {
    const ccLimit = encrypted.shift()
    const dictionary = _dictionary(ccLimit)
    let encryptedText = ccLimit + "_"
    for (let char of encrypted) {
        //console.log(char)
        encryptedText = encryptedText + dictionary[char]
    }
    return encryptedText
}

function _decrypt(encrypted) {
    const ccLimit = Number(encrypted.substring(0, encrypted.indexOf("_")))
    const dictionary = _dictionary(ccLimit, false)
    const lettersGroup = dictionary[0].length
    const encryptedList = [ccLimit]
    for (let l = encrypted.indexOf("_")+1; l < encrypted.length; l += lettersGroup) {
        const letter = encrypted.substring(l,l+lettersGroup);
        const i = dictionary.indexOf(letter.toUpperCase())
        encryptedList.push(i)
    }
    return encryptedList
}
