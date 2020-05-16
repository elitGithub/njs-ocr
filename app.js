const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const { createWorker, PSM } = require('tesseract.js');
const worker = createWorker();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage}).single('avatar');
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index');
});
app.post('/upload', (req, res) => {
    let returnedText = '';
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {

            if (err) {
                return console.log('This is our error', err);
            }
            (async () => {
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                await worker.setParameters({
                    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
                });
                const { data: { text } } = await worker.recognize(data);
                returnedText = text;
                await worker.terminate();
            })();
        });
    });
});

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey I'm running on port ${PORT} `));
