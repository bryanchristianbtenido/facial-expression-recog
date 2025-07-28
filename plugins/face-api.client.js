import * as faceapi from 'face-api.js'

export default async (_, inject) => {
  const MODEL_URL = '/models'

  // Load the necessary models
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
  ])

  // Inject faceapi globally as $faceapi
  inject('faceapi', faceapi)
}
