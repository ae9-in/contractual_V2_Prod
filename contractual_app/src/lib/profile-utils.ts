export interface CompletenessItem {
  key: string;
  label: string;
  weight: number;
  isComplete: boolean;
}

export function computeProfileCompleteness(u: any): { 
  score: number; 
  items: CompletenessItem[]; 
  incomplete: CompletenessItem[]; 
} {
  const items: CompletenessItem[] = [
    { key: 'image', label: 'Avatar / Profile Picture', weight: 15, isComplete: !!u?.image },
    { key: 'headline', label: 'Professional Headline', weight: 10, isComplete: !!(u?.headline?.trim()) },
    { key: 'bio', label: 'Detailed Bio (50+ chars)', weight: 15, isComplete: (u?.bio?.trim()?.length ?? 0) >= 50 },
    { key: 'skills', label: '3+ Skills Added', weight: 15, isComplete: (u?.skills?.length ?? 0) >= 3 },
    { key: 'hourlyRate', label: 'Hourly Rate Set', weight: 10, isComplete: (u?.hourlyRate ?? 0) > 0 },
    { key: 'portfolio', label: '1+ Portfolio Item', weight: 15, isComplete: (u?.portfolio?.length ?? 0) >= 1 },
    { key: 'education', label: 'Education Info', weight: 10, isComplete: (u?.education?.length ?? 0) >= 1 },
    { key: 'experience', label: 'Experience History', weight: 10, isComplete: (u?.experience?.length ?? 0) >= 1 },
  ];

  const score = items.reduce((acc, it) => acc + (it.isComplete ? it.weight : 0), 0);
  const incomplete = items.filter(it => !it.isComplete);

  return { 
    score: Math.min(100, score), 
    items,
    incomplete
  };
}
