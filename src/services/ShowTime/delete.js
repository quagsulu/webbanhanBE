/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
// import Seat from '../../model/Seat.js'
// import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
// import { SOLD, UNAVAILABLE, AVAILABLE } from '../../model/Seat.js'
// import TimeSlot from '../../model/TimeSlot.js'
import Showtimes, {
  AVAILABLE_SCHEDULE,
  CANCELLED_SCHEDULE
} from '../../model/Showtimes.js'
import { timeSlotService } from '../TimeSlot/index.js'
import Movie, { COMING_SOON, IS_SHOWING } from '../../model/Movie.js'
import ScreenRoom from '../../model/ScreenRoom.js'
import Seat from '../../model/Seat.js'

export const removeService = async (req) => {
  try {
    const { id } = req.params
    // check xem có ai đặt ghê chưa
    const response = await Showtimes.findById(id)
    if (!response) {
      throw new ApiError(StatusCodes.NOT_FOUND, ' Show not found!')
    }
    const promises = [
      Showtimes.deleteOne({ _id: id }),
      Movie.updateOne(
        {
          _id: response.movieId
        },
        {
          $pull: {
            showTimes: response._id
          }
        }
      ),
      ScreenRoom.updateOne(
        { _id: response.screenRoomId },
        {
          $pull: {
            ShowtimesId: response._id
          }
        }
      ),
      Seat.deleteMany({
        _id: {
          $in: response.SeatId
        }
      })
    ]
    const currentMovie = await Movie.findById(response.movieId)
    if (
      currentMovie.showTimes.length === 1 &&
      currentMovie.showTimes.includes(response._id)
    ) {
      promises.push(
        Movie.updateOne(
          {
            _id: currentMovie._id
          },
          {
            $set: {
              status: COMING_SOON
            }
          }
        )
      )
    }

    try {
      await Promise.all(promises)
    } catch (error) {
      throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
    }

    return response
  } catch (error) {
    throw error
  }
}
export const deleteShowTime = async (id) => {
  try {
    const deleteShow = await Showtimes.findByIdAndDelete(id)
    if (!deleteShow || Object.keys(deleteShow).length === 0) {
      throw new ApiError(StatusCodes.CONFLICT, 'Delete show failed')
    }
    return deleteShow
  } catch (error) {
    throw error
  }
}
export const deleteSoftService = async (req) => {
  try {
    const id = req.params.id

    // const body = reqBody.body
    const updateShowTime = await Showtimes.findByIdAndUpdate(
      id,
      { destroy: true, status: CANCELLED_SCHEDULE },
      { new: true }
    )
    if (!updateShowTime || Object.keys(updateShowTime).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete soft showtime failed')
    }
    const updateMovie = await Movie.findByIdAndUpdate(
      updateShowTime.movieId,
      {
        status: COMING_SOON
      },
      { new: true }
    )
    if (!updateMovie || Object.keys(updateMovie).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete soft showtime failed')
    }

    return updateShowTime
  } catch (error) {
    throw new Error(error.message)
  }
}

// Ngược lại cái so với delete soft
export const restoreService = async (req) => {
  try {
    const id = req.params.id

    // const body = reqBody.body
    const updateShowTime = await Showtimes.findByIdAndUpdate(
      id,
      { destroy: false, status: AVAILABLE_SCHEDULE },
      { new: true }
    )
    if (!updateShowTime || Object.keys(updateShowTime).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete soft showtime failed')
    }
    const updateMovie = await Movie.findByIdAndUpdate(
      updateShowTime.movieId,
      {
        status: IS_SHOWING
      },
      { new: true }
    )
    if (!updateMovie || Object.keys(updateMovie).length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Delete soft showtime failed')
    }

    return updateShowTime
  } catch (error) {
    throw new Error(error.message)
  }
}
