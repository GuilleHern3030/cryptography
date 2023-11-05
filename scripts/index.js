const HIDE_CLASS = 'hidden';

window.onload = () => {

    const password = document.getElementById('password')
    const passwordWarning = document.querySelector('.psw-warning')
    const getPassword = () => password.value;
    const showPasswordWarning = () => passwordWarning.classList.toggle(HIDE_CLASS, false)
    const hidePasswordWarning = () => passwordWarning.classList.toggle(HIDE_CLASS, true)

    const textToEncrypt = document.querySelector("#text-to-encrypt")
    const textToEncryptContainer = document.querySelector(".text-to-encrypt")
    const bEmptyEncrypt = document.querySelector('#empty-encrypt')
    const getTextToEncrypt = () => textToEncrypt.value;
    const showTextToEncrypt = () => textToEncryptContainer.classList.toggle(HIDE_CLASS, false)
    const hideTextToEncrypt = () => textToEncryptContainer.classList.toggle(HIDE_CLASS, true)
    const emptyTextToEncrypt = () => textToEncrypt.value = "";
    const setTextToEncrypt = text => textToEncrypt.value = text;
    bEmptyEncrypt.addEventListener("click", emptyTextToEncrypt)

    const textToDecrypt = document.querySelector("#text-to-decrypt")
    const textToDecryptContainer = document.querySelector(".text-to-decrypt")
    const bEmptyDecrypt = document.querySelector('#empty-decrypt')
    const getTextToDecrypt = () => textToDecrypt.value;
    const showTextToDecrypt = () => textToDecryptContainer.classList.toggle(HIDE_CLASS, false)
    const hideTextToDecrypt = () => textToDecryptContainer.classList.toggle(HIDE_CLASS, true)
    const emptyTextToDecrypt = () => textToDecrypt.value = "";
    const setTextToDecrypt = text => textToDecrypt.value = text;
    bEmptyDecrypt.addEventListener("click", emptyTextToDecrypt)

    const fileInputEncrypt = document.getElementById('file-encrypt')
    const fileInputDecrypt = document.getElementById('file-decrypt')
    fileInputEncrypt.addEventListener("change", () => readText(fileInputEncrypt.files[0], text => setTextToEncrypt(text)))
    fileInputDecrypt.addEventListener("change", () => readText(fileInputDecrypt.files[0], text => setTextToDecrypt(text)))

    const saveButton = document.getElementById('save-file')
    const resultParagraph = document.getElementById("result")
    const showSaveButton = () => saveButton.classList.toggle(HIDE_CLASS, false)
    const hideSaveButton = () => saveButton.classList.toggle(HIDE_CLASS, true)
    const getResult = () => resultParagraph.innerText;
    const setResult = text => {
        resultParagraph.innerText = text;
        saveButton.classList.toggle(HIDE_CLASS, false)
    }

    const encryptRadioButton = document.querySelector('#post')
    const decryptRadioButton = document.querySelector('#get')
    encryptRadioButton.addEventListener("click", () => { hideTextToDecrypt(); showTextToEncrypt(); })
    decryptRadioButton.addEventListener("click", () => { hideTextToEncrypt(); showTextToDecrypt(); })
    const getRadioButtonSelected = (name="requestType") => {
        const radioButtons = document.getElementsByName(name);
        for (let i = 0; i < radioButtons.length; i++)
            if (radioButtons[i].checked) 
                return radioButtons[i].value;
    }    

    const encrypt = text => {
        if (getPassword().length > 0) {
            hidePasswordWarning()
            const cryptography = new Cryptography(getPassword())
            const result = cryptography.encrypt(getTextToEncrypt() || text)
            setResult(result)
            showSaveButton()
        } else showPasswordWarning()
    }

    const decrypt = text => {
        if (getPassword().length > 0) {
            hidePasswordWarning()
            const cryptography = new Cryptography(getPassword())
            const result = cryptography.decrypt(getTextToDecrypt() || text)
            setResult(result)
            hideSaveButton()
        } else showPasswordWarning()
    }

    const dropAdvisor = document.querySelector(".drop-advisor")
    const showDropAdvisor = () => dropAdvisor.classList.toggle(HIDE_CLASS, false)
    const hideDropAdvisor = () => dropAdvisor.classList.toggle(HIDE_CLASS, true)
    const body = document.getElementsByTagName('body')[0]
    body.addEventListener("dragenter", showDropAdvisor)
    dropAdvisor.addEventListener("dragleave", hideDropAdvisor)
    dropAdvisor.addEventListener("dragover", e => e.preventDefault())
    dropAdvisor.addEventListener("drop", e => {
        e.preventDefault()
        hideDropAdvisor()
        readText(e.dataTransfer.files[0], text => {
            if (getRadioButtonSelected() == 'post') 
                setTextToEncrypt(text)
            else setTextToDecrypt(text)
        })
    })

    const submitButton = document.getElementById('submit')
    submitButton.addEventListener("click", () => {
        if (getRadioButtonSelected() == 'post')
            encrypt(getTextToEncrypt())
        else
            decrypt(getTextToDecrypt())
    })

    saveButton.addEventListener("click", () => {
        const result = getResult()
        sendToDownload(result)
    })
}