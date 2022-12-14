'use strict';

var gMeme;
const gStickers = ['img/stickers/S1.png', 'img/stickers/S2.png', 'img/stickers/S3.png'];

function _createMeme(canvas) {
    var line = _createLine(0, canvas.height, canvas.width, 'left', false, 0);
    return {
        id: '',
        canvasImg: '',
        isCanvas: false,
        selectedImgId: false,
        selectedLineIdx: 0,
        isDrag: false,
        lines: [line]
    };
}

function _createLine(linesCount, height, width, align, isSticker = false, id) {
    if (linesCount % 2 === 0) {
        var y = height / 8 + linesCount * 40;
    } else {
        var y = height - height / 8 - (linesCount - 1) * 40;
    }
    if (align === 'left') var x = (width / 10);
    if (align === 'center') var x = width / 2;
    if (align === 'right') var x = width - (width / 10);

    const position = { x: x, y: y };
    return {
        txt: 'txt here',
        fontSize: height / 7.5,
        font: 'Impact',
        textAlign: align,
        color: { outLineColor: '#000000', fillColor: '#ffffff' },
        position: position,
        isDrag: false,
        isSticker: (isSticker) ? _createSticker(height, width, id) : false
    };
}

function _createSticker(height, width, id) {
    return {
        position: { x: width / 3, y: height / 3 },
        url: gStickers[id],
        widthX: (width / 5),
        heightY: (height / 5)
    };
}

function isCanvas() {
    return gMeme;
}

function isLineClicked(clickedPos) {
    if (!gMeme) return false;
    var lineIdx = gMeme.lines.findIndex(function (line) {
        if (!line.isSticker) {
            if (line.textAlign === 'left') {
                return (clickedPos.x > line.position.x) && (clickedPos.x < (line.position.x + ((line.fontSize / 2) * line.txt.length))) &&
                    (clickedPos.y < line.position.y) && (clickedPos.y > (line.position.y - line.fontSize));
            } else if (line.textAlign === 'center') {
                const helfWordPx = ((line.fontSize / 2) * line.txt.length) / 2;
                return (clickedPos.x > (line.position.x - helfWordPx)) && (clickedPos.x < (line.position.x + helfWordPx)) &&
                    (clickedPos.y < line.position.y) && (clickedPos.y > (line.position.y - line.fontSize));
            } else {
                return (clickedPos.x > (line.position.x - ((line.fontSize / 2) * line.txt.length))) & (clickedPos.x < line.position.x) &&
                    (clickedPos.y < line.position.y) && (clickedPos.y > (line.position.y - line.fontSize));
            }
        } else if (line.isSticker) {
            return (clickedPos.x > line.isSticker.position.x) && (clickedPos.x < (line.isSticker.position.x + line.isSticker.widthX))
                && (clickedPos.y > line.isSticker.position.y) && (clickedPos.y < (line.isSticker.position.y + line.isSticker.heightY));
        }
    });
    if (lineIdx === -1) return false;
    gMeme.selectedLineIdx = lineIdx;
    gMeme.lines[lineIdx].isDrag = true;
    gMeme.isDrag = true;
    return true;
}

function isHandleClicked(clickedPos) {
    var lineIdx = gMeme.lines.findIndex(function (line) {
        if (!line.isSticker) {
            if (line.textAlign === 'left') {
                return (clickedPos.x < ((line.position.x - 10 + 25)) &&
                    ((clickedPos.y) < (line.position.y - (0.5 * line.fontSize))));
            } else if (line.textAlign === 'center') {
                return ((clickedPos.x < (25 + (line.position.x - 10 - (line.txt.length * 0.5 * line.fontSize / 2))) &&
                    ((clickedPos.y) < ((line.position.y - (0.5 * line.fontSize))))));
            } else {
                return ((clickedPos.x < (25 + line.position.x - 10 - (line.txt.length * 0.5 * line.fontSize)) &&
                    ((clickedPos.y) < (line.position.y - (0.5 * line.fontSize)))));
            }
        } else if (line.isSticker) {
            return ((clickedPos.x < (line.isSticker.position.x + 20))
                && (clickedPos.y < (line.isSticker.position.y + 20)));
        }
    });
    if (lineIdx === -1) return false;
    else return true;
}

function getMeme() {
    return gMeme;
}

function resetMeme() {
    var canvas = getCanvas();
    gMeme = _createMeme(canvas);
}

function setSelectedImg(photoId) {
    gMeme.selectedImgId = photoId;
}

function updateTxtLine(txt) {
    if (!gMeme.lines[gMeme.selectedLineIdx].isSticker) {
        gMeme.lines[gMeme.selectedLineIdx].txt = txt;
    } else {
        gMeme.lines[gMeme.selectedLineIdx].txt = txt;
        gMeme.lines[gMeme.selectedLineIdx].isSticker = false;
    }
}

function plusfontSticker(diff) {
    var width = gMeme.lines[gMeme.selectedLineIdx].isSticker.widthX;
    var height = gMeme.lines[gMeme.selectedLineIdx].isSticker.heightY;
    if ((width < 35 && diff < 0)
        || (width > 250 && diff > 0) || (height < 35 && diff < 0)
        || (height > 250 && diff > 0)) {
        diff = 0;
    }
    gMeme.lines[gMeme.selectedLineIdx].isSticker.widthX += diff;
    gMeme.lines[gMeme.selectedLineIdx].isSticker.heightY += diff;
}

function plusFont(diff) {
    var fontSize = gMeme.lines[gMeme.selectedLineIdx].fontSize;
    if ((fontSize < 25 && diff < 0)
        || (fontSize > 150 && diff > 0)) {
        diff = 0;
    }
    gMeme.lines[gMeme.selectedLineIdx].fontSize += diff;
}

function changeColor(color) {
    gMeme.lines[gMeme.selectedLineIdx].color = color;
}

function ChangeFont(font) {
    gMeme.lines[gMeme.selectedLineIdx].font = font;
}

function textAlign(align) {
    gMeme.lines[gMeme.selectedLineIdx].textAlign = align;
    var canvas = getCanvas();
    if (align === 'left') var x = (canvas.width / 10);
    if (align === 'center') var x = canvas.width / 2;
    if (align === 'right') var x = canvas.width - (canvas.width / 10);
    gMeme.lines[gMeme.selectedLineIdx].position.x = x;
}

function getDragLine() {
    return gMeme.lines[gMeme.selectedLineIdx];
}

function moveLine(dx, dy) {
    gMeme.lines[gMeme.selectedLineIdx].position.x += dx;
    gMeme.lines[gMeme.selectedLineIdx].position.y += dy;
}

function moveLineSticker(dx, dy) {
    gMeme.lines[gMeme.selectedLineIdx].isSticker.position.x += dx;
    gMeme.lines[gMeme.selectedLineIdx].isSticker.position.y += dy;
}

function setFalseLineDrag() {
    if (!gMeme.isDrag) return;
    gMeme.lines[gMeme.selectedLineIdx].isDrag = false;
    gMeme.isDrag = false;
}

function addSticker(height, width, id) {
    gMeme.lines.push(_createLine(gMeme.lines.length, height, width, 'left', true, id));
    gMeme.selectedLineIdx = gMeme.lines.length - 1;
}

function addText(height, width) {
    gMeme.lines.push(_createLine(gMeme.lines.length, height, width, gMeme.lines[gMeme.selectedLineIdx].textAlign, false, 0));
    gMeme.selectedLineIdx = gMeme.lines.length - 1;
}
function deleteText() {
    if (gMeme.lines.length === 1) {
        gMeme.lines[gMeme.selectedLineIdx].txt = '';
        return;
    }
    gMeme.lines.splice(gMeme.selectedLineIdx, 1);
    gMeme.selectedLineIdx = gMeme.lines.length - 1;
}

function changeLineIdx() {
    if (gMeme.selectedLineIdx < gMeme.lines.length - 1) gMeme.selectedLineIdx++;
    else gMeme.selectedLineIdx = 0;
}

function getSelectedLine() {
    return gMeme.lines[gMeme.selectedLineIdx];
}