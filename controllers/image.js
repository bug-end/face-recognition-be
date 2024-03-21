const returnClarifaiRequestOptions = (imageUrl) => {
  const IMAGE_URL = imageUrl;

  const raw = JSON.stringify({
    user_app_id: {
      user_id: process.env.CLARIFAI_USER_ID,
      app_id: process.env.CLARIFAI_APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
          },
        },
      },
    ],
  });

  const requestOptions = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Key ' + process.env.CLARIFAI_PAT,
    },
    body: raw,
  };

  return requestOptions;
};

export const handleApiCall = (req, res) => {
  const { input } = req.body;
  fetch(
    'https://api.clarifai.com/v2/models/' + process.env.CLARIFAI_MODEL_ID + '/outputs',
    returnClarifaiRequestOptions(input)
  )
    .then((response) => response.json())
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(400).json('unable to work with API'));
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
