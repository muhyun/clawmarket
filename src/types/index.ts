export interface User {
  id: string;
  email: string;
  username: string;
  avatar_seed: string;
  bio: string;
  created_at: number;
}

export interface Artifact {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  tags: string[];
  skills: string[];
  personality: ClawPersonality;
  file_path?: string;
  preview_config: PreviewConfig;
  download_count: number;
  is_published: boolean;
  created_at: number;
  updated_at: number;
  // Joined fields
  seller_username?: string;
  seller_avatar_seed?: string;
  avg_rating?: number;
  review_count?: number;
  is_purchased?: boolean;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  artifact_id: string;
  amount: number;
  status: string;
  created_at: number;
}

export interface Review {
  id: string;
  reviewer_id: string;
  artifact_id: string;
  rating: number;
  comment: string;
  created_at: number;
  reviewer_username?: string;
}

export type ClawPersonality = 'aggressive' | 'balanced' | 'defensive' | 'creative' | 'analytical' | 'helper';

export interface PreviewConfig {
  color?: string;
  speed?: number;
  pattern?: string;
  glowColor?: string;
  size?: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}
