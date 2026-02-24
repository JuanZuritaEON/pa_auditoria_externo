import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { apiSlice, S3Slice, appReducer } from './Slices';
import { setupListeners } from '@reduxjs/toolkit/query';
import { configureStore } from '@reduxjs/toolkit';

const reducers = {
  [apiSlice.reducerPath]: apiSlice.reducer,
  [S3Slice.reducerPath]: S3Slice.reducer,
  app: appReducer
};

export const store = configureStore({
  reducer: reducers,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }).concat(apiSlice.middleware).concat(S3Slice.middleware)
});
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector