const CATEGORY_IMAGE_MAP: Record<string, string> = {
  development: "/images/categories/development.svg",
  design: "/images/categories/design.svg",
  writing: "/images/categories/writing.svg",
  marketing: "/images/categories/marketing.svg",
  video: "/images/categories/video.svg",
  "social media": "/images/categories/social-media.svg",
  seo: "/images/categories/seo.svg",
  "data & analytics": "/images/categories/data-analytics.svg",
  consulting: "/images/categories/consulting.svg",
  devops: "/images/categories/devops.svg",
}

export function getCategoryGigImage(category?: string | null): string {
  const key = (category ?? "").trim().toLowerCase()
  return CATEGORY_IMAGE_MAP[key] ?? "/images/categories/default.svg"
}

