import axios from 'axios';

const aiApi = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
  },
});

export const aiService = {
  async generateMealAdvice(context: string) {
    const res = await aiApi.post('/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a nutrition coach.' },
        { role: 'user', content: context },
      ],
    });

    return res.data.choices[0].message.content;
  },
};