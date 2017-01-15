const inDir = 'state/get/';
const outDir = 'state/transform/';
const tmpDir = 'state/tmp/';

const fs = require('fs');
const cheerio = require('cheerio');
const config = require('../config.json');
const imagemin = require('imagemin');
const imageminJpegoptim = require('imagemin-jpegoptim');
const imageminPngquant = require('imagemin-pngquant');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');


const log = function () { config.verbose && console.log.apply(console, arguments) };
const error = function () { config.verbose && console.error.apply(console, arguments) };

var getLanguage = function (fileName) {
    return fileName.split('_').pop().split('.')[0];
};

const copyFile = (fromPath, toPath) => {
    return fs.createReadStream(fromPath).pipe(fs.createWriteStream(toPath));
};

//Copy PNG files
copyFileWorker = (index, step, files) => { //TODO: Refactor using highland
    const fileName = files[index];
    if (!fileName) return;
    copyFile(inDir + fileName, outDir + fileName).on('close', function () {
        copyFileWorker(index + step, step, files);
    });
};

const files = fs.readdirSync(inDir).filter(fileName => fileName.split('.').pop() === 'png');

//This only does 10 at a time, most machines can do better
copyFileWorker(0, 10, files); //TODO: Refactor into a workerGenerator
copyFileWorker(1, 10, files);
copyFileWorker(2, 10, files);
copyFileWorker(3, 10, files);
copyFileWorker(4, 10, files);
copyFileWorker(5, 10, files);
copyFileWorker(6, 10, files);
copyFileWorker(7, 10, files);
copyFileWorker(8, 10, files);
copyFileWorker(9, 10, files);



const extractBase64 = (fileName, html) => {
    const b64files = html.match(/( src=)?"data:([A-Za-z-+\/]+);base64,[^"]*/g);

    return b64files.reduce((html, b64, index) => {
        const isInSrc = b64.slice(0, 6) === ' src="';
        b64 = b64.slice(isInSrc ? 6 : 1);

        const split = b64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!split || split.length !== 3) {
            //log('No valid b64, continuing anyway.');
            return html;
        }

        const mimeType = split[1];
        if (!mimeType) {
            //log('No mimeType, continuing anyway.');
            return html;
        }

        const fileExt = mimeType.split('/').pop().split('+')[0];

        if (!split[2].length) return html;

        if (fileExt === 'ogg') return html;
        if (fileExt === 'mpeg') return html;
        //if (fileExt === 'gif') return html;
        //if (fileExt === 'jpeg') return html;
        //if (fileExt === 'png') return html;

        const isImage = mimeType.split('/')[0] === 'image';

        if (!isImage) console.log(mimeType);

        const kiwixPrefix = isInSrc ? '' : '../I/';

        html = html.replace(b64, `${kiwixPrefix}${fileName.replace('.html', '')}_${index}.${fileExt}`);
        fs.writeFileSync(`${tmpDir}${fileName.replace('.html', '')}_${index}.${fileExt}`, split[2], { encoding: 'base64' });
        fs.writeFileSync(`${outDir}${fileName}`, html, 'utf8');

        return html;
    }, html);
};


const filesByLanguage = fs.readdirSync(inDir).filter(fileName => fileName.split('.').pop() === 'html').
    reduce(function (acc, fileName) {
        var language = config.languageMappings[getLanguage(fileName)] || 'Misc';
        acc[language] = acc[language] || [];

        var html = fs.readFileSync(inDir + fileName, 'utf8');

        html = extractBase64(fileName, html);

        var $ = cheerio.load(html);
        var title = ($('meta[property="og:title"]').attr('content') || '');

        acc[language].push({
            displayName: title || fileName.split('_').slice(0, -1).join(' '),
            url: fileName,
            image: '../I/' + fileName.split('_')[0] + `-${config.imageResolution}.png`
        });
        return acc;
    }, {});

fs.writeFileSync(outDir + 'catalog.json', JSON.stringify({
    languageMappings: config.languageMappings,
    simsByLanguage: filesByLanguage
}), 'utf8');


const imageMinSlow = index => {
    imagemin([`${tmpDir}*_${index}.{jpg,jpeg,png,svg}`], outDir, {
        plugins: [
            imageminJpegoptim(),
            imageminPngquant({ quality: '65-80' }),
            imageminSvgo(),
            imageminGifsicle()
        ]
    }).then(files => {
        if (files.length) {
            imageMinSlow(index + 1);
        }
    }).catch(err => {
        const failedFile = err.message.match(/Error in file: (.*)/)[1].trim();
        console.log(err.message)
        fs.unlink(failedFile, () => {
            console.log('The following file is invalid and was deleted:', failedFile);
            imageMinSlow(index);
        });
    });
};
imageMinSlow(0);