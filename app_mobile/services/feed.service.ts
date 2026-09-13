import axios from 'axios';
import type { Comment, Post } from '@/types';

const reddit = axios.create({ timeout: 12000, headers: { 'User-Agent': 'HealthAI/1.0' } });
const ruApi  = axios.create({ baseURL: 'https://randomuser.me/api', timeout: 10000 });

const SUBREDDITS = ['fitness', 'nutrition', 'wellness', 'loseit', 'EatHealthy', 'HealthyFood', 'running'];
const AVATAR_COLORS = ['#2EC4B6', '#5A627B', '#9A4520', '#4C9AFF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// ─── Cache des profils RandomUser ─────────────────────────────────────────────
let cachedProfiles: RandomProfile[] = [];

interface RandomProfile {
  id:        string;
  name:      string;
  initials:  string;
  avatar:    string;
  color:     string;
  followers: number;
  following: number;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getProfiles(count: number): Promise<RandomProfile[]> {
  if (cachedProfiles.length >= count) return cachedProfiles;
  const res = await ruApi.get(`/?results=${count}&inc=name,picture,login&nat=us,gb,au,ca`);
  cachedProfiles = res.data.results.map((u: any, i: number) => {
    const name = `${u.name.first} ${u.name.last}`;
    return {
      id:        u.login.uuid,
      name,
      initials:  `${u.name.first[0]}${u.name.last[0]}`.toUpperCase(),
      avatar:    u.picture.medium,
      color:     AVATAR_COLORS[i % AVATAR_COLORS.length],
      followers: randInt(120, 12000),
      following: randInt(40, 600),
    };
  });
  return cachedProfiles;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(utc: number): string {
  const diff = Math.floor((Date.now() / 1000 - utc) / 3600);
  if (diff < 1)  return 'less than 1h ago';
  if (diff < 24) return `${diff}h ago`;
  const days = Math.floor(diff / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

function extractImageUrl(p: any): string | undefined {
  // Post de type image direct
  if (p.post_hint === 'image' && p.url && /\.(jpg|jpeg|png|webp)/i.test(p.url)) {
    return p.url;
  }
  // Preview Reddit (HTML-encoded, il faut décoder &amp;)
  const src = p.preview?.images?.[0]?.source?.url;
  if (src) return src.replace(/&amp;/g, '&');
  return undefined;
}

function mapPost(p: any, profile: RandomProfile): Post {
  const body = p.selftext?.trim()
    ? p.selftext.slice(0, 300) + (p.selftext.length > 300 ? '…' : '')
    : p.title;

  return {
    id:                `${p.subreddit}_${p.id}`,
    authorId:          profile.id,
    authorName:        profile.name,
    authorInitials:    profile.initials,
    authorAvatarColor: profile.color,
    authorAvatar:      profile.avatar,
    authorFollowers:   profile.followers,
    authorFollowing:   profile.following,
    timeAgo:           timeAgo(p.created_utc),
    body,
    imageUrl:          extractImageUrl(p),
    tags:              [`#${p.subreddit.toLowerCase()}`, ...(p.link_flair_text ? [`#${p.link_flair_text.replace(/\s+/g, '')}`] : [])],
    likes:             p.score,
    comments:          p.num_comments,
    liked:             false,
    saved:             false,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const feedService = {
  async getPosts(_filter?: string): Promise<Post[]> {
    const [postsResults, profiles] = await Promise.all([
      // Tous les subreddits en parallèle, 25 posts chacun
      Promise.all(
        SUBREDDITS.map(sub =>
          reddit
            .get(`https://www.reddit.com/r/${sub}/hot.json?limit=100`)
            .then(r => r.data.data.children.map((c: any) => ({ ...c.data, subreddit: sub })))
            .catch(() => [])
        )
      ),
      getProfiles(20),
    ]);

    const all = postsResults
      .flat()
      .filter((p: any) => !p.stickied && (p.selftext?.trim() || p.title))
      // Retirer les posts NSFW
      .filter((p: any) => !p.over_18)
      // Trier par score décroissant
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 100);

    return all.map((p: any, i: number) => mapPost(p, profiles[i % profiles.length]));
  },

  async likePost(_postId: string): Promise<void> {},
  async savePost(_postId: string): Promise<void> {},

  async createPost(body: string, tags: string[]): Promise<Post> {
    const profile = cachedProfiles[0] ?? {
      id: 'me', name: 'Me', initials: 'ME', avatar: '', color: AVATAR_COLORS[0],
    };
    return {
      id:               'local_' + Date.now(),
      authorId:         'me',
      authorName:       profile.name,
      authorInitials:   profile.initials,
      authorAvatarColor: profile.color,
      authorAvatar:     profile.avatar,
      timeAgo:          'just now',
      body,
      tags,
      likes:    0,
      comments: 0,
      liked:    false,
      saved:    false,
    };
  },

  async getComments(postId: string): Promise<Comment[]> {
    const underscore = postId.indexOf('_');
    const subreddit = postId.slice(0, underscore);
    const redditId  = postId.slice(underscore + 1);
    try {
      const res = await reddit.get(
        `https://www.reddit.com/r/${subreddit}/comments/${redditId}.json?limit=20&depth=1`
      );
      const children = res.data[1].data.children as any[];
      return children
        .filter(c => c.kind === 't1' && c.data.body && c.data.body !== '[deleted]')
        .slice(0, 20)
        .map(c => ({
          id:               c.data.id,
          authorId:         c.data.author,
          authorName:       'u/' + c.data.author,
          authorInitials:   c.data.author.slice(0, 2).toUpperCase(),
          body:             c.data.body,
          timeAgo:          timeAgo(c.data.created_utc),
          likes:            c.data.score,
        }));
    } catch {
      return [];
    }
  },
};
