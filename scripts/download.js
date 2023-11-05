function sendToDownload(text="", fileName="file.cpt") {
    // Crea un nuevo Blob con el contenido que deseas guardar
    const blob = new Blob([text], { type: "text/plain" });

    // Crea un enlace para descargar el archivo
    const url = window.URL.createObjectURL(blob);

    // Crea un elemento de enlace y configura sus atributos
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click(); // Simula hacer clic en el enlace para iniciar la descarga

    window.URL.revokeObjectURL(url); // Libera el objeto URL creado
}