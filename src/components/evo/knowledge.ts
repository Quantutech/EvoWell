import { Recommendation } from './types';

export const KNOWLEDGE_BASE: Record<string, Recommendation[]> = {
  Partner: [
    {
      id: 'partner-intro',
      type: 'article',
      title: 'Partner with EvoWell',
      description: 'Join our ecosystem of integrated care providers and wellness organizations.',
      tags: ['B2B', 'Integration'],
      languages: ['English'],
      url: '#/partners',
      match_reasons: ['You identified as a potential Partner.'],
      availability: 'Always available',
      cost: 'free'
    },
    {
      id: 'partner-api',
      type: 'resource',
      title: 'API Documentation',
      description: 'Technical guides for integrating with our health data layer.',
      tags: ['Tech', 'API'],
      languages: ['English'],
      url: '#/docs',
      match_reasons: ['Technical integration resources.'],
      availability: 'Always available',
      cost: 'free'
    }
  ],
  Investor: [
    {
      id: 'investor-deck',
      type: 'article',
      title: 'Investment Thesis',
      description: 'Understanding the future of mental health infrastructure.',
      tags: ['Finance', 'Strategy'],
      languages: ['English'],
      url: '#/investors',
      match_reasons: ['You identified as an Investor.'],
      availability: 'Request Access',
      cost: 'free'
    },
    {
      id: 'investor-metrics',
      type: 'article',
      title: 'Impact Metrics',
      description: 'Quarterly reports on patient outcomes and provider growth.',
      tags: ['Data', 'Impact'],
      languages: ['English'],
      url: '#/about',
      match_reasons: ['Key performance indicators.'],
      availability: 'Public',
      cost: 'free'
    }
  ],
  Provider: [
    {
      id: 'provider-benefits',
      type: 'article',
      title: 'Why Join EvoWell?',
      description: 'Comprehensive support for your private practice.',
      tags: ['Career', 'Growth'],
      languages: ['English'],
      url: '#/benefits',
      match_reasons: ['You are a Provider.'],
      availability: 'Always available',
      cost: 'free'
    },
    {
      id: 'provider-calc',
      type: 'resource',
      title: 'Income Calculator',
      description: 'Estimate your earnings with our optimized booking system.',
      tags: ['Finance', 'Tool'],
      languages: ['English'],
      url: '#/calculator',
      match_reasons: ['Financial planning tools.'],
      availability: 'Interactive',
      cost: 'free'
    }
  ]
};
