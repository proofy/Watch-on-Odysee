export interface LbrySettings {
  enabled: boolean
  redirect: keyof typeof redirectDomains
}

export const DEFAULT_SETTINGS: LbrySettings = { enabled: true, redirect: 'odysee' };

export const redirectDomains = {
  'odysee' { prefix: 'https://odysee.com/', display: 'Odysee' },
};

export function getSettingsAsync<K extends Array<keyof LbrySettings>>(...keys: K): Promise<Pick<LbrySettings, K[number]>> {
  return new Promise(resolve => chrome.storage.local.get(keys, o => resolve(o as any)));
}
