import axios from 'axios';

const visionApi = axios.create({
  baseURL: 'https://vision.foodvisor.io/api',
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_FOODVISION_KEY}`,
  },
});

export const visionService = {
  async analyzeFood(imageUri: string) {
    const formData = new FormData();

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'food.jpg',
    } as any);

    try {
      const res = await visionApi.post('/analysis/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return res.data;
    } catch (e) {
      console.log('Food Vision API error:', e);
      return null;
    }
  },
};