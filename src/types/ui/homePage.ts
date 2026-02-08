export type HomeCtaTargetKey =
  | 'FIND_PROVIDER'
  | 'FOR_PROVIDERS'
  | 'CHAT_WITH_EVO'
  | 'BROWSE_DIRECTORY'
  | 'CREATE_PROVIDER_PROFILE'
  | 'VIEW_ALL_PROVIDERS'
  | 'BROWSE_EXCHANGE'
  | 'SELL_RESOURCE'
  | 'TALK_TO_SUPPORT';

export type HomeFeaturedLayoutVariant = 'CAROUSEL' | 'GRID';

export type HomeCtaTarget =
  | {
      type: 'route';
      path: string;
    }
  | {
      type: 'action';
      action: 'OPEN_EVO';
    };

export type HomeCtaTargetMap = Record<HomeCtaTargetKey, HomeCtaTarget>;

export interface HomeFeaturedLayoutPreview {
  variant: HomeFeaturedLayoutVariant;
  label: string;
  description: string;
}
