# <img src="public/icons/48.icon.png" width="45" align="left"> Iconttv

Iconttv browser extension source code

구 twitch-icon-selector

## Features

- 트위치 생방송, 트위치 다시보기, popout 채팅창, 클립 페이지에서 작동
- 페이지 이동 시에도 끊김 없이 동작
- 버튼 클릭 시 아이콘 목록 보기
- 채팅창에 `~` 입력 시 아이콘 목록 검색 가능
- 아이콘 목록에서 `←`, `→`으로 탐색, `↓`으로 입력. (커서가 입력의 끝이 아닐 때는 남은 문자열을 클립보드에 복사함) 
- 아이콘 목록에서 클릭시 입력창에 붙여넣기 또는 클립보드에 복사
- 채팅창에서 아이콘 클릭 시 입력창에 붙여넣기 또는 클립보드에 복사
- 일부 스트리머에 한해서 `[]` 명령어를 지원합니다. 
```
[b]굵은글씨
[i]기울어짐
[s]취소선
'''굵은글씨'''
''기울어짐''
~~취소선~~
--취소선--
__밑줄글씨__
[br]줄바꿈
[mq]흘러갈말[/mq]
```



![채팅창 데모](./imgs/demo_chat.gif)

- 전체 아이콘 목록과 개인 통계를 볼 수 있음.

![통계창 데모](./imgs/demo_frontend.gif)

# special thanks to...

Funzinnu

Icons by svgrepo.com

## Install

[**Chromium** extension]() 

[**Firefox** extension]()


# Development

## Environment Configuration

Configuration with `.env.local` file should be done before running the app.

- About: 
  - `FIREFOX_ADDON_ID` Value for Firefox Addon build.

## Contribution

Suggestions and pull requests are welcomed!.

---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)

