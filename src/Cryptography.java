/**
 * @author enel
 */
public class CryptographyClass {

    // Const
    public final static int MAX_CHARACTERS = 24;
    public final static int RECOMENDED_MAX_LENGTH = 300000;
    private final int doubleLetterLimit = 676;
    private final long[] c;
    private final long[] d;
    private final long so;
    
    // Var
    private int frequencyRangeNullMin = 3;
    private int frequencyRangeNullMax = 12;
    
    /**
     * @param seed user password to encode text
     */
    public CryptographyClass(String seed) {
        c = initializeC(seed);
        d = initializeD(c, seed.length());
        so = initializeSO(c, seed.length());
    }
    
    /**
     * @param seed user password to encode text
     * @param frequencyMin min frequency of empty crypto chars
     * @param frequencyMax max frequency of empty crypto chars
     */
    public CryptographyClass(String seed, int frequencyMin, int frequencyMax) {
        c = initializeC(seed);
        d = initializeD(c, seed.length());
        so = initializeSO(c, seed.length());
        
        if(frequencyMax < 0) frequencyMax *= -1;
        if(frequencyMin < 0) frequencyMax *= -1;
        if(frequencyMax >= frequencyMin) {
            frequencyRangeNullMax = frequencyMax;
            frequencyRangeNullMin = frequencyMin;
        } else {
            frequencyRangeNullMax = frequencyMin;
            frequencyRangeNullMin = frequencyMax;
        }
        if(frequencyRangeNullMax == 0) 
            frequencyRangeNullMax = 1;
    }

    // <editor-fold defaultstate="collapsed" desc="Initialize atributes">
    private final static int CC_START = 30;
    private final static int CC_NULL = 30;
    private final static int CC_NL = 31;

    /**
     * @param p user password to encode text
     * @return vector with MAX_CHARACTERS int elements
     */
    private long[] initializeC(String p) {
        if(p.length() > MAX_CHARACTERS) p = p.substring(0,MAX_CHARACTERS+1);
        long[] c = new long[MAX_CHARACTERS];
        for(int i = 0; i < c.length; i++) c[i] = 0;
        for(int i = 0; i < MAX_CHARACTERS; i++) {
            long tmp;
            if(i < p.length()) {
                tmp = octal(p.substring(i,(i+1)).charAt(0));
            } else try {
                tmp = octal(c[i-p.length()]);
            } catch(Exception e) {
                tmp = octal(p.length());
            }
            c[i] = (long)tmp;
        }
        return c;
    }

    /**
     * @param c user password to encode text
     * @param pLength user password length
     * @return vector with MAX_CHARACTERS int elements
     */
    private long[] initializeD(long[] c, int pLength) {
        long[] d = new long[MAX_CHARACTERS];
        for(int i = 0; i < d.length; i++) d[i] = 0;
        long tmp = 0;
        int l = pLength; if(pLength == 0) l = MAX_CHARACTERS;
        if(c.length == d.length) for(int x = 0; x < MAX_CHARACTERS; x++) {
            tmp = x;
            try {
                switch(x) {
                    case 0: { tmp = (l-1); break; }
                    case 1: { tmp = (l+1); break; }
                    case 2: { tmp = ((l+13)/l); break; }
                    case 3: { tmp = (c[5]/(l*l+(l/2))); break; }
                    case 4: { tmp = d[2]+d[3]; break; }
                    case 5: { tmp = d[6]-d[1]; break; }
                    case 6: { tmp = c[23]/d[0]; break; }
                    case 7: { tmp = c[21]-c[12]; break; }
                    case 8: { tmp = c[10]*l/c[2]; break; }
                    case 9: { tmp = l-c[17]+d[10]; break; }
                    case 10:{ tmp = d[4]*l; break; }
                    case 11:{ tmp = l+5+d[7]; break; }
                    case 12:{ tmp = c[2]-c[6]+d[4]; break; }
                    case 13:{ tmp = d[8]-c[7]; break; }
                    case 14:{ tmp = c[15]-c[16]; break; }
                    case 15:{ tmp = d[5]-d[16]; break; }
                    case 16:{ tmp = c[20]/l; break; }
                    case 17:{ tmp = d[18]/d[16]; break; }
                    case 18:{ tmp = d[13]*d[19]/d[16]; break; }
                    case 19:{ tmp = d[17]+l+(d[19]*d[0]); break; }
                    case 20:{ tmp = c[7]/l; break; }
                    case 21:{ tmp = c[15]/d[22]; break; }
                    case 22:{ tmp = c[11]+l-d[14]/c[6]; break; }
                    case 23:{ tmp = d[1]/c[3]+l; break; }

                    default:{ tmp += d[(x-8)]*c[x-4]/pLength; break; }
                }
            } catch(Exception e) { tmp = pLength; }
            if(tmp == 0) tmp = (int)octal((pLength+x));
            if(tmp < 0) tmp*=-1;
            d[x] = tmp;
        }
        return d;
    }

    /**
     * @param c user password to encode text
     * @param pLength user password length
     * @return long octal value
     */
    private long initializeSO(long[] c, int pLength) {
        long so = 1;
        for(int i = 0; i < pLength; i++) {
            so += (octal(c[i])*(i+11));
        }
        return so;
    }
    // </editor-fold>
    
    // Encrypts a text
    public String encrypt(final String text) {
        final int ecfmax = frequencyRangeNullMax;
        final int ecfmin = frequencyRangeNullMin;
        final int ccLimit = getMaxCharInText(text);
        java.util.Random randomize = new java.util.Random(System.currentTimeMillis());
        final java.util.ArrayList<Integer> encrypted = new java.util.ArrayList<>();
        encrypted.add(ccLimit);
        int r = (randomize.nextInt(ecfmax-ecfmin) - ecfmin);
        int chr = 0;
        int iteration = 1;
        while(chr < text.length()) {
            if(r >= ecfmax) {
                int cryptoChar = encryptChar(text.substring(chr,chr+1), iteration, ccLimit, false);
                encrypted.add(cryptoChar);
                r = (randomize.nextInt(ecfmax-ecfmin) - ecfmin);
                chr++;
            } else {
                int cryptoChar = encryptChar(text.substring(chr,chr+1), iteration, ccLimit, true);
                encrypted.add(cryptoChar);
                r++;
            }
            iteration++;
        }
        for (int i = 0; i < encrypted.size(); i++) System.out.println(encrypted.get(i));
        return _encrypt(encrypted);
    }
    
    // Decrypts an encrypted text
    public String decrypt(String textEncrypted) {
        int[] encrypted = _decrypt(textEncrypted);
        if(encrypted == null || encrypted.length < 1) return "";
        final int ccLimit = encrypted[0];
        String textDecrypted = "";
        int i = 1;
        while(i < encrypted.length) {
            textDecrypted += (decryptCharAndParse(encrypted[i], i, ccLimit));
            i++;
        }
        return textDecrypted;
    }

    // <editor-fold defaultstate="collapsed" desc="Specific functions">
    private long octal(long n) {
        try {
            return Long.parseLong(Long.toOctalString(n));
        } catch(NumberFormatException e) {
            return n;
        }
    }

    private int getMaxCharInText(String text) {
        int maxChar = 0;
        try {
            if (text.length() > 0) {
                for (int i = 0; i < text.length(); i++) {
                    char l = text.charAt(i);
                    if(l > maxChar) maxChar = (int)(l);
                }
            }
        } catch(Exception ignored) { 
            maxChar = 255;
        }
        if(maxChar < CC_START) maxChar = 255;
        java.util.Random randomize = new java.util.Random(System.currentTimeMillis());
        maxChar += (randomize.nextInt(MAX_CHARACTERS)) + CC_START;
        return maxChar;
    }

    private int parseCharToCryptoChar(String charr) {
        int crch = 63;// ?
        if(charr.equals("")) crch = CC_NULL;
        else if(charr.equals("\n")) crch = CC_NL;
        else if(charr.length() == 1) {
            try {
                char ch = charr.charAt(0);
                crch = (int)ch;
            } catch(Exception e) { }
        }
        return crch;
    }

    private String parseCryptoCharToString(int l) {
        if(l == CC_NL) return "\n";
        else if(l == CC_NULL) return "";
        String tmp = ""; tmp += ((char)l);
        return tmp;
    }
    
    /**
     * @param character letra que se quiere encriptar
     * @param iteration cantidad de veces que se utilizó la función en el proceso de encriptado
     * @param ccLimit el char máximo que existe en el texto original (default = 255)
     * @param falseEncrypt encripta un caracter vacío si es true
     * @return char encriptado
     */
    private int encryptChar(final String character, final long iteration, final int ccLimit, final boolean falseEncrypt) {
        int crypto = -1;
        if(character.length() == 1) {
            int x = (int)(iteration%c.length);
            int y = (int)(iteration/c.length)%c.length;
            int z = (int)((iteration/c.length)/c.length);
            long soi = ((so+iteration)*(z+ccLimit))*(int)c[x]/(int)d[y];
            if(soi < 0) soi *= -1;
            int tmp = 0;
            int cryptoChar = parseCharToCryptoChar(character);
            while(!falseEncrypt && tmp != cryptoChar || falseEncrypt && tmp != CC_NULL) {
                crypto++;
                long integer = ((soi)*c[y]/d[x] + crypto) % ccLimit;
                if(integer < CC_START) integer = (integer*(ccLimit-CC_START)/CC_START)+CC_START;
                tmp = (int)integer;
            }
        }
        return crypto;
    }
    
    /**
     * @param cryptoChar numero (letra encriptada) que se quiere desencriptar
     * @param iteration cantidad de veces que se utilizó la función en el proceso de desencriptado
     * @param ccLimit el char máximo que existe en el texto original (default = 255)
     * @return char desencriptado
     */
    private int decryptChar(final int cryptoChar, final long iteration, final int ccLimit) {
        int x = (int)(iteration%c.length);
        int y = (int)(iteration/c.length)%c.length;
        int z = (int)((iteration/c.length)/c.length);
        long soi = ((so+iteration)*(z+ccLimit))*(int)c[x]/(int)d[y];
        if(soi < 0) soi *= -1;
        long integer = ((soi)*c[y]/d[x] + cryptoChar) % ccLimit;
        if(integer < CC_START) integer = (integer*(ccLimit-CC_START)/CC_START)+CC_START;
        return (int)integer;
    }
    private String decryptCharAndParse(final int cryptoChar, final long iteration, final int ccLimit) {
        int _cryptoChar = decryptChar(cryptoChar, iteration, ccLimit);
        return parseCryptoCharToString(_cryptoChar);
    }
    // </editor-fold>

    private java.util.ArrayList<String> _dictionary(int ccLimit, boolean randomCase) {
        java.util.ArrayList<String> dictionary = new java.util.ArrayList<>();
        for (int cc = 0; cc < (ccLimit+1); cc++) {
            String l = "";
            int fix = 65; // 65 o 97
            if (ccLimit < doubleLetterLimit) l = String.valueOf((char) ((cc / 26) + fix)) + String.valueOf((char) ((cc % 26) + fix));
            else l = String.valueOf((char) ((cc / (26 * 26) + fix))) + String.valueOf((char) (((cc / 26) % 26) + fix)) + String.valueOf((char) ((cc % 26) + fix));
            dictionary.add(l);
        }
        return dictionary;
    }

    private String _encrypt(java.util.ArrayList<Integer> encrypted) {
        int ccLimit = encrypted.get(0);
        final java.util.ArrayList<String> dictionary = _dictionary(ccLimit, true);
        String encryptedText = String.valueOf(ccLimit) + "_";
        for (int i = 1; i < encrypted.size(); i++)
            encryptedText += dictionary.get(encrypted.get(i));
        return encryptedText;
    }

    private int[] _decrypt(String encrypted) { 
        final int ccLimit = Integer.parseInt(encrypted.substring(0, encrypted.indexOf("_")));
        final java.util.ArrayList<String> dictionary = _dictionary(ccLimit, false);
        final int lettersGroup = dictionary.get(0).length();
        int[] encryptedList = new int[(encrypted.length() - encrypted.indexOf("_")) / lettersGroup + 1];
        encryptedList[0] = ccLimit;
        for (int l = encrypted.indexOf("_")+1, i = 1; l < encrypted.length(); l += lettersGroup, i++) {
            String letter = encrypted.substring(l,l+lettersGroup);
            int e = dictionary.indexOf(letter.toUpperCase());
            encryptedList[i] = e;
        }
        for (int i = 0; i < encryptedList.length; i++) System.out.println(encryptedList[i]);
        return encryptedList;
    }

}