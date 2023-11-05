function readText(file, callback) {
    //console.log(file)
    if (file.type.includes('text') || file.type === '') {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.addEventListener("load", e => callback(e.currentTarget.result))
    } else callback("Text not found")
}