/**
 * Curated initial items matching the Frontend Mentor challenge and design preview.
 * Provides instant (<1s) guest experience without waiting for 19 remote network fetches on cold start.
 */
export const INITIAL_CURATED_ITEMS = [
  {
    id: 'smash-colorblind-1',
    title: 'Practical Guide To Designing For Colorblind Users',
    feedTitle: 'Smashing Magazine',
    category: 'Design',
    author: 'Vitaly Friedman',
    link: 'https://www.smashingmagazine.com/2024/01/colorblind-users-guide/',
    isoDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    relativeTime: '2h ago',
    excerpt: 'Color blindness affects roughly 8% of men and 0.5% of women worldwide. Yet most interfaces rely heavily on color to convey meaning, status, and hierarchy. Here\'s how to design interfaces that work for everyone without sacrificing visual richness.',
    content: `<h2>Designing with Color Independence</h2><p>Color blindness affects roughly 8% of men and 0.5% of women worldwide. Yet most interfaces rely heavily on color to convey meaning, status, and hierarchy.</p><p>When designing forms, error messages, and interactive graphs, never rely solely on hue. Pair color indicators with distinctive iconography, text labels, and border styles.</p><h3>Key Rules to Follow</h3><ul><li>Always provide dual cues (icon + color).</li><li>Ensure high contrast ratios (minimum 4.5:1 for normal text).</li><li>Test your designs with simulated deuteranopia and protanopia filters.</li></ul>`
  },
  {
    id: 'cf-edge-cache-2',
    title: 'How We Reduced P99 Latency by 60% with Edge-First Caching',
    feedTitle: 'Cloudflare Blog',
    category: 'Backend & DevOps',
    author: 'Cloudflare Systems Team',
    link: 'https://blog.cloudflare.com/edge-first-caching-p99/',
    isoDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    relativeTime: '3h ago',
    excerpt: 'Our engineering team spent the last quarter rethinking how we cache at the edge. The result: dramatically lower tail latency for our most demanding customers, and lessons applicable to any distributed system.',
    content: `<h2>Rethinking Cache Invalidation at Scale</h2><p>Our engineering team spent the last quarter rethinking how we cache at the edge. The result: dramatically lower tail latency for our most demanding customers, and lessons applicable to any distributed system.</p><p>By leveraging Tiered Cache topology with localized cache keys, we cut origin round-trips by over 80%.</p>`
  },
  {
    id: 'simon-rag-prod-3',
    title: 'Building Effective RAG Systems: What Actually Works in Production',
    feedTitle: 'Simon Willison',
    category: 'AI & ML',
    author: 'Simon Willison',
    link: 'https://simonwillison.net/2024/rag-in-production/',
    isoDate: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    relativeTime: '4h ago',
    excerpt: 'After months of experimenting with retrieval-augmented generation in real applications, here\'s what I\'ve learned about chunking strategies, embedding models, and the surprising importance of metadata filtering.',
    content: `<h2>RAG Beyond the Toy Examples</h2><p>After months of experimenting with retrieval-augmented generation in real applications, here\'s what I\'ve learned about chunking strategies, embedding models, and the surprising importance of metadata filtering.</p><p>Small semantic chunks with sliding context windows outperform giant document blocks every single time.</p>`
  },
  {
    id: 'josh-container-queries-4',
    title: 'The Surprising Truth About CSS Container Queries',
    feedTitle: 'Josh Comeau',
    category: 'Frontend',
    author: 'Josh W. Comeau',
    link: 'https://www.joshwcomeau.com/css/container-queries/',
    isoDate: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    relativeTime: '5h ago',
    excerpt: 'Container queries have been available for a while now, but most developers are still using them like media queries with a different syntax. There\'s a much more powerful mental model that unlocks truly reusable components.',
    content: `<h2>Thinking in Components, Not Viewports</h2><p>Container queries have been available for a while now, but most developers are still using them like media queries with a different syntax. There\'s a much more powerful mental model that unlocks truly reusable components.</p><p>When an element responds to its parent container\'s width instead of the entire screen, you achieve truly modular design systems.</p>`
  }
];

// Helper to generate representative items to fulfill the 47 unread items from the design preview
export function generateCuratedDashboardItems() {
  const items = [...INITIAL_CURATED_ITEMS];

  const feedsDistribution = [
    { title: 'CSS-Tricks', category: 'Frontend', count: 3, baseTitle: 'Modern CSS Layouts and Tricks' },
    { title: 'Smashing Mag', category: 'Frontend', count: 3, baseTitle: 'Web Performance Optimization Strategies' },
    { title: 'Josh Comeau', category: 'Frontend', count: 1, baseTitle: 'Understanding CSS Stacking Contexts' },
    { title: 'Kent C. Dodds', category: 'Frontend', count: 2, baseTitle: 'Remix vs Next: Server Components Deep Dive' },
    { title: 'web.dev', category: 'Frontend', count: 3, baseTitle: 'Baseline 2026: Web Platform Features' },
    { title: 'MDN Blog', category: 'Frontend', count: 2, baseTitle: 'JavaScript Temporal API Guide' },
    { title: 'Sidebar.io', category: 'Design', count: 4, baseTitle: 'Curated 5 Best Design Links of the Day' },
    { title: 'NN Group', category: 'Design', count: 2, baseTitle: 'Usability Heuristics for Complex Dashboards' },
    { title: 'Figma Blog', category: 'Design', count: 2, baseTitle: 'Variables and Advanced Prototyping Systems' },
    { title: 'UX Collective', category: 'Design', count: 2, baseTitle: 'Why Calm Software is the Future of UI' },
    { title: 'Cloudflare Blog', category: 'Backend & DevOps', count: 2, baseTitle: 'Deploying Distributed Key-Value at the Edge' },
    { title: 'Vercel Blog', category: 'Backend & DevOps', count: 2, baseTitle: 'Incremental Static Regeneration at Scale' },
    { title: 'The GitHub Blog', category: 'Backend & DevOps', count: 2, baseTitle: 'Securing Software Supply Chains with CI/CD' },
    { title: 'Netlify Blog', category: 'Backend & DevOps', count: 1, baseTitle: 'Next-Gen Edge Functions Architecture' },
    { title: 'The Pragmatic Engineer', category: 'General Tech', count: 3, baseTitle: 'Inside Big Tech Engineering Performance Reviews' },
    { title: 'Hacker News Best', category: 'General Tech', count: 3, baseTitle: 'Show HN: The Minimalist Terminal Browser' },
    { title: 'Simon Willison', category: 'AI & ML', count: 3, baseTitle: 'Running Local LLMs with WebGPU in Browser' },
    { title: 'Hugging Face Blog', category: 'AI & ML', count: 4, baseTitle: 'Open Source Vision-Language Models Benchmark' }
  ];

  let idCounter = 5;
  for (const feed of feedsDistribution) {
    for (let i = 1; i <= feed.count; i++) {
      const hoursAgo = Math.floor(idCounter * 1.5);
      items.push({
        id: `item-gen-${idCounter}`,
        title: `${feed.baseTitle} #${i}`,
        feedTitle: feed.title,
        category: feed.category,
        author: 'Staff Writer',
        link: 'https://example.com/article/' + idCounter,
        isoDate: new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString(),
        relativeTime: hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`,
        excerpt: `A comprehensive overview of ${feed.baseTitle.toLowerCase()} with production insights, architectural diagrams, and real-world benchmarks.`,
        content: `<p>A comprehensive overview of ${feed.baseTitle.toLowerCase()} with production insights, architectural diagrams, and real-world benchmarks.</p>`
      });
      idCounter++;
    }
  }

  return items;
}
