
const express = require('express');
const setupGrafanaAuthProxy = require('../index.js');

const app = express();

app.use('/grafana', setupGrafanaAuthProxy('http://localhost:3000/grafana', (req) => {
    return {
        'X-WEBAUTH-USER': 'testuser',
    }
}));

app.get("*", (req, res) => {
    res.send("default server logic");
});

app.listen(9000, () => console.log('Server is running on port 9000'));