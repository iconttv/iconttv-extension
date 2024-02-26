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

export function insertSettingTwitch() {
  const container = document.querySelector(
    window.iconttv.domSelector.chatSettingContainer
  );
  if (!container) return;

  const seperator = container.querySelector(
    window.iconttv.domSelector.chatSettingContainerSeperator
  );
  const settingContainerClassName = container.className;
}
