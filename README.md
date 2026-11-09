# RIDDLOVA — Free Daily Brain Games

Play short brain challenges in your browser: logic, numbers, memory and reflexes. No installation or account is required for solo play.

**[▶ Play RIDDLOVA — free daily challenge](https://kitz-labs.github.io/riddlova-arena/)**

[Surge CDN mirror](https://riddlova.surge.sh/) · [Privacy](https://kitz-labs.github.io/riddlova-arena/privacy.html) · [Legal](https://kitz-labs.github.io/riddlova-arena/legal.html)

## Four game modes

- **Daily Circuit:** Five daily puzzles.
- **Number Rush:** Quick arithmetic questions.
- **Memory Matrix:** Remember and repeat a pattern.
- **Reflex Core:** Test your reaction time.

Personal scores and progress are saved locally in the browser. You can share a challenge link voluntarily; RIDDLOVA does not send unsolicited messages.

## Play in your language

| Language | Play |
| --- | --- |
| English | [Play](https://kitz-labs.github.io/riddlova-arena/) |
| Deutsch | [Spielen](https://kitz-labs.github.io/riddlova-arena/de/) |
| Español | [Jugar](https://kitz-labs.github.io/riddlova-arena/es/) |
| Français | [Jouer](https://kitz-labs.github.io/riddlova-arena/fr/) |
| Italiano | [Gioca](https://kitz-labs.github.io/riddlova-arena/it/) |
| Português | [Jogar](https://kitz-labs.github.io/riddlova-arena/pt/) |
| Türkçe | [Oyna](https://kitz-labs.github.io/riddlova-arena/tr/) |
| Русский | [Играть](https://kitz-labs.github.io/riddlova-arena/ru/) |
| العربية | [العب](https://kitz-labs.github.io/riddlova-arena/ar/) |
| हिन्दी | [खेलें](https://kitz-labs.github.io/riddlova-arena/hi/) |
| 日本語 | [プレイ](https://kitz-labs.github.io/riddlova-arena/ja/) |

## Status and quality checks

RIDDLOVA is free to play. The separate [Telegram runtime](https://github.com/kitz-labs/riddlova-runtime) is prepared for a future bot integration. **Telegram Stars purchases are not active** until an owner-controlled bot, payment verification and support are configured.

This repository has automatic [quality checks](https://github.com/kitz-labs/riddlova-arena/actions/workflows/quality.yml), independent hosting deployment and [IndexNow submission](https://github.com/kitz-labs/riddlova-arena/actions/workflows/indexnow.yml) for search discovery. IndexNow acceptance does not guarantee search indexing.

For local checks on a supported Node.js installation:

```sh
node --check app.js
node --check i18n.js
node --check service-worker.js
node --test tests/*.test.mjs
```

RIDDLOVA is a puzzle game, not gambling, and does not offer cash prizes.
