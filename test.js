'use strict;'

let sa = require('superagent');

sa.get('http://localhost:9000/fibonacci')
  .send({ n: 15 }) // request body object
  .end((err, res) => {
    if (err) {
      console.log({ status: err.status || 'N/A', message: err.response.body.error || 'N/A' });
    } else {
      console.log('Fibonacci API server results:', res.body);
    }
  });

