import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsAuthenticated,
  logout as logoutAction,
} from '../store/authSlice';

/**
 * Custom hook for authentication
 * Provides easy access to user data and auth state
 * 
 * @returns {Object} User data, token, auth state, and logout function
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectCurrentToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const logout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  return {
    user,
    token,
    isAuthenticated,
    logout,
  };
};

