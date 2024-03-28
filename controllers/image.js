import dotenv from 'dotenv';
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';

dotenv.config();

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set('authorization', `Key ${process.env.CLARIFAI_PAT}`);

export const handleApiCall = (req, res) => {
  const { input } = req.body;

  stub.PostModelOutputs(
    {
      model_id: 'face-detection',
      user_app_id: {
        user_id: process.env.CLARIFAI_USER_ID,
        app_id: process.env.CLARIFAI_APP_ID,
      },
      inputs: [{ data: { image: { url: input } } }],
    },
    metadata,
    (err, response) => {
      if (err) {
        console.log('Error: ' + err);
        res.status(500).json('Internal Clarifai Server Error');
        return;
      }

      if (response.status.code !== 10000) {
        console.log('Received failed status: ' + response.status.description + '\n' + response.status.details);
        res.status(400).json(response.status.description);
        return;
      }
      res.json(response);
    }
  );
};

export const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => {
      res.json(entries[0].entries);
    })
    .catch((err) => res.status(400).json('unable to get entries'));
};
