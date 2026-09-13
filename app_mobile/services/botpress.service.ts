// ⚠️ À déplacer côté backend (Supabase Edge Function) avant la mise en production
const BASE = 'https://api.botpress.cloud/v1';
const API_KEY = 'bp_bak_oZ6v6DGAAtlikVvbx5i7I8zsBX0w4yKt9fdK';
const BOT_ID = '4a5582f9-da33-43e8-bc6f-bdab95e40b6c';

function makeHeaders(userKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${API_KEY}`,
    'x-bot-id': BOT_ID,
    'x-user-key': userKey,
    'Content-Type': 'application/json',
  };
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export interface BotpressSession {
  conversationId: string;
  userId: string;
}

export const botpressService = {
  async createSession(userKey: string): Promise<BotpressSession> {
    // 1. Créer l'utilisateur
    const userRes = await fetch(`${BASE}/chat/users`, {
      method: 'POST',
      headers: makeHeaders(userKey),
      body: JSON.stringify({ tags: {}, integrationName: 'webchat' }),
    });
    const userData = await userRes.json();
    console.log('[Botpress] user:', JSON.stringify(userData));
    const userId = userData.user?.id ?? userData.id;

    // 2. Créer la conversation
    const convRes = await fetch(`${BASE}/chat/conversations`, {
      method: 'POST',
      headers: makeHeaders(userKey),
      body: JSON.stringify({ integrationAlias: 'webchat', tags: {} }),
    });
    const convData = await convRes.json();
    console.log('[Botpress] conversation:', JSON.stringify(convData));
    const conversationId = convData.conversation?.id ?? convData.id;

    return { conversationId, userId };
  },

  async sendMessage(session: BotpressSession, text: string, userKey: string): Promise<void> {
    const res = await fetch(`${BASE}/chat/messages`, {
      method: 'POST',
      headers: makeHeaders(userKey),
      body: JSON.stringify({
        conversationId: session.conversationId,
        userId: session.userId,
        type: 'text',
        payload: { type: 'text', text },
        tags: {},
      }),
    });
    const data = await res.json();
    console.log('[Botpress] sendMessage:', JSON.stringify(data));
  },

  async listMessages(session: BotpressSession, userKey: string): Promise<any[]> {
    const res = await fetch(`${BASE}/chat/messages?conversationId=${session.conversationId}`, {
      headers: makeHeaders(userKey),
    });
    const data = await res.json();
    return data.messages ?? [];
  },

  async waitForResponse(session: BotpressSession, userKey: string, afterMs: number): Promise<string | null> {
    for (let i = 0; i < 20; i++) {
      await delay(700);
      const messages = await this.listMessages(session, userKey);

      if (i === 0) {
        console.log('[Botpress] messages:', JSON.stringify(messages.slice(-3), null, 2));
      }

      const botMsg = messages
        .filter(m => {
          const ts = new Date(m.createdAt).getTime();
          return ts > afterMs && m.userId !== session.userId;
        })
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

      if (botMsg) {
        console.log('[Botpress] bot message:', JSON.stringify(botMsg));
        const text = botMsg.payload?.text ?? botMsg.payload?.message ?? botMsg.text ?? '';
        if (text) return text;
      }
    }
    console.log('[Botpress] no response after 20 attempts');
    return null;
  },
};
