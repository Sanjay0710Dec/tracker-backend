const {S3Client, GetObjectCommand,PutObjectCommand} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

 const s3 = new S3Client({
    region:bucketRegion,
    credentials:{
        accessKeyId:accessKey,
        secretAccessKey:secretAccessKey
    }
})
async function getSignedURL(key){
    const command = new GetObjectCommand({
        Bucket:bucketName,
        Key:key
    });
   try {
    const signedUrl = await getSignedUrl(s3,command);
    return signedUrl;
   } catch (error) {
        console.log(error.message);
        return null;
   }

}

async function getSignedURLToUpload (filename,fileType){
    const params = {
        Bucket:process.env.BUCKET_NAME,
        Key:filename,
        ContentType:fileType
        
    };
    const command = new PutObjectCommand(params);
    try {
        const signedUrl = await getSignedUrl(s3,command,{expiresIn:120});
        return signedUrl;
    } catch (error) {
         console.log(error.message);
         return null;
    }
}

module.exports = {
    s3,
    getSignedURL,
    getSignedURLToUpload
};

