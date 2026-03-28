/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/gigs", destination: "/browse", permanent: true },
      { source: "/gigs/:id", destination: "/gig/:id", permanent: true },
      { source: "/freelancers/:id", destination: "/freelancer/:id", permanent: true },
      { source: "/dashboard/freelancer", destination: "/freelancer/dashboard", permanent: false },
      { source: "/dashboard/freelancer/gigs", destination: "/freelancer/browse-gigs", permanent: false },
      { source: "/dashboard/freelancer/applications", destination: "/freelancer/proposals", permanent: false },
      { source: "/dashboard/freelancer/orders", destination: "/freelancer/contracts", permanent: false },
      { source: "/freelancer/my-proposals", destination: "/freelancer/proposals", permanent: false },
      { source: "/freelancer/active-contracts", destination: "/freelancer/contracts", permanent: false },
      { source: "/dashboard/freelancer/earnings", destination: "/freelancer/earnings", permanent: false },
      { source: "/dashboard/freelancer/messages", destination: "/freelancer/messages", permanent: false },
      { source: "/dashboard/freelancer/notifications", destination: "/freelancer/notifications", permanent: false },
      { source: "/dashboard/business", destination: "/business/dashboard", permanent: false },
      { source: "/dashboard/business/post-gig", destination: "/business/post-gig", permanent: false },
      { source: "/dashboard/business/my-gigs", destination: "/business/my-gigs", permanent: false },
      { source: "/dashboard/business/applicants", destination: "/business/applications", permanent: false },
      { source: "/dashboard/business/orders", destination: "/business/contracts", permanent: false },
      { source: "/dashboard/business/messages", destination: "/business/messages", permanent: false },
      { source: "/dashboard/business/payments", destination: "/business/billing", permanent: false },
      { source: "/dashboard/business/reviews", destination: "/business/reviews", permanent: false },
      { source: "/dashboard/business/profile", destination: "/business/profile", permanent: false },
      { source: "/dashboard/business/notifications", destination: "/business/notifications", permanent: false },
      { source: "/dashboard/admin", destination: "/admin/dashboard", permanent: false },
      { source: "/dashboard/admin/messages", destination: "/admin/messages", permanent: false },
      { source: "/dashboard/admin/notifications", destination: "/admin/notifications", permanent: false },
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
