import { BlogPost } from '../../types';
import { providers } from './providers';

export const blogCategories = [
  { id: 'cat-1', name: 'Mental Health', slug: 'mental-health' },
  { id: 'cat-2', name: 'Wellness', slug: 'wellness' },
  { id: 'cat-3', name: 'Nutrition', slug: 'nutrition' },
  { id: 'cat-4', name: 'Lifestyle', slug: 'lifestyle' },
  { id: 'cat-5', name: 'Design', slug: 'design' },
  { id: 'cat-6', name: 'Product', slug: 'product' }
];

export const blogs: BlogPost[] = [
  {
    id: 'blog-1',
    slug: 'science-of-sleep',
    title: 'The Science of Sleep: Why It Matters for Mental Health',
    summary: 'Understanding the bidirectional relationship between sleep quality and emotional regulation. Practical tips for better rest.',
    content: `
      <p>Sleep is not just a passive state of rest; it is an active period of neurological repair and cognitive consolidation. When we drift into slumber, our bodies initiate a series of complex physiological processes that are fundamental to our mental well-being and emotional regulation. In this comprehensive exploration, we will delve into the science of sleep and its profound impact on mental health.</p>

      <h2 id="the-biological-clock">The Biological Clock: Circadian Rhythms</h2>
      <p>Every human body operates on an internal biological clock known as the circadian rhythm. This 24-hour cycle regulates everything from body temperature to hormone release. The master clock, located in the suprachiasmatic nucleus of the brain, is highly sensitive to light cues. This is why exposure to morning sunlight is crucial for setting your internal pace, while evening exposure to blue light can severely disrupt your sleep onset.</p>
      <p>When our circadian rhythms are misaligned—whether through shift work, jet lag, or poor sleep hygiene—our mental health suffers. Disrupted rhythms are linked to increased rates of bipolar disorder flare-ups, seasonal affective disorder, and generalized anxiety.</p>

      <h2 id="the-architecture-of-sleep">The Architecture of Sleep: Beyond REM</h2>
      <p>Sleep is divided into two main types: Non-Rapid Eye Movement (NREM) and Rapid Eye Movement (REM) sleep. NREM sleep is further categorized into three stages, with Stage 3 being the deepest and most restorative phase, often called "slow-wave sleep."</p>
      <h3>NREM Stage 3: Physical Restoration</h3>
      <p>During deep NREM sleep, the body focuses on physical repair. Growth hormone is released, and the immune system strengthens its defenses. For the brain, this is also the period when the glymphatic system—the brain's waste clearance mechanism—becomes most active, literally "washing away" metabolic waste products that accumulate during waking hours.</p>
      <h3>REM Sleep: The Emotional Workshop</h3>
      <p>REM sleep is where the magic of emotional regulation happens. It is the only time our brain is completely devoid of the anxiety-triggering molecule noradrenaline. This allows us to process difficult, even traumatic, memories in a safe, neurochemically calm environment. Individuals who are deprived of REM sleep are significantly more likely to misinterpret neutral facial expressions as hostile and are less capable of social empathy.</p>

      <h2 id="the-bidirectional-link">The Bidirectional Link</h2>
      <p>The relationship between sleep and mental health is bidirectional: poor sleep can contribute to the development of mental health issues, and mental health issues can, in turn, make it harder to sleep. Chronic insomnia, for instance, is a known risk factor for developing depression and anxiety disorders.</p>
      <blockquote>
        "Sleep is the single most effective thing we can do to reset our brain and body health each day — our mother nature's best effort yet at contra-death." 
        <br/>— Dr. Matthew Walker, Why We Sleep
      </blockquote>

      <h2 id="sleep-and-modern-stress">Sleep in the Age of Modern Stress</h2>
      <p>In our hyper-connected world, the boundary between "on" and "off" has blurred. The "always-on" culture is a direct assault on our sleep health. Cortisol, the primary stress hormone, is the natural antagonist of melatonin. When we are stressed late into the evening, our cortisol levels remain elevated, preventing the natural rise of melatonin required for sleep.</p>
      <p>This creates a vicious cycle: stress prevents sleep, and lack of sleep reduces our ability to handle stress, leading to further sleep disruption. Breaking this cycle requires intentional, consistent sleep hygiene practices that treat rest as a non-negotiable pillar of productivity.</p>

      <h2 id="practical-strategies">Practical Strategies for Deep Restoration</h2>
      <p>Improving sleep quality doesn't always require medical intervention. Often, small environmental and behavioral shifts can yield massive dividends for your mental clarity and emotional stability.</p>
      <ul>
        <li><strong>Temperature Control:</strong> Your body needs to drop its core temperature by about 2-3 degrees Fahrenheit to initiate sleep. Aim for a bedroom temperature around 65°F (18°C).</li>
        <li><strong>Darkness is Key:</strong> Invest in blackout curtains and avoid all screens at least 90 minutes before bed. If you must use a device, enable red-light filters.</li>
        <li><strong>The 3-2-1 Rule:</strong> No food 3 hours before bed, no work 2 hours before bed, and no screens 1 hour before bed.</li>
        <li><strong>Consistency:</strong> The brain thrives on predictability. Going to bed and waking up at the same time every day stabilizes your circadian rhythm.</li>
      </ul>

      <h2 id="the-future-of-sleep">The Future of Sleep Science</h2>
      <p>We are just beginning to understand the long-term implications of sleep deprivation on neurodegenerative diseases like Alzheimer's. Research suggests that chronic lack of deep NREM sleep may prevent the clearance of beta-amyloid plaques, a hallmark of the disease. Therefore, sleep is not just about feeling good tomorrow; it is about protecting your cognitive legacy for decades to come.</p>
      <p>In conclusion, prioritizing sleep is perhaps the most courageous act of self-care available to us. It requires setting boundaries with our work, our technology, and our own racing thoughts. But the reward—a resilient brain and a balanced heart—is worth every effort.</p>
    `,
    category: 'Wellness',
    authorName: 'Dr. Sarah Chen',
    authorRole: 'Clinical Psychologist',
    authorImage: providers[1].imageUrl,
    readTime: '6 min read',
    imageUrl: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Oct 12, 2023',
    status: 'APPROVED',
    isFeatured: true,
    providerId: providers[1].id
  },
  {
    id: 'blog-2',
    slug: 'nutrition-and-mood',
    title: 'Gut-Brain Axis: How Food Affects Your Mood',
    summary: 'Exploring the connection between the microbiome and neurotransmitter production. What to eat for better mental clarity.',
    content: `
      <p>It’s often said that the gut is the "second brain." This isn't just a metaphor; the enteric nervous system contains more neurons than the spinal cord. Perhaps more surprisingly, about 95% of your body's serotonin—the neurotransmitter responsible for mood regulation—is produced in your gastrointestinal tract.</p>
      <h2>The Vagus Nerve Connection</h2>
      <p>The gut and the brain communicate constantly via the vagus nerve. This bidirectional highway means that the state of your microbiome can directly influence your stress levels, clarity of thought, and overall emotional state.</p>
      <h2>Top Foods for Mental Clarity</h2>
      <ol>
        <li><strong>Leafy Greens:</strong> Packed with folate, which helps produce dopamine.</li>
        <li><strong>Fatty Fish:</strong> Rich in Omega-3s, essential for brain cell structure.</li>
        <li><strong>Fermented Foods:</strong> Yogurt, kimchi, and kefir provide beneficial probiotics.</li>
        <li><strong>Berries:</strong> High in antioxidants that protect brain cells from oxidative stress.</li>
      </ol>
      <p>When we choose whole, nutrient-dense foods, we are providing the raw materials our brain needs to function at its peak. Mental health starts on your plate.</p>
    `,
    category: 'Nutrition',
    authorName: 'James Wilson',
    authorRole: 'Clinical Nutritionist',
    authorImage: providers[4].imageUrl,
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Nov 05, 2023',
    status: 'APPROVED',
    providerId: providers[4].id
  },
  {
    id: 'blog-3',
    slug: 'mindfulness-at-work',
    title: 'Micro-Mindfulness for Busy Professionals',
    summary: 'You don\'t need 20 minutes to meditate. Learn how 30-second resets can lower cortisol levels instantly.',
    content: '<p>Stress in the corporate world is endemic...</p>',
    category: 'Lifestyle',
    authorName: 'Elena Vance',
    authorRole: 'Wellness Coach',
    authorImage: providers[3].imageUrl,
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Dec 01, 2023',
    status: 'PENDING',
    providerId: providers[3].id
  },
  {
    id: 'blog-4',
    slug: 'understanding-trauma',
    title: 'Understanding Complex Trauma',
    summary: 'Distinguishing between PTSD and C-PTSD, and the pathways to recovery through somatic experiencing.',
    content: '<p>Trauma is not just in the event, but in the nervous system...</p>',
    category: 'Mental Health',
    authorName: 'Dr. Marcus Thorne',
    authorRole: 'Psychiatrist',
    authorImage: providers[2].imageUrl,
    readTime: '8 min read',
    imageUrl: 'https://images.unsplash.com/photo-1620065406085-7d8d21b5f7e6?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Jan 10, 2024',
    status: 'APPROVED',
    providerId: providers[2].id
  },
  {
    id: 'blog-5',
    slug: 'benefits-of-coaching',
    title: 'Therapy vs. Coaching: Which Do You Need?',
    summary: 'A breakdown of the differences between clinical therapy and goal-oriented coaching.',
    content: '<p>While therapy often looks back to heal, coaching looks forward to build...</p>',
    category: 'Wellness',
    authorName: 'Elena Vance',
    authorRole: 'Wellness Coach',
    authorImage: providers[3].imageUrl,
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Feb 15, 2024',
    status: 'APPROVED',
    providerId: providers[3].id
  },
  {
    id: 'blog-6',
    slug: 'digital-detox',
    title: 'The Art of the Digital Detox',
    summary: 'Reclaiming your attention span in an economy designed to distract you.',
    content: '<p>Screen time is correlated with higher rates of anxiety...</p>',
    category: 'Lifestyle',
    authorName: 'EvoWell Editorial',
    authorRole: 'Admin',
    authorImage: 'https://i.pravatar.cc/150?u=admin',
    readTime: '4 min read',
    imageUrl: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&q=80&w=800',
    publishedAt: 'Mar 01, 2024',
    status: 'APPROVED'
  }
];
