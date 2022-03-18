require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Topic = require('./models/topic');

const alltopics = [];

fs.createReadStream(__dirname + '/Topics.csv')
  .pipe(csv())
  .on('data', (datarow) => {
    for (let key in datarow) {
      if (datarow[key] === '' || datarow[key] === undefined) {
        delete datarow[key];
      }
    }

    var level1;
    var level2;
    var level3;

    // ===== LEVEL 3 ===========
    if (datarow.TopicLevel3 !== undefined) {
      level3 = {
        _id: datarow.TopicLevel3,
        topiclist: [datarow.TopicLevel3],
      };
      alltopics.push(level3);
    }
    // ==========================

    // ===== LEVEL 2 ===========
    if (datarow.TopicLevel2 !== undefined) {
      const level2Exists = alltopics.find((topic) => {
        return topic._id == datarow.TopicLevel2;
      });

      if (level2Exists) {
        level2 = level2Exists;

        if (level3 !== undefined) {
          if (!level2.topiclist.includes(level3._id)) {
            level2.topiclist.push(level3._id);
          }
        }
      } else {
        const temp = [];
        temp.push(datarow.TopicLevel2);

        if (level3 !== undefined) {
          temp.push(level3._id);
        }

        level2 = {
          _id: datarow.TopicLevel2,
          topiclist: temp,
        };
        alltopics.push(level2);
      }
    }
    // ==========================

    // ===== LEVEL 1 ===========
    if (datarow.TopicLevel1 !== undefined) {
      // check if it exists in the alltopics array
      const level1Exists = alltopics.find((topic) => {
        return topic._id == datarow.TopicLevel1;
      });

      if (level1Exists) {
        level1 = level1Exists;
        if (level2 !== undefined) {
          if (!level1.topiclist.includes(level2._id)) {
            level1.topiclist.push(level2._id);
          }
        }
        if (level3 !== undefined) {
          if (!level1.topiclist.includes(level3._id)) {
            level1.topiclist.push(level3._id);
          }
        }
      } else {
        const temp = [];
        temp.push(datarow.TopicLevel1);
        if (level2 !== undefined) {
          temp.push(level2._id);
        }
        if (level3 !== undefined) {
          temp.push(level3._id);
        }

        level1 = {
          _id: datarow.TopicLevel1,
          topiclist: temp,
        };
        alltopics.push(level1);
      }
    }
    // ==========================
  })
  .on('end', () => {
    console.log('[+] done reading the file');
    console.log(
      '[+] writing to database number of ' + alltopics.length + ' topics'
    );

    const DBHOST = process.env.DBHOST;
    const DBUSERNAME = process.env.DBUSERNAME;
    const DBPASSWORD = process.env.DBPASSWORD;

    const uri = `mongodb+srv://${DBUSERNAME}:${DBPASSWORD}@${DBHOST}/pencil-project?retryWrites=true&w=majority`;

    mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('[+] connected to the database');
        console.log(
          '=========================================================='
        );
        let total = 0;

        alltopics.forEach((topic) => {
          const t = new Topic(topic);
          t.save();
          total++;
        });

        if (total == alltopics.length) {
          console.log(
            '[+] done inserting all topics to the database successfuly!'
          );
        }
        console.log(
          '=========================================================='
        );
      });
  });
