## Looking for contributors :)
# Watch on Odysee
![WOO_marquee promo tile 1400x560](https://user-images.githubusercontent.com/16674412/120082996-48100880-c0c6-11eb-83fe-526847c48026.jpg)

A plugin for web browsers that brings more utility for LBRY Protocol by allowing you to find people you watch on YouTube that are available on Odysee, LBRY Desktop App and other LBRY Protocol based apps/websites, allows you to easly check your subscribtion list and much more!

# Privacy

This plugin is using LBRY Inc YouTube Sync API to check if video fot synchronized with LBRY Platform. For more informations read LBRY Inc Privacy Policy [here.](https://lbry.com/privacypolicy)

## Installation

[![Get it on Firefox](doc/img/AMO-button_1.png)](https://addons.mozilla.org/en/firefox/addon/watch-on-odysee/)
Google removed it from the Webstore

## Build

From the root of the project

For Production
```bash
$ npm install
$ npm run build
$ npm run build:webext  # optional, to create the zip file from the dist directory
```

For Development
```bash
$ npm install
$ npm run watch
```

Then, either manually install it for your browser or, from another terminal invoke:

```bash
$ npm run start:chrome
$ npm run start:firefox # or, if you'd prefer firefox
```

### Manual Install for Chrome:
Visit ```chrome://extensions``` (via omnibox or menu -> Tools -> Extensions).
Enable Developer mode by ticking the checkbox in the upper-right corner.
Click on the "Load unpacked extension..." button.
Select the directory containing your unpacked extension.
### Manual Install for Firefox
To install an extension temporarily:

-   open Firefox
-   enter “about:debugging” in the URL bar
-   click “Load Temporary Add-on”
-   open the extension’s directory and select any file inside the extension.

The extension will be installed, and will stay installed until you restart Firefox.


## Usage

Go to YouTube in your browser. When you load a video or channel, it will detect if it's also uploaded to the LBRY Network and the it will move you to open.lbry.com so you can watch the video on LBRY (either on the web or in the app)!

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[GPL-3.0 License](LICENSE)


