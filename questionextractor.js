require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Question = require('./models/question');

const allquestions = [];

fs.createReadStream(__dirname + '/Questions.csv')
  .pipe(csv())
  .on('data', (datarow) => {
    if (datarow.Question_number) {
      for (let key in datarow) {
        if (datarow[key] === '' || datarow[key] === undefined) {
          delete datarow[key];
        }
      }

      const question = {
        _id: datarow.Question_number,
        annotation1: datarow.Annotation_1,
        annotation2:
          datarow.Annotation_2 === undefined ? null : datarow.Annotation_2,
        annotation3:
          datarow.Annotation_3 === undefined ? null : datarow.Annotation_3,
        annotation4:
          datarow.Annotation_4 === undefined ? null : datarow.Annotation_4,
        annotation5:
          datarow.Annotation_5 === undefined ? null : datarow.Annotation_5,
      };
      allquestions.push(question);
    }
  })
  .on('end', () => {
    console.log('[+] done reading the file');
    console.log(
      '[+] writing to database number of ' + allquestions.length + ' questions'
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

        allquestions.forEach((question) => {
          const q = new Question(question);
          q.save();
          total++;
        });

        if (total == allquestions.length) {
          console.log(
            '[+] done inserting all questions into the database successfuly!'
          );
        }
        console.log(
          '=========================================================='
        );
      });
  })
  .on('error', (err) => {
    console.log(err.message);
  });
