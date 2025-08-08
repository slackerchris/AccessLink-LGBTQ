import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Alert, Platform } from 'react-native';

// Pick an image or video from the device
export async function pickMediaAsync(mediaTypes: 'Images' | 'Videos' | 'All' = 'All') {
  let pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: mediaTypes === 'Images' ? ImagePicker.MediaTypeOptions.Images
      : mediaTypes === 'Videos' ? ImagePicker.MediaTypeOptions.Videos
      : ImagePicker.MediaTypeOptions.All,
    allowsEditing: false,
    quality: 0.8,
    selectionLimit: 1, // Only allow one file for now
  });
  if (pickerResult.canceled) return null;
  // Return the first asset (or all assets if you want multiple)
  if (pickerResult.assets && pickerResult.assets.length > 0) {
    return pickerResult.assets[0];
  }
  return null;
}

// Upload a file to Firebase Storage and return the download URL
export async function uploadMediaToFirebase(uri: string, folder: string = 'uploads') {
  try {
    const storage = getStorage();
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = uri.split('.').pop();
    const filename = `${folder}/${Date.now()}.${ext}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    Alert.alert('Upload Error', error.message || 'Failed to upload media.');
    return null;
  }
}
