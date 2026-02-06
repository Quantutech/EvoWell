import React from 'react';
import Breadcrumb from '../components/Breadcrumb';
import { Section, Container } from '../components/layout';
import { Heading, Text, Label } from '../components/typography';
import { Card } from '../components/ui';

const LegalView: React.FC<{ type: 'terms' | 'privacy' }> = ({ type }) => {
  const pageTitle = type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy';
  return (
    <div className="bg-[#fbfcff] min-h-screen">
      <Breadcrumb items={[{ label: pageTitle }]} />
      
      <Section spacing="sm">
        <Container size="narrow">
          <Card variant="default" size="lg" className="prose prose-slate max-w-none">
            <Label variant="overline" color="brand" className="mb-4">Official Documentation</Label>
            <Heading level={1} className="mb-10">{pageTitle}</Heading>
            <Label variant="badge" color="muted" className="mb-12">Last Updated: January 1, 2024</Label>
            
            <div className="space-y-12">
              <section>
                <Heading level={3} size="h4" className="mb-4">1. Clinical Overview</Heading>
                <Text>EvoWell operates as a clinical directory. We facilitate connections between patients and licensed wellness providers. By using this portal, you agree to our standard operating protocols as outlined in this document.</Text>
              </section>
              
              <section>
                <Heading level={3} size="h4" className="mb-4">2. Data Security & Privacy</Heading>
                <Text>All clinical data is encrypted using AES-256 bit protocols. We adhere to zero-knowledge storage principles for patient communications whenever possible within HIPAA guidelines.</Text>
              </section>

              <section>
                <Heading level={3} size="h4" className="mb-4">3. Provider Responsibilities</Heading>
                <Text>Providers registered on EvoWell are responsible for maintaining their own clinical licensure and board standing. EvoWell performs manual vetting but does not provide medical advice or supervise clinical practice.</Text>
              </section>

              <Card variant="muted" size="sm">
                 <Heading level={4} size="h4" className="mb-2">Notice of Privacy Practices</Heading>
                 <Text variant="small">This document is meant to be a summary of our full clinical-grade privacy infrastructure. For specific HIPAA BAA inquiries, please contact our security officer at legal@evowell.com.</Text>
              </Card>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
};
export default LegalView;