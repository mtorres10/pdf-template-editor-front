var jsonTemplateData = JSON.parse("{}");
var pdf;

function selectJson() {
    var parent = document.getElementById("loadJson");
    var input = document.createElement('input');
    input.setAttribute("id", "inputJson");
    input.setAttribute("accept", "application/JSON");
    input.type = 'file';
    input.classList.add("inputPdf");
    parent.appendChild(input);
    input.onchange = e => {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.onload = function () {
            jsonTemplateData = JSON.parse(reader.result);
            pdf.loadFromJSON2(jsonTemplateData);
        }
        reader.readAsText(file);
    }
    input.click();
}

function selectFile() {
    var parent = document.getElementById("load");
    var input = document.createElement('input');
    input.setAttribute("id", "inputPdfId");
    input.setAttribute("accept", "application/pdf");
    input.type = 'file';
    input.classList.add("inputPdf");
    parent.appendChild(input);
    input.onchange = e => {
        // getting a hold of the file reference
        var file = e.target.files[0];
        // setting up the reader
        var reader = new FileReader();
        reader.onload = function () {
            //Step 4:turn array buffer into typed array
            var typedarray = new Uint8Array(this.result);
            //Step 5:pdfjs should be able to read this
            load(typedarray);
        }
        //Step 3:Read the file as ArrayBuffer
        reader.readAsArrayBuffer(file);
    }
    input.click();
    //input.remove();
}

function load(pdfcontent) {
    var canvasContainers = document.querySelectorAll("[class='canvas-container']");
    var input = document.getElementById('inputPdfId');

    for (i = 0; i < canvasContainers.length; ++i) {
        let canvasContainer = canvasContainers[i];
        canvasContainer.parentNode.removeChild(canvasContainer);
    }

    pdf = new PDFAnnotate("pdf-container", pdfcontent, {
        onPageUpdated(page, oldData, newData) {
            console.log(page, oldData, newData);
        },
        ready() {
            console.log("Plugin initialized successfully");
            input.remove();
        },
        scale: 1.5,
        pageImageCompression: "MEDIUM", // FAST, MEDIUM, SLOW(Helps to control the new PDF file size)
    });
}

function changeActiveTool(event) {
    var element = $(event.target).hasClass("tool-button") ?
        $(event.target) :
        $(event.target).parents(".tool-button").first();
    $(".tool-button.active").removeClass("active");
    $(element).addClass("active");
}

function enableSelector(event) {
    event.preventDefault();
    changeActiveTool(event);
    pdf.enableSelector();
}

function enablePencil(event) {
    event.preventDefault();
    changeActiveTool(event);
    pdf.enablePencil();
}

function enableAddText(event) {
    event.preventDefault();
    changeActiveTool(event);
    pdf.enableAddText();
}

function enableAddArrow(event) {
    event.preventDefault();
    changeActiveTool(event);
    pdf.enableAddArrow();
}

function addImage(event) {
    event.preventDefault();
    pdf.addImageToCanvas()
}

function enableRectangle(event) {
    event.preventDefault();
    changeActiveTool(event);
    pdf.setColor('rgba(255, 0, 0, 0.3)');
    pdf.setBorderColor('blue');
    pdf.enableRectangle();
}

function deleteSelectedObject(event) {
    event.preventDefault();
    pdf.deleteSelectedObject();
}

function savePDF() {
    // pdf.savePdf();
    pdf.savePdf('output.pdf'); // save with given file name
}

function inputHandler(e) {
    // pdf.savePdf();
    pdf.inputHandler(e); // save with given file name
}

function clearPage() {
    pdf.clearActivePage();
}

function showPdfData() {
    pdf.serializePdf(function (string) {
        $("#dataModal .modal-body pre")
            .first()
            .text(JSON.stringify(JSON.parse(string), null, 4));
        PR.prettyPrint();
        $('#dataModal').modal('show');
    });
}

function readJson(fileReader) {
    var fr = new FileReader();

    fr.onload = function () {
        //document.getElementById('output').textContent = fr.result;
        jsonTemplateData = JSON.parse(fr.result);
        pdf.loadFromJSON2(jsonTemplateData);
    }
    fr.readAsText(fileReader.files[0]);

}

function getPdfData() {
    var json = pdf.serializePdf(function (string) {
        //console.log(JSON.stringify(JSON.parse(string), null, 4));
        var text = JSON.stringify(JSON.parse(string), null, 4);
        download(text, "template.json", "text/json");
    });
}

function download(text, name, type) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', name);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    /* var a = document.getElementById("a");
     var file = new Blob([text], {type: type});
     a.href = URL.createObjectURL(file);
     a.download = name;
     a.click;*/
}




const expectedValue = document.getElementById('expectedValue');
expectedValue.addEventListener('input', inputHandler);
expectedValue.addEventListener('propertychange', inputHandler);
const sectionName = document.getElementById('sectionName');
sectionName.addEventListener('input', inputHandler);
sectionName.addEventListener('propertychange', inputHandler);
const fieldName = document.getElementById('fieldName');
fieldName.addEventListener('input', inputHandler);
fieldName.addEventListener('propertychange', inputHandler);


$(function () {
    $('.color-tool').click(function () {
        $('.color-tool.active').removeClass('active');
        $(this).addClass('active');
        color = $(this).get(0).style.backgroundColor;
        pdf.setColor(color);
    });

    $('#brush-size').change(function () {
        var width = $(this).val();
        pdf.setBrushSize(width);
    });

    $('#font-size').change(function () {
        var font_size = $(this).val();
        pdf.setFontSize(font_size);
    });
});