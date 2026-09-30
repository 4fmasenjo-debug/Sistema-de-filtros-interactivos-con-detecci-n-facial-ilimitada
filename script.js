const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const SCALE_FACTOR_DISPERSION = 1;

// --- FANTÁSTICOS (DINÁMICO) ---
const fenixImg = document.getElementById("fenix-img");
const hipogrifoImg = document.getElementById("hipogrifo-img");
const pegasoImg = document.getElementById("pegaso-img");
const STICKERS_FANTASTICOS = [fenixImg, hipogrifoImg, pegasoImg];
const TOTAL_STICKERS_PER_FACE = 25;
const GLOBAL_SCALE_FACTOR = 0.20;

// --- MITOLÓGICOS (ESTÁTICO) ---
const cerberoImg = document.getElementById("cerbero-img");
const minotauroImg = document.getElementById("minotauro-img");
const fenrirImg = document.getElementById("fenrir-img");
const convertedImg = document.getElementById("converted-img");
const STICKERS_MITOLOGICOS = [cerberoImg, minotauroImg, fenrirImg];
const TOTAL_FLOWERS_PER_FACE = 20;
const FLOWER_SCALE_FACTOR = 0.18;

// ---  (MÁSCARA) y PANTERA (OVERLAY) ---
const unicornioImg = document.getElementById("unicornio-img");
const fondoMaskImg = unicornioImg;
const quetzalcoatlImg = document.getElementById("quetzalcoatl-img");
const quetzalcoatlOverlayImg = quetzalcoatlImg;

// --- DRAGÓN (WEBM) ---
const animacionWebmVideo = document.getElementById("dragón-webm");

// --- TIPOS DE FILTROS ---
const FILTER_TYPES = ['FANTASTICOS_DINAMICO', 'MITOLOGICOS', 'MASCARA', 'PANTERA', 'WEBM_ANIMACION'];
let faceFilterCache = [];
function getRandomFilterType() {
    return FILTER_TYPES[Math.floor(Math.random() * FILTER_TYPES.length)];
}

// --- CARGA DE ARCHIVOS ---
function loadDomImages(images) {
    return Promise.all(images.map(img => new Promise(resolve => {
        if (!img) return resolve();
        if (img.complete) return resolve();
        img.onload = resolve;
        img.onerror = resolve;
    })));
}

function loadVideo(videoElement) {
    return new Promise(resolve => {
        if (!videoElement) return resolve();
        if (videoElement.readyState >= 2) return resolve();
        videoElement.oncanplaythrough = resolve;
        videoElement.onerror = resolve;
        videoElement.load();
    });
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
    loadDomImages([...STICKERS_FANTASTICOS, ...STICKERS_MITOLOGICOS, convertedImg, fondoMaskImg, quetzalcoatlOverlayImg]),
    loadVideo(animacionWebmVideo)
]).then(startWebcam);

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: {} }).then(stream => {
        video.srcObject = stream;
    });
}

// --- LOOP PRINCIPAL ---
video.addEventListener("play", () => {
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    if (animacionWebmVideo && animacionWebmVideo.paused) animacionWebmVideo.play();
    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceFilterCache = faceFilterCache.slice(0, resizedDetections.length);
        resizedDetections.forEach((detection, i) => {
            if (!faceFilterCache[i]) {
                faceFilterCache[i] = {
                    type: getRandomFilterType(),
                    specificCache: []
                };
            }
            const filterData = faceFilterCache[i];
            switch (filterData.type) {
                case 'FANTASTICOS_DINAMICO':
                    drawFilterFantasticosDinamicas(detection, filterData.specificCache);
                    break;
                case 'MITOLOGICOS':
                    drawFilterMitologicosEstaticas(detection, filterData.specificCache);
                    break;
                case 'MASCARA':
                    drawMaskFilter(detection, quetzalcoatlOverlayImg);
                    break;
                case 'PANTERA':
                    drawImageOverlay(detection, fondoMaskImg);
                    break;
                case 'WEBM_ANIMACION':
                    drawWebmOverlayFilter(detection, animacionWebmVideo);
                    break;
            }
        });

    }, 100);
});

// --- WEBM DRAGÓN ---
function drawWebmOverlayFilter(detection, webmVideoElement) {
    if (!detection || !webmVideoElement) return;
    const box = detection.detection.box;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const th = box.height * 1.5;
    const scale = th / (webmVideoElement.videoWidth || 1);
    const tw = (webmVideoElement.videoWidth || 1) * scale;
    ctx.drawImage(webmVideoElement, cx - tw / 2, cy - th / 2, tw, th);
}

// --- PEGATINAS FANTÁSTICOS TOTALMENTE ALEATORIAS Y RÁPIDAS ---
function drawRandomStickersFantásticos(box, count, baseStickerSize, stickerArray, cache) {
    const generateNew = cache.length === 0;
    for (let j = 0; j < count; j++) {
        let absX, absY, sizeFactor, sticker;
        if (generateNew) {
            absX = box.x + Math.random() * box.width;
            absY = box.y + Math.random() * box.height;
            sizeFactor = 0.8 + Math.random() * 0.4;
            sticker = stickerArray[Math.floor(Math.random() * stickerArray.length)];
            const vx = (Math.random() - 0.5) * 10;
            const vy = (Math.random() - 0.5) * 10;
            cache.push({ 
                relX: (absX - box.x) / box.width, 
                relY: (absY - box.y) / box.height, 
                sizeFactor, 
                img: sticker, 
                vx, 
                vy 
            });
        } else {
            const c = cache[j];
            c.relX += c.vx / box.width;
            c.relY += c.vy / box.height;
            c.vx += (Math.random() - 0.5) * 0.5;
            c.vy += (Math.random() - 0.5) * 0.5;
            const maxSpeed = 10;
            c.vx = Math.max(Math.min(c.vx, maxSpeed), -maxSpeed);
            c.vy = Math.max(Math.min(c.vy, maxSpeed), -maxSpeed);
            if (c.relX < 0) { c.relX = 0; c.vx *= -1; }
            if (c.relX > 1) { c.relX = 1; c.vx *= -1; }
            if (c.relY < 0) { c.relY = 0; c.vy *= -1; }
            if (c.relY > 1) { c.relY = 1; c.vy *= -1; }
            absX = box.x + c.relX * box.width;
            absY = box.y + c.relY * box.height;
            sizeFactor = c.sizeFactor;
            sticker = c.img;
        }
        const size = baseStickerSize * sizeFactor;
        ctx.drawImage(sticker, absX - size / 2, absY - size / 2, size, size);
    }
}

// --- FANTÁSTICOS DINÁMICOS ---
function drawFilterFantasticosDinamicas(detection, cache) {
    const box = detection.detection.box;
    const newW = box.width * SCALE_FACTOR_DISPERSION;
    const newH = box.height * SCALE_FACTOR_DISPERSION;
    const extendedBox = {
        x: box.x - (newW - box.width) / 2,
        y: box.y - (newH - box.height) / 2,
        width: newW,
        height: newH
    };
    const baseSize = extendedBox.width * GLOBAL_SCALE_FACTOR;
    drawRandomStickersFantásticos(extendedBox, TOTAL_STICKERS_PER_FACE, baseSize, STICKERS_FANTASTICOS, cache);
}

// --- PEGATINAS MITOLÓGICOS ESTÁTICAS ---
function drawRandomStickersInBox(box, count, baseStickerSize, stickerArray, cache) {
    const generateNew = cache.length === 0;
    for (let j = 0; j < count; j++) {
        let absX, absY, sizeFactor, sticker;
        if (generateNew) {
            absX = box.x + Math.random() * box.width;
            absY = box.y + Math.random() * box.height;
            sizeFactor = 0.8 + Math.random() * 0.4;
            sticker = stickerArray[Math.floor(Math.random() * stickerArray.length)];
            cache.push({ relX: (absX - box.x) / box.width, relY: (absY - box.y) / box.height, sizeFactor, img: sticker });
        } else {
            const c = cache[j];
            absX = box.x + c.relX * box.width;
            absY = box.y + c.relY * box.height;
            sizeFactor = c.sizeFactor;
            sticker = c.img;
        }
        const size = baseStickerSize * sizeFactor;
        ctx.drawImage(sticker, absX - size / 2, absY - size / 2, size, size);
    }
}

// --- MITOLÓGICOS ---
function drawFilterMitologicosEstaticas(detection, cache) {
    const box = detection.detection.box;
    const newW = box.width * SCALE_FACTOR_DISPERSION;
    const newH = box.height * SCALE_FACTOR_DISPERSION;
    const extendedBox = {
        x: box.x - (newW - box.width) / 2,
        y: box.y - (newH - box.height) / 2,
        width: newW,
        height: newH
    };
    const baseSize = extendedBox.width * FLOWER_SCALE_FACTOR;
    drawRandomStickersInBox(extendedBox, TOTAL_FLOWERS_PER_FACE, baseSize, STICKERS_MITOLOGICOS, cache);
}

// --- UNICORNIO REDUCIDO
function drawMaskFilter(detection, maskImage) {
    const box = detection.detection.box;
    const landmarks = detection.landmarks;
    const jaw = landmarks.getJawOutline();
    const left = landmarks.getLeftEyeBrow();
    const right = landmarks.getRightEyeBrow();
    const foreheadTopY = box.y - box.height * 0.10;
    const maskLeftX = box.x - box.width * 0.05;
    const maskRightX = box.x + box.width * 1.05;
    const maskWidth = maskRightX - maskLeftX;
    const maskHeight = (jaw[8]?.y || (box.y + box.height)) - foreheadTopY;
    const cx = maskLeftX + maskWidth / 2;
    const cy = foreheadTopY + maskHeight / 2;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(maskLeftX, foreheadTopY);
    ctx.lineTo(maskRightX, foreheadTopY);
    ctx.lineTo(right[4].x, right[4].y);
    ctx.lineTo(jaw[jaw.length - 1].x, jaw[jaw.length - 1].y);
    for (let i = jaw.length - 2; i >= 0; i--) ctx.lineTo(jaw[i].x, jaw[i].y);
    ctx.lineTo(left[0].x, left[0].y);
    ctx.closePath();
    ctx.clip();
    const scale = Math.max(maskWidth / maskImage.naturalWidth, maskHeight / maskImage.naturalHeight) * 0.73;
    drawImageWithTransform(ctx, maskImage, {
        translate: [cx, cy],
        scale,
        rotate: 0,
        offsetX: maskImage.naturalWidth / 2,
        offsetY: maskImage.naturalHeight / 2
    });
    ctx.restore();
}

// --- QUETZALCÓATL SUPERPOSICIÓN
function drawImageOverlay(detection, overlayImage) {
    const box = detection.detection.box;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const tw = box.width * 0.9;
    const scale = tw / overlayImage.naturalWidth;
    const th = overlayImage.naturalHeight * scale;
    ctx.drawImage(overlayImage, cx - tw / 2, cy - th / 2, tw, th);
}

// --- UTILIDAD DE TRANSFORMACIÓN ---
function drawImageWithTransform(ctx, img, t) {
    ctx.save();
    ctx.translate(t.translate[0], t.translate[1]);
    ctx.rotate((t.rotate * Math.PI) / 180);
    ctx.scale(t.scale, t.scale);
    ctx.drawImage(img, -t.offsetX, -t.offsetY);
    ctx.restore();
}
