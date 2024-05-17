import express from 'express';
import { createcategories, getAllcategories, removecategories, updatecategories } from '../controllers/categorys';

const routerCategories = express.Router();

routerCategories.get('', getAllcategories)
routerCategories.post('', createcategories)
routerCategories.patch('', updatecategories)
routerCategories.patch('', removecategories)

export default routerCategories