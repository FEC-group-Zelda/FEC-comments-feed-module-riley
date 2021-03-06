const faker = require('faker');
const db = require('./db');
const AWS = require('aws-sdk');
const fs = require('fs');
const $ = require('jquery');
const cliProgress = require('cli-progress');
let n = 1; // how many pictures?
const _colors = require('colors');
const axios = require('axios');
const Promise = require('bluebird');
const moment = require('moment');

const config = require('../config/config.js');


// setup progress bar
const b1 = new cliProgress.SingleBar({
  format: 'Progress |' + _colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});

// setup s3
const BUCKET_NAME = 'fec-comments-images';
let imageName = faker.image.avatar();

const s3 = new AWS.S3({
  accessKeyId: config.ID,
  secretAccessKey: config.SECRET
});

const uploadFile = (fileName) => {
  // Read content from the file
  const fileContent = fs.readFile(fileName);

  // Setting up S3 upload parameters
  const params = {
      Bucket: BUCKET_NAME,
      Key: imageName, // File name you want to save as in S3
      Body: fileContent
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
      if (err) {
          throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
  });
};

// start seed script
let superSeed = function () {
  // start progress bar
  // b1.start(n, 0, {
  //   speed: "N/A"
  // });

  // db.Comments.sync();
  // db.Artist.sync();
  // db.Song.sync();

  // Generate fake user data

  // Generate random user from API
  // axios.get('https://randomuser.me/api/?inc=name,id,picture')
  //   .then((obj) => {
  //     // console.log(obj.data.results)
  //     // let output = obj.data.results;
  //     fakeUser.user_name = `${output[0].name.first} ${output[0].name.last}`;
  //     fakeUser.user_id = output[0].id.value;
  //     fakeUser.user_profile_pic = output[0].picture.thumbnail;
  //     console.log('fakeUser: ', fakeUser);
  //   })
  // .catch((err) => {
  //   // console.log('Error: randomuser get')
  //   throw new Error('Randomuser failed')
  // })

    // Generate hipster ipsum
  let fakeUser = {};
  axios.get('https://hipsum.co/api/?type=hipster-centric&sentences=1')
    .then((hipsterString) => {
      console.log(hipsterString.data);
      // fakeUser.text = hipsterString.data;
    }).then(fakeUser.user_id = faker.random.uuid())
    .then(fakeUser.user_name = faker.internet.userName())
    .then(fakeUser.user_profile_pic = faker.internet.avatar())
    .then(fakeUser.text = faker.lorem.sentence())
    .then(fakeUser.user_followers_count = Math.floor(Math.random() * 100))
    .then(fakeUser.track_location = moment.utc(Math.floor(Math.random() * 235000)).format('mm:ss'))
    .then(console.log('fakeUser: ', fakeUser))
    .then(db.Comments.create(fakeUser))
    .then((result) => {
      console.log('Success: Created Comments Table');
    })
    .catch((err) => {
      console.log('Error: Comments Table', err);
    })

    // Seed Artist
    .then(db.Artist.create({
      name: 'the1975',
      followers_count: 981356,
      tracks_count: 136,
      profile_pic: 'https://fec-comments-images.s3.us-east-2.amazonaws.com/frailstateofmindsm.jpg'
    }))
    .then((message) => {
      console.log('Success: Created Artist Table');
    })
    .catch((err) => {
      console.log('Error: Artist Table', err)
    })

    // Seed Song
    .then(db.Artist.findOrCreate({ where: { name: 'the1975' } })
      .spread((artist, created) => {
        db.Song.create({
          artist_id: artist.id,
          title: 'Frail State of Mind',
          play_count: 16543,
          likes_count: 368,
          repost_count: 41,
          description: '',
          released_by: '',
          release_date: '24 October 2019',
          p_line: '℗ 2020 Dirty Hit, under exclusive licence to Polydor Records and Interscope Records',
          c_line: '© 2019 Dirty Hit, under exclusive licence to Polydor Records and Interscope Records',
          hashtags: ''
        })
        .then((message) => {
          console.log('Success: Created Song Table');
        })
        .catch((err) => {
          console.log('Error: Song.create', err);
        })
      })
      .catch((err) => {
        console.log('Error: Artist.findOrCreate', err);
      })
    )
    .then((message) => {
      console.log('Success: Checked Artist Table');
    })
    .catch((err) => {
      console.log('Error: Checking Artist Table')
    })
    // update progress bar
    // .then(b1.update(1))
    // end progress bar
    // .then(b1.stop())
};

superSeed();

module.exports = superSeed;