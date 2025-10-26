import express from 'express'
import authMiddleware from '../middleware/auth.js'
import { createResult, listResults } from '../controllers/resultController.js';
const resultRouter=express.Router();

resultRouter.post('/',createResult);
resultRouter.get('/',listResults);

export default resultRouter;