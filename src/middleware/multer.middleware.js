const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage:storage,
    limits:{
        fileSize:'10MB'
    }
});

module.exports = upload;

