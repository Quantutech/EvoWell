import React from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { PageHero, Section, Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardBody, Badge } from '../components/ui';

const PodcastsView: React.FC = () => {
  const { navigate } = useNavigation();

  const episodes = [
    { title: "The Neurobiology of Resilience", host: "Dr. Sarah Miller", category: "Clinical", length: "45 min", img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400" },
    { title: "Mindfulness in Modern Therapy", host: "Kenji Sato", category: "Holistic", length: "32 min", img: "https://images.unsplash.com/photo-1478737270239-2fccd2c7862a?auto=format&fit=crop&q=80&w=400" },
    { title: "Building a Private Practice", host: "Elena Rodriguez", category: "Professional", length: "58 min", img: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?auto=format&fit=crop&q=80&w=400" }
  ];

  return (
    <div className="bg-[#fbfcff] min-h-screen">
      <Breadcrumb items={[{ label: 'Health Podcasts' }]} />

      <PageHero
        overline="Audio Resources"
        title="The EvoWell Podcast"
        description="Expert conversations with leading psychologists, coaches, and clinicians from the EvoWell network."
        variant="left-aligned"
      />

      <Section spacing="sm">
        <Container>
          <Grid cols={3} gap="lg" className="mb-20">
            {episodes.map((ep, i) => (
              <Card key={i} hoverable className="p-0 overflow-hidden group">
                <div className="aspect-square overflow-hidden relative bg-slate-100">
                  <img src={ep.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-2xl">
                        <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                     </div>
                  </div>
                  <div className="absolute top-6 left-6">
                     <Badge variant="neutral" className="bg-white/90 backdrop-blur-sm shadow-sm">{ep.category}</Badge>
                  </div>
                </div>
                <CardBody className="p-6">
                  <Label variant="badge" color="muted" className="mb-2 block">{ep.host} • {ep.length}</Label>
                  <Heading level={3} size="h3" className="group-hover:text-brand-500 transition-colors leading-tight">{ep.title}</Heading>
                </CardBody>
              </Card>
            ))}
          </Grid>

          <Card variant="elevated" className="bg-slate-900 text-white text-center relative overflow-hidden border-none">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-brand-500/10 blur-[120px] rounded-full"></div>
             <CardBody className="relative z-10 p-8 lg:p-16">
               <Heading level={2} color="white" className="mb-6">Never miss a clinical breakthrough.</Heading>
               <Text color="muted" className="mb-12 max-w-xl mx-auto">Subscribe to our podcast on your favorite platform to stay updated with the latest in mental health and wellness.</Text>
               <div className="flex flex-wrap justify-center gap-6">
                  {['Spotify', 'Apple Music', 'Google Podcasts'].map(plat => (
                    <Button key={plat} variant="secondary" className="bg-white/10 border-white/10 text-white hover:bg-white/20 hover:border-white/20 hover:text-white border-2">
                      {plat}
                    </Button>
                  ))}
               </div>
             </CardBody>
          </Card>
        </Container>
      </Section>
    </div>
  );
};
export default PodcastsView;