import express from 'express'
// import { deleteCommentRecursive, getAllByMovie, getAll as getAllRecursive } from '../controllers/commentRecursive'
import { getAll, create, deleteComment,  getCommentByMovie } from '../controllers/comment'
const routerComment = express.Router()

routerComment.get('/', getAll)
routerComment.get('/movie', getCommentByMovie)
routerComment.post('/', create)
routerComment.delete('/:id', deleteComment)

export default routerComment
