import React from 'react';

export type WidgetType = 'METRIC' | 'CHART' | 'FEED' | 'HEALTH';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  component: React.ComponentType<any>;
  defaultSize: 'sm' | 'md' | 'lg' | 'full';
  permissions: string[];
}

export const WIDGET_REGISTRY: Record<string, WidgetConfig> = {};

export const registerWidget = (config: WidgetConfig) => {
  WIDGET_REGISTRY[config.id] = config;
};

export const getWidget = (id: string) => WIDGET_REGISTRY[id];
export const getAllWidgets = () => Object.values(WIDGET_REGISTRY);
