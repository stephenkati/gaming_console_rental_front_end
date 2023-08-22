import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import customApi from '../../utils/axios';
import { getToken, saveToken } from '../../utils/localStorage';

const fetchUserReservations = createAsyncThunk(
  'user/fetchUserReservations',
  async (_, thunkAPI) => {
    try {
      const token = getToken();
      if (!token) {
        return thunkAPI.rejectWithValue('No authentication token found');
      }

      const response = await customApi.get('/api/v1/reservations', {
        headers: token
      });

      const reservations = await Promise.all(
        response.data.map(async (reservation) => {
          const consoleResponse = await customApi.get(
            `/api/v1/consoles/${reservation.console_id}`
          );

          const consoleData = consoleResponse.data;
          return {
            id: reservation.id,
            user_id: reservation.user_id,
            city: reservation.city,
            reserve_date: reservation.reserve_date,
            console: consoleData.data,
          };
        })

      );
      const headers = response.headers;
      const authorizationToken = headers.get('authorization')
      const newToken = {
        'authorization': authorizationToken,
      }
      if (response.status === 201 || response.status === 200) {
        saveToken(newToken)
      }

      return reservations;
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 422)
      ) {
        return thunkAPI.rejectWithValue(error.response.data.errors[0]);
      }

      return thunkAPI.rejectWithValue(
        error.response?.data.errors || 'Unknown error'
      );
    }
  }
);

const initialState = {
  reservations: [],
  isLoading: false,
  error: null,
};

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserReservations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserReservations.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.reservations = payload;
      })
      .addCase(fetchUserReservations.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      });
  },
});

export { fetchUserReservations };

export default reservationsSlice.reducer;
