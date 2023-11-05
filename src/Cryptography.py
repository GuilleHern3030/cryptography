from random import randint, choice

# Constantes
CC_START = 30
CC_NL = 31
CC_NULL = 30
MAX_CHARACTERS = 24
RECOMENDED_MAX_LENGTH = 300000

def __getC__(p:str) -> list:
    if len(p) > MAX_CHARACTERS:
        p = p[0:(MAX_CHARACTERS+1)]
    c = []
    p = str(p)
    for i in range(MAX_CHARACTERS):
        if i < len(p):
            c.append(int(str(oct(int(ord(str(p[i])))))[2:]))
        else:
            try:
                c.append(int(str(oct(int(c[i-len(p)])))[2:]))
            except:
                c.append(int(str(oct(int(len(p))))[2:]))
    return c

def __getD__(c: list, length:int) -> list:
    d = []
    for x in range(MAX_CHARACTERS):
        d.append(int(0))
    tmp = 0
    l = int(length)
    if length == 0:
        l = MAX_CHARACTERS
    for x in range(MAX_CHARACTERS):
        tmp = int(x)
        try:
            if x == 0: tmp = (l-1)
            elif x == 1: tmp = (l+1)
            elif x == 2: tmp = ((l+13)//l)
            elif x == 3: tmp = (c[5]//(l*l+(l//2)))
            elif x == 4: tmp = d[2]+d[3]
            elif x == 5: tmp = d[6]-d[1]
            elif x == 6: tmp = c[23]//d[0]
            elif x == 7: tmp = c[21]-c[12]
            elif x == 8: tmp = c[10]*l//c[2]
            elif x == 9: tmp = l-c[17]+d[10]
            elif x == 10: tmp = d[4]*l
            elif x == 11: tmp = l+5+d[7]
            elif x == 12: tmp = c[2]-c[6]+d[4]
            elif x == 13: tmp = d[8]-c[7]
            elif x == 14: tmp = c[15]-c[16]
            elif x == 15: tmp = d[5]-d[16]
            elif x == 16: tmp = c[20]//l
            elif x == 17: tmp = d[18]//d[16]
            elif x == 18: tmp = d[13]*d[19]//d[16]
            elif x == 19: tmp = d[17]+l+(d[19]*d[0])
            elif x == 20: tmp = c[7]//l
            elif x == 21: tmp = c[15]//d[22]
            elif x == 22: tmp = c[11]+l-d[14]//c[6]
            elif x == 23: tmp = d[1]//c[3]+l
            else: tmp += (d[(x-8)]*c[x-4] // length)
        except: tmp = length
        if tmp == 0: 
            tmp = int(str(oct(int(length+x)))[2:]) 
        if tmp < 0: tmp *= -1
        d[x] = tmp
    return d

def __getSO__(c: list, length:int) -> int:
    so = 1
    for i in range(length):
        so += (int(str(oct(int(c[i])))[2:]) * (i+11))
    return so

def __getMaxCharId__(text: str) -> int:
    maxChar = 0
    try:
        text = str(text)
        if len(text) > 0:
            for l in text:
                if ord(l) > maxChar:
                    maxChar = ord(l)
            maxChar += 2 + randint(0, MAX_CHARACTERS)
    except:
        maxChar = 255
    return maxChar

def __parseCharToCryptoChar__(charr: str) -> int:
    crch = 63 # ?
    if charr == "":
        crch = CC_NULL
    elif charr == "\n":
        crch = CC_NL
    elif len(charr) == 1:
        try:
            crch = ord(charr)
        except:
            None
    return crch

def __parseCryptoCharToString__(l: int) -> str:
    charr = None
    if l == CC_NL:
        charr = "\n"
    elif l == CC_NULL:
        charr = ""
    else:
        charr = chr(l)
    return charr

def __dictionary__(ccLimit:int, randomCase:bool=True) -> str:
    dictionary = []
    for cc in range(ccLimit+1):
        l = ""
        fix = choice([65, 97]) if randomCase else 65
        if ccLimit < 676: l = chr(cc // 26 + fix) + chr(cc % 26 + fix)
        else: l = chr(cc // (26 * 26) + fix) + chr((cc // 26) % 26 + fix) + chr(cc % 26 + fix)
        dictionary.append(l)
    return dictionary

def __encrypt__(encrypted: list) -> str:
    ccLimit = encrypted.pop(0)
    dictionary = __dictionary__(ccLimit)
    encryptedText = str(ccLimit) + "_"
    for char in encrypted: encryptedText = encryptedText + dictionary[char]
    return encryptedText

def __decrypt__(encrypted: str) -> list:
    ccLimit = int(encrypted[0:encrypted.index("_")])
    dictionary = __dictionary__(ccLimit, False)
    lettersGroup = len(dictionary[0])
    encryptedList = [ccLimit]
    for l in range(encrypted.index("_")+1, len(encrypted), lettersGroup):
        letter = encrypted[l:l+lettersGroup]
        i = dictionary.index(letter.upper())
        encryptedList.append(i)
    return encryptedList

class Cryptography:

    def __init__(self, seed: str = "1234", frequencyMin:int = 3, frequencyMax:int = 12):
        if isinstance(seed, str):
            if len(seed) <= 1: seed = seed + "  "
            self.frequencyRangeNullMin = 3
            self.frequencyRangeNullMax = 12
            self.__c__ = __getC__(str(seed))
            self.__d__ = __getD__(self.__c__, len(seed))
            self.__so__ = __getSO__(self.__c__, len(seed))
            if(frequencyMax < 0): frequencyMax *= -1
            if(frequencyMin < 0): frequencyMax *= -1
            if(frequencyMax >= frequencyMin):
                self.frequencyRangeNullMax = frequencyMax
                self.frequencyRangeNullMin = frequencyMin
            else:
                self.frequencyRangeNullMax = frequencyMin
                self.frequencyRangeNullMin = frequencyMax
            if self.frequencyRangeNullMax == 0: self.frequencyRangeNullMax = 1

    def __encryptChar__(self, character:str, iteration:int, ccLimit:int, falseEncrypt:bool) -> int:
        crypto = -1
        c = self.__c__
        d = self.__d__
        so = self.__so__
        if len(character) == 1:
            i = iteration
            x = int(iteration%len(c))
            y = int(iteration//len(c))%len(c)
            z = int((iteration//len(c))//len(c))
            soi = ((so+iteration)*(z+ccLimit))*int(c[x])//int(d[y])
            if soi < 0:
                soi *= -1
            tmp = 0
            cryptoChar = __parseCharToCryptoChar__(character)
            while (not falseEncrypt and tmp != cryptoChar) or (falseEncrypt and tmp != CC_NULL):
                crypto += 1
                integer = ((soi)*c[y]//d[x] + crypto) % ccLimit
                if integer < CC_START: integer = (integer*(ccLimit-CC_START)//CC_START)+CC_START
                tmp = int(integer)
                if crypto > ccLimit: 
                    print("[ERROR ec]", character, str(ccLimit), str(falseEncrypt))
                    break
        return crypto

    def __decryptChar__(self, cryptoChar:int, iteration:int, ccLimit:int) -> int:
        c = self.__c__
        d = self.__d__
        so = self.__so__
        x = int(iteration%len(c))
        y = int(iteration//len(c))%len(c)
        z = int((iteration//len(c))//len(c))
        soi = ((so+iteration)*(z+ccLimit))*int(c[x])//int(d[y])
        if soi < 0:
            soi *= -1
        integer = ((soi)*c[y]//d[x] + cryptoChar) % ccLimit
        if integer < CC_START: integer = (integer*(ccLimit-CC_START)//CC_START)+CC_START
        return int(integer)
    
    def __decryptCharAndParse__(self, cryptoChar:int, iteration:int, ccLimit:int) -> str:
        _cryptoChar = self.__decryptChar__(cryptoChar, iteration, ccLimit)
        return __parseCryptoCharToString__(_cryptoChar)

    def decrypt(self, encryptedText:str) -> str:
        encryptText = __decrypt__(encryptedText)
        textDecrypted = ""
        if isinstance(encryptText, list) and len(encryptText) > 1:
            ccLimit = encryptText[0]
            i = 1
            while i < len(encryptText):
                textDecrypted += self.__decryptCharAndParse__(int(encryptText[i]), i, ccLimit)
                i += 1
        return textDecrypted

    def encrypt(self, text:str) -> list:
        text = str(text)
        if len(text) == 0: text = " "
        textEncrypted = []
        ecfmax = self.frequencyRangeNullMax
        ecfmin = self.frequencyRangeNullMin
        ccLimit = __getMaxCharId__(text)
        textEncrypted.append(ccLimit)
        r = randint(ecfmin, ecfmax) - ecfmin
        _chr = 0
        iteration = 1
        while _chr < len(text):
            if r >= ecfmax:
                textEncrypted.append(self.__encryptChar__(str(text[_chr]), iteration, ccLimit, False))
                r = randint(ecfmin, ecfmax) - ecfmin
                _chr += 1
            else:
                textEncrypted.append(self.__encryptChar__(str(text[_chr]), iteration, ccLimit, True))
                r += 1
            iteration += 1
        return __encrypt__(textEncrypted)
    
if __name__ == "__main__":
    print("Write the text to encrypt")
    text = input(" -> ")
    print("Write the password to encrypt the text")
    psw = input(" -> ")

    cr = Cryptography(psw)
    
    encrypted = cr.encrypt(text)
    print(encrypted)

    decrypted = cr.decrypt(encrypted)
    print(decrypted)