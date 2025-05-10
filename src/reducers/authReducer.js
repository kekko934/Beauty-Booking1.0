
export const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_IS_ADMIN_AUTH: 'SET_IS_ADMIN_AUTH',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  ADMIN_LOGIN_SUCCESS: 'ADMIN_LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  INITIALIZE_AUTH: 'INITIALIZE_AUTH',
};

export const initialState = {
  user: null,
  isAdminAuth: false,
  loading: true, // Start with loading true
};

export const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case AuthActionTypes.SET_USER:
      return { ...state, user: action.payload };
    case AuthActionTypes.SET_IS_ADMIN_AUTH:
      return { ...state, isAdminAuth: action.payload };
    case AuthActionTypes.INITIALIZE_AUTH:
      return {
        ...state,
        user: action.payload.user,
        isAdminAuth: action.payload.isAdmin,
        loading: false,
      };
    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAdminAuth: action.payload.isAdmin,
        loading: false,
      };
    case AuthActionTypes.ADMIN_LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAdminAuth: true,
        loading: false,
      };
    case AuthActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAdminAuth: false,
        loading: false,
      };
    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAdminAuth: false,
        loading: false,
      };
    default:
      return state;
  }
};
  