import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../App';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { JobPosting } from '../types';
import { PageHero, Section, Container, Grid } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Button, Card, CardBody, Badge, Tag } from '../components/ui';

const CareersView: React.FC = () => {
  const { navigate } = useNavigation();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [loading, setLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    api.getAllJobs().then(data => {
      setJobs(data);
      setFilteredJobs(data);
      setLoading(false);
    });

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    
    return () => observerRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (activeDepartment === 'All') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(j => j.department === activeDepartment));
    }
    setTimeout(() => { document.querySelectorAll('.reveal').forEach(el => observerRef.current?.observe(el)); }, 100);
  }, [activeDepartment, jobs]);

  const departments = ['All', ...Array.from(new Set(jobs.map(j => j.department)))];

  const benefits = [
    { title: "Remote-First Culture", icon: "🏠", desc: "Work from anywhere in the US. We prioritize output over hours." },
    { title: "Comprehensive Health", icon: "❤️", desc: "100% covered medical, dental, and vision for you and your dependents." },
    { title: "Unlimited PTO", icon: "🌴", desc: "Take the time you need to recharge. We believe in sustainable pacing." },
    { title: "Learning Budget", icon: "📚", desc: "$1,500 annual stipend for courses, conferences, and personal development." }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      <Breadcrumb items={[{ label: 'Careers' }]} />

      <PageHero
        overline="Join the Team"
        title={<>Build the future of <br/><span className="text-brand-500">mental health access.</span></>}
        description="We are a team of clinicians, engineers, and designers working together to dismantle barriers to care. Join us in creating a healthier world."
        variant="centered"
        background="gradient"
      />

      <Section spacing="md" background="white">
        <Container>
           <Grid cols={4} className="reveal">
              {benefits.map((b, i) => (
                 <Card key={i} variant="muted" hoverable>
                    <CardBody>
                      <div className="text-4xl mb-6">{b.icon}</div>
                      <Heading level={3} size="h4" className="mb-3">{b.title}</Heading>
                      <Text variant="small">{b.desc}</Text>
                    </CardBody>
                 </Card>
              ))}
           </Grid>
        </Container>
      </Section>

      <Section spacing="md" background="default" id="openings">
         <Container>
           <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 reveal">
              <Heading level={2}>Open Positions</Heading>
              <div className="flex flex-wrap gap-2">
                 {departments.map(dept => (
                    <Tag 
                      key={dept} 
                      selected={activeDepartment === dept} 
                      onSelect={() => setActiveDepartment(dept)}
                    >
                      {dept}
                    </Tag>
                 ))}
              </div>
           </div>

           <div className="space-y-4 min-h-[400px]">
              {loading ? (
                 <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading opportunities...</div>
              ) : filteredJobs.length > 0 ? (
                 filteredJobs.map((job) => (
                    <Card key={job.id} hoverable onClick={() => navigate(`#/careers/${job.id}`)} className="reveal flex flex-col md:flex-row items-start md:items-center gap-6 p-8">
                       <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                             <Badge variant="brand">{job.department}</Badge>
                             <Label variant="badge" color="muted">{job.type}</Label>
                          </div>
                          <Heading level={3} size="h3" className="group-hover:text-brand-600 transition-colors">{job.title}</Heading>
                          <Text variant="small" color="muted" className="mt-1">{job.location}</Text>
                       </div>
                       <Button variant="secondary" size="sm">View Role</Button>
                    </Card>
                 ))
              ) : (
                 <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
                    <Text color="muted">No open positions in {activeDepartment} at the moment.</Text>
                 </div>
              )}
           </div>
         </Container>
      </Section>
    </div>
  );
};

export default CareersView;