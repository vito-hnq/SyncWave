const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data.json');

function readData() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readData, writeData };

// controllers/dataController.js
const { readData, writeData } = require('./data');

exports.getAll = (req, res) => {
  res.json(readData());
};

exports.getOne = (req, res) => {
  const data = readData();
  const item = data.find(d => d.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};

exports.create = (req, res) => {
  const data = readData();
  const newItem = { id: Date.now(), ...req.body };
  data.push(newItem);
  writeData(data);
  res.status(201).json(newItem);
};

exports.update = (req, res) => {
  let data = readData();
  const index = data.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Not found' });
  data[index] = { ...data[index], ...req.body };
  writeData(data);
  res.json(data[index]);
};

exports.remove = (req, res) => {
  let data = readData();
  const filteredData = data.filter(d => d.id !== parseInt(req.params.id));
  writeData(filteredData);
  res.status(204).send();
};

// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/dataController');

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');

app.use(express.json());
app.use(cors());

app.use('/api/data', dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
