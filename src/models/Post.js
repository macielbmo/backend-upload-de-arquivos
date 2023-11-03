const mongoose = require('mongoose');
const aws = require('@aws-sdk/client-s3');
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const s3 = new aws.S3({ region: 'sa-east-1' });

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.pre('save', function() {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`
    console.log(this.key)
  }
})

PostSchema.pre('deleteOne', { document: true, query: false }, async function() {
  const post = this; // Obtenha o documento Post
  const key = post.key;

  if (process.env.STORAGE_TYPE === 's3') {
    if (key) {
      console.log('Excluindo objeto do S3:', key);

      try {
        await s3.deleteObject({ Bucket: 'upload-photo-rota-aerea', Key: key });

        console.log('Objeto excluído com sucesso do S3:', key);
      } catch (error) {
        console.error('Erro ao excluir objeto do S3:', key, error);
        throw error; // Rejeita a exclusão no caso de um erro
      }
    } 
  } else {
      console.log("Teste, abriu o ELESE")
      console.log(key, post)
      return promisify(fs.unlink)(
      path.resolve(__dirname, '..', '..', 'temp', 'uploads', key)
    )
  }
});

module.exports = mongoose.model("Post", PostSchema)