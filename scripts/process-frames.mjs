import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Este script convierte una secuencia de imágenes JPG en WEBP optimizadas.

const INPUT_DIR = path.join(process.cwd(), 'raw_frames');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'frames');
const TARGET_WIDTH = 1440;
const WEBP_QUALITY = 65;
const WEBP_EFFORT = 6;

if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ Directorio de entrada '${INPUT_DIR}' no encontrado. Por favor créalo y coloca ahí tus .jpg (Ej: frame_0001.jpg a frame_0361.jpg)`);
    process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processFrames() {
    const files = fs.readdirSync(INPUT_DIR).filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.jpeg'));

    if (files.length === 0) {
        console.warn(`⚠️ No se encontraron imágenes .jpg/.jpeg en ${INPUT_DIR}`);
        return;
    }

    console.log(`🚀 Iniciando: Procesando ${files.length} frames...`);
    let count = 0;

    for (const file of files) {
        const inputPath = path.join(INPUT_DIR, file);
        // Extraemos el nombre sin extensión, ej "frame_0001"
        const baseName = path.basename(file, path.extname(file));
        const outputPath = path.join(OUTPUT_DIR, `${baseName}.webp`);

        await sharp(inputPath)
            .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
            .toFile(outputPath);

        count++;
        // Log de progreso amigable
        if (count % 20 === 0 || count === files.length) {
            console.log(`✅ Progreso: ${count}/${files.length} frames convertidos.`);
        }
    }

    console.log(`\n🎉 ¡Finalizado! Los frames optimizados se guardaron en: ${OUTPUT_DIR}`);
}

processFrames().catch(err => {
    console.error("❌ Error procesando los frames:", err);
});
