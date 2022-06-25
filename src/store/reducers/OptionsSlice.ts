import { IOption } from './../../models/IOption';
import { getTokenHeader } from './../../components/helpers/getTokenHeader';
import { ILesson } from './../../models/ILesson';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { AxiosErr } from '../../types/types';
interface UserState {
  activeBoard: string;
  fullMenu: boolean;
  todayLessons: ILesson[];
  searchedStudentId: number | null;
  data: IOption | null;
}

const initialState: UserState = {
  activeBoard: 'schedule',
  fullMenu: true,
  todayLessons: [],
  searchedStudentId: null,
  data: null
};

interface GetTodayLessons {
  userId: number;
  date: Date;
}

export const getTodayLessons = createAsyncThunk(
  'lesson/today',
  async (payload: GetTodayLessons, thunkAPI) => {
    try {
      const response = await axios.post<ILesson[]>(
        `${process.env.REACT_APP_API_URL}/lesson/today`,
        payload,
        getTokenHeader()
      );
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        return thunkAPI.rejectWithValue(
          (err.response?.data as AxiosErr).message
        );
      }
    }
  }
);

export const fetchOptionsData = createAsyncThunk(
  'option/all/:id',
  async (payload: number, thunkAPI) => {
    try {
      const response = await axios.get<IOption>(
        `${process.env.REACT_APP_API_URL}/option/all/${payload}`
        // getTokenHeader()
      );
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        return thunkAPI.rejectWithValue(
          (err.response?.data as AxiosErr).message
        );
      }
    }
  }
);

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    resetOpions: () => initialState,
    setActiveBoard: (state, action: PayloadAction<string>) => {
      state.activeBoard = action.payload;
    },
    setFullMenu: (state) => {
      state.fullMenu = !state.fullMenu;
    },
    setSearchedStudent: (state, action: PayloadAction<number | null>) => {
      state.searchedStudentId = action.payload;
    }
  },
  extraReducers: {
    [getTodayLessons.fulfilled.type]: (
      state,
      action: PayloadAction<ILesson[]>
    ) => {
      state.todayLessons = action.payload;
    },
    [fetchOptionsData.fulfilled.type]: (
      state,
      action: PayloadAction<IOption>
    ) => {
      state.data = action.payload;
    }
  }
});

export const { setActiveBoard, setFullMenu, resetOpions, setSearchedStudent } =
  optionsSlice.actions;

export default optionsSlice.reducer;
