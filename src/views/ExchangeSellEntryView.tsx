import React, { useEffect, useState } from 'react';
import { useAuth, useNavigation } from '@/App';
import { ModerationStatus, UserRole } from '@/types';
import { Container, Section } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { Heading, Text } from '@/components/typography';

const providerJoinPath = '/login?join=true&role=provider&next=%2Fexchange%2Fsell';
const providerOnboardingPath = '/onboarding?next=%2Fexchange%2Fsell';
const providerResourcesPath = '/console/resources';

const ExchangeSellEntryView: React.FC = () => {
  const { user, provider, isLoading } = useAuth();
  const { navigate } = useNavigation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setIsRedirecting(true);
      navigate(providerJoinPath);
      return;
    }

    if (user.role === UserRole.PROVIDER) {
      setIsRedirecting(true);

      const needsVerification =
        !provider ||
        !provider.onboardingComplete ||
        provider.moderationStatus !== ModerationStatus.APPROVED;

      navigate(needsVerification ? providerOnboardingPath : providerResourcesPath);
    }
  }, [isLoading, navigate, provider, user]);

  const showRedirectState = isLoading || isRedirecting || !user || user.role === UserRole.PROVIDER;

  if (showRedirectState) {
    return (
      <Section spacing="lg" background="default">
        <Container>
          <Card className="mx-auto max-w-2xl rounded-3xl border border-slate-200 shadow-sm">
            <CardBody className="p-10 text-center">
              <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <Heading level={2} className="mb-3">
                Preparing your sell workspace
              </Heading>
              <Text className="text-slate-600">
                We are routing you to the right next step for publishing in the Provider Exchange.
              </Text>
            </CardBody>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="lg" background="default">
      <Container>
        <Card className="mx-auto max-w-3xl rounded-3xl border border-slate-200 shadow-sm">
          <CardBody className="space-y-6 p-10 md:p-12">
            <Heading level={2}>Provider access required to sell resources</Heading>
            <Text className="text-slate-600">
              Publishing in the Provider Exchange is reserved for verified provider accounts. Join as a provider to
              create listings, or continue browsing the Exchange.
            </Text>
            <div className="flex flex-wrap gap-4">
              <Button variant="brand" onClick={() => navigate(providerJoinPath)}>
                Join as Provider
              </Button>
              <Button variant="secondary" onClick={() => navigate('/exchange')}>
                Browse Exchange
              </Button>
            </div>
          </CardBody>
        </Card>
      </Container>
    </Section>
  );
};

export default ExchangeSellEntryView;
