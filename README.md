# single-page-memegen

Shamelessly stolen from various memegens found in Github, I've only mixed them to obtain this single page memegen

I hate NodeJS, so I've researched how to do it in plain JS.

Thanks to various folks I've hacked together this single-page-memegen for the sake of memes. 

## How to use it

`git clone http://rickroll.click/xawos/single-page-memegen` and open the `index.html`.

Upload your image, edit it and save it locally. There you go.

If you wish to upload memes to the cloud switch the JS file loaded in the `index.html` to the commented one, and comment the one used.

So: uncomment `editorController_upload.js` and comment `editorController.js` for the sake of completeness.

This will upload the memes to `rickroll.click` (this VPS) but will actually land in my Raspberry Pi cluster mounted via GlusterFS.

Will eventually create a gallery with authentication, for the sake of you know.. memes.

If you want to change the endpoint for the meme's storage there's the `upload.py` that takes care of ingesting the image.

The image is saved with IP+timestamp, taking the IP from [icanhazip.com](https://icanhazip.com) and shipping it via base64-encoded JSON.

## How to contribute

`git clone http://rickroll.click/xawos/single-page-memegen`, modify it and `git push` it like a normal [Pull Request](https://opensource.com/article/19/7/create-pull-request-github)

Ping the owner as well, he probably won't notice otherwise :)

Feel free as always to steal everything from here and use it for your own purposes, the license is the [UNLICENSE](https://unlicense.org/) one.
