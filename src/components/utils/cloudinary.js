const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME


export const uploadImage = async (file) => {
  // console.log("Upload preset, cloud name", UPLOAD_PRESET, CLOUD_NAME);
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  })

  console.log("response", JSON.stringify(response));

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = await response.json()
  return data.secure_url
}

