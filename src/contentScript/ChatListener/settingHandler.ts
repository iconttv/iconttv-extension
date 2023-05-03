import TWITCH_SELECTORS from '../utils/selectors';

interface Setting {
  name: string;
  options: string | boolean | number;
}
const settings: Setting[] = [
  {
    name: '아이콘 크기',
    options: 'medium',
  },
  {
    name: '태그 명령어 사용',
    options: true,
  },
];

export function insertSetting() {
  const container = document.querySelector(
    TWITCH_SELECTORS.chatSettingContainer
  );
  if (!container) return;

  const seperator = container.querySelector(
    TWITCH_SELECTORS.chatSettingContainerSeperator
  );
  const settingContainerClassName = container.className;
}
