import { handleActions } from 'utils/store';
import some from 'lodash/some';
import omit from 'lodash/omit';

import { createSelector } from 'reselect';

const KEY_IMAGES: StoreKey = 'workspace.images.props';
const KEY_IMAGES_LOAD_STATUS: StoreKey = 'workspace.images.status';
const KEY_TRACING: StoreKey = 'workspace.images.tracing';

const imagesReducer = handleActions<typeof KEY_IMAGES>(
  {
    LOAD_IMAGE_SUCCEEDED: (state, { payload }) => {
      return {
        ...state,
        [payload.id]: {
          name: null,
          type: 'ceph_lateral',
          scaleFactor: null,
          flipX: false,
          flipY: false,
          brightness: 0.5,
          contrast: 0.5,
          invertColors: false,
          tracing: {
            mode: 'assisted',
            manualLandmarks: {

            },
            skippedSteps: {

            },
          },
          analysis: {
            activeId: null,
          },
          ...payload,
        },
      };
    },
    CLOSE_IMAGE_REQUESTED: (state, { payload: { id } }) => {
      return omit(state, id) as typeof state;
    },
  },
  { },
);

const loadStatusReducer = handleActions<typeof KEY_IMAGES_LOAD_STATUS>({
  LOAD_IMAGE_FAILED: (state, { payload: { id, error } }) => {
    return {
      ...state,
      [id]: {
        isLoading: false,
        error,
      },
    };
  },
  LOAD_IMAGE_REQUESTED: (state, { payload: { id } }) => {
    return {
      ...state,
      [id]: {
        isLoading: true,
        error: null,
      },
    };
  },
  LOAD_IMAGE_SUCCEEDED: (state, { payload: { id } }) => {
    return {
      ...state,
      [id]: {
        isLoading: false,
        error: null,
      },
    };
  },
  CLOSE_IMAGE_REQUESTED: (state, { payload: id }) => {
    return omit(state, id) as typeof state;
  },
}, { });

const tracingReducer = handleActions<typeof KEY_TRACING>({
  ADD_MANUAL_LANDMARK_REQUESTED: (state, { payload }) => {
    const { imageId, symbol, value } = payload;
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        manualLandmarks: {
          ...state[imageId].manualLandmarks,
          [symbol]: value,
        },
      },
    };
  },
  REMOVE_MANUAL_LANDMARK_REQUESTED: (state, { payload }) => {
    const { imageId, symbol } = payload;
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        manualLandmarks: {
          ...omit(state[imageId].manualLandmarks, symbol),
        },
      },
    };
  },
  SKIP_MANUAL_STEP_REQUESTED: (state, { payload: { imageId, step } }) => {
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        skippedSteps: {
          ...state[imageId].skippedSteps,
          [step]: true,
        },
      },
    };
  },
  UNSKIP_MANUAL_STEP_REQUESTED: (state, { payload: { imageId, step } }) => {
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        skippedSteps: {
          ...omit(state[imageId].skippedSteps, step),
        },
      },
    };
  },
}, { });

const reducers: Partial<ReducerMap> = {
  [KEY_IMAGES]: imagesReducer,
  [KEY_IMAGES_LOAD_STATUS]: loadStatusReducer,
  [KEY_TRACING]: tracingReducer,
};

export default reducers;

export const getAllImages = (state: StoreState) => state[KEY_IMAGES];
export const getAllImagesStatus = (state: StoreState) => state[KEY_IMAGES_LOAD_STATUS];

export const getImageProps = createSelector(
  getAllImages,
  (all) => (imageId: string) => all[imageId],
);

export const getImageStatus = createSelector(
  getAllImagesStatus,
  (all) => (imageId: string) => all[imageId],
);

export const isImageLoading = createSelector(
  getImageStatus,
  (getStatus) => (id: string) => getStatus(id).isLoading,
);

export const hasImageLoadFailed = createSelector(
  getImageStatus,
  (getStatus) => (id: string) => {
    const props = getStatus(id);
    return props.isLoading === false && props.error === null;
  },
);

export const isImageLoaded = createSelector(
  getImageStatus,
  (getStatus) => (id: string) => {
    const props = getStatus(id);
    return props.isLoading === false && props.error !== null;
  },
);

export const hasImage = createSelector(
  getAllImages,
  isImageLoaded,
  (all, isLoaded) => (
    some(all, (_, k: string) => isLoaded(k))
  ),
);

export const getAllTracingData = (state: StoreState) => state[KEY_TRACING];
export const getTracingDataByImageId = createSelector(
  getAllTracingData,
  (all) => (id: string) => all[id],
);

export const getManualLandmarks = createSelector(
  getTracingDataByImageId,
  (getTracing) => (id: string) => getTracing(id).manualLandmarks,
);
