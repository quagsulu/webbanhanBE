import express from 'express';
import {
  create,
  getAll,
  getDetail,
  remove,
  update
} from '../controllers/category.js';
const routerCategory = express.Router();



routerCategory.get('/', getAll);
routerCategory.get('/query', getDetail);
routerCategory.patch('/:id', update);
routerCategory.post('/', create);
routerCategory.delete('/:id', remove);


export default routerCategory;
