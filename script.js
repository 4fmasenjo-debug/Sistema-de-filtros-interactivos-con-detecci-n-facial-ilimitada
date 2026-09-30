const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SCALE_FACTOR_DISPERSION = 1;

// ============================================================
// FANTÁSTICOS
// ============================================================

const fenixImg = document.getElementById("fenix-img");
const hipogrifoImg = document.getElementById("hipogrifo-img");
const pegasoImg = document.getElementById("pegaso-img");

const STICKERS_FANTASTICOS = [
    fenixImg,
    hipogrifoImg,
    pegasoImg
];

const TOTAL_STICKERS_PER_FACE = 25;
const GLOBAL_SCALE_FACTOR = 0.20;

// ============================================================
// MITOLÓGICOS
// ============================================================

const cerberoImg = document.getElementById("cerbero-img");
const minotauroImg = document.getElementById("minotauro-img");
const fenrirImg = document.getElementById("fenrir-img");

const STICKERS_MITOLOGICOS = [
    cerberoImg,
    minotauroImg,
    fenrirImg
];

const TOTAL_FLOWERS_PER_FACE = 20;
const FLOWER_SCALE_FACTOR = 0.18;

// ============================================================
// MÁSCARA Y OVERLAY
// ============================================================

const unicornioImg = document.getElementById("unicornio-img");
const fondoMaskImg = unicornioImg;

const quetzalcoatlImg =
    document.getElementById("quetzalcoatl-img");

const quetzalcoatlOverlayImg =
    quetzalcoatlImg;

// ============================================================
// DRAGÓN WEBM
// ============================================================

const animacionWebmVideo =
    document.getElementById("dragón-webm");

// ============================================================
// FILTROS
// ============================================================

const FILTER_TYPES = [
    "FANTASTICOS_DINAMICO",
    "MITOLOGICOS",
    "MASCARA",
    "PANTERA",
    "WEBM_ANIMACION"
];

let faceFilterCache = [];

// ============================================================
// FILTRO ALEATORIO
// ============================================================

function getRandomFilterType() {

    return FILTER_TYPES[
        Math.floor(
            Math.random() *
            FILTER_TYPES.length
        )
    ];

}

// ============================================================
// CARGAR IMÁGENES
// ============================================================

function loadDomImages(images) {

    return Promise.all(

        images.map(img => {

            return new Promise((resolve, reject) => {

                if (!img) {

                    reject(
                        new Error(
                            "No se encontró una imagen en el HTML"
                        )
                    );

                    return;
                }

                if (
                    img.complete &&
                    img.naturalWidth > 0
                ) {

                    console.log(
                        "Imagen OK:",
                        img.src
                    );

                    resolve();

                    return;
                }

                img.onload = () => {

                    console.log(
                        "Imagen OK:",
                        img.src
                    );

                    resolve();

                };

                img.onerror = () => {

                    console.error(
                        "ERROR CARGANDO IMAGEN:",
                        img.src
                    );

                    reject(
                        new Error(
                            "No se pudo cargar la imagen: " +
                            img.src
                        )
                    );

                };

            });

        })

    );

}

// ============================================================
// CARGAR WEBM
// ============================================================

function loadVideo(videoElement) {

    return new Promise((resolve, reject) => {

        if (!videoElement) {

            reject(
                new Error(
                    "No se encontró el vídeo WEBM"
                )
            );

            return;
        }

        if (
            videoElement.readyState >= 2
        ) {

            console.log(
                "WEBM OK:",
                videoElement.src
            );

            resolve();

            return;
        }

        videoElement.oncanplaythrough = () => {

            console.log(
                "WEBM OK:",
                videoElement.src
            );

            resolve();

        };

        videoElement.onerror = () => {

            console.error(
                "ERROR CARGANDO WEBM:",
                videoElement.src
            );

            reject(
                new Error(
                    "No se pudo cargar el WEBM: " +
                    videoElement.src
                )
            );

        };

        videoElement.load();

    });

}

// ============================================================
// INICIO
// ============================================================

console.log(
    "================================="
);

console.log(
    "INICIANDO CARGA"
);

console.log(
    "================================="
);

console.log(
    "1. Cargando Tiny Face Detector..."
);

// ============================================================
// CARGAR TODO
// ============================================================

Promise.all([

    // --------------------------------------------------------
    // TINY FACE DETECTOR
    // --------------------------------------------------------

    faceapi.nets.tinyFaceDetector
        .loadFromUri("./models")
        .then(() => {

            console.log(
                "2. Tiny Face Detector OK"
            );

        }),

    // --------------------------------------------------------
    // FACE LANDMARK 68
    // --------------------------------------------------------

    faceapi.nets.faceLandmark68Net
        .loadFromUri("./models")
        .then(() => {

            console.log(
                "3. Face Landmark 68 OK"
            );

        }),

    // --------------------------------------------------------
    // IMÁGENES
    // --------------------------------------------------------
    // IMPORTANTE:
    // converted_image.png NO SE CARGA.
    // --------------------------------------------------------

    loadDomImages([

        ...STICKERS_FANTASTICOS,

        ...STICKERS_MITOLOGICOS,

        fondoMaskImg,

        quetzalcoatlOverlayImg

    ]),

    // --------------------------------------------------------
    // WEBM
    // --------------------------------------------------------

    loadVideo(
        animacionWebmVideo
    )

])

.then(() => {

    console.log(
        "4. TODOS LOS ARCHIVOS CARGADOS"
    );

    console.log(
        "5. Iniciando webcam..."
    );

    startWebcam();

})

.catch(error => {

    console.error(
        "================================="
    );

    console.error(
        "ERROR DURANTE LA CARGA"
    );

    console.error(
        error
    );

    console.error(
        "================================="
    );

});

// ============================================================
// WEBCAM
// ============================================================

function startWebcam() {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        console.error(
            "getUserMedia no está disponible"
        );

        return;
    }

    navigator.mediaDevices
        .getUserMedia({

            video: true,

            audio: false

        })

        .then(stream => {

            console.log(
                "6. Cámara OK"
            );

            video.srcObject =
                stream;

        })

        .catch(error => {

            console.error(
                "ERROR DE CÁMARA:",
                error
            );

        });

}

// ============================================================
// CUANDO EL VÍDEO DE LA CÁMARA EMPIEZA
// ============================================================

video.addEventListener(
    "play",
    () => {

        console.log(
            "7. VIDEO INICIADO"
        );

        const displaySize = {

            width:
                video.videoWidth ||
                video.width,

            height:
                video.videoHeight ||
                video.height

        };

        canvas.width =
            displaySize.width;

        canvas.height =
            displaySize.height;

        faceapi.matchDimensions(
            canvas,
            displaySize
        );

        // ----------------------------------------------------
        // REPRODUCIR WEBM
        // ----------------------------------------------------

        if (
            animacionWebmVideo &&
            animacionWebmVideo.paused
        ) {

            animacionWebmVideo
                .play()
                .catch(error => {

                    console.warn(
                        "No se pudo reproducir el WEBM:",
                        error
                    );

                });

        }

        // ----------------------------------------------------
        // EVITAR CREAR VARIOS INTERVALOS
        // ----------------------------------------------------

        if (
            window.faceDetectionInterval
        ) {

            clearInterval(
                window.faceDetectionInterval
            );

        }

        // ----------------------------------------------------
        // LOOP DE DETECCIÓN
        // ----------------------------------------------------

        window.faceDetectionInterval =
            setInterval(

                async () => {

                    try {

                        const detections =
                            await faceapi
                                .detectAllFaces(

                                    video,

                                    new faceapi
                                        .TinyFaceDetectorOptions({

                                            inputSize: 320,

                                            scoreThreshold: 0.5

                                        })

                                )
                                .withFaceLandmarks();

                        // ------------------------------------
                        // LIMPIAR CANVAS
                        // ------------------------------------

                        ctx.clearRect(

                            0,

                            0,

                            canvas.width,

                            canvas.height

                        );

                        // ------------------------------------
                        // REDIMENSIONAR
                        // ------------------------------------

                        const resizedDetections =
                            faceapi.resizeResults(

                                detections,

                                displaySize

                            );

                        // ------------------------------------
                        // CACHE
                        // ------------------------------------

                        faceFilterCache =
                            faceFilterCache.slice(

                                0,

                                resizedDetections.length

                            );

                        // ------------------------------------
                        // DETECCIÓN
                        // ------------------------------------

                        resizedDetections.forEach(

                            (detection, i) => {

                                if (
                                    !faceFilterCache[i]
                                ) {

                                    faceFilterCache[i] = {

                                        type:
                                            getRandomFilterType(),

                                        specificCache: []

                                    };

                                    console.log(

                                        "Nueva cara detectada."

                                    );

                                    console.log(

                                        "Nuevo filtro:",

                                        faceFilterCache[i].type

                                    );

                                }

                                const filterData =
                                    faceFilterCache[i];

                                // --------------------------------
                                // FILTROS
                                // --------------------------------

                                switch (
                                    filterData.type
                                ) {

                                    case "FANTASTICOS_DINAMICO":

                                        drawFilterFantasticosDinamicas(

                                            detection,

                                            filterData.specificCache

                                        );

                                        break;


                                    case "MITOLOGICOS":

                                        drawFilterMitologicosEstaticas(

                                            detection,

                                            filterData.specificCache

                                        );

                                        break;


                                    case "MASCARA":

                                        drawMaskFilter(

                                            detection,

                                            quetzalcoatlOverlayImg

                                        );

                                        break;


                                    case "PANTERA":

                                        drawImageOverlay(

                                            detection,

                                            fondoMaskImg

                                        );

                                        break;


                                    case "WEBM_ANIMACION":

                                        drawWebmOverlayFilter(

                                            detection,

                                            animacionWebmVideo

                                        );

                                        break;

                                }

                            }

                        );

                    }

                    catch (error) {

                        console.error(

                            "ERROR EN LA DETECCIÓN:",

                            error

                        );

                    }

                },

                100

            );

    }
);

// ============================================================
// DRAGÓN WEBM
// ============================================================

function drawWebmOverlayFilter(
    detection,
    webmVideoElement
) {

    if (
        !detection ||
        !webmVideoElement
    ) {

        return;

    }

    const box =
        detection.detection.box;

    const cx =
        box.x +
        box.width / 2;

    const cy =
        box.y +
        box.height / 2;

    const th =
        box.height * 1.5;

    const videoWidth =
        webmVideoElement.videoWidth ||
        1;

    const videoHeight =
        webmVideoElement.videoHeight ||
        1;

    const scale =
        th /
        videoHeight;

    const tw =
        videoWidth *
        scale;

    ctx.drawImage(

        webmVideoElement,

        cx - tw / 2,

        cy - th / 2,

        tw,

        th

    );

}

// ============================================================
// PEGATINAS FANTÁSTICOS
// ============================================================

function drawRandomStickersFantásticos(

    box,

    count,

    baseStickerSize,

    stickerArray,

    cache

) {

    const generateNew =
        cache.length === 0;

    for (
        let j = 0;
        j < count;
        j++
    ) {

        let absX;
        let absY;
        let sizeFactor;
        let sticker;

        // ----------------------------------------------------
        // CREAR
        // ----------------------------------------------------

        if (generateNew) {

            absX =
                box.x +
                Math.random() *
                box.width;

            absY =
                box.y +
                Math.random() *
                box.height;

            sizeFactor =
                0.8 +
                Math.random() *
                0.4;

            sticker =
                stickerArray[
                    Math.floor(

                        Math.random() *
                        stickerArray.length

                    )
                ];

            const vx =
                (
                    Math.random() -
                    0.5
                ) * 10;

            const vy =
                (
                    Math.random() -
                    0.5
                ) * 10;

            cache.push({

                relX:
                    (
                        absX -
                        box.x
                    ) /
                    box.width,

                relY:
                    (
                        absY -
                        box.y
                    ) /
                    box.height,

                sizeFactor,

                img:
                    sticker,

                vx,

                vy

            });

        }

        // ----------------------------------------------------
        // MOVER
        // ----------------------------------------------------

        else {

            const c =
                cache[j];

            c.relX +=
                c.vx /
                box.width;

            c.relY +=
                c.vy /
                box.height;

            c.vx +=
                (
                    Math.random() -
                    0.5
                ) * 0.5;

            c.vy +=
                (
                    Math.random() -
                    0.5
                ) * 0.5;

            const maxSpeed = 10;

            c.vx =
                Math.max(

                    Math.min(
                        c.vx,
                        maxSpeed
                    ),

                    -maxSpeed

                );

            c.vy =
                Math.max(

                    Math.min(
                        c.vy,
                        maxSpeed
                    ),

                    -maxSpeed

                );

            if (
                c.relX < 0
            ) {

                c.relX = 0;

                c.vx *= -1;

            }

            if (
                c.relX > 1
            ) {

                c.relX = 1;

                c.vx *= -1;

            }

            if (
                c.relY < 0
            ) {

                c.relY = 0;

                c.vy *= -1;

            }

            if (
                c.relY > 1
            ) {

                c.relY = 1;

                c.vy *= -1;

            }

            absX =
                box.x +
                c.relX *
                box.width;

            absY =
                box.y +
                c.relY *
                box.height;

            sizeFactor =
                c.sizeFactor;

            sticker =
                c.img;

        }

        // ----------------------------------------------------
        // DIBUJAR
        // ----------------------------------------------------

        const size =
            baseStickerSize *
            sizeFactor;

        if (
            sticker &&
            sticker.complete &&
            sticker.naturalWidth > 0
        ) {

            ctx.drawImage(

                sticker,

                absX -
                    size / 2,

                absY -
                    size / 2,

                size,

                size

            );

        }

    }

}

// ============================================================
// FANTÁSTICOS DINÁMICOS
// ============================================================

function drawFilterFantasticosDinamicas(

    detection,

    cache

) {

    const box =
        detection.detection.box;

    const newW =
        box.width *
        SCALE_FACTOR_DISPERSION;

    const newH =
        box.height *
        SCALE_FACTOR_DISPERSION;

    const extendedBox = {

        x:
            box.x -
            (
                newW -
                box.width
            ) / 2,

        y:
            box.y -
            (
                newH -
                box.height
            ) / 2,

        width:
            newW,

        height:
            newH

    };

    const baseSize =
        extendedBox.width *
        GLOBAL_SCALE_FACTOR;

    drawRandomStickersFantásticos(

        extendedBox,

        TOTAL_STICKERS_PER_FACE,

        baseSize,

        STICKERS_FANTASTICOS,

        cache

    );

}

// ============================================================
// PEGATINAS MITOLÓGICAS
// ============================================================

function drawRandomStickersInBox(

    box,

    count,

    baseStickerSize,

    stickerArray,

    cache

) {

    const generateNew =
        cache.length === 0;

    for (
        let j = 0;
        j < count;
        j++
    ) {

        let absX;
        let absY;
        let sizeFactor;
        let sticker;

        // ----------------------------------------------------
        // CREAR
        // ----------------------------------------------------

        if (
            generateNew
        ) {

            absX =
                box.x +
                Math.random() *
                box.width;

            absY =
                box.y +
                Math.random() *
                box.height;

            sizeFactor =
                0.8 +
                Math.random() *
                0.4;

            sticker =
                stickerArray[
                    Math.floor(

                        Math.random() *
                        stickerArray.length

                    )
                ];

            cache.push({

                relX:
                    (
                        absX -
                        box.x
                    ) /
                    box.width,

                relY:
                    (
                        absY -
                        box.y
                    ) /
                    box.height,

                sizeFactor,

                img:
                    sticker

            });

        }

        // ----------------------------------------------------
        // MANTENER
        // ----------------------------------------------------

        else {

            const c =
                cache[j];

            absX =
                box.x +
                c.relX *
                box.width;

            absY =
                box.y +
                c.relY *
                box.height;

            sizeFactor =
                c.sizeFactor;

            sticker =
                c.img;

        }

        const size =
            baseStickerSize *
            sizeFactor;

        if (
            sticker &&
            sticker.complete &&
            sticker.naturalWidth > 0
        ) {

            ctx.drawImage(

                sticker,

                absX -
                    size / 2,

                absY -
                    size / 2,

                size,

                size

            );

        }

    }

}

// ============================================================
// MITOLÓGICOS
// ============================================================

function drawFilterMitologicosEstaticas(

    detection,

    cache

) {

    const box =
        detection.detection.box;

    const newW =
        box.width *
        SCALE_FACTOR_DISPERSION;

    const newH =
        box.height *
        SCALE_FACTOR_DISPERSION;

    const extendedBox = {

        x:
            box.x -
            (
                newW -
                box.width
            ) / 2,

        y:
            box.y -
            (
                newH -
                box.height
            ) / 2,

        width:
            newW,

        height:
            newH

    };

    const baseSize =
        extendedBox.width *
        FLOWER_SCALE_FACTOR;

    drawRandomStickersInBox(

        extendedBox,

        TOTAL_FLOWERS_PER_FACE,

        baseSize,

        STICKERS_MITOLOGICOS,

        cache

    );

}

// ============================================================
// MÁSCARA
// ============================================================

function drawMaskFilter(

    detection,

    maskImage

) {

    if (
        !maskImage ||
        !maskImage.complete ||
        maskImage.naturalWidth === 0
    ) {

        return;

    }

    const box =
        detection.detection.box;

    const landmarks =
        detection.landmarks;

    if (!landmarks) {

        return;

    }

    const jaw =
        landmarks.getJawOutline();

    const left =
        landmarks.getLeftEyeBrow();

    const right =
        landmarks.getRightEyeBrow();

    const foreheadTopY =
        box.y -
        box.height *
        0.10;

    const maskLeftX =
        box.x -
        box.width *
        0.05;

    const maskRightX =
        box.x +
        box.width *
        1.05;

    const maskWidth =
        maskRightX -
        maskLeftX;

    const maskHeight =
        (
            jaw[8]?.y ||
            (
                box.y +
                box.height
            )
        ) -
        foreheadTopY;

    const cx =
        maskLeftX +
        maskWidth / 2;

    const cy =
        foreheadTopY +
        maskHeight / 2;

    ctx.save();

    // --------------------------------------------------------
    // RECORTE
    // --------------------------------------------------------

    ctx.beginPath();

    ctx.moveTo(

        maskLeftX,

        foreheadTopY

    );

    ctx.lineTo(

        maskRightX,

        foreheadTopY

    );

    ctx.lineTo(

        right[4].x,

        right[4].y

    );

    ctx.lineTo(

        jaw[
            jaw.length - 1
        ].x,

        jaw[
            jaw.length - 1
        ].y

    );

    for (
        let i =
            jaw.length - 2;

        i >= 0;

        i--
    ) {

        ctx.lineTo(

            jaw[i].x,

            jaw[i].y

        );

    }

    ctx.lineTo(

        left[0].x,

        left[0].y

    );

    ctx.closePath();

    ctx.clip();

    // --------------------------------------------------------
    // ESCALA
    // --------------------------------------------------------

    const scale =
        Math.max(

            maskWidth /
                maskImage.naturalWidth,

            maskHeight /
                maskImage.naturalHeight

        ) * 0.73;

    drawImageWithTransform(

        ctx,

        maskImage,

        {

            translate: [
                cx,
                cy
            ],

            scale:

                scale,

            rotate:
                0,

            offsetX:

                maskImage.naturalWidth /
                2,

            offsetY:

                maskImage.naturalHeight /
                2

        }

    );

    ctx.restore();

}

// ============================================================
// OVERLAY
// ============================================================

function drawImageOverlay(

    detection,

    overlayImage

) {

    if (
        !overlayImage ||
        !overlayImage.complete ||
        overlayImage.naturalWidth === 0
    ) {

        return;

    }

    const box =
        detection.detection.box;

    const cx =
        box.x +
        box.width / 2;

    const cy =
        box.y +
        box.height / 2;

    const tw =
        box.width *
        0.9;

    const scale =
        tw /
        overlayImage.naturalWidth;

    const th =
        overlayImage.naturalHeight *
        scale;

    ctx.drawImage(

        overlayImage,

        cx -
            tw / 2,

        cy -
            th / 2,

        tw,

        th

    );

}

// ============================================================
// TRANSFORMACIÓN
// ============================================================

function drawImageWithTransform(

    ctx,

    img,

    t

) {

    ctx.save();

    ctx.translate(

        t.translate[0],

        t.translate[1]

    );

    ctx.rotate(

        (
            t.rotate *
            Math.PI
        ) / 180

    );

    ctx.scale(

        t.scale,

        t.scale

    );

    ctx.drawImage(

        img,

        -t.offsetX,

        -t.offsetY

    );

    ctx.restore();

}
