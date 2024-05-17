/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'

import ScreeningRoom from '../../model/ScreenRoom.js'
import ApiError from '../../utils/ApiError.js'
import Showtimes, { APPROVAL_SCHEDULE } from '../../model/Showtimes.js'
import showtimesValidate from '../../validations/showtimes.js'
import Movie, { COMING_SOON, IS_SHOWING } from '../../model/Movie.js'
import { timeSlotService } from '../TimeSlot/index.js'
import mongoose from 'mongoose'
import {
  convertTimeToIsoString,
  minutesToMilliseconds
} from '../../utils/timeLib.js'
import { insertSeatIntoScreen } from '../Seat/post.js'
import ScreenRoom from '../../model/ScreenRoom.js'
import { getRowAndCol } from '../../utils/getRowAndCol.js'

export const validateDurationMovie = (body, movie) => {
  const currentTimeFrom = new Date(convertTimeToIsoString(body.timeFrom))
  const currentTimeTo = new Date(convertTimeToIsoString(body.timeTo))
  const milisecond = currentTimeTo.getTime() - currentTimeFrom.getTime()
  const durationMovie = minutesToMilliseconds(movie.duration)

  // Kiểm tra xem khoảng thời gian có bằng với thời lượng của phim không
  if (milisecond !== durationMovie) {
    return true
  }
  return false
}

export const validateTime = async (body, movieIdSelf = null) => {
  const currentTimeFrom = new Date(convertTimeToIsoString(body.timeFrom))
  const currentTimeTo = new Date(convertTimeToIsoString(body.timeTo))
  let isTimeSet = false
  const checkScreenRoom = await Showtimes.find(
    {
      screenRoomId: body.screenRoomId
    },
    'movieId'
  )
  if (!checkScreenRoom || checkScreenRoom.length === 0) {
    return isTimeSet
  }
  const movieArray = checkScreenRoom.map((movie) => movie.movieId)
  // Kiểm tra xem khoảng thời gian xem ai đã đặt chưa
  const checkOverLap = await Showtimes.aggregate([
    {
      $match: {
        _id: {
          $ne: movieIdSelf
        },
        screenRoomId: new mongoose.Types.ObjectId(body.screenRoomId),
        movieId: {
          $in: movieArray
        }
      }
    }
  ])

  checkOverLap.forEach((showTime) => {
    if (
      currentTimeFrom >= showTime.timeFrom &&
      currentTimeFrom <= showTime.timeTo
    ) {
      return (isTimeSet = true)
    }
    if (
      currentTimeTo >= showTime.timeFrom &&
      currentTimeTo <= showTime.timeTo
    ) {
      return (isTimeSet = true)
    }
  })

  return isTimeSet
}

export const createService = async (req) => {
  // Mẫu
  // "screenRoomId": "65a23172acc8cf3b1cd48690",
  // "movieId": "65a207c8c69c863bf30a4c0e",
  // "date": "13-01-2024 15:38",
  // "timeFrom": "13-01-2024 15:38",
  // "timeTo": "13-01-2024 16:38"
  try {
    const body = req.body
    const { error } = showtimesValidate.validate(body, { abortEarly: true })
    if (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, new Error(error).message)
    }
    // Kiểm tra tồn tại của movieId và screenRoomId
    const resultMovieAndScreenRoom = await Promise.all([
      Movie.findById(body.movieId),
      ScreeningRoom.findById(body.screenRoomId)
    ])

    if (!resultMovieAndScreenRoom[0] || !resultMovieAndScreenRoom[1]) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'movieId hoặc screenRoomId không hợp lệ'
      )
    }
    if (validateDurationMovie(body, resultMovieAndScreenRoom[0])) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Timeframe is not equal to duration of movie'
      )
    }

    if (await validateTime(body)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'This time has been set')
    }
    // Tạo lịch chiếu phim
    const data = await Showtimes.create({
      ...body,
      status : APPROVAL_SCHEDULE,
      date: new Date(convertTimeToIsoString(body.date)),
      timeFrom: new Date(convertTimeToIsoString(body.timeFrom)),
      timeTo: new Date(convertTimeToIsoString(body.timeTo))
    })
    if (!data || Object.keys(data).length == 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Create showtime failed')
    }
    const { row, column } = getRowAndCol(resultMovieAndScreenRoom[1].NumberSeat)
    const promises = [
      ScreenRoom.updateOne(
        { _id: body.screenRoomId },
        {
          $addToSet: {
            ShowtimesId: data._id
          }
        }
      ),
      insertSeatIntoScreen(row, column, data),
      Movie.findByIdAndUpdate(body.movieId, {
        $push: { showTimes: data._id }
      })
    ]
    // Nếu như khi thêm lịch chiếu một bộ phim thì bộ
    // phim sẽ chuyển sang trạng thái công chiếu
    // if (resultMovieAndScreenRoom[0].status === COMING_SOON) {
    //   promises.push(
    //     Movie.findByIdAndUpdate(body.movieId, {
    //       $set: {
    //         status: COMING_SOON
    //       }
    //     })
    //   )
    // }
    await Promise.all(promises).catch((error) => {
      throw new ApiError(StatusCodes.CONFLICT, new Error(error.message))
    })

    return data
  } catch (error) {
    throw error
  }
}
