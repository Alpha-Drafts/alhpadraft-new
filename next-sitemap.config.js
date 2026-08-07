/** @type {import('next-sitemap').IConfig} */

module.exports = {
  siteUrl: process.env.SITE_URL || "https://alphadrafts.com",
  generateRobotsTxt: false, // We manage robots.txt manually
  exclude: [
    "/dashboard",
    "/dashboard/**",
    "/api/**",
    "/auth",
    "/auth/**",
    "/unauthorised",
    "/404",
    "/500",
  ],
  transform: async (config, path) => {
    // Custom priority and changefreq per path
    const priorities = {
      "/": { priority: 1.0, changefreq: "weekly" },
      "/privacy": { priority: 0.3, changefreq: "yearly" },
      "/terms": { priority: 0.3, changefreq: "yearly" },
    };

    const custom = priorities[path] || {
      priority: 0.5,
      changefreq: "monthly",
    };

    return {
      loc: path,
      changefreq: custom.changefreq,
      priority: custom.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
