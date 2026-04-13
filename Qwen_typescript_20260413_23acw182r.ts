export interface FoodContent {
  caption: string;
  hashtags: string[];
  photographyTips: string[];
  mood: string;
}

export interface HistoryItem {
  id: string;
  dish: string;
  result: FoodContent;
  createdAt: string;
}