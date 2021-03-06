#!/usr/bin/env node

'use strict';

require('shelljs/global');
const config = require('../package.json');
const Github = require('./github');
const tagName = `v${config.version}`;
const ghRelease = require('gh-release-assets');

/**
 *
 * @param options
 */
function addReleaseAsset(options) {
  const releaseOptions = {
    url:options.upload_url,
    auth:{
      username: process.env.GITHUB_USERNAME,
      password: process.env.GITHUB_PASSWORD
    },
    assets:[`./dist/clipman-v${config.version}.zip`]
  };

  ghRelease(releaseOptions, function (err, assets){
    if(err) throw err;
    console.log(assets);
  })
}

//run jspm bundle and zip operation
echo('----------- Bundling Code for JSPM ----------------');
let execBundle = exec('jspm bundle-sfx src/content.js - react + jquery dist/clipman/bundle.js --minify');

echo('----------- Creating Archive for Release -----------');
let execZip = exec(`cp -R src/ dist/clipman && rm -r dist/clipman/jspm_packages && cd dist && zip -r -X clipman-v${config.version}.zip clipman`);

echo('----------- Pushing archive to Remote repo ---------');
let execGitAddCommitPush = exec(`git add dist/ && git commit -m "release for version ${config.version}" && git push origin master`);

if(execBundle.code === 0 && execZip.code === 0 && execGitAddCommitPush.code === 0){
  echo('--------- Release Preparation went well ----------');
} else {
  throw new Error('Release script failed')
}

//create release
Github.repos.createRelease({
  owner: 'numeriklabs',
  repo: 'com.numeriklabs.clipman',
  tag_name: tagName,
  name: tagName,
  draft:false,
  prerelease: true
}).then(addReleaseAsset);