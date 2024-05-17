/* eslint-disable no-useless-catch */
import { createService } from './post.js'
import { deleteSoftService, removeService, restoreService, deleteShowTime } from './delete.js'
import { updateApproval, updateMovieShowService, updateService, updateStatusFull } from './patch.js'
import { getAllService, getOneService, getAllIncludeDestroyService, getAllServiceByMovie, getAllApprovalService } from './get.js'


export const scheduleService = {
  getAllIncludeDestroyService,
  createService,
  deleteSoftService,
  restoreService,
  removeService,
  updateService,
  getOneService,
  getAllService,
  updateStatusFull,
  deleteShowTime,
  getAllServiceByMovie,
  updateMovieShowService,
  updateApproval,
  getAllApprovalService
}
