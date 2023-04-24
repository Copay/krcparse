## KRCPARSE
Author Sinofine

This tool is intended for use with [Caraoke](https://github.com/MoePlayer/Caraoke) and [Caraoke Plasmoid](https://github.com/Copay/caraoke-plasmoid).

Currently, we've hosted kugou, netease, and qq music's lyrics.

You may host the project yourself (using vervel) or use [the hosted one](https://krcparse.sinofine.me/).

The source code of wasm files are located at [LyricDecoder](https://github.com/Copay/LyricDecoder).

### USAGE
You may use the interface below.
```
GET /service/query?body=1
service: one of those `kugou', `qq', `163'
query: string
optional body: if you set this, then body will be in JSON format, instead of a JSON string.
```

You may refer to https://github.com/MoePlayer/Caraoke/blob/karaoke/src/caraoke.interface.ts for further details.
### LICENSE
The project is distributed with the AGPL v3.